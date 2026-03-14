import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import { api } from "../src/lib/api";
import { saveToken } from "../src/lib/auth";

export default function LoginScreen() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post<{ token: string }>("/login", {
        username,
        pin,
      });

      await saveToken(res.data.token);

      router.replace("/(tabs)");
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        "Login failed",
        err?.response?.data ?? "Please check your credentials",
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />

      <TextInput
        placeholder="4-digit PIN"
        value={pin}
        onChangeText={setPin}
        secureTextEntry
        keyboardType="number-pad"
        maxLength={4}
        style={styles.input}
      />

      <Button title="Log in" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 12,
  },
});
