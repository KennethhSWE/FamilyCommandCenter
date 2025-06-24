import React from "react";
import { View, ScrollView, Text, StyleSheet } from "react-native";

const dummyPoints = [
  { name: "Ella", points: 80 },
  { name: "Austin", points: 65 },
  { name: "Lincoln", points: 40 },
  { name: "Charlie", points: 25 },
];

export default function PointsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>🏆 Points Leaderboard</Text>
      {dummyPoints.map((kid, index) => (
        <View key={index} style={styles.pointsRow}>
          <Text style={styles.name}>{kid.name}</Text>
          <Text style={styles.points}>{kid.points} pts</Text>
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
    color: "#27ae60",
    textAlign: "center",
  },
  pointsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  name: {
    fontSize: 18,
  },
  points: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
