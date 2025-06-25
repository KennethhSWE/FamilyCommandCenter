// app/register.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveToken } from "./lib/auth";            // ← correct relative path

const USERS_KEY = "@fcc_users";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert("Please enter a name.");
      return;
    }

    try {
      // 1️⃣ Fetch existing users (if any)
      const raw = await AsyncStorage.getItem(USERS_KEY);
      const users = raw ? JSON.parse(raw) : [];

      // 2️⃣ Push the new user
      users.push({ name, createdAt: Date.now() });

      // 3️⃣ Save back to storage
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));

      // 4️⃣ Store a dummy auth token (replace later with real backend token)
      await saveToken("dummy-token");

      // 5️⃣ Navigate to the main tab navigator
      router.replace("./(tabs)");
    } catch (error) {
      console.error("Registration failed:", error);
      Alert.alert("Error", "Something went wrong while registering.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register Your Family</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />
      <Button title="Create Account" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
});
