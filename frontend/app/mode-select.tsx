import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { saveDeviceMode } from "../src/lib/deviceMode";

export default function ModeSelectScreen() {
  const router = useRouter();

  const chooseHubMode = async () => {
    await saveDeviceMode("hub");
    router.replace("/hub" as any);
  };

  const chooseCompanionMode = async () => {
    await saveDeviceMode("companion");
    router.replace("/(tabs)" as any);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>Family Command Center</Text>

        <Text style={styles.title}>Choose this device layout</Text>

        <Text style={styles.subtitle}>
          Pick once for this device. The tablet can use Hub Mode and your phone
          can use Companion Mode.
        </Text>

        <Pressable style={styles.card} onPress={chooseHubMode}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="tablet" size={42} color="#2563eb" />
          </View>

          <View style={styles.cardTextBox}>
            <Text style={styles.cardTitle}>Family Hub Tablet</Text>
            <Text style={styles.cardText}>
              Large dashboard for the pantry tablet with chores, points,
              calendar, bills, and alerts.
            </Text>
          </View>
        </Pressable>

        <Pressable style={styles.card} onPress={chooseCompanionMode}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name="cellphone"
              size={42}
              color="#7c3aed"
            />
          </View>

          <View style={styles.cardTextBox}>
            <Text style={styles.cardTitle}>Parent Phone Companion</Text>
            <Text style={styles.cardText}>
              Parent control layout for approvals, points, rewards, chores,
              calendar, and settings.
            </Text>
          </View>
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
    fontSize: 34,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 10,
    marginBottom: 26,
    fontSize: 16,
    lineHeight: 23,
    color: "#4b5563",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dbeafe",
    shadowColor: "#111827",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  cardTextBox: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 6,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 21,
    color: "#4b5563",
    fontWeight: "600",
  },
});
