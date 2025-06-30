import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
// Update the path below to the correct location of your api module, e.g.:
import { Kid, getKids, getChoresByKid } from "src/lib/api";
import KidCard from "../../components/KidCard";

const { width } = Dimensions.get("window");
const CARD_WIDTH  = width * 0.68;
const CARD_HEIGHT = CARD_WIDTH * 1.25;

export default function KidsCarouselScreen() {
  const [kids, setKids] = useState<(Kid & { chores: any[] })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadKids = async () => {
      try {
        const rawKids = await getKids();            // 1 pull kids
        const withChores = await Promise.all(       // 2️ attach chores
          rawKids.map(async kid => ({
            ...kid,
            chores: await getChoresByKid(kid.id),
          }))
        );
        setKids(withChores);
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
        <KidCard name="No kids yet" chores={[]} />
      </View>
    );
  }

  return (
    <Carousel
      width={CARD_WIDTH}
      height={CARD_HEIGHT}
      data={kids}
      mode="horizontal-stack"
      modeConfig={{ stackInterval: 18, scaleInterval: 0.08, opacityInterval: 0.25 }}
      style={styles.carousel}
      defaultIndex={0}
      gestureConfig={{ activeOffsetX: [-10, 10] }}
      renderItem={({ item }) => (
        <KidCard name={item.name} chores={item.chores ?? []} />
      )}
    />
  );
}

const styles = StyleSheet.create({
  carousel: { flex: 1, justifyContent: "center", alignItems: "center" },
  loader:   { flex: 1, justifyContent: "center", alignItems: "center" },
});
