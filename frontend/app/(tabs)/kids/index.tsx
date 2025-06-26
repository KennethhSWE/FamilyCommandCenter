import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import KidCard from "../../components/KidCard";
/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
interface Kid {
  id: string;
  name: string;
  points: number;
  avatar?: string;
  role: "kid" | "parent";
}

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */
const USERS_KEY = "@fcc_users";
const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.68;
const CARD_HEIGHT = CARD_WIDTH * 1.25;

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */
export default function KidsCarouselScreen() {
  const [kids, setKids] = useState<Kid[]>([]);
  const router = useRouter();

  /* ------------------------- Load kids from storage ------------------------- */
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(USERS_KEY);
      const users: Kid[] = raw ? JSON.parse(raw) : [];

      // type-guard so TS knows the filter returns Kid[]
      const isKid = (u: Kid): u is Kid => u.role === "kid";
      const storedKids = users.filter(isKid);

      // fallback demo list
      const demo: Kid[] = [
        { id: "1", name: "Austin", points: 80, role: "kid" },
        { id: "2", name: "Ella", points: 120, role: "kid" },
        { id: "3", name: "Lincoln", points: 65, role: "kid" },
      ];

      setKids(storedKids.length ? storedKids : demo);
    })();
  }, []);

  /* ----------------------------- Render ------------------------------------- */
  return (
    <Carousel
      width={CARD_WIDTH}
      height={CARD_HEIGHT}
      data={kids}
      mode="horizontal-stack"
      modeConfig={{
        stackInterval: 18,
        scaleInterval: 0.08,
        opacityInterval: 0.25,
      }}
      style={styles.carousel}
      defaultIndex={1}
      pagingEnabled={true}
      renderItem={({ item }: { item: Kid }) => (
        <KidCard
          name={item.name}
          chores={
            Array.isArray((item as any).chores) ? (item as any).chores : []
          } // ③ guarantee array
        />
      )}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                             */
/* ------------------------------------------------------------------ */
const styles = StyleSheet.create({
  carousel: { flex: 1, justifyContent: "center", alignItems: "center" },
});
