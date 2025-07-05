// frontend/app/register.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  useColorScheme,
} from "react-native";
import { router } from "expo-router";
import {
  saveToken,
  saveHouseholdId,
  getToken,
  getHouseholdId,
} from "../src/lib/auth";

export default function RegisterScreen() {
  const [adminName, setAdminName] = useState("");
  const [pin, setPin] = useState("");
  const scheme = useColorScheme(); // "light" | "dark" | null

  /* ──────────────────────────────────────────────────────────
     If both a JWT and a householdId already exist → skip register
     ────────────────────────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      const token = await getToken();
      const householdId = await getHouseholdId();
      if (token && householdId) {
        router.replace("/(tabs)/kids");
      }
    })();
  }, []);

  /* ────────────────────────── on-submit ───────────────────── */
  const handleRegister = async () => {
    if (adminName.trim() === "" || pin.length !== 4) {
      Alert.alert("Missing info", "Please enter a name and 4-digit PIN.");
      return;
    }

    try {
      const res = await fetch("http://192.168.1.122:7070/api/household", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminName, pin }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const { token, householdId } = await res.json();
      await saveToken(token);             // SecureStore
      await saveHouseholdId(householdId); // AsyncStorage

      // 👇 jump to the first onboarding step
      router.replace("./onboarding/add-kids");
    } catch (err) {
      console.error("Registration error:", err);
      Alert.alert("Error", "Failed to register. Please try again.");
    }
  };

  /* ─────────────────────────── UI ─────────────────────────── */
  const colors =
    scheme === "dark"
      ? { bg: "#000", text: "#FFF", border: "#666", btn: "#444" }
      : { bg: "#FFF", text: "#000", border: "#CCC", btn: "#E5E5E5" };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.label, { color: colors.text }]}>Parent name</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        placeholder="e.g. Danielle"
        placeholderTextColor={scheme === "dark" ? "#888" : "#AAA"}
        value={adminName}
        onChangeText={setAdminName}
      />

      <Text style={[styles.label, { color: colors.text }]}>4-digit PIN</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        placeholder="e.g. 1234"
        placeholderTextColor={scheme === "dark" ? "#888" : "#AAA"}
        keyboardType="numeric"
        secureTextEntry
        maxLength={4}
        value={pin}
        onChangeText={setPin}
      />

      <View style={{ marginTop: 24 }}>
        <Button
          title="Register & Begin"
          onPress={handleRegister}
          disabled={adminName.trim() === "" || pin.length !== 4}
          color={scheme === "dark" ? colors.btn : undefined}
        />
      </View>
    </View>
  );
}

/* ────────────────────────── styles ────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  label: {
    fontSize: 18,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 18,
    marginTop: 4,
  },
});
