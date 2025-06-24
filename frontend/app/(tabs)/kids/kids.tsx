import React, { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  RefreshControl,
} from "react-native";
import ChoreListItem from "../../components/ChoreListItem";

interface Chore {
  id: number;
  name: string;
  assignedTo: string;
  complete: boolean;
  dueDate: string;
  points: number;
  requestedComplete?: boolean;
}

export default function KidsScreen() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChores = async () => {
    try {
      const response = await fetch("http://192.168.1.122:7070/api/chores");
      const data = await response.json();
      setChores(data);
    } catch (error) {
      console.error("Error fetching chores:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
    fetchChores();
  }, [])
);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchChores();
    setRefreshing(false);
  };

  const choresByKid: Record<string, Chore[]> = chores.reduce((acc, chore) => {
    const trimmedName = chore.assignedTo.trim();
    if (!acc[trimmedName]) {
      acc[trimmedName] = [];
    }
    acc[trimmedName].push(chore);
    return acc;
  }, {} as Record<string, Chore[]>);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      contentInset={{ bottom: 100}}
    >
      <Text style={styles.header}>🔥 You Are On the Kids Screen</Text>
      {Object.entries(choresByKid).map(([kid, kidChores]) => (
        <View key={kid} style={styles.kidBlock}>
          <Text style={styles.kidName}>{kid}</Text>
          {kidChores.map((chore) => (
            <ChoreListItem
              key={chore.id}
              chore={chore}
              onRefresh={handleRefresh}
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    padding: 16,
    paddingBottom: 120, // Prevents hiding behind tab bar so that its more visable
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "green",
  },
  kidBlock: {
    marginBottom: 24,
  },
  kidName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#000000",
  },
});
