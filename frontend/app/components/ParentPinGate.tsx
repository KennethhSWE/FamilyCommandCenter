import React, { ReactNode, useState } from "react";
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

import { verifyParentPin } from "../../src/lib/api";

type ParentPinGateProps = {
  children: ReactNode;
  title?: string;
};

export default function ParentPinGate({
  children,
  title = "Parent Mode",
}: ParentPinGateProps) {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkParentPin = async () => {
    if (pin.length !== 4) {
      Alert.alert("PIN Needed", "Enter the 4-digit parent PIN.");
      return;
    }

    setChecking(true);

    try {
      const result = await verifyParentPin(pin);

      if (result.verified) {
        setUnlocked(true);
        setPin("");
      } else {
        Alert.alert("Wrong PIN", "That PIN did not unlock parent mode.");
        setPin("");
      }
    } catch (error) {
      console.error("parent pin:", error);
      Alert.alert("Error", "Could not verify parent PIN.");
    } finally {
      setChecking(false);
    }
  };

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          Enter the 4-digit parent PIN to continue.
        </Text>

        <TextInput
          value={pin}
          onChangeText={(value) => setPin(value.replace(/\D/g, "").slice(0, 4))}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={4}
          style={styles.input}
          placeholder="••••"
        />

        <Pressable
          style={[styles.button, checking && styles.buttonDisabled]}
          onPress={checkParentPin}
          disabled={checking}
        >
          <Text style={styles.buttonText}>
            {checking ? "Checking..." : "Unlock"}
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
    padding: 24,
    backgroundColor: "#f3f4f6",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 14,
    padding: 16,
    fontSize: 26,
    letterSpacing: 12,
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
});
