// frontend/app/(tabs)/admin.tsx
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ParentPinGate from "../components/ParentPinGate";
import {
  ApprovalQueueItem,
  DailyChoreSummary,
  approveApproval,
  createChore,
  denyApproval,
  getWaitingApprovals,
  runDailyChoreSweep,
} from "../../src/lib/api";

export default function AdminScreen() {
  const [approvalQueue, setApprovalQueue] = useState<ApprovalQueueItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [workingApprovalId, setWorkingApprovalId] = useState<number | null>(
    null,
  );

  const [name, setName] = useState("");
  const [points, setPoints] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [savingChore, setSavingChore] = useState(false);

  const [runningSweep, setRunningSweep] = useState(false);
  const [lastSweep, setLastSweep] = useState<DailyChoreSummary | null>(null);

  const loadApprovalQueue = useCallback(async () => {
    setRefreshing(true);

    try {
      const approvals = await getWaitingApprovals();
      setApprovalQueue(approvals);
    } catch (error) {
      console.error("load approvals:", error);
      Alert.alert("Error", "Failed to load parent approvals.");
    } finally {
      setRefreshing(false);
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

  const runMorningSweep = async () => {
    setRunningSweep(true);

    try {
      const summary = await runDailyChoreSweep();
      setLastSweep(summary);

      Alert.alert(
        "Daily Chores Updated",
        `Kids checked: ${summary.kidsChecked}\nCarried over: ${summary.carriedOverChores}\nPenalty points: ${summary.penaltyPointsTaken}\nNew chores: ${summary.newChoresAssigned}`,
      );
    } catch (error) {
      console.error("daily sweep:", error);
      Alert.alert("Error", "Could not run the daily chore sweep.");
    } finally {
      setRunningSweep(false);
    }
  };

  return (
    <ParentPinGate title="Parent Admin">
      <SafeAreaView style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={loadApprovalQueue}
            />
          }
        >
          <Text style={styles.header}>Parent Command Center</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Waiting for Approval</Text>

            {approvalQueue.length === 0 ? (
              <Text style={styles.emptyText}>
                Nothing needs approval right now.
              </Text>
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
                        workingApprovalId === approval.id &&
                          styles.disabledButton,
                      ]}
                      disabled={workingApprovalId === approval.id}
                      onPress={() => denyQueuedThing(approval.id)}
                    >
                      <Text style={styles.buttonText}>Deny</Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.approveButton,
                        workingApprovalId === approval.id &&
                          styles.disabledButton,
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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Chore Sweep</Text>

            <Text style={styles.helpText}>
              This carries missed chores forward, subtracts penalty points, and
              assigns new chores from the chore pool.
            </Text>

            {lastSweep && (
              <View style={styles.summaryBox}>
                <Text style={styles.summaryText}>
                  Kids checked: {lastSweep.kidsChecked}
                </Text>
                <Text style={styles.summaryText}>
                  Carried over: {lastSweep.carriedOverChores}
                </Text>
                <Text style={styles.summaryText}>
                  Penalty points: {lastSweep.penaltyPointsTaken}
                </Text>
                <Text style={styles.summaryText}>
                  New chores assigned: {lastSweep.newChoresAssigned}
                </Text>
              </View>
            )}

            <Pressable
              style={[
                styles.primaryButton,
                runningSweep && styles.disabledButton,
              ]}
              disabled={runningSweep}
              onPress={runMorningSweep}
            >
              <Text style={styles.buttonText}>
                {runningSweep ? "Running..." : "Run Daily Chores"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Chore to Pool</Text>

            <Text style={styles.helpText}>
              Pool chores are not assigned to one kid right away. The daily
              chore sweep can assign them later.
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
              style={[
                styles.primaryButton,
                savingChore && styles.disabledButton,
              ]}
              disabled={savingChore}
              onPress={addChoreToPool}
            >
              <Text style={styles.buttonText}>
                {savingChore ? "Saving..." : "Add Chore"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ParentPinGate>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 18,
    color: "#111827",
  },
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
  helpText: {
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 14,
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
  summaryBox: {
    backgroundColor: "#eff6ff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  summaryText: {
    color: "#1e3a8a",
    fontWeight: "700",
    marginBottom: 4,
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
