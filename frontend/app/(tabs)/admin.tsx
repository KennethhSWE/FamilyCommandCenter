import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
  Switch,
  Button,
  RefreshControl,
  useColorScheme,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  api,
  ApprovalQueueItem,
  getWaitingApprovals,
  approveApproval,
  denyApproval,
} from "../../src/lib/api";

export default function AdminScreen() {
  const scheme = useColorScheme();
  const colors =
    scheme === "dark"
      ? { bg: "#000", card: "#1e1e1e", text: "#fff", border: "#666" }
      : { bg: "#fff", card: "#f5f5f5", text: "#000", border: "#ccc" };

  const [approvalQueue, setApprovalQueue] = useState<ApprovalQueueItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // New chore form state
  const [name, setName] = useState("");
  const [points, setPoints] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);

  // Load pending chores on screen focus
  const loadApprovalQueue = useCallback(async () => {
    setRefreshing(true);

    try {
      const approvals = await getWaitingApprovals();
      setApprovalQueue(approvals);
    } catch (error) {
      console.error("Error loading approvals:", error);
      Alert.alert("Error", "Failed to load approvals from server.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadApprovalQueue();
    }, [loadApprovalQueue]),
  );

  useEffect(() => {
    loadApprovalQueue();
  }, [loadApprovalQueue]);

  // Approve a chore
  const approveChore = async (id: number) => {
    try {
      await api.patch(`/chores/${id}/approve`);
      Alert.alert("Approved", "Chore approved.");
      loadApprovalQueue();
    } catch (error) {
      console.error("approve:", error);
      Alert.alert("Error", "Could not approve chore.");
    }
  };

  // Reject a chore
  const approveQueuedThing = async (approvalId: number) => {
    try {
      await approveApproval(approvalId);
      Alert.alert("Approved", "Approval completed.");
      loadApprovalQueue();
    } catch (error) {
      console.error("approve:", error);
      Alert.alert("Error", "Could not approve this item.");
    }
  };

  const denyQueuedThing = async (approvalId: number) => {
    try {
      await denyApproval(approvalId);
      Alert.alert("Denied", "Approval denied.");
      loadApprovalQueue();
    } catch (error) {
      console.error("deny:", error);
      Alert.alert("Error", "Could not deny this item.");
    }
  };

  // Submit new chore to pool
  const addChoreToPool = async () => {
    if (!name.trim() || !points.trim()) {
      Alert.alert("Validation", "Name and points are required.");
      return;
    }

    try {
      await api.post("/chores", {
        name: name.trim(),
        points: parseInt(points),
        assignedTo: "",
        minAge: minAge ? parseInt(minAge) : null,
        maxAge: maxAge ? parseInt(maxAge) : null,
        isRecurring,
      });

      Alert.alert("Success", "New pool chore created.");
      setName("");
      setPoints("");
      setMinAge("");
      setMaxAge("");
      setIsRecurring(false);
      loadApprovalQueue();
    } catch (error) {
      console.error("add chore:", error);
      Alert.alert("Error", "Could not create new chore.");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.bg }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={loadApprovalQueue} />
      }
    >
      <Text style={[styles.header, { color: colors.text }]}>
        Pending Approvals
      </Text>

      {approvalQueue.length === 0 ? (
        <Text style={{ textAlign: "center", color: "#888" }}>
          No approvals waiting right now.
        </Text>
      ) : (
        approvalQueue.map((approval) => (
          <View
            key={approval.id}
            style={[styles.card, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.title, { color: colors.text }]}>
              {approval.title}
            </Text>

            <Text style={{ color: colors.text, marginBottom: 10 }}>
              {approval.message}
            </Text>

            <Text style={{ color: "#888", marginBottom: 10 }}>
              Type: {approval.approvalType}
            </Text>

            <View style={styles.btnRow}>
              <Button
                title="Approve"
                onPress={() => approveQueuedThing(approval.id)}
              />
              <Button
                title="Deny"
                color="#e74c3c"
                onPress={() => denyQueuedThing(approval.id)}
              />
            </View>
          </View>
        ))
      )}

      <Text style={[styles.header, { color: colors.text }]}>
        Create New Chore
      </Text>

      <TextInput
        placeholder="Chore name"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
        style={[
          styles.input,
          { borderColor: colors.border, color: colors.text },
        ]}
      />
      <TextInput
        placeholder="Points"
        placeholderTextColor="#888"
        value={points}
        onChangeText={setPoints}
        keyboardType="numeric"
        style={[
          styles.input,
          { borderColor: colors.border, color: colors.text },
        ]}
      />
      <TextInput
        placeholder="Min age (optional)"
        placeholderTextColor="#888"
        value={minAge}
        onChangeText={setMinAge}
        keyboardType="numeric"
        style={[
          styles.input,
          { borderColor: colors.border, color: colors.text },
        ]}
      />
      <TextInput
        placeholder="Max age (optional)"
        placeholderTextColor="#888"
        value={maxAge}
        onChangeText={setMaxAge}
        keyboardType="numeric"
        style={[
          styles.input,
          { borderColor: colors.border, color: colors.text },
        ]}
      />
      <View style={styles.switchRow}>
        <Text style={{ color: colors.text }}>Recurring</Text>
        <Switch value={isRecurring} onValueChange={setIsRecurring} />
      </View>
      <Button title="Add Chore to Pool" onPress={addChoreToPool} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  card: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    elevation: 2,
  },
  title: { fontSize: 16, marginBottom: 10 },
  btnRow: { flexDirection: "row", justifyContent: "space-between" },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
});
