// frontend/app/components/DailyChoreSweepPanel.tsx
import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { DailyChoreSummary, runDailyChoreSweep } from "../../src/lib/api";

export default function DailyChoreSweepPanel() {
  const [runningSweep, setRunningSweep] = useState(false);
  const [lastSweep, setLastSweep] = useState<DailyChoreSummary | null>(null);

  const runMorningSweep = async () => {
    setRunningSweep(true);

    try {
      const summary = await runDailyChoreSweep();
      setLastSweep(summary);

      Alert.alert(
        "Daily Chores Updated",
        `Kids checked: ${summary.kidsChecked}\nCarried over: ${summary.carriedOverChores}\nPenalty points: ${summary.penaltyPointsTaken}\nNew chores: ${summary.newChoresAssigned}`,
      );
    } catch (error) {
      console.error("daily sweep:", error);
      Alert.alert("Error", "Could not run the daily chore sweep.");
    } finally {
      setRunningSweep(false);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Daily Chore Sweep</Text>

      <Text style={styles.helpText}>
        This carries missed chores forward, subtracts penalty points, and
        assigns new chores from the chore pool.
      </Text>

      {lastSweep && (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>
            Kids checked: {lastSweep.kidsChecked}
          </Text>
          <Text style={styles.summaryText}>
            Carried over: {lastSweep.carriedOverChores}
          </Text>
          <Text style={styles.summaryText}>
            Penalty points: {lastSweep.penaltyPointsTaken}
          </Text>
          <Text style={styles.summaryText}>
            New chores assigned: {lastSweep.newChoresAssigned}
          </Text>
        </View>
      )}

      <Pressable
        style={[styles.primaryButton, runningSweep && styles.disabledButton]}
        disabled={runningSweep}
        onPress={runMorningSweep}
      >
        <Text style={styles.buttonText}>
          {runningSweep ? "Running..." : "Run Daily Chores"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 10,
    color: "#111827",
  },
  helpText: {
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 14,
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.55,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "900",
  },
  summaryBox: {
    backgroundColor: "#eff6ff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  summaryText: {
    color: "#1e3a8a",
    fontWeight: "700",
    marginBottom: 4,
  },
});
