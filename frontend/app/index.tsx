import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import KidCard from "./components/KidCard";

interface Kid {
  id: string;
  name: string;
  points: number;
  avatar?: string;
  role: "kid" | "parent";
}

const USERS_KEY = "@fcc_users";
const { width } = Dimensions.get("window");
const CARD_WIDTH  = width * 0.68;
const CARD_HEIGHT = CARD_WIDTH * 1.25;

export default function KidsCarouselScreen() {
  const [kids, setKids] = useState<Kid[]>([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(USERS_KEY);
      const users: Kid[] = raw ? JSON.parse(raw) : [];

      // fallback demo list if storage empty
      const demo = [
        { id: "1", name: "Austin",  points:  80, role: "kid" },
        { id: "2", name: "Ella",    points: 120, role: "kid" },
        { id: "3", name: "Lincoln", points:  65, role: "kid" },
      ];

      setKids(
        users.filter(u => u.role === "kid").length
          ? users.filter(u => u.role === "kid")
          : demo
      );
    })();
  }, []);

  return (
    <Carousel
      width={CARD_WIDTH}
      height={CARD_HEIGHT}
      data={kids}
      mode="horizontal-stack"
      modeConfig={{
        stackInterval: 18,   // spacing of the back cards
        scaleInterval: 0.08, // how much the back cards shrink
        opacityInterval: 0.25,
      }}
      style={styles.carousel}
      defaultIndex={1} // start with second kid centered (optional)
      panGestureHandlerProps={{ activeOffsetX: [-10, 10] }}
      renderItem={({ item }) => (
        <KidCard
          data={item}
          width={CARD_WIDTH}
          onPress={() => router.push(`./kids/${item.id}`)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  carousel: { flex: 1, justifyContent: "center", alignItems: "center" },
});
