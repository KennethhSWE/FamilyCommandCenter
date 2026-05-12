// frontend/app/kid/[id].tsx
//--------------------------------------------------------------
// Kid detail – shows today’s chores for the selected child
//--------------------------------------------------------------
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getChoresByKid, requestChoreApproval, Chore } from "../../src/lib/api";

export default function KidChoresScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const username = Array.isArray(params.id) ? params.id[0] : params.id;

  const [chores, setChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [workingChoreId, setWorkingChoreId] = useState<number | null>(null);

  const loadChores = useCallback(async () => {
    if (!username) {
      setChores([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const list = await getChoresByKid(username);
      setChores(list);
    } catch (error) {
      console.error("Failed to load chores:", error);
      Alert.alert("Error", "Could not load chores.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [username]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadChores();
    }, [loadChores]),
  );

  const askParentToCheckChore = async (id: number) => {
    setWorkingChoreId(id);

    setChores((currentChores) =>
      currentChores.map((chore) =>
        chore.id === id ? { ...chore, requestedComplete: true } : chore,
      ),
    );

    try {
      await requestChoreApproval(id);
    } catch (error) {
      console.error("Request approval failed:", error);

      setChores((currentChores) =>
        currentChores.map((chore) =>
          chore.id === id ? { ...chore, requestedComplete: false } : chore,
        ),
      );

      Alert.alert(
        "Could Not Submit",
        "Ask a parent to check this chore again.",
      );
    } finally {
      setWorkingChoreId(null);
    }
  };

  const finishedCount = chores.filter((chore) => chore.complete).length;
  const waitingCount = chores.filter(
    (chore) => !chore.complete && chore.requestedComplete,
  ).length;
  const openCount = chores.filter(
    (chore) => !chore.complete && !chore.requestedComplete,
  ).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading chores...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={chores}
        keyExtractor={(chore) => String(chore.id)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadChores();
            }}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerBox}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>

            <Text style={styles.header}>
              {username ? `${username}'s Chores` : "Chores"}
            </Text>

            <Text style={styles.subtitle}>
              Mark chores done when finished. A parent approves points.
            </Text>

            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>{openCount}</Text>
                <Text style={styles.summaryLabel}>Open</Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>{waitingCount}</Text>
                <Text style={styles.summaryLabel}>Waiting</Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>{finishedCount}</Text>
                <Text style={styles.summaryLabel}>Done</Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyTitle}>All chores done for today!</Text>
            <Text style={styles.emptyText}>
              Check back later or ask a parent if there is anything else to help
              with.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isWorking = workingChoreId === item.id;

          return (
            <View
              style={[
                styles.card,
                item.overdue && styles.cardOverdue,
                item.complete && styles.cardDone,
              ]}
            >
              <View style={styles.cardTopRow}>
                <View style={styles.choreTextBox}>
                  <Text
                    style={[
                      styles.name,
                      item.overdue && styles.overdueText,
                      item.complete && styles.doneText,
                    ]}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={[
                      styles.points,
                      item.overdue && styles.overdueText,
                      item.complete && styles.doneText,
                    ]}
                  >
                    {item.points} points
                  </Text>
                </View>

                {item.complete ? (
                  <View style={[styles.statusPill, styles.donePill]}>
                    <Text style={[styles.statusPillText, styles.donePillText]}>
                      Done
                    </Text>
                  </View>
                ) : item.requestedComplete ? (
                  <View style={[styles.statusPill, styles.waitingPill]}>
                    <Text
                      style={[styles.statusPillText, styles.waitingPillText]}
                    >
                      Waiting
                    </Text>
                  </View>
                ) : item.overdue ? (
                  <View style={[styles.statusPill, styles.overduePill]}>
                    <Text
                      style={[styles.statusPillText, styles.overduePillText]}
                    >
                      Overdue
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.statusPill, styles.openPill]}>
                    <Text style={[styles.statusPillText, styles.openPillText]}>
                      Open
                    </Text>
                  </View>
                )}
              </View>

              {!item.complete && !item.requestedComplete && (
                <Pressable
                  onPress={() => askParentToCheckChore(item.id)}
                  style={[
                    styles.completeButton,
                    isWorking && styles.disabledButton,
                  ]}
                  disabled={isWorking}
                >
                  <Text style={styles.completeButtonText}>
                    {isWorking ? "Sending..." : "I Did It"}
                  </Text>
                </Pressable>
              )}

              {item.requestedComplete && !item.complete && (
                <Text style={styles.waitingMessage}>
                  Nice job. This is waiting for parent approval.
                </Text>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#6b7280",
    fontWeight: "700",
  },
  listContent: {
    padding: 16,
    paddingBottom: 120,
  },
  headerBox: {
    marginBottom: 16,
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#e5e7eb",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  backButtonText: {
    color: "#111827",
    fontWeight: "900",
  },
  header: {
    fontSize: 30,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    color: "#6b7280",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: "900",
    color: "#2563eb",
  },
  summaryLabel: {
    color: "#6b7280",
    fontWeight: "800",
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    elevation: 2,
  },
  emptyEmoji: {
    fontSize: 42,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyText: {
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 18,
    marginBottom: 12,
    elevation: 2,
  },
  cardOverdue: {
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#fecdd3",
  },
  cardDone: {
    opacity: 0.75,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  choreTextBox: {
    flex: 1,
  },
  name: {
    fontSize: 19,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 4,
  },
  points: {
    color: "#4b5563",
    fontWeight: "800",
  },
  overdueText: {
    color: "#991b1b",
  },
  doneText: {
    color: "#6b7280",
    textDecorationLine: "line-through",
  },
  statusPill: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "900",
  },
  openPill: {
    backgroundColor: "#dbeafe",
  },
  openPillText: {
    color: "#1e40af",
  },
  waitingPill: {
    backgroundColor: "#fef3c7",
  },
  waitingPillText: {
    color: "#92400e",
  },
  donePill: {
    backgroundColor: "#dcfce7",
  },
  donePillText: {
    color: "#166534",
  },
  overduePill: {
    backgroundColor: "#fee2e2",
  },
  overduePillText: {
    color: "#991b1b",
  },
  completeButton: {
    backgroundColor: "#22c55e",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    marginTop: 14,
  },
  completeButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  waitingMessage: {
    marginTop: 12,
    color: "#92400e",
    fontWeight: "800",
    lineHeight: 20,
  },
});
