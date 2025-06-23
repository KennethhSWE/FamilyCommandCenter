import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import KidCard from '../../components/KidCard';

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

  useEffect(() => {
    const fetchChores = async () => {
      try {
        const response = await fetch('http://localhost:7070/chores');
        const data = await response.json();
        console.log("Fetched chores:", data);
        setChores(data);
      } catch (error) {
        console.error('Error fetching chores:', error);
      }
    };

    fetchChores();
  }, []);

  // Group chores by kid name
  const choresByKid: Record<string, Chore[]> = chores.reduce((acc, chore) => {
    if (!acc[chore.assignedTo]) {
      acc[chore.assignedTo] = [];
    }
    acc[chore.assignedTo].push(chore);
    return acc;
  }, {} as Record<string, Chore[]>);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Today's Chores</Text>
      {Object.entries(choresByKid).map(([kidName, kidChores]) => (
        <KidCard key={kidName} name={kidName} chores={kidChores} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default KidsScreen;
