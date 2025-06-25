// app/index.tsx
import React from "react";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import SplashAnimation from "../components/SplashAnimation";   // keep your animation
import { checkIfUsersExist } from "../lib/auth";

// keep native splash visible
SplashScreen.preventAutoHideAsync();

export default function RootSplash() {
  const router = useRouter();

  const handleFinish = async () => {
    const haveUser = await checkIfUsersExist();
    await SplashScreen.hideAsync();
    router.replace(haveUser ? "./(tabs)/kids" : "/register");
  };

  // <SplashAnimation> will call the prop when it’s done
  return <SplashAnimation onFinish={handleFinish} />;
}

