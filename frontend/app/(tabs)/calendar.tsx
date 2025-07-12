// frontend/app/(tabs)/calendar.tsx
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  Platform,
  useColorScheme,
} from "react-native";
import { Agenda, AgendaSchedule } from "react-native-calendars";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@expo/vector-icons";

/** ----------------------------------------------------------------------------
 *  CalendarScreen – Agenda view with quick-add modal for events & bills
 *  ------------------------------------------------------------------------- */
export default function CalendarScreen() {
  /* ---------- theming ---------- */
  const scheme  = useColorScheme();
  const colors  = scheme === "dark"
    ? { bg: "#000", card: "#1e1e1e", text: "#fff" }
    : { bg: "#fff", card: "#fff",   text: "#000" };

  /* ---------- state ---------- */
  const [items,       setItems]       = useState<AgendaSchedule>({});
  const [modalOpen,   setModalOpen]   = useState(false);
  const [title,       setTitle]       = useState("");
  const [date,        setDate]        = useState<Date>(new Date());
  const [pickerOpen,  setPickerOpen]  = useState(false);
  const [type,        setType]        = useState<"event"|"bill">("event");

  /* ---------- helpers ---------- */
  const saveEntry = () => {
    if (!title.trim()) { return; }
    const key = date.toISOString().split("T")[0];           // YYYY-MM-DD

    setItems(prev => {
      const dayItems = prev[key] ?? [];
      return { ...prev, [key]: [...dayItems, { name: title.trim(), type }] };
    });

    setTitle(""); setType("event"); setModalOpen(false);
  };

  /* ---------- render ---------- */
  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Agenda
        items={items}
        selected={new Date().toISOString().split("T")[0]}
        renderItem={item => (
          <View style={[styles.item, { backgroundColor: colors.card }]}>
            <Text style={[styles.itemText, { color: colors.text }]}>{item.name}</Text>
            {item.type === "bill" && (
              <MaterialIcons name="attach-money" size={18} color="#2ecc71" />
            )}
          </View>
        )}
        theme={{
          agendaDayTextColor:      colors.text,
          agendaDayNumColor:       colors.text,
          agendaTodayColor:        "#8e44ad",
          agendaKnobColor:         "#8e44ad",
          backgroundColor:         colors.bg,
          calendarBackground:      colors.bg,
          monthTextColor:          colors.text,
          textSectionTitleColor:   colors.text,
        }}
      />

      {/* floating “add” button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalOpen(true)}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* ------------------------------------------------------------------
            ADD / EDIT MODAL
         ------------------------------------------------------------------ */}
      <Modal transparent visible={modalOpen} animationType="slide">
        <View style={styles.backdrop}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>New entry</Text>

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

            {/* date selector  */}
            <TouchableOpacity
              style={styles.dateRow}
              onPress={() => setPickerOpen(true)}
            >
              <MaterialIcons name="event" size={20} color="#8e44ad" />
              <Text style={{ marginLeft: 8, color: colors.text }}>
                {date.toDateString()}
              </Text>
            </TouchableOpacity>

            {/* event vs bill selector */}
            <View style={styles.typeRow}>
              {["event", "bill"].map(t => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.typeBtn,
                    t === type && styles.typeBtnActive,
                  ]}
                  onPress={() => setType(t as "event" | "bill")}
                >
                  <Text style={{ color: t === type ? "#fff" : colors.text }}>
                    {t === "event" ? "Event" : "Bill"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* actions */}
            <View style={styles.actions}>
              <Button title="Cancel" onPress={() => setModalOpen(false)} />
              <Button title="Save"   onPress={saveEntry} />
            </View>
          </View>
        </View>
      </Modal>

      {/* native date-picker */}
      {pickerOpen && (
        <DateTimePicker
          mode="date"
          value={date}
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(_, d) => {
            setPickerOpen(Platform.OS === "ios");
            d && setDate(d);
          }}
        />
      )}
    </View>
  );
}

/* ----------------------------------------------------------------------------
 *  Styles
 * ------------------------------------------------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Agenda item */
  item: {
    padding: 14,
    borderRadius: 10,
    marginRight: 10,
    marginTop: 17,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  itemText: { fontSize: 16 },

  /* Floating Action Button */
  fab: {
    position: "absolute",
    right: 24,
    bottom: 40,
    backgroundColor: "#8e44ad",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },

  /* Modal */
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
  modalTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },

  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 14,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  /* type selector */
  typeRow: { flexDirection: "row", marginBottom: 20 },
  typeBtn: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#8e44ad",
    marginHorizontal: 4,
    borderRadius: 6,
  },
  typeBtnActive: { backgroundColor: "#8e44ad" },

  /* modal actions */
  actions: { flexDirection: "row", justifyContent: "space-between" },
});
