import React from "react";
import { useRouter } from "expo-router";
import SplashAnimation from "./components/SplashAnimation";
import { checkIfUsersExist } from "./lib/auth"; // This file should exist or be created

export default function SplashScreen() {
  const router = useRouter();

  const handleFinish = async () => {
    const usersExist = await checkIfUsersExist();

    if (usersExist) {
      router.replace("/login");
    } else {
      router.replace("/register");
    }
  };

  return <SplashAnimation onFinish={handleFinish} />;
}

