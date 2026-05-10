import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function SetupDoneScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Setup Complete</Text>
      <Text style={styles.subtitle}>Your Family Command Center is ready.</Text>

      <Pressable
        style={styles.button}
        onPress={() => router.replace("/(tabs)/kids" as any)}
      >
        <Text style={styles.buttonText}>Go to Dashboard</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f3f4f6",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: { textAlign: "center", color: "#555", marginBottom: 20 },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "900" },
});
