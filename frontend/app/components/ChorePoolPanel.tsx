// frontend/app/components/ChorePoolPanel.tsx
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { createChore } from "../../src/lib/api";

export default function ChorePoolPanel() {
  const [name, setName] = useState("");
  const [points, setPoints] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [savingChore, setSavingChore] = useState(false);

  const parseOptionalNumber = (value: string) => {
    if (!value.trim()) {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const addChoreToPool = async () => {
    const cleanName = name.trim();
    const pointValue = Number(points);

    if (!cleanName) {
      Alert.alert("Missing Name", "Enter a chore name.");
      return;
    }

    if (!Number.isFinite(pointValue) || pointValue <= 0) {
      Alert.alert("Invalid Points", "Enter a point value greater than 0.");
      return;
    }

    setSavingChore(true);

    try {
      await createChore({
        name: cleanName,
        assignedTo: "",
        points: pointValue,
        minAge: parseOptionalNumber(minAge),
        maxAge: parseOptionalNumber(maxAge),
        recurring: isRecurring,
        createdBy: null,
      });

      setName("");
      setPoints("");
      setMinAge("");
      setMaxAge("");
      setIsRecurring(false);

      Alert.alert("Chore Added", "This chore was added to the chore pool.");
    } catch (error) {
      console.error("add chore:", error);
      Alert.alert("Error", "Could not create this chore.");
    } finally {
      setSavingChore(false);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Add Chore to Pool</Text>

      <Text style={styles.helpText}>
        Pool chores are not assigned to one kid right away. The daily chore
        sweep can assign them later.
      </Text>

      <Text style={styles.label}>Chore Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Example: Empty dishwasher"
        style={styles.input}
      />

      <Text style={styles.label}>Points</Text>
      <TextInput
        value={points}
        onChangeText={(value) => setPoints(value.replace(/\D/g, ""))}
        keyboardType="number-pad"
        placeholder="Example: 5"
        style={styles.input}
      />

      <View style={styles.ageRow}>
        <View style={styles.ageInput}>
          <Text style={styles.label}>Min Age</Text>
          <TextInput
            value={minAge}
            onChangeText={(value) => setMinAge(value.replace(/\D/g, ""))}
            keyboardType="number-pad"
            placeholder="Optional"
            style={styles.input}
          />
        </View>

        <View style={styles.ageInput}>
          <Text style={styles.label}>Max Age</Text>
          <TextInput
            value={maxAge}
            onChangeText={(value) => setMaxAge(value.replace(/\D/g, ""))}
            keyboardType="number-pad"
            placeholder="Optional"
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.switchRow}>
        <View style={styles.switchTextBox}>
          <Text style={styles.switchTitle}>Recurring Chore</Text>
          <Text style={styles.switchSubtitle}>
            Allow this chore to come back during daily assignment.
          </Text>
        </View>

        <Switch value={isRecurring} onValueChange={setIsRecurring} />
      </View>

      <Pressable
        style={[styles.primaryButton, savingChore && styles.disabledButton]}
        disabled={savingChore}
        onPress={addChoreToPool}
      >
        <Text style={styles.buttonText}>
          {savingChore ? "Saving..." : "Add Chore"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 10,
    color: "#111827",
  },
  helpText: {
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 14,
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.55,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "900",
  },
  label: {
    fontWeight: "800",
    marginBottom: 6,
    color: "#111827",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  ageRow: {
    flexDirection: "row",
    gap: 12,
  },
  ageInput: {
    flex: 1,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  switchTextBox: {
    flex: 1,
  },
  switchTitle: {
    fontWeight: "900",
    color: "#111827",
  },
  switchSubtitle: {
    color: "#6b7280",
    marginTop: 2,
    lineHeight: 18,
  },
});
