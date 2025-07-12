// frontend/app/register.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
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
  const [loading, setLoading] = useState(false);
  const scheme = useColorScheme(); // "light" | "dark" | null

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const householdId = await getHouseholdId();
      if (token && householdId) {
        router.replace("/(tabs)/kids");
      }
    })();
  }, []);

  const handleRegister = async () => {
    if (adminName.trim() === "" || pin.length !== 4) {
      Alert.alert("Missing info", "Please enter a name and 4-digit PIN.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://192.168.1.122:7070/api/household", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminName, pin }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const { token, householdId } = await res.json();
      await saveToken(token);
      await saveHouseholdId(householdId);

      router.replace("/onboarding/AddKidsScreen");
    } catch (err) {
      console.error("Registration error:", err);
      Alert.alert("Error", "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const colors =
    scheme === "dark"
      ? { bg: "#000", text: "#FFF", border: "#555", input: "#222", btn: "#0ff" }
      : { bg: "#FFF", text: "#000", border: "#CCC", input: "#FFF", btn: "#00d4ff" };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        🎉 Welcome to the Family Command Center
      </Text>

      <Text style={[styles.label, { color: colors.text }]}>Parent name</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.input,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        placeholder="e.g. Danielle"
        placeholderTextColor={scheme === "dark" ? "#888" : "#AAA"}
        value={adminName}
        onChangeText={setAdminName}
      />

      <Text style={[styles.label, { color: colors.text }]}>4-digit PIN</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.input,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        placeholder="e.g. 1234"
        placeholderTextColor={scheme === "dark" ? "#888" : "#AAA"}
        keyboardType="numeric"
        secureTextEntry
        maxLength={4}
        value={pin}
        onChangeText={setPin}
      />

      <Pressable
        onPress={handleRegister}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.btn,
            opacity: pressed || loading ? 0.7 : 1,
          },
        ]}
        disabled={adminName.trim() === "" || pin.length !== 4 || loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.buttonText}>Register & Begin</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 32,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 16,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 18,
  },
  button: {
    marginTop: 32,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
});
