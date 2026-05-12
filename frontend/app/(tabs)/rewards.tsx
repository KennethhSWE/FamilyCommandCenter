// frontend/app/(tabs)/rewards.tsx
//--------------------------------------------------------------
// Rewards tab – kid reward shop
//--------------------------------------------------------------
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getKids,
  getPoints,
  getRewards,
  Kid,
  redeemReward,
  Reward,
} from "../../src/lib/api";

export default function RewardsScreen() {
  const [kids, setKids] = useState<Kid[]>([]);
  const [selectedKidUsername, setSelectedKidUsername] = useState("");
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [points, setPoints] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [workingRewardId, setWorkingRewardId] = useState<number | null>(null);

  const selectedKid = useMemo(() => {
    return kids.find((kid) => kid.username === selectedKidUsername) ?? null;
  }, [kids, selectedKidUsername]);

  const loadRewardsScreen = useCallback(async () => {
    setRefreshing(true);

    try {
      const [kidList, rewardList] = await Promise.all([
        getKids(),
        getRewards(),
      ]);

      setKids(kidList);
      setRewards(rewardList);

      const currentKidStillExists = kidList.some(
        (kid) => kid.username === selectedKidUsername,
      );

      const usernameToUse =
        currentKidStillExists && selectedKidUsername
          ? selectedKidUsername
          : (kidList[0]?.username ?? "");

      setSelectedKidUsername(usernameToUse);

      if (usernameToUse) {
        const kidPoints = await getPoints(usernameToUse);
        setPoints(kidPoints);
      } else {
        setPoints(0);
      }
    } catch (error) {
      console.error("load rewards:", error);
      Alert.alert("Error", "Could not load rewards.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedKidUsername]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadRewardsScreen();
    }, [loadRewardsScreen]),
  );

  const chooseKid = async (kid: Kid) => {
    setSelectedKidUsername(kid.username);
    setWorkingRewardId(null);

    try {
      const kidPoints = await getPoints(kid.username);
      setPoints(kidPoints);
    } catch (error) {
      console.error("load kid points:", error);
      Alert.alert("Error", "Could not load this kid's points.");
    }
  };

  const confirmReward = (reward: Reward) => {
    if (!selectedKid) {
      Alert.alert("Pick a Kid", "Choose who is redeeming this reward.");
      return;
    }

    if (workingRewardId !== null) {
      return;
    }

    if (points < reward.cost) {
      Alert.alert(
        "Not Enough Points",
        `${selectedKid.name} needs ${reward.cost - points} more points for this reward.`,
      );
      return;
    }

    const needsApproval = reward.requiresApproval || reward.cost > 50;

    Alert.alert(
      "Redeem Reward",
      needsApproval
        ? `${selectedKid.name} wants "${reward.name}" for ${reward.cost} points. This will go to parent approval.`
        : `${selectedKid.name} will spend ${reward.cost} points on "${reward.name}".`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: needsApproval ? "Request Reward" : "Redeem",
          onPress: () => askForReward(reward),
        },
      ],
    );
  };

  const askForReward = async (reward: Reward) => {
    if (!selectedKid) {
      return;
    }

    setWorkingRewardId(reward.id);

    try {
      const result = await redeemReward(reward.id, selectedKid.username);

      if (result.status === "AUTO_APPROVED") {
        Alert.alert(
          "Reward Redeemed",
          `${selectedKid.name} redeemed "${reward.name}".`,
        );
      } else if (result.status === "WAITING_FOR_PARENT") {
        Alert.alert(
          "Waiting for Parent",
          `"${reward.name}" was sent to the parent approval queue.`,
        );
      } else if (result.status === "NOT_ENOUGH_POINTS") {
        Alert.alert("Not Enough Points", result.message);
      } else {
        Alert.alert("Reward", result.message);
      }

      const updatedPoints = await getPoints(selectedKid.username);
      setPoints(updatedPoints);

      await loadRewardsScreen();
    } catch (error: any) {
      console.error("redeem reward:", error);

      const message =
        typeof error?.response?.data === "string"
          ? error.response.data
          : (error?.response?.data?.message ??
            error?.message ??
            "Could not redeem this reward.");

      Alert.alert("Could Not Redeem Reward", message);
    } finally {
      setWorkingRewardId(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading rewards...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadRewardsScreen}
          />
        }
      >
        <Text style={styles.header}>Rewards</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Who is redeeming?</Text>

          {kids.length === 0 ? (
            <Text style={styles.emptyText}>No kids found yet.</Text>
          ) : (
            <View style={styles.kidRow}>
              {kids.map((kid) => {
                const isSelected = selectedKidUsername === kid.username;

                return (
                  <Pressable
                    key={kid.id ?? kid.username}
                    style={[
                      styles.kidButton,
                      isSelected && styles.kidButtonSelected,
                    ]}
                    onPress={() => chooseKid(kid)}
                  >
                    <Text
                      style={[
                        styles.kidButtonText,
                        isSelected && styles.kidButtonTextSelected,
                      ]}
                    >
                      {kid.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {selectedKid && (
            <View style={styles.pointsBox}>
              <Text style={styles.pointsNumber}>{points}</Text>
              <Text style={styles.pointsText}>
                points available for {selectedKid.name}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reward Shop</Text>

          {rewards.length === 0 ? (
            <Text style={styles.emptyText}>No rewards available yet.</Text>
          ) : (
            rewards.map((reward) => {
              const canAfford = points >= reward.cost;
              const needsApproval = reward.requiresApproval || reward.cost > 50;
              const isWorking = workingRewardId === reward.id;

              return (
                <Pressable
                  key={reward.id}
                  style={[
                    styles.rewardCard,
                    !canAfford && styles.rewardCardDisabled,
                  ]}
                  onPress={() => confirmReward(reward)}
                  disabled={isWorking}
                >
                  <View style={styles.rewardTopRow}>
                    <View style={styles.rewardTextBox}>
                      <Text style={styles.rewardName}>{reward.name}</Text>
                      <Text style={styles.rewardCost}>
                        {reward.cost} points
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusPill,
                        canAfford
                          ? styles.canAffordPill
                          : styles.cannotAffordPill,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          canAfford
                            ? styles.canAffordText
                            : styles.cannotAffordText,
                        ]}
                      >
                        {canAfford ? "Enough" : "Need More"}
                      </Text>
                    </View>
                  </View>

                  {needsApproval && (
                    <Text style={styles.approvalText}>
                      Requires parent approval
                    </Text>
                  )}

                  <View
                    style={[
                      styles.redeemButton,
                      (!canAfford || !selectedKid || isWorking) &&
                        styles.disabledButton,
                    ]}
                  >
                    <Text style={styles.redeemButtonText}>
                      {isWorking
                        ? "Requesting..."
                        : needsApproval
                          ? "Request Reward"
                          : "Redeem Reward"}
                    </Text>
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#6b7280",
    fontWeight: "700",
  },
  container: {
    padding: 16,
    paddingBottom: 120,
  },
  header: {
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 18,
    color: "#111827",
  },
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
    marginBottom: 12,
    color: "#111827",
  },
  emptyText: {
    color: "#6b7280",
    lineHeight: 20,
  },
  kidRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  kidButton: {
    backgroundColor: "#e5e7eb",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  kidButtonSelected: {
    backgroundColor: "#2563eb",
  },
  kidButtonText: {
    fontWeight: "900",
    color: "#111827",
  },
  kidButtonTextSelected: {
    color: "#fff",
  },
  pointsBox: {
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
  },
  pointsNumber: {
    fontSize: 34,
    fontWeight: "900",
    color: "#2563eb",
  },
  pointsText: {
    fontWeight: "800",
    color: "#1e3a8a",
    textAlign: "center",
  },
  rewardCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  rewardCardDisabled: {
    opacity: 0.8,
  },
  rewardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  rewardTextBox: {
    flex: 1,
  },
  rewardName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 4,
  },
  rewardCost: {
    color: "#4b5563",
    fontWeight: "700",
  },
  statusPill: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  canAffordPill: {
    backgroundColor: "#dcfce7",
  },
  cannotAffordPill: {
    backgroundColor: "#fee2e2",
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "900",
  },
  canAffordText: {
    color: "#166534",
  },
  cannotAffordText: {
    color: "#991b1b",
  },
  approvalText: {
    color: "#b45309",
    fontWeight: "800",
    marginBottom: 10,
  },
  redeemButton: {
    backgroundColor: "#8b5cf6",
    borderRadius: 14,
    padding: 13,
    alignItems: "center",
  },
  redeemButtonText: {
    color: "#fff",
    fontWeight: "900",
  },
  disabledButton: {
    opacity: 0.45,
  },
});
