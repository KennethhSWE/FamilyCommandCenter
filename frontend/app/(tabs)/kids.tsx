import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { Kid, getKids } from "src/lib/api";
import KidCard from "../components/KidCard";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.68;
const CARD_HEIGHT = CARD_WIDTH * 1.25;

export default function KidsCarouselScreen() {
  const [kids, setKids] = useState<Kid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadKids = async () => {
      try {
        const rawKids = await getKids();
        setKids(rawKids);
      } catch (err) {
        console.error("Failed to load kids:", err);
      } finally {
        setLoading(false);
      }
    };
    loadKids();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!kids.length) {
    return (
      <View style={styles.loader}>
        <KidCard
          data={{ id: "0", name: "No kids yet", points: 0, role: "kid" }}
          width={CARD_WIDTH}
          onPress={() => {}}
        />
      </View>
    );
  }

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
      defaultIndex={0}
      panGestureHandlerProps={{ activeOffsetX: [-10, 10] }} 
      renderItem={({ item }) => (
        <KidCard
          data={item}
          width={CARD_WIDTH}
          onPress={() => {
            // TODO: Navigate to kid detail or chore list screen
            console.log("Tapped kid:", item.name);
          }}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  carousel: { flex: 1, justifyContent: "center", alignItems: "center" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});
