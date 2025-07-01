// frontend/app/index.tsx
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { getToken } from "../src/lib/auth";
import SplashAnimation from "./components/SplashAnimation";

/**
 * 1️.  Show animated splash first.
 * 2️.  While it runs, decide where we’re going.
 * 3️.  When Splash calls onFinish → redirect.
 */
export default function Index() {
  const [dest, setDest] = useState<"/(tabs)/kids" | "/register" | null>(null);
  const [splashDone, setSplashDone] = useState(false);

  // Decide destination once
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        setDest(token ? "/(tabs)/kids" : "/register");
      } catch (err) {
        console.error("Token check failed:", err);
        setDest("/register");
      }
    })();
  }, []);

  /* -------------- render -------------- */
  if (!splashDone || dest === null) {
    return <SplashAnimation onFinish={() => setSplashDone(true)} />;
  }

  // Splash finished & we know where to go
  return <Redirect href={dest} />;
}
