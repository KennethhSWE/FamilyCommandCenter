// frontend/app/(tabs)/kids.tsx
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Carousel from "react-native-reanimated-carousel";
import { getKids, Kid } from "../../src/lib/api";
import KidCard from "../components/KidCard";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.75;

export default function KidsTab() {
  const router = useRouter();
  const [kids, setKids] = useState<Kid[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0); // track focused item

  useEffect(() => {
    (async () => {
      try {
        setKids(await getKids());
      } finally {
        setLoading(false);
      }
    })();
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
          data={{ id: "0", name: "No kids yet", role: "kid", points: 0 }}
          width={CARD_WIDTH}
          onPress={function (): void {
            throw new Error("Function not implemented.");
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.carouselWrapper}>
      <Carousel
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        data={kids}
        loop
        onSnapToItem={setIndex} // update state
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 60,
          parallaxAdjacentItemScale: 0.8,
        }}
        renderItem={({ item, index: i }) => (
          <KidCard
            data={{ ...item, id: String(item.id) }}
            width={CARD_WIDTH}
            isCentered={i === index} // highlight center card
            onPress={() =>
              router.push({
                pathname: "/kid/[id]",
                params: { id: String(item.id) },
              })
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  carouselWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
