import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import {
  Chore,
  FamilyCalendarEntry,
  getCalendarEntries,
  getChoresByKid,
  getKids,
  getPoints,
  getUnreadNotificationCount,
  getWaitingApprovals,
  Kid,
} from "../src/lib/api";
import { saveDeviceMode } from "../src/lib/deviceMode";

type KidDashboardRow = {
  kid: Kid;
  points: number;
  chores: Chore[];
  completeCount: number;
  waitingCount: number;
  remainingCount: number;
};

const todayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const dateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatShortDate = (value?: string) => {
  if (!value) {
    return "No date";
  }

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${month}/${day}`;
};

const isBillDueSoon = (entry: FamilyCalendarEntry) => {
  if (entry.type !== "BILL" || entry.paid) {
    return false;
  }

  const today = todayKey();
  const sevenDaysFromNow = dateKey(addDays(new Date(), 7));

  return entry.entryDate >= today && entry.entryDate <= sevenDaysFromNow;
};

const isUpcomingEvent = (entry: FamilyCalendarEntry) => {
  return entry.type === "EVENT" && entry.entryDate >= todayKey();
};

export default function HubScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isWide = width >= 820;

  const [kids, setKids] = useState<KidDashboardRow[]>([]);
  const [calendarEntries, setCalendarEntries] = useState<FamilyCalendarEntry[]>(
    [],
  );
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [approvalCount, setApprovalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHub = useCallback(async () => {
    setRefreshing(true);

    try {
      const [kidList, calendar, notificationCount, approvals] =
        await Promise.all([
          getKids(),
          getCalendarEntries(),
          getUnreadNotificationCount(),
          getWaitingApprovals(),
        ]);

      const kidRows = await Promise.all(
        kidList.map(async (kid) => {
          const [points, chores] = await Promise.all([
            getPoints(kid.username),
            getChoresByKid(kid.username),
          ]);

          const completeCount = chores.filter((chore) => chore.complete).length;
          const waitingCount = chores.filter(
            (chore) => chore.requestedComplete,
          ).length;
          const remainingCount = chores.filter(
            (chore) => !chore.complete && !chore.requestedComplete,
          ).length;

          return {
            kid,
            points,
            chores,
            completeCount,
            waitingCount,
            remainingCount,
          };
        }),
      );

      setKids(kidRows);
      setCalendarEntries(calendar);
      setUnreadAlerts(notificationCount.unreadCount ?? 0);
      setApprovalCount(approvals.length);
    } catch (error) {
      console.error("load hub:", error);
      Alert.alert("Hub Error", "Could not load the family dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadHub();
    }, [loadHub]),
  );

  const totals = useMemo(() => {
    const totalPoints = kids.reduce((sum, row) => sum + row.points, 0);
    const totalChores = kids.reduce((sum, row) => sum + row.chores.length, 0);
    const completeChores = kids.reduce(
      (sum, row) => sum + row.completeCount,
      0,
    );
    const remainingChores = kids.reduce(
      (sum, row) => sum + row.remainingCount,
      0,
    );

    return {
      totalPoints,
      totalChores,
      completeChores,
      remainingChores,
    };
  }, [kids]);

  const billsDueSoon = useMemo(() => {
    return calendarEntries
      .filter(isBillDueSoon)
      .sort((a, b) => a.entryDate.localeCompare(b.entryDate))
      .slice(0, 4);
  }, [calendarEntries]);

  const upcomingEvents = useMemo(() => {
    return calendarEntries
      .filter(isUpcomingEvent)
      .sort((a, b) => a.entryDate.localeCompare(b.entryDate))
      .slice(0, 4);
  }, [calendarEntries]);

  const goToCompanionMode = async () => {
    Alert.alert(
      "Switch Device Mode?",
      "This will change this device from Hub Mode to Parent Companion Mode.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Switch",
          onPress: async () => {
            await saveDeviceMode("companion");
            router.replace("/(tabs)/kids" as any);
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading family dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadHub} />
        }
      >
        <View style={styles.hero}>
          <View>
            <Text style={styles.eyebrow}>Family Command Center</Text>
            <Text style={styles.title}>Today at Home</Text>
            <Text style={styles.subtitle}>
              Chores, points, calendar, bills, and alerts in one place.
            </Text>
          </View>

          <View style={styles.datePill}>
            <MaterialCommunityIcons
              name="calendar-today"
              size={22}
              color="#1d4ed8"
            />
            <Text style={styles.datePillText}>
              {new Date().toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>

        <View style={[styles.summaryGrid, isWide && styles.summaryGridWide]}>
          <SummaryCard
            icon="clipboard-check-outline"
            label="Chores Done"
            value={`${totals.completeChores}/${totals.totalChores}`}
            detail={`${totals.remainingChores} still open`}
            tone="blue"
          />

          <SummaryCard
            icon="star-circle"
            label="Family Points"
            value={String(totals.totalPoints)}
            detail={`${kids.length} kids on the board`}
            tone="purple"
          />

          <SummaryCard
            icon="bell-ring-outline"
            label="Needs Attention"
            value={String(approvalCount + unreadAlerts)}
            detail={`${approvalCount} approvals, ${unreadAlerts} alerts`}
            tone="amber"
          />

          <SummaryCard
            icon="cash-clock"
            label="Bills Due Soon"
            value={String(billsDueSoon.length)}
            detail="Next 7 days"
            tone="green"
          />
        </View>

        <View style={[styles.mainGrid, isWide && styles.mainGridWide]}>
          <View style={[styles.panel, isWide && styles.largePanel]}>
            <PanelHeader
              icon="account-child-circle"
              title="Kids Today"
              subtitle="Chores and points"
            />

            {kids.length === 0 ? (
              <EmptyState message="No kids have been added yet." />
            ) : (
              kids.map((row) => <KidHubCard key={row.kid.id} row={row} />)
            )}
          </View>

          <View style={styles.sideStack}>
            <View style={styles.panel}>
              <PanelHeader
                icon="calendar-month"
                title="Upcoming"
                subtitle="Events and bills"
              />

              <Text style={styles.sectionMiniTitle}>Events</Text>
              {upcomingEvents.length === 0 ? (
                <EmptyState message="No upcoming events." compact />
              ) : (
                upcomingEvents.map((entry) => (
                  <CalendarLine key={`event-${entry.id}`} entry={entry} />
                ))
              )}

              <Text style={[styles.sectionMiniTitle, styles.miniTitleGap]}>
                Bills
              </Text>
              {billsDueSoon.length === 0 ? (
                <EmptyState message="No bills due soon." compact />
              ) : (
                billsDueSoon.map((entry) => (
                  <CalendarLine key={`bill-${entry.id}`} entry={entry} />
                ))
              )}
            </View>

            <View style={styles.panel}>
              <PanelHeader
                icon="lightning-bolt"
                title="Quick Actions"
                subtitle="Jump to the right tool"
              />

              <View style={styles.actionGrid}>
                <QuickAction
                  icon="clipboard-list-outline"
                  label="Chores"
                  onPress={() => router.push("/(tabs)/kids" as any)}
                />
                <QuickAction
                  icon="gift-outline"
                  label="Rewards"
                  onPress={() => router.push("/(tabs)/rewards" as any)}
                />
                <QuickAction
                  icon="calendar-plus"
                  label="Calendar"
                  onPress={() => router.push("/(tabs)/calendar" as any)}
                />
                <QuickAction
                  icon="shield-account"
                  label="Parent Admin"
                  onPress={() => router.push("/(tabs)/admin" as any)}
                />
                <QuickAction
                  icon="bell-outline"
                  label="Alerts"
                  onPress={() => router.push("/(tabs)/notifications" as any)}
                />
                <QuickAction
                  icon="cellphone-cog"
                  label="Switch to Companion"
                  onPress={goToCompanionMode}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  detail: string;
  tone: "blue" | "purple" | "amber" | "green";
}) {
  const colors = {
    blue: { bg: "#dbeafe", fg: "#1d4ed8" },
    purple: { bg: "#ede9fe", fg: "#6d28d9" },
    amber: { bg: "#fef3c7", fg: "#b45309" },
    green: { bg: "#dcfce7", fg: "#15803d" },
  }[tone];

  return (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: colors.bg }]}>
        <MaterialCommunityIcons name={icon} size={30} color={colors.fg} />
      </View>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryDetail}>{detail}</Text>
    </View>
  );
}

function PanelHeader({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.panelHeader}>
      <View style={styles.panelIcon}>
        <MaterialCommunityIcons name={icon} size={24} color="#2563eb" />
      </View>
      <View>
        <Text style={styles.panelTitle}>{title}</Text>
        <Text style={styles.panelSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function KidHubCard({ row }: { row: KidDashboardRow }) {
  const total = row.chores.length;
  const progress =
    total === 0 ? 0 : Math.round((row.completeCount / total) * 100);

  return (
    <View style={styles.kidCard}>
      <View style={styles.kidTopRow}>
        <View>
          <Text style={styles.kidName}>{row.kid.name ?? row.kid.username}</Text>
          <Text style={styles.kidSubline}>
            {row.completeCount} done • {row.remainingCount} open •{" "}
            {row.waitingCount} waiting
          </Text>
        </View>

        <View style={styles.pointsBadge}>
          <MaterialCommunityIcons name="star" size={17} color="#f59e0b" />
          <Text style={styles.pointsText}>{row.points}</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      <Text style={styles.progressText}>{progress}% complete today</Text>
    </View>
  );
}

function CalendarLine({ entry }: { entry: FamilyCalendarEntry }) {
  const isBill = entry.type === "BILL";

  return (
    <View style={styles.calendarLine}>
      <View style={styles.calendarDate}>
        <Text style={styles.calendarDateText}>
          {formatShortDate(entry.entryDate)}
        </Text>
      </View>

      <View style={styles.calendarTextBox}>
        <Text style={styles.calendarTitle}>{entry.title}</Text>
        <Text style={styles.calendarType}>
          {isBill ? (entry.paid ? "Bill paid" : "Bill due") : "Family event"}
        </Text>
      </View>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={26} color="#111827" />
      <Text style={styles.quickActionText}>{label}</Text>
    </Pressable>
  );
}

function EmptyState({
  message,
  compact = false,
}: {
  message: string;
  compact?: boolean;
}) {
  return (
    <View style={[styles.emptyState, compact && styles.emptyStateCompact]}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#edf2ff",
  },
  container: {
    padding: 18,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#4b5563",
    fontWeight: "700",
  },
  hero: {
    backgroundColor: "#ffffff",
    borderRadius: 32,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#dbeafe",
    shadowColor: "#111827",
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "900",
    color: "#2563eb",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: {
    fontSize: 38,
    fontWeight: "900",
    color: "#111827",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 17,
    lineHeight: 24,
    color: "#4b5563",
    maxWidth: 620,
  },
  datePill: {
    marginTop: 18,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#eff6ff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  datePillText: {
    color: "#1d4ed8",
    fontSize: 15,
    fontWeight: "900",
  },
  summaryGrid: {
    gap: 12,
    marginBottom: 16,
  },
  summaryGridWide: {
    flexDirection: "row",
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  summaryIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  summaryLabel: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "800",
  },
  summaryValue: {
    color: "#111827",
    fontSize: 32,
    fontWeight: "900",
    marginTop: 4,
  },
  summaryDetail: {
    color: "#6b7280",
    fontSize: 14,
    marginTop: 3,
    fontWeight: "700",
  },
  mainGrid: {
    gap: 16,
  },
  mainGridWide: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  panel: {
    backgroundColor: "#ffffff",
    borderRadius: 30,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#111827",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 3,
  },
  largePanel: {
    flex: 1.35,
  },
  sideStack: {
    flex: 1,
    gap: 16,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  panelIcon: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  panelTitle: {
    fontSize: 22,
    color: "#111827",
    fontWeight: "900",
  },
  panelSubtitle: {
    marginTop: 2,
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "700",
  },
  kidCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  kidTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  kidName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
  },
  kidSubline: {
    marginTop: 4,
    color: "#6b7280",
    fontWeight: "700",
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#fffbeb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  pointsText: {
    color: "#92400e",
    fontWeight: "900",
    fontSize: 16,
  },
  progressTrack: {
    height: 12,
    backgroundColor: "#e5e7eb",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 16,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2563eb",
    borderRadius: 999,
  },
  progressText: {
    marginTop: 8,
    color: "#4b5563",
    fontWeight: "800",
  },
  sectionMiniTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  miniTitleGap: {
    marginTop: 16,
  },
  calendarLine: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 18,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  calendarDate: {
    width: 58,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  calendarDateText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 14,
  },
  calendarTextBox: {
    flex: 1,
  },
  calendarTitle: {
    color: "#111827",
    fontWeight: "900",
    fontSize: 16,
  },
  calendarType: {
    color: "#6b7280",
    fontWeight: "700",
    marginTop: 2,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  quickAction: {
    width: "48%",
    minHeight: 92,
    borderRadius: 22,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    gap: 8,
  },
  quickActionText: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyState: {
    backgroundColor: "#f8fafc",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  emptyStateCompact: {
    padding: 12,
    marginBottom: 8,
  },
  emptyText: {
    color: "#6b7280",
    fontWeight: "700",
  },
});
