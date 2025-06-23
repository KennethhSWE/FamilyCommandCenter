// frontend/app/screens/Admin/PointsHouseScreen.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PointsHouseScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Points House</Text>
      <Text style={styles.subtitle}>Track kids' points and rankings here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#eef2f7',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#636e72',
  },
});
