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
import { SafeAreaView } from "react-native-safe-area-context";

import { getChoresByKid, requestChoreApproval, Chore } from "../../src/lib/api";

export default function KidChoresScreen() {
  // Carousel passes ?id=<username>
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const username = Array.isArray(params.id) ? params.id[0] : params.id;

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

  const askParentToCheckChore = async (id: number) => {
    // Optimistic update: kid asked for approval, but did not earn points yet.
    setChores((prev) =>
      prev.map((c) => (c.id === id ? { ...c, requestedComplete: true } : c)),
    );

    try {
      await requestChoreApproval(id);
    } catch (e) {
      console.error("Request approval failed:", e);

      setChores((prev) =>
        prev.map((c) => (c.id === id ? { ...c, requestedComplete: false } : c)),
      );
    }
  };

  /* ------------------ render branches ------------------ */
  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!chores.length) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>🎉 All chores done for today!</Text>
        </View>
      </SafeAreaView>
    );
  }

  /* ------------------ main list ------------------ */
  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        contentContainerStyle={styles.listContent}
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
                style={[styles.name, item.overdue && styles.nameOverdue]}
                numberOfLines={2}
              >
                {item.name}
              </Text>
              <Text style={[styles.points, item.overdue && styles.nameOverdue]}>
                {item.points} pts
              </Text>
            </View>

            {item.complete ? (
              <Text style={styles.doneBadge}>Done</Text>
            ) : item.requestedComplete ? (
              <Text style={styles.waitingBadge}>Waiting for Parent</Text>
            ) : (
              <TouchableOpacity
                onPress={() => askParentToCheckChore(item.id)}
                style={styles.completeBtn}
                activeOpacity={0.9}
              >
                <Text style={styles.completeTxt}>I Did It</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

/* ------------------------ styles ------------------------ */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  listContent: {
    padding: 16,
    paddingTop: 20,
  },
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
  waitingBadge: {
    color: "#f39c12",
    fontWeight: "700",
    alignSelf: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },
});
