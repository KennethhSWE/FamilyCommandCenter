import React, { ReactNode, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { verifyParentPin } from "../../src/lib/api";

type ParentInlineGateProps = {
  children: ReactNode;
  title?: string;
};

export default function ParentInlineGate({
  children,
  title = "Parent Controls",
}: ParentInlineGateProps) {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(false);

  const unlockTheGrownUpStuff = async () => {
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
        Alert.alert("Wrong PIN", "That PIN did not unlock parent controls.");
        setPin("");
      }
    } catch (error) {
      console.error("parent inline pin:", error);
      Alert.alert("Error", "Could not verify parent PIN.");
    } finally {
      setChecking(false);
    }
  };

  if (unlocked) {
    return <View style={styles.unlockedBox}>{children}</View>;
  }

  return (
    <View style={styles.lockedBox}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>
        Calendar is visible to everyone. Editing requires the parent PIN.
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
        onPress={unlockTheGrownUpStuff}
        disabled={checking}
      >
        <Text style={styles.buttonText}>
          {checking ? "Checking..." : "Unlock Parent Controls"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  lockedBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    margin: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  unlockedBox: {
    margin: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  subtitle: {
    color: "#555",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    padding: 12,
    fontSize: 22,
    letterSpacing: 10,
    textAlign: "center",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
  },
});
