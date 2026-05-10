// frontend/app/(tabs)/calendar.tsx
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";

import ParentInlineGate from "../components/ParentInlineGate";
import {
  CalendarEntryType,
  createCalendarEntry,
  deleteCalendarEntry,
  FamilyCalendarEntry,
  getCalendarEntries,
  toggleBillPaid,
} from "../../src/lib/api";

/** ----------------------------------------------------------------------------
 *  CalendarScreen
 *  Kids can view the calendar.
 *  Parent controls require the parent PIN.
 *  ------------------------------------------------------------------------- */
export default function CalendarScreen() {
  const scheme = useColorScheme();

  const colors =
    scheme === "dark"
      ? { bg: "#000", card: "#1e1e1e", text: "#fff", soft: "#333" }
      : { bg: "#f3f4f6", card: "#fff", text: "#111", soft: "#e5e7eb" };

  const [entries, setEntries] = useState<FamilyCalendarEntry[]>([]);
  const [selectedDay, setSelectedDay] = useState(formatDateKey(new Date()));
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [type, setType] = useState<CalendarEntryType>("EVENT");

  const loadCalendar = useCallback(async () => {
    setLoading(true);

    try {
      const savedEntries = await getCalendarEntries();
      setEntries(savedEntries);
    } catch (error) {
      console.error("calendar load:", error);
      Alert.alert("Error", "Could not load family calendar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  const entriesForSelectedDay = useMemo(() => {
    return entries.filter((entry) => entry.entryDate === selectedDay);
  }, [entries, selectedDay]);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    entries.forEach((entry) => {
      marks[entry.entryDate] = {
        marked: true,
        dotColor: entry.type === "BILL" ? "#f59e0b" : "#8e44ad",
      };
    });

    marks[selectedDay] = {
      ...(marks[selectedDay] ?? {}),
      selected: true,
      selectedColor: "#8e44ad",
    };

    return marks;
  }, [entries, selectedDay]);

  const openNewEntryModal = () => {
    setTitle("");
    setDate(new Date(`${selectedDay}T12:00:00`));
    setType("EVENT");
    setPickerOpen(false);
    setModalOpen(true);
  };

  const closeNewEntryModal = () => {
    setModalOpen(false);
    setPickerOpen(false);
    setTitle("");
  };

  const saveEntry = async () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Add a title before saving.");
      return;
    }

    try {
      await createCalendarEntry({
        title: title.trim(),
        type,
        entryDate: formatDateKey(date),
      });

      closeNewEntryModal();
      await loadCalendar();
      setSelectedDay(formatDateKey(date));
    } catch (error) {
      console.error("calendar save:", error);
      Alert.alert("Error", "Could not save calendar entry.");
    }
  };

  const flipTheBillPaidSwitch = async (entryId: number) => {
    try {
      await toggleBillPaid(entryId);
      await loadCalendar();
    } catch (error) {
      console.error("toggle paid:", error);
      Alert.alert("Error", "Could not update bill paid status.");
    }
  };

  const removeCalendarThing = async (entryId: number) => {
    try {
      await deleteCalendarEntry(entryId);
      await loadCalendar();
    } catch (error) {
      console.error("delete calendar entry:", error);
      Alert.alert("Error", "Could not delete calendar entry.");
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <Calendar
        current={selectedDay}
        markedDates={markedDates}
        onDayPress={(day: DateData) => setSelectedDay(day.dateString)}
        theme={{
          calendarBackground: colors.card,
          dayTextColor: colors.text,
          monthTextColor: colors.text,
          textDisabledColor: "#9ca3af",
          arrowColor: "#8e44ad",
          todayTextColor: "#8e44ad",
          selectedDayBackgroundColor: "#8e44ad",
          selectedDayTextColor: "#fff",
        }}
      />

      <View style={styles.selectedHeader}>
        <Text style={[styles.selectedTitle, { color: colors.text }]}>
          {selectedDay}
        </Text>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadCalendar}
          activeOpacity={0.85}
        >
          <MaterialIcons name="refresh" size={18} color="#fff" />
          <Text style={styles.refreshText}>
            {loading ? "Loading..." : "Refresh"}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={entriesForSelectedDay}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No family events or bills for this day.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.entryCard, { backgroundColor: colors.card }]}>
            <View style={styles.entryLeft}>
              <Text style={[styles.entryTitle, { color: colors.text }]}>
                {item.title}
              </Text>

              <Text style={styles.entryMeta}>
                {item.type === "BILL"
                  ? item.paid
                    ? "Bill • Paid"
                    : "Bill • Unpaid"
                  : "Family Event"}
              </Text>
            </View>

            {item.type === "BILL" && (
              <MaterialIcons
                name={item.paid ? "check-circle" : "attach-money"}
                size={24}
                color={item.paid ? "#16a34a" : "#f59e0b"}
              />
            )}
          </View>
        )}
      />

      <ParentInlineGate title="Calendar Parent Controls">
        <View style={styles.parentPanel}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={openNewEntryModal}
            activeOpacity={0.85}
          >
            <MaterialIcons name="add" size={22} color="#fff" />
            <Text style={styles.addButtonText}>Add Event or Bill</Text>
          </TouchableOpacity>

          {entriesForSelectedDay.map((entry) => (
            <View key={entry.id} style={styles.parentRow}>
              <Text style={styles.parentRowText}>{entry.title}</Text>

              {entry.type === "BILL" && (
                <TouchableOpacity
                  style={[
                    styles.smallActionButton,
                    entry.paid && styles.smallActionButtonDone,
                  ]}
                  onPress={() => flipTheBillPaidSwitch(entry.id)}
                >
                  <Text style={styles.smallActionText}>
                    {entry.paid ? "Paid" : "Mark Paid"}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => removeCalendarThing(entry.id)}
              >
                <Text style={styles.smallActionText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ParentInlineGate>

      <Modal transparent visible={modalOpen} animationType="slide">
        <View style={styles.backdrop}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              New calendar entry
            </Text>

            <TextInput
              placeholder="Title"
              placeholderTextColor="#888"
              value={title}
              onChangeText={setTitle}
              style={[
                styles.input,
                { borderColor: colors.text, color: colors.text },
              ]}
            />

            <TouchableOpacity
              style={styles.dateRow}
              onPress={() => setPickerOpen(true)}
              activeOpacity={0.85}
            >
              <MaterialIcons name="event" size={20} color="#8e44ad" />
              <Text style={{ marginLeft: 8, color: colors.text }}>
                {date.toDateString()}
              </Text>
            </TouchableOpacity>

            <View style={styles.typeRow}>
              {(["EVENT", "BILL"] as const).map((entryType) => (
                <TouchableOpacity
                  key={entryType}
                  style={[
                    styles.typeBtn,
                    entryType === type && styles.typeBtnActive,
                  ]}
                  onPress={() => setType(entryType)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={{
                      color: entryType === type ? "#fff" : colors.text,
                      fontWeight: "700",
                    }}
                  >
                    {entryType === "EVENT" ? "Event" : "Bill"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.actions}>
              <Button title="Cancel" onPress={closeNewEntryModal} />
              <Button title="Save" onPress={saveEntry} />
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
    </View>
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
  },

  selectedHeader: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  refreshButton: {
    backgroundColor: "#8e44ad",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  refreshText: {
    color: "#fff",
    fontWeight: "800",
  },

  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#777",
    marginTop: 20,
  },

  entryCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
  },
  entryLeft: {
    flex: 1,
    paddingRight: 10,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  entryMeta: {
    color: "#777",
    marginTop: 4,
    fontSize: 12,
  },

  parentPanel: {
    marginHorizontal: 12,
    marginBottom: 12,
    gap: 8,
  },
  addButton: {
    backgroundColor: "#8e44ad",
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
  parentRow: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  parentRowText: {
    flex: 1,
    fontWeight: "700",
    color: "#111",
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
    fontWeight: "800",
    fontSize: 12,
  },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "85%",
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },

  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  typeRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  typeBtn: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#8e44ad",
    marginHorizontal: 4,
    borderRadius: 8,
  },
  typeBtnActive: {
    backgroundColor: "#8e44ad",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
