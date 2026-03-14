import { Redirect } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import { getToken, getHouseholdId } from "../src/lib/auth";
import SplashAnimation from "./components/SplashAnimation";
import "react-native-get-random-values";

type Dest = "/(tabs)/kids" | "/register";

export default function Index() {
  const [dest, setDest] = useState<Dest | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [token, householdId] = await Promise.all([
          getToken(),
          getHouseholdId(),
        ]);

        setDest(token && householdId ? "/(tabs)/kids" : "/register");
      } catch (err) {
        console.error("Startup check failed:", err);
        setDest("/register");
      }
    })();
  }, []);

  const handleSplashFinish = useCallback(() => {
    setReady(true);
  }, []);

  if (!ready || dest === null) {
    return <SplashAnimation onFinish={handleSplashFinish} />;
  }

  return <Redirect href={dest} />;
}
