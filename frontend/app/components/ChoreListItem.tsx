import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';

const ChoreListItem = ({ chore }: { chore: any }) => {
  const handleComplete = async () => {
    try {
      await axios.patch(`http://192.168.0.120:7070/chores${chore.id}`, {
        complete: true,
      });
      // You could trigger a refresh here with a callback prop
    } catch (err) {
      console.error('Failed to update chore:', err);
    }
  };

  return (
    <TouchableOpacity style={styles.item} onPress={handleComplete}>
      <Text style={styles.text}>⬜ {chore.name} ({chore.points} pts)</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  item: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  text: {
    fontSize: 18,
  },
});

export default ChoreListItem;
