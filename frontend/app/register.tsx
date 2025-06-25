// app/register.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { saveUser, saveToken } from "./lib/auth";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert("Please enter a name.");
      return;
    }

    try {
      // 1️⃣ Save the user record (single-family design)
      await saveUser({ name, createdAt: Date.now() });

      // 2️⃣ (Optional) stash a placeholder auth token
      await saveToken("dummy-token");

      // 3️⃣ Navigate straight to the Kids tab
      router.replace("./(tabs)/kids");
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
