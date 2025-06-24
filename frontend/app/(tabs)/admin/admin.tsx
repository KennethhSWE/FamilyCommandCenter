import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import axios from "axios";

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

  useEffect(() => {
    fetchChores();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await axios.patch(`http://192.168.1.122:7070/api/chores/${id}/verify`);
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
    } catch (err) {
      console.error("Reject failed:", err);
      Alert.alert("Error", "Failed to reject chore.");
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
  },
});
