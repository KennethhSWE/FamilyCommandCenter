// frontend/app/kid/[id].tsx
//--------------------------------------------------------------
//  Kid detail – shows today’s chores for the selected child
//--------------------------------------------------------------
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

import { getChoresByKid, Chore } from "../../src/lib/api";

export default function KidChoresScreen() {
  /* The carousel passes ?id=<username> */
  const { id: username } = useLocalSearchParams<{ id: string }>();

  const [chores, setChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (username) {
          setChores(await getChoresByKid(username));
        }
      } catch (e) {
        console.error("Failed to load chores:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [username]);

  /* ------------------ render branches ------------------ */
  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  if (!chores.length) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 18, color: "#666" }}>
          🎉 All chores done for today!
        </Text>
      </View>
    );
  }

  /* ------------------ main list ------------------ */
  return (
    <FlatList
      contentContainerStyle={{ padding: 16 }}
      data={chores}
      keyExtractor={(c) => String(c.id)}
      renderItem={({ item }) => (
        <View
          style={[
            styles.card,
            item.overdue && styles.cardOverdue, // red cue for overdue
          ]}
        >
          <Text
            style={[
              styles.name,
              item.overdue && styles.nameOverdue, // red text for overdue
            ]}
          >
            {item.name}
          </Text>
          <Text
            style={[
              styles.points,
              item.overdue && styles.nameOverdue,
            ]}
          >
            {item.points} pts
          </Text>
        </View>
      )}
    />
  );
}

/* ------------------------ styles ------------------------ */
const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardOverdue: {
    backgroundColor: "#331111",
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  nameOverdue: {
    color: "#ff6666",
  },
  points: {
    color: "#444",
  },
});
