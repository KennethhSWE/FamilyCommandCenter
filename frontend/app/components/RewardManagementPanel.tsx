// frontend/app/components/RewardManagementPanel.tsx
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  Reward,
  createReward,
  deleteReward,
  getRewards,
} from "../../src/lib/api";

export default function RewardManagementPanel() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [rewardName, setRewardName] = useState("");
  const [rewardCost, setRewardCost] = useState("");
  const [rewardNeedsApproval, setRewardNeedsApproval] = useState(false);
  const [savingReward, setSavingReward] = useState(false);
  const [deletingRewardId, setDeletingRewardId] = useState<number | null>(null);

  const loadRewards = useCallback(async () => {
    try {
      const rewardList = await getRewards();
      setRewards(rewardList);
    } catch (error) {
      console.error("load rewards:", error);
      Alert.alert("Error", "Could not load rewards.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRewards();
    }, [loadRewards]),
  );

  const addRewardFromAdmin = async () => {
    const cleanName = rewardName.trim();
    const cost = Number(rewardCost);

    if (!cleanName) {
      Alert.alert("Missing Reward", "Enter a reward name.");
      return;
    }

    if (!Number.isFinite(cost) || cost <= 0) {
      Alert.alert("Invalid Cost", "Enter a reward cost greater than 0.");
      return;
    }

    setSavingReward(true);

    try {
      await createReward(cleanName, cost, rewardNeedsApproval || cost > 50);

      setRewardName("");
      setRewardCost("");
      setRewardNeedsApproval(false);

      await loadRewards();

      Alert.alert("Reward Added", "The reward shop has been updated.");
    } catch (error) {
      console.error("add reward:", error);
      Alert.alert("Error", "Could not add this reward.");
    } finally {
      setSavingReward(false);
    }
  };

  const removeRewardFromAdmin = async (reward: Reward) => {
    Alert.alert("Delete Reward", `Delete "${reward.name}"?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeletingRewardId(reward.id);

          try {
            await deleteReward(reward.id);
            await loadRewards();
          } catch (error) {
            console.error("delete reward:", error);
            Alert.alert("Error", "Could not delete this reward.");
          } finally {
            setDeletingRewardId(null);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Manage Rewards</Text>

      <Text style={styles.helpText}>
        Add rewards kids can spend points on. Rewards over 50 points require
        parent approval automatically.
      </Text>

      <Text style={styles.label}>Reward Name</Text>
      <TextInput
        value={rewardName}
        onChangeText={setRewardName}
        placeholder="Example: 30 minutes tablet time"
        style={styles.input}
      />

      <Text style={styles.label}>Point Cost</Text>
      <TextInput
        value={rewardCost}
        onChangeText={(value) =>
          setRewardCost(value.replace(/\D/g, "").slice(0, 4))
        }
        keyboardType="number-pad"
        placeholder="Example: 25"
        style={styles.input}
      />

      <View style={styles.switchRow}>
        <View style={styles.switchTextBox}>
          <Text style={styles.switchTitle}>Require Parent Approval</Text>
          <Text style={styles.switchSubtitle}>
            Turn this on for rewards that should always be reviewed first.
          </Text>
        </View>

        <Switch
          value={rewardNeedsApproval}
          onValueChange={setRewardNeedsApproval}
        />
      </View>

      <Pressable
        style={[styles.primaryButton, savingReward && styles.disabledButton]}
        disabled={savingReward}
        onPress={addRewardFromAdmin}
      >
        <Text style={styles.buttonText}>
          {savingReward ? "Saving..." : "Add Reward"}
        </Text>
      </Pressable>

      <View style={styles.divider} />

      <Text style={styles.subSectionTitle}>Current Rewards</Text>

      {rewards.length === 0 ? (
        <Text style={styles.emptyText}>No rewards created yet.</Text>
      ) : (
        rewards.map((reward) => (
          <View key={reward.id} style={styles.rewardAdminCard}>
            <View style={styles.rewardAdminInfo}>
              <Text style={styles.rewardAdminName}>{reward.name}</Text>
              <Text style={styles.rewardAdminMeta}>
                {reward.cost} pts
                {reward.requiresApproval || reward.cost > 50
                  ? " • Parent approval"
                  : " • Auto redeem"}
              </Text>
            </View>

            <Pressable
              style={[
                styles.deleteRewardButton,
                deletingRewardId === reward.id && styles.disabledButton,
              ]}
              disabled={deletingRewardId === reward.id}
              onPress={() => removeRewardFromAdmin(reward)}
            >
              <Text style={styles.buttonText}>
                {deletingRewardId === reward.id ? "..." : "Delete"}
              </Text>
            </Pressable>
          </View>
        ))
      )}
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
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  switchTextBox: {
    flex: 1,
  },
  switchTitle: {
    fontWeight: "900",
    color: "#111827",
  },
  switchSubtitle: {
    color: "#6b7280",
    marginTop: 2,
    lineHeight: 18,
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
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 18,
  },
  subSectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 10,
  },
  rewardAdminCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rewardAdminInfo: {
    flex: 1,
  },
  rewardAdminName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },
  rewardAdminMeta: {
    color: "#6b7280",
    fontWeight: "700",
    marginTop: 3,
  },
  deleteRewardButton: {
    backgroundColor: "#ef4444",
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
});
