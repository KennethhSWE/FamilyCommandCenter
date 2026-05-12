// frontend/app/(tabs)/calendar.tsx
//--------------------------------------------------------------
// Calendar tab – family events and bill tracking
//--------------------------------------------------------------
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";

import ParentInlineGate from "../components/ParentInlineGate";
import {
  CalendarEntryType,
  createCalendarEntry,
  deleteCalendarEntry,
  FamilyCalendarEntry,
  getCalendarEntries,
  toggleBillPaid,
} from "../../src/lib/api";

export default function CalendarScreen() {
  const [entries, setEntries] = useState<FamilyCalendarEntry[]>([]);
  const [selectedDay, setSelectedDay] = useState(formatDateKey(new Date()));
  const [refreshing, setRefreshing] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [type, setType] = useState<CalendarEntryType>("EVENT");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const loadCalendar = useCallback(async () => {
    setRefreshing(true);

    try {
      const savedEntries = await getCalendarEntries();
      setEntries(savedEntries);
    } catch (error) {
      console.error("calendar load:", error);
      Alert.alert("Error", "Could not load family calendar.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCalendar();
    }, [loadCalendar]),
  );

  const entriesForSelectedDay = useMemo(() => {
    return entries.filter((entry) => entry.entryDate === selectedDay);
  }, [entries, selectedDay]);

  const todayEntries = useMemo(() => {
    const today = formatDateKey(new Date());
    return entries.filter((entry) => entry.entryDate === today);
  }, [entries]);

  const unpaidBills = useMemo(() => {
    return entries.filter((entry) => entry.type === "BILL" && !entry.paid);
  }, [entries]);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    entries.forEach((entry) => {
      const existing = marks[entry.entryDate] ?? {};

      marks[entry.entryDate] = {
        ...existing,
        marked: true,
        dotColor: entry.type === "BILL" ? "#f59e0b" : "#2563eb",
      };
    });

    marks[selectedDay] = {
      ...(marks[selectedDay] ?? {}),
      selected: true,
      selectedColor: "#2563eb",
      selectedTextColor: "#fff",
    };

    return marks;
  }, [entries, selectedDay]);

  const openNewEntryModal = () => {
    setTitle("");
    setDate(new Date(`${selectedDay}T12:00:00`));
    setType("EVENT");
    setAmount("");
    setNotes("");
    setPickerOpen(false);
    setModalOpen(true);
  };

  const closeNewEntryModal = () => {
    setModalOpen(false);
    setPickerOpen(false);
    setTitle("");
    setType("EVENT");
    setAmount("");
    setNotes("");
    setDate(new Date());
  };

  const saveEntry = async () => {
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      Alert.alert("Missing Title", "Add a title before saving.");
      return;
    }

    const cleanAmount =
      type === "BILL" && amount.trim().length > 0 ? Number(amount) : null;

    if (
      type === "BILL" &&
      cleanAmount !== null &&
      !Number.isFinite(cleanAmount)
    ) {
      Alert.alert("Invalid Amount", "Enter a valid bill amount.");
      return;
    }

    setSaving(true);

    try {
      await createCalendarEntry({
        title: cleanTitle,
        type,
        entryDate: formatDateKey(date),
        amount: cleanAmount,
        notes: notes.trim() || null,
      });

      const newSelectedDay = formatDateKey(date);

      closeNewEntryModal();
      setSelectedDay(newSelectedDay);
      await loadCalendar();
    } catch (error) {
      console.error("calendar save:", error);
      Alert.alert("Error", "Could not save calendar entry.");
    } finally {
      setSaving(false);
    }
  };

  const markBillPaidOrUnpaid = async (entry: FamilyCalendarEntry) => {
    try {
      await toggleBillPaid(entry.id);
      await loadCalendar();
    } catch (error) {
      console.error("toggle paid:", error);
      Alert.alert("Error", "Could not update bill paid status.");
    }
  };

  const removeCalendarEntry = async (entry: FamilyCalendarEntry) => {
    Alert.alert("Delete Calendar Entry", `Delete "${entry.title}"?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCalendarEntry(entry.id);
            await loadCalendar();
          } catch (error) {
            console.error("delete calendar entry:", error);
            Alert.alert("Error", "Could not delete calendar entry.");
          }
        },
      },
    ]);
  };

  const jumpToToday = () => {
    setSelectedDay(formatDateKey(new Date()));
  };

  const formatAmount = (entry: FamilyCalendarEntry) => {
    if (entry.amount === null || entry.amount === undefined) {
      return "";
    }

    return ` • $${Number(entry.amount).toFixed(2)}`;
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadCalendar} />
        }
      >
        <Text style={styles.header}>Family Calendar</Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{todayEntries.length}</Text>
            <Text style={styles.summaryLabel}>Today</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{unpaidBills.length}</Text>
            <Text style={styles.summaryLabel}>Unpaid Bills</Text>
          </View>
        </View>

        <View style={styles.calendarCard}>
          <Calendar
            current={selectedDay}
            markedDates={markedDates}
            onDayPress={(day: DateData) => setSelectedDay(day.dateString)}
            theme={{
              calendarBackground: "#fff",
              dayTextColor: "#111827",
              monthTextColor: "#111827",
              textDisabledColor: "#9ca3af",
              arrowColor: "#2563eb",
              todayTextColor: "#2563eb",
              selectedDayBackgroundColor: "#2563eb",
              selectedDayTextColor: "#fff",
            }}
          />
        </View>

        <View style={styles.selectedHeader}>
          <View>
            <Text style={styles.selectedTitle}>{selectedDay}</Text>
            <Text style={styles.selectedSubtitle}>
              {entriesForSelectedDay.length === 1
                ? "1 item scheduled"
                : `${entriesForSelectedDay.length} items scheduled`}
            </Text>
          </View>

          <Pressable style={styles.todayButton} onPress={jumpToToday}>
            <MaterialIcons name="today" size={18} color="#fff" />
            <Text style={styles.todayButtonText}>Today</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selected Day</Text>

          {entriesForSelectedDay.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Nothing scheduled.</Text>
              <Text style={styles.emptyText}>
                No family events or bills are listed for this day.
              </Text>
            </View>
          ) : (
            entriesForSelectedDay.map((entry) => (
              <View key={entry.id} style={styles.entryCard}>
                <View style={styles.iconCircle}>
                  <MaterialIcons
                    name={entry.type === "BILL" ? "attach-money" : "event"}
                    size={22}
                    color={entry.type === "BILL" ? "#b45309" : "#1d4ed8"}
                  />
                </View>

                <View style={styles.entryInfo}>
                  <Text style={styles.entryTitle}>{entry.title}</Text>

                  <Text style={styles.entryMeta}>
                    {entry.type === "BILL"
                      ? entry.paid
                        ? `Bill • Paid${formatAmount(entry)}`
                        : `Bill • Unpaid${formatAmount(entry)}`
                      : "Family Event"}
                  </Text>

                  {entry.notes ? (
                    <Text style={styles.entryNotes}>{entry.notes}</Text>
                  ) : null}
                </View>

                {entry.type === "BILL" && (
                  <View
                    style={[
                      styles.billPill,
                      entry.paid ? styles.paidPill : styles.unpaidPill,
                    ]}
                  >
                    <Text
                      style={[
                        styles.billPillText,
                        entry.paid ? styles.paidText : styles.unpaidText,
                      ]}
                    >
                      {entry.paid ? "Paid" : "Due"}
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        <ParentInlineGate title="Calendar Parent Controls">
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Parent Controls</Text>

            <Pressable style={styles.addButton} onPress={openNewEntryModal}>
              <MaterialIcons name="add" size={22} color="#fff" />
              <Text style={styles.addButtonText}>Add Event or Bill</Text>
            </Pressable>

            {entriesForSelectedDay.length === 0 ? (
              <Text style={styles.parentEmptyText}>
                Select a day with entries to mark bills paid or delete items.
              </Text>
            ) : (
              entriesForSelectedDay.map((entry) => (
                <View key={entry.id} style={styles.parentRow}>
                  <Text style={styles.parentRowText} numberOfLines={2}>
                    {entry.title}
                  </Text>

                  {entry.type === "BILL" && (
                    <Pressable
                      style={[
                        styles.smallActionButton,
                        entry.paid && styles.smallActionButtonDone,
                      ]}
                      onPress={() => markBillPaidOrUnpaid(entry)}
                    >
                      <Text style={styles.smallActionText}>
                        {entry.paid ? "Mark Unpaid" : "Mark Paid"}
                      </Text>
                    </Pressable>
                  )}

                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => removeCalendarEntry(entry)}
                  >
                    <Text style={styles.smallActionText}>Delete</Text>
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </ParentInlineGate>
      </ScrollView>

      <Modal transparent visible={modalOpen} animationType="slide">
        <View style={styles.backdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>New Calendar Entry</Text>

            <Text style={styles.label}>Title</Text>
            <TextInput
              placeholder="Example: Soccer practice or Electric bill"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />

            <Text style={styles.label}>Date</Text>
            <Pressable
              style={styles.dateRow}
              onPress={() => setPickerOpen(true)}
            >
              <MaterialIcons name="event" size={20} color="#2563eb" />
              <Text style={styles.dateText}>{date.toDateString()}</Text>
            </Pressable>

            <Text style={styles.label}>Type</Text>
            <View style={styles.typeRow}>
              <Pressable
                style={[
                  styles.typeButton,
                  type === "EVENT" && styles.typeActive,
                ]}
                onPress={() => setType("EVENT")}
              >
                <Text
                  style={[
                    styles.typeText,
                    type === "EVENT" && styles.typeTextActive,
                  ]}
                >
                  Event
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.typeButton,
                  type === "BILL" && styles.typeActive,
                ]}
                onPress={() => setType("BILL")}
              >
                <Text
                  style={[
                    styles.typeText,
                    type === "BILL" && styles.typeTextActive,
                  ]}
                >
                  Bill
                </Text>
              </Pressable>
            </View>

            {type === "BILL" && (
              <>
                <Text style={styles.label}>Amount</Text>
                <TextInput
                  placeholder="Example: 145.32"
                  value={amount}
                  onChangeText={(value) =>
                    setAmount(value.replace(/[^0-9.]/g, "").slice(0, 10))
                  }
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
              </>
            )}

            <Text style={styles.label}>Notes</Text>
            <TextInput
              placeholder="Optional notes"
              value={notes}
              onChangeText={setNotes}
              style={[styles.input, styles.notesInput]}
              multiline
            />

            <View style={styles.modalButtonRow}>
              <Pressable
                style={styles.cancelButton}
                onPress={closeNewEntryModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.saveButton, saving && styles.disabledButton]}
                onPress={saveEntry}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? "Saving..." : "Save"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {pickerOpen && (
        <DateTimePicker
          mode="date"
          value={date}
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(_, pickedDate) => {
            setPickerOpen(Platform.OS === "ios");

            if (pickedDate) {
              setDate(pickedDate);
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  container: {
    padding: 16,
    paddingBottom: 120,
  },
  header: {
    fontSize: 32,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
    marginBottom: 18,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: "900",
    color: "#2563eb",
  },
  summaryLabel: {
    color: "#6b7280",
    fontWeight: "800",
    marginTop: 4,
    textAlign: "center",
  },
  calendarCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 2,
  },
  selectedHeader: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  selectedTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },
  selectedSubtitle: {
    color: "#6b7280",
    fontWeight: "700",
    marginTop: 3,
  },
  todayButton: {
    backgroundColor: "#2563eb",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  todayButtonText: {
    color: "#fff",
    fontWeight: "900",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 6,
  },
  emptyText: {
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  entryCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  entryInfo: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
  },
  entryMeta: {
    color: "#6b7280",
    fontWeight: "700",
    marginTop: 3,
  },
  entryNotes: {
    color: "#374151",
    marginTop: 5,
    lineHeight: 18,
  },
  billPill: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  paidPill: {
    backgroundColor: "#dcfce7",
  },
  unpaidPill: {
    backgroundColor: "#fef3c7",
  },
  billPillText: {
    fontWeight: "900",
    fontSize: 12,
  },
  paidText: {
    color: "#166534",
  },
  unpaidText: {
    color: "#92400e",
  },
  addButton: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
  parentEmptyText: {
    color: "#6b7280",
    lineHeight: 20,
  },
  parentRow: {
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  parentRowText: {
    flex: 1,
    fontWeight: "900",
    color: "#111827",
  },
  smallActionButton: {
    backgroundColor: "#f59e0b",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  smallActionButtonDone: {
    backgroundColor: "#16a34a",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  smallActionText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 12,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.58)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },
  modal: {
    width: "100%",
    maxWidth: 460,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  label: {
    fontWeight: "900",
    color: "#111827",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  notesInput: {
    minHeight: 72,
    textAlignVertical: "top",
  },
  dateRow: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    marginLeft: 8,
    color: "#111827",
    fontWeight: "800",
  },
  typeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },
  typeButton: {
    flex: 1,
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  typeActive: {
    backgroundColor: "#2563eb",
  },
  typeText: {
    color: "#111827",
    fontWeight: "900",
  },
  typeTextActive: {
    color: "#fff",
  },
  modalButtonRow: {
    flexDirection: "row",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#e5e7eb",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#111827",
    fontWeight: "900",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "900",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
