import ParentPinGate from "../components/ParentPinGate";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  getRecentNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  ParentNotification,
} from "../../src/lib/api";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<ParentNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    setRefreshing(true);

    try {
      const recent = await getRecentNotifications();
      setNotifications(recent);
    } catch (error) {
      console.error("notifications:", error);
      Alert.alert("Error", "Could not load notifications.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markOneRead = async (notificationId: number) => {
    try {
      await markNotificationRead(notificationId);
      loadNotifications();
    } catch (error) {
      console.error("mark read:", error);
      Alert.alert("Error", "Could not mark notification read.");
    }
  };

  const clearTheBell = async () => {
    try {
      await markAllNotificationsRead();
      loadNotifications();
    } catch (error) {
      console.error("mark all read:", error);
      Alert.alert("Error", "Could not clear notifications.");
    }
  };

  return (
    <ParentPinGate title="Parent Alerts">
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadNotifications}
          />
        }
      >
        <View style={styles.headerRow}>
          <Text style={styles.header}>Parent Notifications</Text>
          <Button title="Mark All Read" onPress={clearTheBell} />
        </View>

        {notifications.length === 0 ? (
          <Text style={styles.emptyText}>No notifications yet.</Text>
        ) : (
          notifications.map((notification) => (
            <View
              key={notification.id}
              style={[
                styles.card,
                notification.read ? styles.readCard : styles.unreadCard,
              ]}
            >
              <Text style={styles.title}>{notification.title}</Text>
              <Text style={styles.message}>{notification.message}</Text>
              <Text style={styles.type}>{notification.type}</Text>

              {!notification.read && (
                <Button
                  title="Mark Read"
                  onPress={() => markOneRead(notification.id)}
                />
              )}
            </View>
          ))
        )}
      </ScrollView>
    </ParentPinGate>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  headerRow: {
    gap: 10,
    marginBottom: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: "800",
  },
  emptyText: {
    textAlign: "center",
    color: "#777",
    marginTop: 24,
  },
  card: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  unreadCard: {
    backgroundColor: "#fff8dc",
    borderColor: "#f59e0b",
  },
  readCard: {
    backgroundColor: "#ffffff",
    borderColor: "#ddd",
    opacity: 0.75,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 6,
  },
  message: {
    fontSize: 15,
    marginBottom: 8,
  },
  type: {
    fontSize: 12,
    color: "#777",
    marginBottom: 8,
  },
});
