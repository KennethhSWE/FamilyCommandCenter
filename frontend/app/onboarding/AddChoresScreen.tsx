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
import { getHouseholdId, getToken } from "../../src/lib/auth";
import { getKidsByHousehold } from "../../src/lib/api";

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
        if (!householdId) throw new Error("No householdId in storage");

        const kids = await getKidsByHousehold(householdId);
        setkids(kids.map((k) => k.name));
      } catch (error) {
        console.error("Error Fetching kids:", error);
        setkids([]);
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
      const token = await getToken();
      if (!token) throw new Error("No token in storage");

      // optional: filter out empty rows so backend doesn't store blanks
      const cleaned = chores
        .filter((c) => c.name.trim() && c.assignedTo.trim())
        .map((c) => ({
          ...c,
          points:
            typeof c.points === "string"
              ? parseInt(c.points, 10) || 0
              : c.points,
        }));

      const res = await axios.post(
        "http://10.0.2.2:7070/api/chores/bulk",
        cleaned,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        }
      );

      console.log("Chores submit OK:", res.status, res.data);
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
      {/* your UI here */}
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
