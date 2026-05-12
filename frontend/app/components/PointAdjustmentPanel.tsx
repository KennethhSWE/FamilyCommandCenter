// frontend/app/components/admin/PointAdjustmentPanel.tsx
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  Kid,
  PointAdjustmentResult,
  adjustPoints,
  getKidsByHousehold,
} from "../../src/lib/api";
import { getHouseholdId } from "../../src/lib/auth";

export default function PointAdjustmentPanel() {
  const [kids, setKids] = useState<Kid[]>([]);
  const [selectedKidUsername, setSelectedKidUsername] = useState("");
  const [pointAction, setPointAction] = useState<"ADD" | "REMOVE">("ADD");
  const [pointAmount, setPointAmount] = useState("");
  const [pointReason, setPointReason] = useState("");
  const [adjustingPoints, setAdjustingPoints] = useState(false);
  const [lastPointResult, setLastPointResult] =
    useState<PointAdjustmentResult | null>(null);

  const loadKids = useCallback(async () => {
    try {
      const householdId = await getHouseholdId();

      if (!householdId) {
        setKids([]);
        setSelectedKidUsername("");
        return;
      }

      const householdKids = await getKidsByHousehold(householdId);

      setKids(householdKids);

      if (!selectedKidUsername && householdKids.length > 0) {
        setSelectedKidUsername(householdKids[0].username);
      }
    } catch (error) {
      console.error("load kids for point adjustment:", error);
      Alert.alert("Error", "Could not load kids for point adjustment.");
    }
  }, [selectedKidUsername]);

  useFocusEffect(
    useCallback(() => {
      loadKids();
    }, [loadKids]),
  );

  const submitPointAdjustment = async () => {
    const amount = Number(pointAmount);
    const reason = pointReason.trim();

    if (!selectedKidUsername) {
      Alert.alert("Pick a Kid", "Choose which kid gets the point adjustment.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert("Invalid Points", "Enter a point amount greater than 0.");
      return;
    }

    if (!reason) {
      Alert.alert("Reason Needed", "Enter a reason for the point adjustment.");
      return;
    }

    setAdjustingPoints(true);

    try {
      const result = await adjustPoints(
        selectedKidUsername,
        amount,
        pointAction,
        reason,
      );

      setLastPointResult(result);
      setPointAmount("");
      setPointReason("");

      Alert.alert(
        "Points Updated",
        `${result.username}: ${result.oldPoints} → ${result.newPoints}`,
      );
    } catch (error: any) {
      console.error("adjust points:", error);

      const message =
        typeof error?.response?.data === "string"
          ? error.response.data
          : (error?.response?.data?.message ??
            error?.message ??
            "Could not adjust points.");

      Alert.alert("Point Adjustment Failed", message);
    } finally {
      setAdjustingPoints(false);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Adjust Points</Text>

      <Text style={styles.helpText}>
        Add bonus points, remove points, or correct mistakes. A reason is
        required so we can show point history later.
      </Text>

      <Text style={styles.label}>Kid</Text>
      <View style={styles.kidPickerRow}>
        {kids.length === 0 ? (
          <Text style={styles.emptyText}>No kids found.</Text>
        ) : (
          kids.map((kid) => {
            const selected = selectedKidUsername === kid.username;

            return (
              <Pressable
                key={kid.id ?? kid.username}
                style={[
                  styles.kidPickButton,
                  selected && styles.kidPickButtonSelected,
                ]}
                onPress={() => setSelectedKidUsername(kid.username)}
              >
                <Text
                  style={[
                    styles.kidPickText,
                    selected && styles.kidPickTextSelected,
                  ]}
                >
                  {kid.name}
                </Text>
              </Pressable>
            );
          })
        )}
      </View>

      <Text style={styles.label}>Action</Text>
      <View style={styles.buttonRow}>
        <Pressable
          style={[
            styles.actionButton,
            pointAction === "ADD" && styles.addActionSelected,
          ]}
          onPress={() => setPointAction("ADD")}
        >
          <Text
            style={[
              styles.actionButtonText,
              pointAction === "ADD" && styles.actionButtonTextSelected,
            ]}
          >
            Add Points
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.actionButton,
            pointAction === "REMOVE" && styles.removeActionSelected,
          ]}
          onPress={() => setPointAction("REMOVE")}
        >
          <Text
            style={[
              styles.actionButtonText,
              pointAction === "REMOVE" && styles.actionButtonTextSelected,
            ]}
          >
            Remove Points
          </Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Points</Text>
      <TextInput
        value={pointAmount}
        onChangeText={(value) =>
          setPointAmount(value.replace(/\D/g, "").slice(0, 4))
        }
        keyboardType="number-pad"
        placeholder="Example: 5"
        style={styles.input}
      />

      <Text style={styles.label}>Reason</Text>
      <TextInput
        value={pointReason}
        onChangeText={setPointReason}
        placeholder="Example: Helped clean the living room"
        style={styles.input}
      />

      {lastPointResult && (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>
            Last adjustment: {lastPointResult.username}
          </Text>
          <Text style={styles.summaryText}>
            {lastPointResult.oldPoints} → {lastPointResult.newPoints}
          </Text>
          <Text style={styles.summaryText}>
            Reason: {lastPointResult.reason}
          </Text>
        </View>
      )}

      <Pressable
        style={[styles.primaryButton, adjustingPoints && styles.disabledButton]}
        disabled={adjustingPoints}
        onPress={submitPointAdjustment}
      >
        <Text style={styles.buttonText}>
          {adjustingPoints ? "Saving..." : "Save Point Adjustment"}
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
  emptyText: {
    color: "#6b7280",
    lineHeight: 20,
  },
  helpText: {
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 14,
  },
  label: {
    fontWeight: "800",
    marginBottom: 6,
    color: "#111827",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  kidPickerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  kidPickButton: {
    backgroundColor: "#e5e7eb",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  kidPickButtonSelected: {
    backgroundColor: "#2563eb",
  },
  kidPickText: {
    fontWeight: "900",
    color: "#111827",
  },
  kidPickTextSelected: {
    color: "#fff",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  addActionSelected: {
    backgroundColor: "#16a34a",
  },
  removeActionSelected: {
    backgroundColor: "#dc2626",
  },
  actionButtonText: {
    color: "#111827",
    fontWeight: "900",
  },
  actionButtonTextSelected: {
    color: "#fff",
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
