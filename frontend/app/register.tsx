// frontend/app/register.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { saveToken } from "../src/lib/auth";

export default function RegisterScreen() {
  const [adminName, setAdminName] = useState("");
  const [pin, setPin] = useState("");

  const handleRegister = async () => {
    if (!adminName || !pin) {
      Alert.alert("Missing Info", "Please enter your name and a 4-digit PIN.");
      return;
    }

    try {
      const res = await fetch("http://192.168.1.122:7070/api/household", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminName, pin }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const { token } = await res.json();
      await saveToken(token);

      router.replace("/(tabs)/kids");
    } catch (err) {
      console.error("Registration error:", err);
      Alert.alert("Error", "Failed to register. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Parent Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Danielle"
        value={adminName}
        onChangeText={setAdminName}
      />

      <Text style={styles.label}>4-digit PIN</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 1234"
        keyboardType="numeric"
        secureTextEntry
        value={pin}
        maxLength={4}
        onChangeText={setPin}
      />

      <Button title="Register & Begin" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    justifyContent: "center",
    flex: 1,
  },
  label: {
    fontSize: 18,
    marginTop: 16,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    fontSize: 18,
    marginTop: 4,
    borderRadius: 8,
  },
});
