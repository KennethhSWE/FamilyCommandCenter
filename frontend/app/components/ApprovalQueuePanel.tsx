// frontend/app/components/admin/ApprovalQueuePanel.tsx
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import {
  ApprovalQueueItem,
  approveApproval,
  denyApproval,
  getWaitingApprovals,
} from "../../src/lib/api";

export default function ApprovalQueuePanel() {
  const [approvalQueue, setApprovalQueue] = useState<ApprovalQueueItem[]>([]);
  const [workingApprovalId, setWorkingApprovalId] = useState<number | null>(
    null,
  );

  const loadApprovalQueue = useCallback(async () => {
    try {
      const approvals = await getWaitingApprovals();
      setApprovalQueue(approvals);
    } catch (error) {
      console.error("load approvals:", error);
      Alert.alert("Error", "Failed to load parent approvals.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadApprovalQueue();
    }, [loadApprovalQueue]),
  );

  const approveQueuedThing = async (approvalId: number) => {
    setWorkingApprovalId(approvalId);

    try {
      await approveApproval(approvalId);
      await loadApprovalQueue();
    } catch (error) {
      console.error("approve approval:", error);
      Alert.alert("Error", "Could not approve this item.");
    } finally {
      setWorkingApprovalId(null);
    }
  };

  const denyQueuedThing = async (approvalId: number) => {
    setWorkingApprovalId(approvalId);

    try {
      await denyApproval(approvalId);
      await loadApprovalQueue();
    } catch (error) {
      console.error("deny approval:", error);
      Alert.alert("Error", "Could not deny this item.");
    } finally {
      setWorkingApprovalId(null);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Waiting for Approval</Text>

      {approvalQueue.length === 0 ? (
        <Text style={styles.emptyText}>Nothing needs approval right now.</Text>
      ) : (
        approvalQueue.map((approval) => (
          <View key={approval.id} style={styles.approvalCard}>
            <Text style={styles.approvalTitle}>{approval.title}</Text>
            <Text style={styles.approvalMessage}>{approval.message}</Text>
            <Text style={styles.approvalType}>
              Type: {approval.approvalType}
            </Text>

            <View style={styles.buttonRow}>
              <Pressable
                style={[
                  styles.denyButton,
                  workingApprovalId === approval.id && styles.disabledButton,
                ]}
                disabled={workingApprovalId === approval.id}
                onPress={() => denyQueuedThing(approval.id)}
              >
                <Text style={styles.buttonText}>Deny</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.approveButton,
                  workingApprovalId === approval.id && styles.disabledButton,
                ]}
                disabled={workingApprovalId === approval.id}
                onPress={() => approveQueuedThing(approval.id)}
              >
                <Text style={styles.buttonText}>Approve</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
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
  emptyText: {
    color: "#6b7280",
    lineHeight: 20,
  },
  approvalCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  approvalTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 6,
  },
  approvalMessage: {
    color: "#374151",
    lineHeight: 20,
    marginBottom: 8,
  },
  approvalType: {
    color: "#6b7280",
    fontSize: 12,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 0,
  },
  approveButton: {
    flex: 1,
    backgroundColor: "#16a34a",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  denyButton: {
    flex: 1,
    backgroundColor: "#dc2626",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.55,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "900",
  },
});
