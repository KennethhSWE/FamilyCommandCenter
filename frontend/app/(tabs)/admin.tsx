import ParentPinGate from "../components/ParentPinGate";
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
    <ParentPinGate title="Parent Admin">
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadApprovalQueue}
          />
        }
      >
        ...
      </ScrollView>
    </ParentPinGate>
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
