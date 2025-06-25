import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import useColorScheme from "../hooks/useColorScheme";

// animated splash component you already have in  /app/splash.tsx
import SplashScreenCustom from "./splash";

export { ErrorBoundary } from "expo-router";

/**
 * `unstable_settings` lets Expo Router know which route tree branch
 * to open first **after** the splash screen has navigated away.
 */
export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// keep the native (white) splash visible until Expo Router is ready
SplashScreen.preventAutoHideAsync();

/* ------------------------------------------------------------------ */

export default function RootLayout() {
  /* ---------- load fonts before we show anything ---------- */
  const [loaded, error] = useFonts({
    SpaceMono: require("./assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
    if (loaded) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded) return null; // 👍 native splash stays up

  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}

/* ================= NAVIGATION TREE ================= */

function RootNavigator() {
  const colorScheme = useColorScheme();

  /* tiny wrapper so we can call router.replace("/login") after animation */
  function SplashRoute() {
    const router = useRouter();
    return (
      <SplashScreenCustom onFinish={() => router.replace("/login")} />
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} initialRouteName="splash">
        {/* 1️⃣ animated splash (4-second progress bar) */}
        <Stack.Screen name="splash" component={SplashRoute} />

        {/* regular pages picked up automatically */}
        {/*     - /login.tsx          (shown first because DB is empty) */}
        {/*     - /register.tsx */}
        {/*     - /(tabs)/* (the parent tab navigator folder) */}
        <Stack.Screen name="(tabs)" />

        {/* example modal route (optional) */}
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </ThemeProvider>
  );
}