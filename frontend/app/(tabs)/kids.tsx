// frontend/app/(tabs)/kids.tsx
//--------------------------------------------------------------
//  Kids tab – fetch household kids & display them in a carousel
//--------------------------------------------------------------
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import Carousel from "react-native-reanimated-carousel";
import * as Haptics from "expo-haptics";

import { getKids, Kid } from "../../src/lib/api";
import KidCard from "../components/KidCard";

/* ───────────────────────── constants ───────────────────────── */
const { width, height } = Dimensions.get("window");
const CARD_WIDTH  = width  * 0.9;
const CARD_HEIGHT = height * 0.75;

/* ───────────────────────── component ───────────────────────── */
export default function KidsTab() {
  const router   = useRouter();
  const scheme   = useColorScheme();
  const colors   = scheme === "dark"
    ? { bg: "#000", loader: "#888" }
    : { bg: "#FFF", loader: "#444" };

  const [kids,      setKids]      = useState<Kid[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [refreshing,setRefreshing]= useState(false);
  const [focused,   setFocused]   = useState(0);

  /* ---------------------- data fetcher ---------------------- */
  const loadKids = useCallback(async () => {
    try {
      const list = await getKids();
      setKids(list);
    } catch (e) {
      console.error("Failed to load kids:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadKids(); }, [loadKids]);

  /* ------------------------ UI states ----------------------- */
  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.loader} />
      </View>
    );
  }

  if (!kids.length) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <KidCard
          data={{ username: "none", name: "No kids yet", role: "kid" }}
          width={CARD_WIDTH}
          onPress={() => {}}
        />
      </View>
    );
  }

  /* ------------------------ main UI ------------------------ */
  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Carousel
        data={kids}
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        loop
        onSnapToItem={(idx) => {
          setFocused(idx);
          Haptics.selectionAsync();              // subtle tick
        }}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 60,
          parallaxAdjacentItemScale: 0.8,
        }}
        renderItem={({ item, index }) => (
          <KidCard
            data={{ ...item, id: String(item.id) }}
            width={CARD_WIDTH}
            isCentered={index === focused}
            onPress={() =>
              router.push({ pathname: "/kid/[id]", params: { id: String(item.id) } })
            }
          />
        )}
      />

      {/* Pull-to-refresh support */}
      <RefreshControl refreshing={refreshing} onRefresh={() => {
        setRefreshing(true);
        loadKids();
      }} />
    </View>
  );
}

/* ───────────────────────── styles ───────────────────────── */
const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
