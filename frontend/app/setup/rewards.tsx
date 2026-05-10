import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function SetupRewardsScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Starter Rewards</Text>
      <Text style={styles.subtitle}>
        We will move the old add-rewards screen here next.
      </Text>

      <Pressable
        style={styles.button}
        onPress={() => router.replace("/setup/done" as any)}
      >
        <Text style={styles.buttonText}>Finish Setup</Text>
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
