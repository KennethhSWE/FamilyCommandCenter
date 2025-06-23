import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import KidCard from "../../components/KidCard";

interface ChoreDTO {
  id: number;
  name: string;
  assignedTo: string;   
  dueDate: string;
  points: number;
  complete: boolean;
}

const KidsScreen = () => {
  const [kids]        = useState<string[]>(["Ella", "Lincoln", "Austin"]);
  const [choresByKid, setChoresByKid] = useState<Record<string, ChoreDTO[]>>({});
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const fetchChores = async () => {

       console.log("Fetching chores...");

      try {
        // correct URL
        const { data } = await axios.get<ChoreDTO[]>(
          "http://192.168.0.120:7070/api/chores"
        );

        // group with correct keys
        const grouped: Record<string, ChoreDTO[]> = {};
        kids.forEach(kid => {
          grouped[kid] = data.filter(
            c => c.assignedTo.trim() === kid && !c.complete
          );
        });
        console.log("Grouped:", grouped);
      
        setChoresByKid(grouped);
      } catch (err) {
        console.error("Error fetching chores:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChores();
  }, [kids]);

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {kids.map(kid => (
        <KidCard key={kid} name={kid} chores={choresByKid[kid] ?? []} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100,
  },
});

export default KidsScreen;
