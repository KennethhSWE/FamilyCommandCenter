import React, { useState } from "react";
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

interface Chore {
  name: string;
  assignedTo: string;
  points: number | string; 
  dueDate: string | null;
  isComplete: boolean;
  requestedComplete: boolean;
  isVerified: boolean;
  isRecurring: boolean;
  minAge: number | null;
  maxAge: number | null;
  createdBy: number | null;
}

export default function AddChoresScreen() {
  const [chores, setChores] = useState<Chore[]>([
    {
      name: "",
      assignedTo: "",
      points: '',
      dueDate: null,
      isComplete: false,
      requestedComplete: false,
      isVerified: false,
      isRecurring: false,
      minAge: null,
      maxAge: null,
      createdBy: null,
    },
  ]);

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
        points: '',
        dueDate: null,
        isComplete: false,
        requestedComplete: false,
        isVerified: false,
        isRecurring: false,
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
      Alert.alert("Success", "Chores added successfully!");
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
