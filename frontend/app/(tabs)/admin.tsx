import React, { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
  Switch,
} from "react-native";
import axios from "axios";

// Types
type Chore = {
  id: number;
  assignedTo: string;
  name: string;
  points: number;
  requestedComplete: boolean;
  complete: boolean;
};

export default function AdminScreen() {
  const [pendingChores, setPendingChores] = useState<Chore[]>([]);

  // New form state for adding a chore to the pool
  const [choreName, setChoreName] = useState("");
  const [points, setPoints] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);

  const fetchChores = async () => {
    try {
      const res = await axios.get<Chore[]>(
        "http://192.168.1.122:7070/api/chores"
      );
      const filtered = res.data.filter(
        (chore) => chore.requestedComplete && !chore.complete
      );
      setPendingChores(filtered);
    } catch (err) {
      console.error("Error fetching chores:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchChores();
    }, [])
  );

  const handleApprove = async (id: number) => {
    try {
      await axios.patch(`http://192.168.1.122:7070/api/chores/${id}/approve`);
      Alert.alert("Approved!", "Chore marked as complete.");
      fetchChores();
    } catch (err) {
      console.error("Approve failed:", err);
      Alert.alert("Error", "Failed to approve chore.");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await axios.patch(`http://192.168.1.122:7070/api/chores/${id}/reject`);
      Alert.alert("Rejected", "Chore sent back to kid.");
      fetchChores();
    } catch (err: any) {
      console.error("Reject failed:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data || "Failed to reject chore.");
    }
  };

  const handleCreateChore = async () => {
    if (!choreName || !points) {
      Alert.alert("Validation", "Please fill in required fields.");
      return;
    }

    try {
      await axios.post("http://192.168.1.122:7070/api/chores", {
        name: choreName,
        points: parseInt(points),
        minAge: minAge ? parseInt(minAge) : null,
        maxAge: maxAge ? parseInt(maxAge) : null,
        isRecurring,
      });
      Alert.alert("Success", "Chore added to pool.");
      setChoreName("");
      setPoints("");
      setMinAge("");
      setMaxAge("");
      setIsRecurring(false);
    } catch (err) {
      console.error("Create chore failed:", err);
      Alert.alert("Error", "Failed to create chore.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Pending Approvals</Text>
      {pendingChores.length === 0 && (
        <Text style={{ textAlign: "center", color: "gray" }}>
          No pending chores right now.
        </Text>
      )}
      {pendingChores.map((chore) => (
        <View key={chore.id} style={styles.card}>
          <Text style={styles.text}>
            {chore.assignedTo} - {chore.name} ({chore.points} pts)
          </Text>
          <View style={styles.buttonRow}>
            <Button title="Approve" onPress={() => handleApprove(chore.id)} />
            <Button
              title="Reject"
              onPress={() => handleReject(chore.id)}
              color="red"
            />
          </View>
        </View>
      ))}

      <Text style={styles.header}>Create New Chore</Text>
      <TextInput
        placeholder="Chore Name"
        value={choreName}
        onChangeText={setChoreName}
        style={styles.input}
      />
      <TextInput
        placeholder="Points"
        value={points}
        onChangeText={setPoints}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Min Age (optional)"
        value={minAge}
        onChangeText={setMinAge}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Max Age (optional)"
        value={maxAge}
        onChangeText={setMaxAge}
        keyboardType="numeric"
        style={styles.input}
      />
      <View style={styles.switchRow}>
        <Text style={styles.text}>Recurring</Text>
        <Switch value={isRecurring} onValueChange={setIsRecurring} />
      </View>
      <Button title="Add Chore to Pool" onPress={handleCreateChore} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  card: {
    backgroundColor: "#eee",
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  text: { fontSize: 16, marginBottom: 8 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  input: {
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
});