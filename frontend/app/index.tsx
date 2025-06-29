// frontend/app/index.tsx
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useRouter } from "expo-router";

import KidCard from "./components/KidCard";

interface Kid {
  id: string;
  name: string;
  points: number;
  avatar?: string;
  role: "kid" | "parent";
}

/* ─────────────────────────── constants ─────────────────────────── */
const { width } = Dimensions.get("window");
const CARD_WIDTH  = width * 0.68;
const CARD_HEIGHT = CARD_WIDTH * 1.25;

/* Fallback demo kids if backend returns 0 kids (fresh DB) */
const demoKids: Kid[] = [
  { id: "1", name: "Austin",  points:  80, role: "kid" },
  { id: "2", name: "Ella",    points: 120, role: "kid" },
  { id: "3", name: "Lincoln", points:  65, role: "kid" },
];

/* ───────────────────────────── screen ──────────────────────────── */
export default function KidsCarouselScreen() {
  const [kids, setKids] = useState<Kid[]>([]);
  const router = useRouter();

  /* pull kids on first mount */
  useEffect(() => {
    fetch("http://localhost:7070/api/users/kids")
      .then((res) => res.json())
      .then((data: Kid[]) => {
        if (Array.isArray(data) && data.length) {
          setKids(data);
        } else {
          setKids(demoKids);              // fallback if DB empty
        }
      })
      .catch((err) => {
        console.error("Failed to fetch kids:", err);
        setKids(demoKids);                // fallback on network error
      });
  }, []);

  /* ──────────────────────── render UI ─────────────────────────── */
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
      panGestureHandlerProps={{ activeOffsetX: [-10, 10] }}
      renderItem={({ item }) => (
        <KidCard
          data={item}
          width={CARD_WIDTH}
          onPress={() => router.push(`/kids/${item.id}`)}
        />
      )}
    />
  );
}

/* ────────────────────────── styles ────────────────────────────── */
const styles = StyleSheet.create({
  carousel: { flex: 1, justifyContent: "center", alignItems: "center" },
});

