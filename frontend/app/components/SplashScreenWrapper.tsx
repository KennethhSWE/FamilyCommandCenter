// app/components/SplashScreenWrapper.tsx
import React, { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { Stack, useRouter } from "expo-router";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import useColorScheme from "../../hooks/useColorScheme";
import SplashAnimation from "./SplashAnimation";
import AsyncStorage from "@react-native-async-storage/async-storage";

SplashScreen.preventAutoHideAsync();

export default function SplashScreenWrapper() {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    // ❶ Wait 4 s for the animation, then decide where to go
    const startApp = async () => {
      await new Promise((res) => setTimeout(res, 4000));

      const user = await AsyncStorage.getItem("@fcc_user");
      setShowSplash(false);
      await SplashScreen.hideAsync();

      if (user) router.replace("./(tabs)");
      else router.replace("/register");
    };

    startApp();
  }, []);

  if (showSplash) return <SplashAnimation onFinish={() => {}} />;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <SafeAreaView style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="login"    options={{ headerShown: false }} />
        </Stack>
      </SafeAreaView>
    </ThemeProvider>
  );
}
