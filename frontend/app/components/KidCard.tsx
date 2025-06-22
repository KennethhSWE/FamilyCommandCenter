import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ChoreListItem from './ChoreListItem';

interface Props {
  name: string;
  chores: any[];
}

const KidCard = ({ name, chores }: Props) => {
  return (
    <View style={styles.card}>
      <Text style={styles.kidName}>{name}</Text>
      {chores.length === 0 ? (
        <Text style={styles.noChores}>🎉 No chores today!</Text>
      ) : (
        chores.map((chore, index) => (
          <ChoreListItem key={index} chore={chore} />
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    elevation: 4,
  },
  kidName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noChores: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#666',
  },
});

export default KidCard;
