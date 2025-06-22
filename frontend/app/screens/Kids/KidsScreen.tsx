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

const KidsScreen = () => {
  const [kids, setKids] = useState<string[]>(["Ella", "Lincoln", "Austin"]); // temp hardcoded
  const [choresByKid, setChoresByKid] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChores = async () => {
      try {
        const res = await axios.get<
          {
            id: number;
            name: string;
            assigned_to: string;
            points: number;
            is_complete: boolean;
          }[]
        >("http://192.168.0.120:7070/chores");

        const chores = res.data;

        console.log('Fetched chores: ', chores);

        const grouped: any = {};
        console.log("Fetched chores: ", chores);
        console.log("Grouped by kid: ", grouped);
        kids.forEach((kid) => {
          grouped[kid] = chores.filter(
            (c: any) => c.assigned_to === kid && !c.is_complete
          );
        });

        console.log('Grouped chores: ', grouped); 

        setChoresByKid(grouped);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching chores:", error);
      }
    };

    fetchChores();
  }, []);

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {kids.map((kid) => (
        <KidCard key={kid} name={kid} chores={choresByKid[kid] || []} />
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
