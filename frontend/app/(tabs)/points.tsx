// frontend/app/(tabs)/points.tsx
//--------------------------------------------------------------
// Points tab – family scoreboard and point history
//--------------------------------------------------------------
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getKids,
  getPoints,
  getRecentPointTransactions,
  Kid,
  PointTransaction,
} from "../../src/lib/api";

type KidPointCard = {
  kid: Kid;
  points: number;
};

export default function PointsScreen() {
  const [scoreboard, setScoreboard] = useState<KidPointCard[]>([]);
  const [pointHistory, setPointHistory] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPoints = useCallback(async () => {
    setRefreshing(true);

    try {
      const kids = await getKids();
      const cards = await Promise.all(
        kids.map(async (kid) => {
          const points = await getPoints(kid.username);

          return {
            kid,
            points,
          };
        }),
      );

      cards.sort((a, b) => b.points - a.points);

      const transactions = await getRecentPointTransactions();

      setScoreboard(cards);
      setPointHistory(transactions);
    } catch (error) {
      console.error("load points:", error);
      Alert.alert("Error", "Could not load family points.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadPoints();
    }, [loadPoints]),
  );

  const formatChange = (changeAmount: number) => {
    if (changeAmount > 0) {
      return `+${changeAmount}`;
    }

    return String(changeAmount);
  };

  const formatSource = (source: string) => {
    return source.replace(/_/g, " ").toLowerCase();
  };

  const formatDate = (createdAt: string) => {
    if (!createdAt) {
      return "";
    }

    return createdAt.substring(0, 16);
  };

  const totalPoints = scoreboard.reduce((sum, card) => sum + card.points, 0);
  const topKid = scoreboard[0];

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading points...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadPoints} />
        }
      >
        <Text style={styles.header}>Family Points</Text>

        <View style={styles.summaryBox}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{totalPoints}</Text>
            <Text style={styles.summaryLabel}>Total Family Points</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {topKid ? topKid.kid.name : "-"}
            </Text>
            <Text style={styles.summaryLabel}>Current Leader</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scoreboard</Text>

          {scoreboard.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No kids found yet.</Text>
              <Text style={styles.emptyText}>
                Add kids during setup to start tracking points.
              </Text>
            </View>
          ) : (
            scoreboard.map((card, index) => {
              const rank = index + 1;

              return (
                <View
                  key={card.kid.id ?? card.kid.username}
                  style={styles.kidCard}
                >
                  <View style={styles.rankCircle}>
                    <Text style={styles.rankText}>{rank}</Text>
                  </View>

                  <View style={styles.kidInfo}>
                    <Text style={styles.kidName}>{card.kid.name}</Text>
                    <Text style={styles.kidUsername}>@{card.kid.username}</Text>
                  </View>

                  <View style={styles.pointsBox}>
                    <Text style={styles.pointsNumber}>{card.points}</Text>
                    <Text style={styles.pointsLabel}>pts</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Point History</Text>

          {pointHistory.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No point history yet.</Text>
              <Text style={styles.emptyText}>
                Parent point adjustments will show here.
              </Text>
            </View>
          ) : (
            pointHistory.map((transaction) => {
              const isPositive = transaction.changeAmount > 0;

              return (
                <View key={transaction.id} style={styles.historyCard}>
                  <View
                    style={[
                      styles.changeBubble,
                      isPositive
                        ? styles.positiveBubble
                        : styles.negativeBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.changeText,
                        isPositive ? styles.positiveText : styles.negativeText,
                      ]}
                    >
                      {formatChange(transaction.changeAmount)}
                    </Text>
                  </View>

                  <View style={styles.historyInfo}>
                    <Text style={styles.historyTitle}>
                      {transaction.username}
                    </Text>

                    <Text style={styles.historyReason}>
                      {transaction.reason}
                    </Text>

                    <Text style={styles.historyMeta}>
                      {formatSource(transaction.source)} •{" "}
                      {formatDate(transaction.createdAt)}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>Point Rules</Text>
          <Text style={styles.noteText}>
            Points are awarded after a parent approves a completed chore.
          </Text>
          <Text style={styles.noteText}>
            Missed chores can subtract points during the daily chore sweep.
          </Text>
          <Text style={styles.noteText}>
            Rewards spend points when redeemed or approved.
          </Text>
        </View>
      </ScrollView>
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
  container: {
    padding: 16,
    paddingBottom: 120,
  },
  header: {
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    color: "#111827",
    marginBottom: 18,
  },
  summaryBox: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: "900",
    color: "#2563eb",
    textAlign: "center",
  },
  summaryLabel: {
    marginTop: 6,
    color: "#6b7280",
    fontWeight: "800",
    textAlign: "center",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 14,
  },
  kidCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
  },
  rankCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rankText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
  kidInfo: {
    flex: 1,
  },
  kidName: {
    fontSize: 19,
    fontWeight: "900",
    color: "#111827",
  },
  kidUsername: {
    color: "#6b7280",
    fontWeight: "700",
    marginTop: 2,
  },
  pointsBox: {
    alignItems: "center",
    minWidth: 70,
  },
  pointsNumber: {
    fontSize: 26,
    fontWeight: "900",
    color: "#16a34a",
  },
  pointsLabel: {
    color: "#6b7280",
    fontWeight: "800",
  },
  historyCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
  },
  changeBubble: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  positiveBubble: {
    backgroundColor: "#dcfce7",
  },
  negativeBubble: {
    backgroundColor: "#fee2e2",
  },
  changeText: {
    fontSize: 18,
    fontWeight: "900",
  },
  positiveText: {
    color: "#166534",
  },
  negativeText: {
    color: "#991b1b",
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 3,
  },
  historyReason: {
    color: "#374151",
    fontWeight: "700",
    marginBottom: 4,
  },
  historyMeta: {
    color: "#6b7280",
    fontSize: 12,
    textTransform: "capitalize",
  },
  emptyCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 6,
  },
  emptyText: {
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  noteBox: {
    backgroundColor: "#eff6ff",
    borderRadius: 18,
    padding: 16,
    elevation: 1,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1e3a8a",
    marginBottom: 8,
  },
  noteText: {
    color: "#1f2937",
    lineHeight: 20,
    marginBottom: 6,
  },
});
