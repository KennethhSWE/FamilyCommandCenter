import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';

const ChoreListItem = ({ chore }: { chore: any }) => {
  const handleRequestComplete = async () => {
    try {
      await axios.put(`http://10.0.2.2:7070/api/chores/request-complete/${chore.id}`);
      Alert.alert("Chore submitted", "Waiting for parent approval.");
      // Add optional refresh logic here
    } catch (err) {
      console.error('Failed to request chore approval:', err);
      Alert.alert("Error", "Could not mark chore as pending.");
    }
  };

  const renderStatus = () => {
    if (chore.complete) return '✅';
    if (chore.requestedComplete) return '🕒';
    return '⬜';
  };

  const renderTextColor = () => {
    if (chore.complete) return styles.done;
    if (chore.requestedComplete) return styles.pending;
    return styles.default;
  };

  return (
    <TouchableOpacity
      style={styles.item}
      onPress={handleRequestComplete}
      disabled={chore.complete || chore.requestedComplete}
    >
      <Text style={[styles.text, renderTextColor()]}>
        {renderStatus()} {chore.name} ({chore.points} pts)
      </Text>
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
  done: {
    color: 'green',
  },
  pending: {
    color: 'orange',
  },
  default: {
    color: '#000',
  },
});

export default ChoreListItem;
