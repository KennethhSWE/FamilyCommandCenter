import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  checkBackendHealth,
  FamilyCalendarEntry,
  getCalendarEntries,
  getKids,
  getUnreadNotificationCount,
  getWaitingApprovals,
  Kid,
} from "../../src/lib/api";

import { saveDeviceMode } from "../../src/lib/deviceMode";

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

type CompanionConnectionState = "connecting" | "connected" | "error";

const formatUpdatedTime = (value: Date | null) => {
  if (!value) {
    return "Not updated yet";
  }

  return value.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
};

const isBillDueSoon = (entry: FamilyCalendarEntry) => {
  if (entry.type !== "BILL" || entry.paid) {
    return false;
  }

  return (
    entry.entryDate >= todayKey() &&
    entry.entryDate <= dateKey(addDays(new Date(), 7))
  );
};

const isUpcomingEvent = (entry: FamilyCalendarEntry) => {
  return entry.type === "EVENT" && entry.entryDate >= todayKey();
};

export default function CompanionHomeScreen() {
  const router = useRouter();

  const [kids, setKids] = useState<Kid[]>([]);
  const [calendarEntries, setCalendarEntries] = useState<FamilyCalendarEntry[]>(
    [],
  );
  const [approvalCount, setApprovalCount] = useState(0);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionState, setConnectionState] =
    useState<CompanionConnectionState>("connecting");
  const [connectionMessage, setConnectionMessage] = useState(
    "Connecting to Family Command Center...",
  );
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadHome = useCallback(async () => {
    setRefreshing(true);
    setConnectionState("connecting");
    setConnectionMessage(
      "Connecting to Family Command Center. If the free server is waking up, this can take up to a minute.",
    );

    try {
      await checkBackendHealth();

      const [kidList, calendar, alerts, approvals] = await Promise.all([
        getKids(),
        getCalendarEntries(),
        getUnreadNotificationCount(),
        getWaitingApprovals(),
      ]);

      setKids(kidList);
      setCalendarEntries(calendar);
      setUnreadAlerts(alerts.unreadCount ?? 0);
      setApprovalCount(approvals.length);
      setLastUpdated(new Date());
      setConnectionState("connected");
      setConnectionMessage("Connected");
    } catch (error) {
      console.error("load companion home:", error);
      setConnectionState("error");
      setConnectionMessage(
        "Could not connect to the family server. Check Wi-Fi or tap Retry.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadHome();
    }, [loadHome]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        loadHome();
      }
    });

    return () => subscription.remove();
  }, [loadHome]);

  const billsDueSoon = useMemo(() => {
    return calendarEntries
      .filter(isBillDueSoon)
      .sort((a, b) => a.entryDate.localeCompare(b.entryDate))
      .slice(0, 3);
  }, [calendarEntries]);

  const upcomingEvents = useMemo(() => {
    return calendarEntries
      .filter(isUpcomingEvent)
      .sort((a, b) => a.entryDate.localeCompare(b.entryDate))
      .slice(0, 3);
  }, [calendarEntries]);

  const switchToHubMode = () => {
    Alert.alert(
      "Switch Device Mode?",
      "This will change this device to Family Hub Tablet mode.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Switch",
          onPress: async () => {
            await saveDeviceMode("hub");
            router.replace("/hub" as any);
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
          <Text style={styles.loadingText}>Loading parent dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadHome} />
        }
      >
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons
              name="home-heart"
              size={34}
              color="#ffffff"
            />
          </View>

          <Text style={styles.eyebrow}>Parent Companion</Text>
          <Text style={styles.title}>Home Dashboard</Text>
          <Text style={styles.subtitle}>
            Approvals, alerts, bills, and family actions from your phone.
          </Text>
        </View>

        <ConnectionBanner
          connectionState={connectionState}
          message={connectionMessage}
          lastUpdated={lastUpdated}
          onRetry={loadHome}
        />

        <View style={styles.attentionCard}>
          <View style={styles.attentionHeader}>
            <View style={styles.attentionIcon}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={30}
                color="#b45309"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Needs Attention</Text>
              <Text style={styles.cardSubtitle}>
                Tap a card to jump to the right place.
              </Text>
            </View>
          </View>

          <View style={styles.attentionGrid}>
            <MetricPill
              label="Approvals"
              value={approvalCount}
              onPress={() => router.push("/(tabs)/admin" as any)}
            />
            <MetricPill
              label="Alerts"
              value={unreadAlerts}
              onPress={() => router.push("/(tabs)/notifications" as any)}
            />
            <MetricPill
              label="Bills"
              value={billsDueSoon.length}
              onPress={() => router.push("/(tabs)/calendar" as any)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionGrid}>
            <ActionButton
              icon="shield-check"
              label="Approvals"
              onPress={() => router.push("/(tabs)/admin" as any)}
            />
            <ActionButton
              icon="star-plus"
              label="Adjust Points"
              onPress={() => router.push("/(tabs)/points" as any)}
            />
            <ActionButton
              icon="gift"
              label="Rewards"
              onPress={() => router.push("/(tabs)/rewards" as any)}
            />
            <ActionButton
              icon="calendar-plus"
              label="Calendar"
              onPress={() => router.push("/(tabs)/calendar" as any)}
            />
            <ActionButton
              icon="account-child"
              label="Kids"
              onPress={() => router.push("/(tabs)/kids" as any)}
            />
            <ActionButton
              icon="tablet"
              label="Hub Mode"
              onPress={switchToHubMode}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Family Snapshot</Text>

          <View style={styles.snapshotCard}>
            <View style={styles.snapshotIcon}>
              <MaterialCommunityIcons
                name="account-group"
                size={30}
                color="#2563eb"
              />
            </View>

            <View>
              <Text style={styles.snapshotValue}>{kids.length}</Text>
              <Text style={styles.snapshotLabel}>kids in this household</Text>
            </View>
          </View>

          <View style={styles.infoList}>
            <InfoRow
              icon="calendar-clock"
              title="Upcoming events"
              value={String(upcomingEvents.length)}
              onPress={() => router.push("/(tabs)/calendar" as any)}
            />
            <InfoRow
              icon="cash-clock"
              title="Bills due soon"
              value={String(billsDueSoon.length)}
              onPress={() => router.push("/(tabs)/calendar" as any)}
            />
            <InfoRow
              icon="bell-outline"
              title="Unread alerts"
              value={String(unreadAlerts)}
              onPress={() => router.push("/(tabs)/notifications" as any)}
            />
          </View>
        </View>

        {(billsDueSoon.length > 0 || upcomingEvents.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coming Up</Text>

            {upcomingEvents.map((event) => (
              <CalendarPreview
                key={`event-${event.id}`}
                icon="calendar-star"
                entry={event}
              />
            ))}

            {billsDueSoon.map((bill) => (
              <CalendarPreview
                key={`bill-${bill.id}`}
                icon="cash"
                entry={bill}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ConnectionBanner({
  connectionState,
  message,
  lastUpdated,
  onRetry,
}: {
  connectionState: CompanionConnectionState;
  message: string;
  lastUpdated: Date | null;
  onRetry: () => void;
}) {
  const isConnected = connectionState === "connected";
  const isError = connectionState === "error";

  return (
    <View
      style={[
        styles.connectionBanner,
        isConnected && styles.connectionBannerConnected,
        isError && styles.connectionBannerError,
      ]}
    >
      <View style={styles.connectionRow}>
        <MaterialCommunityIcons
          name={
            isConnected ? "cloud-check" : isError ? "cloud-alert" : "cloud-sync"
          }
          size={24}
          color={isConnected ? "#15803d" : isError ? "#b91c1c" : "#b45309"}
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.connectionTitle}>
            {isConnected
              ? "Connected"
              : isError
                ? "Connection Issue"
                : "Connecting"}
          </Text>

          <Text style={styles.connectionText}>
            {isConnected
              ? `Last updated ${formatUpdatedTime(lastUpdated)}`
              : message}
          </Text>
        </View>

        {isError && (
          <Pressable style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function MetricPill({
  label,
  value,
  onPress,
}: {
  label: string;
  value: number;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.metricPill} onPress={onPress}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </Pressable>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.actionButton} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={28} color="#111827" />
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

function InfoRow({
  icon,
  title,
  value,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.infoRow} onPress={onPress}>
      <View style={styles.infoLeft}>
        <MaterialCommunityIcons name={icon} size={23} color="#2563eb" />
        <Text style={styles.infoTitle}>{title}</Text>
      </View>

      <Text style={styles.infoValue}>{value}</Text>
    </Pressable>
  );
}

function CalendarPreview({
  icon,
  entry,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  entry: FamilyCalendarEntry;
}) {
  return (
    <View style={styles.calendarPreview}>
      <View style={styles.calendarIcon}>
        <MaterialCommunityIcons name={icon} size={24} color="#111827" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.calendarTitle}>{entry.title}</Text>
        <Text style={styles.calendarSubline}>
          {formatShortDate(entry.entryDate)} •{" "}
          {entry.type === "BILL" ? "Bill due" : "Family event"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  container: {
    padding: 16,
    paddingBottom: 120,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#4b5563",
    fontWeight: "700",
  },
  hero: {
    backgroundColor: "#111827",
    borderRadius: 30,
    padding: 24,
    marginBottom: 16,
  },
  heroIcon: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  eyebrow: {
    color: "#93c5fd",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: {
    color: "#ffffff",
    fontSize: 34,
    fontWeight: "900",
  },
  subtitle: {
    color: "#d1d5db",
    fontSize: 16,
    marginTop: 8,
    fontWeight: "600",
    lineHeight: 22,
  },
  attentionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  attentionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  attentionIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "900",
  },
  cardSubtitle: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
  },
  attentionGrid: {
    flexDirection: "row",
    gap: 10,
  },
  metricPill: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  metricValue: {
    color: "#111827",
    fontSize: 30,
    fontWeight: "900",
  },
  metricLabel: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    marginTop: 3,
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 14,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionButton: {
    width: "48%",
    minHeight: 96,
    borderRadius: 22,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    gap: 8,
  },
  actionText: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },
  snapshotCard: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderRadius: 22,
    padding: 16,
  },
  snapshotIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  snapshotValue: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "900",
  },
  snapshotLabel: {
    color: "#4b5563",
    fontSize: 14,
    fontWeight: "700",
  },
  infoList: {
    marginTop: 14,
    gap: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoTitle: {
    color: "#111827",
    fontWeight: "800",
  },
  infoValue: {
    color: "#111827",
    fontWeight: "900",
    fontSize: 18,
  },
  calendarPreview: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 10,
  },
  calendarIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
  },
  calendarTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "900",
  },
  calendarSubline: {
    color: "#6b7280",
    fontWeight: "700",
    marginTop: 3,
  },

  connectionBanner: {
    backgroundColor: "#fffbeb",
    borderRadius: 22,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  connectionBannerConnected: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  connectionBannerError: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  connectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  connectionTitle: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "900",
  },
  connectionText: {
    color: "#4b5563",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  retryButton: {
    backgroundColor: "#111827",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },
});
