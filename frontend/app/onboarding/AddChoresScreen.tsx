import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { getHouseholdId } from "../../src/lib/auth";
import { createChoreBulk, getKidsByHousehold } from "../../src/lib/api";

interface Chore {
  name: string;
  assignedTo: string;
  points: number | string;
  dueDate: string | null;
  complete: boolean;
  requestedComplete: boolean;
  verified: boolean;
  recurring: boolean;
  minAge: number | null;
  maxAge: number | null;
  createdBy: number | null;
}

const emptyChore = (): Chore => ({
  name: "",
  assignedTo: "",
  points: "",
  dueDate: null,
  complete: false,
  requestedComplete: false,
  verified: false,
  recurring: false,
  minAge: null,
  maxAge: null,
  createdBy: null,
});

export default function AddChoresScreen() {
  const [chores, setChores] = useState<Chore[]>([emptyChore()]);
  const [kids, setKids] = useState<string[]>([]);

  useEffect(() => {
    const fetchKids = async () => {
      try {
        const householdId = await getHouseholdId();
        console.log("Household ID from storage:", householdId);

        if (!householdId) {
          throw new Error("No householdId in storage");
        }

        const kids = await getKidsByHousehold(householdId);
        setKids(kids.map((k) => k.name));
      } catch (error) {
        console.error("Error fetching kids:", error);
        setKids([]);
      }
    };

    fetchKids();
  }, []);

  const updateChore = <K extends keyof Chore>(
    index: number,
    field: K,
    value: Chore[K],
  ) => {
    const updated = [...chores];
    updated[index][field] = value;
    setChores(updated);
  };

  const addChoreRow = () => {
    setChores([...chores, emptyChore()]);
  };

  const removeChoreRow = (index: number) => {
    const updated = chores.filter((_, i) => i !== index);
    setChores(updated.length ? updated : [emptyChore()]);
  };

  const submitChores = async () => {
    try {
      const cleaned = chores
        .filter((c) => c.name.trim() && c.assignedTo.trim())
        .map((c) => ({
          ...c,
          dueDate: c.dueDate ?? undefined,
          points:
            typeof c.points === "string"
              ? parseInt(c.points, 10) || 0
              : c.points,
        }));

      if (cleaned.length === 0) {
        Alert.alert(
          "No chores added",
          "Please add at least one chore before continuing.",
        );
        return;
      }

      await createChoreBulk(cleaned);
      router.replace("/(tabs)/kids");
    } catch (error: any) {
      const msg =
        error?.response?.data ??
        error?.message ??
        "Unknown error submitting chores";
      console.error("Submit chores failed:", msg);
      Alert.alert("Error", String(msg));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Add Chores</Text>

      {chores.map((chore, index) => (
        <View key={index} style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Chore name"
            value={chore.name}
            onChangeText={(text) => updateChore(index, "name", text)}
          />

          <Picker
            selectedValue={chore.assignedTo}
            onValueChange={(value) => updateChore(index, "assignedTo", value)}
          >
            <Picker.Item label="Select a kid" value="" />
            {kids.map((kid) => (
              <Picker.Item key={kid} label={kid} value={kid} />
            ))}
          </Picker>

          <TextInput
            style={styles.input}
            placeholder="Points"
            keyboardType="number-pad"
            value={String(chore.points)}
            onChangeText={(text) => updateChore(index, "points", text)}
          />

          <Button title="Remove Chore" onPress={() => removeChoreRow(index)} />
        </View>
      ))}

      <Button title="Add Another Chore" onPress={addChoreRow} />
      <Button title="Submit Chores" onPress={submitChores} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    alignSelf: "center",
  },
  card: {
    backgroundColor: "#eee",
    padding: 15,
    borderRadius: 10,
    gap: 10,
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
  },
});
