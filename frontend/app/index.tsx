// frontend/app/index.tsx
//--------------------------------------------------------------
//  Entry point – decide where to go, show splash meanwhile
//--------------------------------------------------------------
import { Redirect }         from "expo-router";
import { useEffect, useState } from "react";

import { getToken, getHouseholdId } from "../src/lib/auth";
import SplashAnimation      from "./components/SplashAnimation";
import 'react-native-get-random-values';

/* ───────────────────────── types ───────────────────────── */
type Dest = "/(tabs)/kids" | "/register";

/* ───────────────────────── component ───────────────────────── */
export default function Index() {
  const [dest,   setDest]   = useState<Dest | null>(null); // where to redirect
  const [ready,  setReady]  = useState(false);             // splash finished

  /* 1 ▸ auth / onboarding check (runs once) */
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

  /* 2 ▸ still loading ⟶ keep splash */
  if (!ready || dest === null) {
    return <SplashAnimation onFinish={() => setReady(true)} />;
  }

  /* 3 ▸ auth check done + splash done ⟶ redirect */
  return <Redirect href={dest} />;
}
