// app/index.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SplashAnimation from "./components/SplashAnimation";

export default function SplashWrapper() {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      // Wait for animation to finish (4 s) …
      await new Promise((res) => setTimeout(res, 4000));

      const user = await AsyncStorage.getItem("@fcc_user");

      // Hide splash
      setShowSplash(false);

      // Navigate to the right place
      if (user) {
        router.replace("./(tabs)");     // absolute route to your tabs layout
      } else {
        router.replace("./register");   // absolute route to register page
      }
    };

    init();
  }, []);

  // While splash is showing, render the animation
  if (showSplash) return <SplashAnimation onFinish={() => {}} />;

  // Once we navigate away this component unmounts, so we can return null
  return null;
}
