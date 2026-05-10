// frontend/app/setup/rewards.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { createRewardBulk } from "../../src/lib/api";
import { getHouseholdId } from "../../src/lib/auth";

type SetupReward = {
  localId: string;
  name: string;
  cost: string;
  requiresApproval: boolean;
};

const makeSetupRewardId = () =>
  `reward-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

export default function SetupRewardsScreen() {
  const router = useRouter();

  const [rewards, setRewards] = useState<SetupReward[]>([
    {
      localId: makeSetupRewardId(),
      name: "",
      cost: "",
      requiresApproval: false,
    },
  ]);

  const [saving, setSaving] = useState(false);

  const updateReward = (
    localId: string,
    field: "name" | "cost" | "requiresApproval",
    value: string | boolean,
  ) => {
    setRewards((currentRewards) =>
      currentRewards.map((reward) =>
        reward.localId === localId ? { ...reward, [field]: value } : reward,
      ),
    );
  };

  const addAnotherReward = () => {
    setRewards((currentRewards) => [
      ...currentRewards,
      {
        localId: makeSetupRewardId(),
        name: "",
        cost: "",
        requiresApproval: false,
      },
    ]);
  };

  const removeReward = (localId: string) => {
    setRewards((currentRewards) => {
      if (currentRewards.length === 1) {
        return currentRewards;
      }

      return currentRewards.filter((reward) => reward.localId !== localId);
    });
  };

  const saveRewardsAndFinish = async () => {
    const householdId = await getHouseholdId();

    if (!householdId) {
      Alert.alert("Setup Error", "Household ID is missing. Restart setup.");
      return;
    }

    const cleanedRewards = rewards
      .map((reward) => {
        const pointCost = Number(reward.cost);

        return {
          name: reward.name.trim(),
          cost: pointCost,
          requiresApproval: reward.requiresApproval || pointCost > 50,
        };
      })
      .filter((reward) => reward.name.length > 0);

    if (cleanedRewards.length === 0) {
      Alert.alert("Rewards Needed", "Add at least one starter reward.");
      return;
    }

    const invalidReward = cleanedRewards.find(
      (reward) => !Number.isFinite(reward.cost) || reward.cost <= 0,
    );

    if (invalidReward) {
      Alert.alert(
        "Check Rewards",
        "Each reward needs a point cost greater than 0.",
      );
      return;
    }

    setSaving(true);

    try {
      await createRewardBulk(householdId, cleanedRewards);
      router.replace("/setup/done" as any);
    } catch (error: any) {
      console.error("save starter rewards:", error);

      const message =
        typeof error?.response?.data === "string"
          ? error.response.data
          : (error?.response?.data?.message ??
            error?.message ??
            "Could not save starter rewards.");

      Alert.alert("Could Not Save Rewards", message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Starter Rewards</Text>

      <Text style={styles.subtitle}>
        Add rewards your kids can spend points on. Rewards over 50 points will
        require parent approval.
      </Text>

      <FlatList
        data={rewards}
        keyExtractor={(reward) => reward.localId}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Reward {index + 1}</Text>

            <Text style={styles.label}>Reward Name</Text>
            <TextInput
              value={item.name}
              onChangeText={(value) =>
                updateReward(item.localId, "name", value)
              }
              placeholder="Example: 30 minutes tablet time"
              style={styles.input}
            />

            <Text style={styles.label}>Point Cost</Text>
            <TextInput
              value={item.cost}
              onChangeText={(value) =>
                updateReward(
                  item.localId,
                  "cost",
                  value.replace(/\D/g, "").slice(0, 4),
                )
              }
              placeholder="Example: 25"
              keyboardType="number-pad"
              style={styles.input}
            />

            <Pressable
              style={[
                styles.approvalToggle,
                item.requiresApproval && styles.approvalToggleOn,
              ]}
              onPress={() =>
                updateReward(
                  item.localId,
                  "requiresApproval",
                  !item.requiresApproval,
                )
              }
            >
              <Text
                style={[
                  styles.approvalToggleText,
                  item.requiresApproval && styles.approvalToggleTextOn,
                ]}
              >
                {item.requiresApproval
                  ? "Parent Approval Required"
                  : "Auto Redeem Under 50 Points"}
              </Text>
            </Pressable>

            {rewards.length > 1 && (
              <Pressable
                style={styles.removeButton}
                onPress={() => removeReward(item.localId)}
              >
                <Text style={styles.removeButtonText}>Remove Reward</Text>
              </Pressable>
            )}
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <Pressable
              style={styles.secondaryButton}
              onPress={addAnotherReward}
            >
              <Text style={styles.secondaryButtonText}>Add Another Reward</Text>
            </Pressable>

            <Pressable
              style={[styles.primaryButton, saving && styles.buttonDisabled]}
              onPress={saveRewardsAndFinish}
              disabled={saving}
            >
              <Text style={styles.primaryButtonText}>
                {saving ? "Saving..." : "Finish Setup"}
              </Text>
            </Pressable>
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    color: "#555",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  list: {
    paddingBottom: 28,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
  },
  label: {
    fontWeight: "800",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    backgroundColor: "#fff",
  },
  approvalToggle: {
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginBottom: 14,
  },
  approvalToggleOn: {
    backgroundColor: "#2563eb",
  },
  approvalToggleText: {
    color: "#111",
    fontWeight: "900",
  },
  approvalToggleTextOn: {
    color: "#fff",
  },
  removeButton: {
    backgroundColor: "#ef4444",
    borderRadius: 12,
    padding: 11,
    alignItems: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "900",
  },
  footer: {
    gap: 12,
  },
  secondaryButton: {
    backgroundColor: "#e5e7eb",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#111",
    fontWeight: "900",
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
