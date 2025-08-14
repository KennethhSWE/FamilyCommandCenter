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

import { getKidsByHousehold, getPoints } from "../../src/lib/api";
import { getHouseholdId } from "../../src/lib/auth";

type Row = { user_name: string; total_points: number };

export default function PointsScreen() {
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isDark = useColorScheme() === "dark";

  const loadPoints = async () => {
    try {
      setLoading(true);

      const hh = await getHouseholdId();
      if (!hh) {
        setData([]);
        return;
      }

      const kids = await getKidsByHousehold(hh);
      const rows: Row[] = await Promise.all(
        kids.map(async (k) => {
          try {
            const { points } = await getPoints(k.username);
            return { user_name: k.username, total_points: points ?? 0 };
          } catch {
            return { user_name: k.username, total_points: 0 };
          }
        })
      );

      rows.sort((a, b) => b.total_points - a.total_points);
      setData(rows);
    } catch (err) {
      console.error("[Points] load failed:", err);
      Toast.show({ type: "error", text1: "Failed to load points" });
      setData([]);
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

      {data.map((kid) => (
        <View key={kid.user_name} style={styles.pointsRow}>
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