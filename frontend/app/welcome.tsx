import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.heroIcon}>
          <MaterialCommunityIcons name="home-heart" size={44} color="#ffffff" />
        </View>

        <Text style={styles.eyebrow}>Family Command Center</Text>

        <Text style={styles.title}>Set up this device</Text>

        <Text style={styles.subtitle}>
          Create a new family account or connect this device to an existing
          family.
        </Text>

        <Pressable
          style={styles.primaryCard}
          onPress={() => router.push("/setup/parent" as any)}
        >
          <View style={styles.cardIcon}>
            <MaterialCommunityIcons
              name="home-plus"
              size={34}
              color="#2563eb"
            />
          </View>

          <View style={styles.cardTextBox}>
            <Text style={styles.cardTitle}>Create New Family</Text>
            <Text style={styles.cardText}>
              Start a new household, add kids, chores, and rewards.
            </Text>
          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={28}
            color="#9ca3af"
          />
        </Pressable>

        <Pressable
          style={styles.primaryCard}
          onPress={() => router.push("/login" as any)}
        >
          <View style={styles.cardIconPurple}>
            <MaterialCommunityIcons name="login" size={34} color="#7c3aed" />
          </View>

          <View style={styles.cardTextBox}>
            <Text style={styles.cardTitle}>I Already Have a Family</Text>
            <Text style={styles.cardText}>
              Log in with the parent name and PIN to connect this device.
            </Text>
          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={28}
            color="#9ca3af"
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#eef2ff",
  },
  container: {
    flex: 1,
    padding: 22,
    justifyContent: "center",
  },
  heroIcon: {
    width: 82,
    height: 82,
    borderRadius: 28,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 14,
    fontWeight: "900",
    color: "#4f46e5",
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 10,
    marginBottom: 28,
    fontSize: 16,
    lineHeight: 23,
    color: "#4b5563",
    textAlign: "center",
  },
  primaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 18,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dbeafe",
    shadowColor: "#111827",
    shadowOpacity: 0.11,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  cardIcon: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardIconPurple: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: "#f3e8ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardTextBox: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#4b5563",
    fontWeight: "600",
  },
});
