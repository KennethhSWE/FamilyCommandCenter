// frontend/app/index.tsx
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { getToken, getHouseholdId } from "../src/lib/auth";
import SplashAnimation from "./components/SplashAnimation";

type Dest = "/(tabs)/kids" | "/register";

export default function Index() {
  const [dest, setDest] = useState<Dest | null>(null);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const householdId = await getHouseholdId();

        setDest(token && householdId ? "/(tabs)/kids" : "/register");
      } catch (err) {
        console.error("Startup check failed:", err);
        setDest("/register");
      }
    })();
  }, []);

  if (!splashDone || dest === null) {
    return <SplashAnimation onFinish={() => setSplashDone(true)} />;
  }

  return <Redirect href={{ pathname: dest ?? "/register" }} />;

}
