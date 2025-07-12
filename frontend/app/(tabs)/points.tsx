import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import * as Haptics from "expo-haptics";
import Toast from "react-native-toast-message";
import { getAllPoints } from "../../src/lib/api"; // fetches /points-bank

export default function PointsScreen() {
  const [data, setData] = useState<{ user_name: string; total_points: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const scheme = useColorScheme();

  const isDark = scheme === "dark";

  const loadPoints = async () => {
    try {
      setLoading(true);
      const points = await getAllPoints(); // GET /api/points-bank
      const sorted = points.sort((a, b) => b.total_points - a.total_points);
      setData(sorted);
    } catch (err) {
      console.error(err);
      Toast.show({ type: "error", text1: "Failed to load points" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPoints();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    Haptics.selectionAsync();
    loadPoints();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#fff" },
      ]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={[styles.header, { color: isDark ? "#0ff" : "#27ae60" }]}>
        🏆 Points Leaderboard
      </Text>
      {data.map((kid, index) => (
        <View key={index} style={styles.pointsRow}>
          <Text style={[styles.name, { color: isDark ? "#fff" : "#000" }]}>
            {kid.user_name}
          </Text>
          <Text style={[styles.points, { color: isDark ? "#0ff" : "#27ae60" }]}>
            {kid.total_points} pts
          </Text>
        </View>
      ))}

      <Toast />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  pointsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  name: {
    fontSize: 18,
    fontWeight: "500",
  },
  points: {
    fontSize: 18,
    fontWeight: "700",
  },
});
