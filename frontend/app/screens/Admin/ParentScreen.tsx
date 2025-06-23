// frontend/app/screens/Admin/ParentScreen.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ParentScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Parent Admin Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
});
