import React from "react";
import { View, ScrollView, Text, StyleSheet } from "react-native";

const dummyRewards = [
  { id: 1, name: "Extra 30 Minutes Screen Time", cost: 25 },
  { id: 2, name: "Stay Up Late", cost: 50 },
  { id: 3, name: "Trip to the Park", cost: 75 },
];

export default function RewardsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>🎁 Rewards</Text>
      {dummyRewards.map((reward) => (
        <View key={reward.id} style={styles.rewardItem}>
          <Text style={styles.rewardText}>{reward.name} - {reward.cost} pts</Text>
        </View>
      ))}
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
    marginBottom: 16,
    color: "#8e44ad",
    textAlign: "center",
  },
  rewardItem: {
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 10,
  },
  rewardText: {
    fontSize: 16,
  },
});
