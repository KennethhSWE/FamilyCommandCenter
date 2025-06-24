import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  useColorScheme,
} from "react-native";
import ChoreListItem from "../../components/ChoreListItem";

interface Chore {
  id: number;
  name: string;
  assignedTo: string;
  complete: boolean;
  dueDate: string;
  points: number;
}

export default function KidsScreen() {
  const [chores, setChores] = useState<Chore[]>([]);

  useEffect(() => {
    const fetchChores = async () => {
      try {
        const response = await fetch("http://10.0.2.2:7070/api/chores");
        const data = await response.json();
        setChores(data);
      } catch (error) {
        console.error("Error fetching chores:", error);
      }
    };

    fetchChores();
  }, []);

  const choresByKid: Record<string, Chore[]> = chores.reduce((acc, chore) => {
    const trimmedName = chore.assignedTo.trim();
    if (!acc[trimmedName]) {
      acc[trimmedName] = [];
    }
    acc[trimmedName].push(chore);
    return acc;
  }, {} as Record<string, Chore[]>);

  return (
     <View style={styles.safeContainer}>
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.header}>🔥 You Are On the Kids Screen</Text>
      <Text style={{ textAlign: "center", color: "gray", marginBottom: 10 }}>
        Total chores loaded: {chores.length}
      </Text>

      {Object.entries(choresByKid).map(([kid, kidChores]) => (
        <View key={kid} style={styles.kidBlock}>
          <Text style={styles.kidName}>{kid}</Text>
          {kidChores.map((chore) => (
            <ChoreListItem key={chore.id} chore={chore} />
          ))}
        </View>
      ))}
    </ScrollView>
  </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#ffffff", // FORCES visible background on all phones
  },
  scrollContent: {
    padding: 16,
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
