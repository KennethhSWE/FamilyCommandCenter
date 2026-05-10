// frontend/app/setup/done.tsx
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function SetupDoneScreen() {
  const router = useRouter();

  const goToCommandCenter = () => {
    router.replace("/(tabs)/kids" as any);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <MaterialCommunityIcons
          name="home-heart"
          size={72}
          color="#2563eb"
          style={styles.icon}
        />

        <Text style={styles.title}>Setup Complete</Text>

        <Text style={styles.subtitle}>
          Your Family Command Center is ready. Kids can now view their chores,
          mark chores done, earn points after approval, and redeem rewards.
        </Text>

        <View style={styles.ruleBox}>
          <Text style={styles.ruleTitle}>How it works</Text>

          <Text style={styles.ruleText}>
            Kids can mark chores as done, but points are only awarded after a
            parent approves them.
          </Text>

          <Text style={styles.ruleText}>
            Parent areas like Admin, Alerts, and Calendar controls require the
            parent PIN.
          </Text>
        </View>

        <Pressable style={styles.button} onPress={goToCommandCenter}>
          <Text style={styles.buttonText}>Open Family Dashboard</Text>
        </Pressable>
      </View>
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 24,
    elevation: 3,
  },
  icon: {
    alignSelf: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    color: "#555",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 20,
  },
  ruleBox: {
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  ruleTitle: {
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 8,
    color: "#1e3a8a",
  },
  ruleText: {
    color: "#1f2937",
    marginBottom: 8,
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    padding: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
});
