import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { clearAuth } from "../../src/lib/auth";
import { clearDeviceMode, saveDeviceMode } from "../../src/lib/deviceMode";

export default function DeviceSettingsPanel() {
  const router = useRouter();

  const switchToHubMode = () => {
    Alert.alert(
      "Switch to Hub Mode?",
      "This device will open as the Family Hub Tablet dashboard.",
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

  const switchToCompanionMode = () => {
    Alert.alert(
      "Switch to Companion Mode?",
      "This device will open as the Parent Phone Companion dashboard.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Switch",
          onPress: async () => {
            await saveDeviceMode("companion");
            router.replace("/(tabs)" as any);
          },
        },
      ],
    );
  };

  const logoutThisDevice = () => {
    Alert.alert(
      "Log out this device?",
      "This clears the saved login and device mode on this device only.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await clearAuth();
            await clearDeviceMode();
            router.replace("/welcome" as any);
          },
        },
      ],
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconBubble}>
          <MaterialCommunityIcons name="devices" size={26} color="#2563eb" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Device Settings</Text>
          <Text style={styles.subtitle}>
            Change how this device opens the app.
          </Text>
        </View>
      </View>

      <View style={styles.buttonStack}>
        <DeviceButton
          icon="tablet"
          label="Switch to Hub Mode"
          detail="Use this for centralized tablet."
          onPress={switchToHubMode}
        />

        <DeviceButton
          icon="cellphone"
          label="Switch to Companion Mode"
          detail="Use this for a parent's phone."
          onPress={switchToCompanionMode}
        />

        <DeviceButton
          icon="logout"
          label="Log Out This Device"
          detail="Clears saved login and setup mode on this device."
          danger
          onPress={logoutThisDevice}
        />
      </View>
    </View>
  );
}

function DeviceButton({
  icon,
  label,
  detail,
  danger = false,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  detail: string;
  danger?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.deviceButton, danger && styles.dangerButton]}
      onPress={onPress}
    >
      <MaterialCommunityIcons
        name={icon}
        size={24}
        color={danger ? "#b91c1c" : "#111827"}
      />

      <View style={{ flex: 1 }}>
        <Text style={[styles.buttonLabel, danger && styles.dangerText]}>
          {label}
        </Text>
        <Text style={styles.buttonDetail}>{detail}</Text>
      </View>

      <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  iconBubble: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 21,
    fontWeight: "900",
    color: "#111827",
  },
  subtitle: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "700",
    color: "#6b7280",
  },
  buttonStack: {
    gap: 10,
  },
  deviceButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  dangerButton: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  buttonLabel: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "900",
  },
  dangerText: {
    color: "#b91c1c",
  },
  buttonDetail: {
    marginTop: 2,
    color: "#6b7280",
    fontSize: 13,
    fontWeight: "600",
  },
});
