import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, StyleSheet, ActivityIndicator } from "react-native";

import { getRewards, getToken, getUsername, getPoints, Reward } from "../../src/lib/api";

export default function RewardsScreen() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const username = token ? await getUsername(token) : null;

        if (username) {
          const [rewardList, pointData] = await Promise.all([
            getRewards(),
            getPoints(username),
          ]);
          setRewards(rewardList);
          setPoints(pointData.points);
        }
      } catch (e) {
        console.error("Failed to load rewards:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>🎁 Rewards</Text>
      <Text style={styles.points}>You have {points} points</Text>

      {rewards.length === 0 ? (
        <Text style={styles.noRewards}>No rewards available.</Text>
      ) : (
        rewards.map((reward) => (
          <View key={reward.id} style={styles.rewardItem}>
            <Text style={styles.rewardText}>
              {reward.name} — {reward.cost} pts
            </Text>
            {reward.requiresApproval && (
              <Text style={styles.approval}>Requires parent approval</Text>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#8e44ad",
    textAlign: "center",
  },
  points: {
    fontSize: 18,
    color: "#444",
    textAlign: "center",
    marginBottom: 16,
  },
  rewardItem: {
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 12,
  },
  rewardText: {
    fontSize: 16,
    fontWeight: "600",
  },
  approval: {
    marginTop: 4,
    color: "#e67e22",
    fontStyle: "italic",
  },
  noRewards: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 40,
  },
});
