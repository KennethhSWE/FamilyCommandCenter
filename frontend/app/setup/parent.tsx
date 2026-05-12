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

import { createHousehold, setParentPinDuringSetup } from "../../src/lib/api";
import { saveToken } from "../../src/lib/auth";

export default function ParentSetupScreen() {
  const router = useRouter();

  const [parentName, setParentName] = useState("");
  const [pin, setPin] = useState("");
  const [saving, setSaving] = useState(false);

  const createParentAndStartHousehold = async () => {
    if (!parentName.trim()) {
      Alert.alert("Parent Name Needed", "Enter the parent name first.");
      return;
    }

    if (pin.length !== 4) {
      Alert.alert("PIN Needed", "Enter a 4-digit parent PIN.");
      return;
    }

    setSaving(true);

    try {
      const setupResult = await createHousehold(parentName.trim(), pin);

      await saveToken(setupResult.token);

      await setParentPinDuringSetup(pin);

      router.replace("/setup/kids" as any);
    } catch (error: any) {
      console.error("parent setup:", error);

      const message =
        typeof error?.response?.data === "string"
          ? error.response.data
          : (error?.response?.data?.message ??
            error?.message ??
            "Could not create parent account.");

      Alert.alert("Setup Failed", message);
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
        <Text style={styles.title}>Set Up Your Family Command Center</Text>

        <Text style={styles.subtitle}>
          First, create the parent account. This account controls chores,
          rewards, calendar edits, and approvals.
        </Text>

        <Text style={styles.label}>Parent Name</Text>
        <TextInput
          value={parentName}
          onChangeText={setParentName}
          placeholder="Example: Dad"
          style={styles.input}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Parent PIN</Text>
        <TextInput
          value={pin}
          onChangeText={(value) => setPin(value.replace(/\D/g, "").slice(0, 4))}
          placeholder="4-digit PIN"
          keyboardType="number-pad"
          secureTextEntry
          maxLength={4}
          style={styles.input}
        />

        <Pressable
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={createParentAndStartHousehold}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? "Creating..." : "Continue"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f3f4f6",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 22,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    color: "#555",
    textAlign: "center",
    marginBottom: 22,
    lineHeight: 20,
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
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
});
