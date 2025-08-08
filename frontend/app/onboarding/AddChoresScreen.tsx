import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { getHouseholdId } from "../../src/lib/auth";

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

export default function AddChoresScreen() {
  const [chores, setChores] = useState<Chore[]>([
    {
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
    },
  ]);

  const [kids, setkids] = useState<string[]>([]);

  useEffect(() => {
    const fetchKids = async () => {
      try {
        const householdId = await getHouseholdId();
        const response = await axios.get(
          "http://192.168.122/api/household/kids?householeId=${householdId}"
        );
        const kidsNames = response.data.map((k: { name: string }) => k.name);
        setkids(kidsNames);
      } catch (error) {
        console.error("Error fetching kids:", error);
      }
    };
    fetchKids();
  }, []);

  const updateChore = <K extends keyof Chore>(
    index: number,
    field: K,
    value: Chore[K]
  ) => {
    const updated = [...chores];
    updated[index][field] = value;
    setChores(updated);
  };

  const addChoreRow = () => {
    setChores([
      ...chores,
      {
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
      },
    ]);
  };

  const removeChoreRow = (index: number) => {
    const updated = chores.filter((_, i) => i !== index);
    setChores(updated);
  };

  const submitChores = async () => {
    try {
      await axios.post("http://192.168.1.122:7070/api/chores/bulk", chores);
      router.replace("../(tabs)/kids");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to add chores.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Add Chores</Text>

      {chores.map((chore, index) => (
        <View key={index} style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Chore Name"
            value={chore.name}
            onChangeText={(text) => updateChore(index, "name", text)}
          />

          <Picker
            selectedValue={chore.assignedTo}
            onValueChange={(itemValue) =>
              updateChore(index, "assignedTo", itemValue)
            }
            style={styles.input}
          >
            <Picker.Item label="Select Kid" value="" />
            {kids.map((kid) => (
              <Picker.Item key={kid} label={kid} value={kid} />
            ))}
          </Picker>
          
          <TextInput
            style={styles.input}
            placeholder="Assigned To (optional)"
            value={chore.assignedTo}
            onChangeText={(text) => updateChore(index, "assignedTo", text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Points"
            keyboardType="numeric"
            value={chore.points.toString()}
            onChangeText={(text) =>
              updateChore(index, "points", parseInt(text) || 0)
            }
          />
          <Button title="Remove" onPress={() => removeChoreRow(index)} />
        </View>
      ))}

      <Button title="Add Another Chore" onPress={addChoreRow} />
      <View style={{ marginVertical: 10 }} />
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
