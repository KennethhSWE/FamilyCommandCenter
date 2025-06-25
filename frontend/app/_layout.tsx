import { Stack } from "expo-router";
import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import useColorScheme from "../hooks/useColorScheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        {/* Every screen in /app will be nested here */}
        <Stack
          screenOptions={{ headerShown: false }}
          initialRouteName="index"   /* <-- this shows Splash first */
        />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
