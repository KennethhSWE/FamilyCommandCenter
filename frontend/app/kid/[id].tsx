// frontend/app/kid/[id].tsx
//--------------------------------------------------------------
//  Kid detail – shows today’s chores for the selected child
//--------------------------------------------------------------
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";

import { getChoresByKid, completeChore, Chore } from "../../src/lib/api";

export default function KidChoresScreen() {
  // Carousel passes ?id=<username>
  const { id: username } = useLocalSearchParams<{ id: string }>();

  const [chores, setChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (username) {
          const list = await getChoresByKid(username);
          setChores(list);
        }
      } catch (e) {
        console.error("Failed to load chores:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [username]);

  const onComplete = async (id: number) => {
    // optimistic update
    setChores(prev => prev.map(c => (c.id === id ? { ...c, complete: true } : c)));
    try {
      await completeChore(id);
    } catch (e) {
      // rollback if it failed
      console.error("Complete failed:", e);
      setChores(prev => prev.map(c => (c.id === id ? { ...c, complete: false } : c)));
    }
  };

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
            item.overdue && styles.cardOverdue,
            item.complete && styles.cardDone,
          ]}
        >
          <View style={styles.left}>
            <Text
              style={[
                styles.name,
                item.overdue && styles.nameOverdue,
              ]}
              numberOfLines={2}
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

          {item.complete ? (
            <Text style={styles.doneBadge}>Done</Text>
          ) : (
            <TouchableOpacity
              onPress={() => onComplete(item.id)}
              style={styles.completeBtn}
              activeOpacity={0.9}
            >
              <Text style={styles.completeTxt}>Complete</Text>
            </TouchableOpacity>
          )}
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
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardOverdue: {
    backgroundColor: "#331111",
  },
  cardDone: {
    opacity: 0.7,
  },
  left: { flex: 1, paddingRight: 12 },
  name: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  nameOverdue: {
    color: "#ff6666",
  },
  points: {
    color: "#4b5563",
    fontWeight: "500",
  },
  completeBtn: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  completeTxt: { color: "#fff", fontWeight: "700" },
  doneBadge: { color: "#16a34a", fontWeight: "700" },
});
