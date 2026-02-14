import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";

import api from "../src/lib/api";        // default export in api.ts
import { saveToken } from "../src/lib/auth";

export default function LoginScreen() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      // ⬇️ tell Axios what shape the response body has
      const res = await api.post<{ token: string }>("/api/login", {
        username,
        password,
      });

      await saveToken(res.data.token);

      // go to the (tabs) stack root
      router.replace("./(tabs)");
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        "Login failed",
        err?.response?.data ?? "Please check your credentials"
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
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button title="Log in" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 12,
  },
});