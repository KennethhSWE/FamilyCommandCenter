import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, StyleSheet, ActivityIndicator } from "react-native";
import ChoreListItem from "../../components/ChoreListItem";

interface Chore {
  id: number;
  name: string;
  assignedTo: string;
  complete: boolean;
  dueDate: string;
  points: number;
}

const KidsScreen = () => {
  const [chores, setChores] = useState<Chore[]>([]);
  const [debugMessage, setDebugMessage] = useState("Loading chores...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChores = async () => {
      try {
        const response = await fetch("http://192.168.1.122:7070/api/chores"); 
        if (!response.ok) {
          throw new Error("Server responded with " + response.status);
        }
        const data = await response.json();
        setChores(data);
        setDebugMessage("Chores loaded.");
      } catch (error) {
        console.error("Error fetching chores:", error);
        setDebugMessage("Could not load chores: " + error);
      } finally {
        setLoading(false);
      }
    };

    fetchChores();
  }, []);

  // Group chores by kid name (trimmed to exclude spaces errors)
  const choresByKid: Record<string, Chore[]> = chores.reduce((acc, chore) => {
    const trimmedName = chore.assignedTo.trim();
    if (!acc[trimmedName]) {
      acc[trimmedName] = [];
    }
    acc[trimmedName].push(chore);
    return acc;
  }, {} as Record<string, Chore[]>);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.debugText}>{debugMessage}</Text>

      {loading && <ActivityIndicator size="large" color="#007aff" />}

      {Object.entries(choresByKid).map(([kid, kidChores]) => (
        <View key={kid} style={{ marginBottom: 20 }}>
          <Text style={styles.header}>{kid}</Text>
          {kidChores.map((chore) => (
            <ChoreListItem key={chore.id} chore={chore} />
          ))}
        </View>
      ))}

      {!loading && chores.length === 0 && (
        <Text style={{ textAlign: "center", marginTop: 20, color: "gray" }}>
          No chores available.
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  debugText: {
    fontSize: 12,
    color: "gray",
    marginBottom: 10,
  },
});

export default KidsScreen;
