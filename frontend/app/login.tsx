import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { loginParent } from "../src/lib/api";
import { saveToken } from "../src/lib/auth";

export default function LoginScreen() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [saving, setSaving] = useState(false);

  const handleLogin = async () => {
    const cleanUsername = username.trim();
    const cleanPin = pin.trim();

    if (!cleanUsername) {
      Alert.alert("Parent Name Needed", "Enter the parent account name.");
      return;
    }

    if (!cleanPin || cleanPin.length !== 4) {
      Alert.alert("PIN Needed", "Enter the 4-digit parent PIN.");
      return;
    }

    setSaving(true);

    try {
      const result = await loginParent(cleanUsername, cleanPin);

      await saveToken(result.token);

      router.replace("/mode-select" as any);
    } catch (err: any) {
      console.error("login:", err);

      const message =
        typeof err?.response?.data === "string"
          ? err.response.data
          : (err?.response?.data?.message ?? "Please check your credentials.");

      Alert.alert("Login Failed", message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <View style={styles.iconBubble}>
          <MaterialCommunityIcons
            name="account-key"
            size={42}
            color="#2563eb"
          />
        </View>

        <Text style={styles.title}>Log Into Your Family</Text>

        <Text style={styles.subtitle}>
          Use the parent name and PIN that created the family account.
        </Text>

        <Text style={styles.label}>Parent Name</Text>
        <TextInput
          placeholder="Example: Danielle"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="words"
          style={styles.input}
        />

        <Text style={styles.label}>Parent PIN</Text>
        <TextInput
          placeholder="4-digit PIN"
          value={pin}
          onChangeText={(value) => setPin(value.replace(/\D/g, "").slice(0, 4))}
          secureTextEntry
          keyboardType="number-pad"
          maxLength={4}
          style={styles.input}
        />

        <Pressable
          style={[styles.primaryButton, saving && styles.disabledButton]}
          onPress={handleLogin}
          disabled={saving}
        >
          <Text style={styles.primaryButtonText}>
            {saving ? "Logging In..." : "Log In"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.replace("/welcome" as any)}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#eef2ff",
    padding: 20,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 30,
    padding: 22,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  iconBubble: {
    width: 78,
    height: 78,
    borderRadius: 26,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 22,
    fontSize: 15,
    lineHeight: 22,
    color: "#4b5563",
    textAlign: "center",
    fontWeight: "600",
  },
  label: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 17,
    color: "#111827",
  },
  primaryButton: {
    backgroundColor: "#111827",
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 22,
  },
  disabledButton: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
  secondaryButton: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 6,
  },
  secondaryButtonText: {
    color: "#4b5563",
    fontSize: 15,
    fontWeight: "800",
  },
});
