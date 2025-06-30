// frontend/app/_layout.tsx
import React, { useEffect, useState } from "react";
import { Stack, router } from "expo-router";
import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import useColorScheme from "../hooks/useColorScheme";

import { getToken, clearToken } from "../src/lib/auth";
import SplashAnimation from "./components/SplashAnimation";
import axios from "axios";

const API = "http://192.168.1.122:7070/api";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      console.log("🔄 Bootstrapping app...");

      try {
        const token = await getToken();
        console.log("🔐 Token:", token);

        if (!token) {
          console.log("🆕 No token found. New user — go to /register");
          router.replace("/register");
          return;
        }

        console.log("🔍 Validating token with backend...");

        const res = await axios.get(`${API}/auth/validate`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        });

        console.log("✅ Token validated, status:", res.status);
        router.replace("/(tabs)/kids");
      } catch (err: any) {
        console.log("❌ Token invalid or server unreachable:", err?.message);
        await clearToken();
        router.replace("/register");
      } finally {
        setAppReady(true);
      }
    }

    bootstrap();
  }, []);

  if (!appReady) return <SplashAnimation />;

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
