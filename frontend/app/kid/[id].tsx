import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, FlatList } from "react-native";
import { getChoresByKid, Chore } from "../../src/lib/api";

export default function KidChoresScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [chores, setChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setChores(await getChoresByKid(Number(id)));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <FlatList
      data={chores}
      keyExtractor={(c) => String(c.id)}
      renderItem={({ item }) => {
        // === Chore Color Logic ===
        const overdue = !item.complete && new Date(item.dueDate) < new Date(); // due before today

        return (
          <View
            style={{
              padding: 16,
              backgroundColor: overdue ? "#331111" : "#fff",
              borderRadius: 12,
              marginBottom: 8,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                color: overdue ? "#ff6666" : "#000",
                fontWeight: "600",
              }}
            >
              {item.name}
            </Text>
            <Text
              style={{
                color: overdue ? "#ff6666" : "#444",
              }}
            >
              {item.points} pts
            </Text>
          </View>
        );
      }}
    />
  );
}
