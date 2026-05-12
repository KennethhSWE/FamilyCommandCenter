// frontend/app/(tabs)/admin.tsx
import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ApprovalQueuePanel from "../components/ApprovalQueuePanel";
import ChorePoolPanel from "../components/ChorePoolPanel";
import DailyChoreSweepPanel from "../components/DailyChoreSweepPanel";
import ParentPinGate from "../components/ParentPinGate";
import PointAdjustmentPanel from "../components/PointAdjustmentPanel";
import RewardManagementPanel from "../components/RewardManagementPanel";

export default function AdminScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const loadAdminData = useCallback(async () => {
    setRefreshing(true);

    try {
      // Each panel loads and manages its own data.
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <ParentPinGate title="Parent Admin">
      <SafeAreaView style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadAdminData} />
          }
        >
          <Text style={styles.header}>Parent Command Center</Text>

          <ApprovalQueuePanel />

          <PointAdjustmentPanel />

          <RewardManagementPanel />

          <DailyChoreSweepPanel />

          <ChorePoolPanel />
        </ScrollView>
      </SafeAreaView>
    </ParentPinGate>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 18,
    color: "#111827",
  },
});
