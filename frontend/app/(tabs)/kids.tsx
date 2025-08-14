// frontend/app/(tabs)/kids.tsx
//--------------------------------------------------------------
//  Kids tab – fetch household kids & display them in a carousel
//--------------------------------------------------------------
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  StyleSheet,
  View,
  useColorScheme,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import Carousel from "react-native-reanimated-carousel";
import * as Haptics from "expo-haptics";

import { getKidsByHousehold, Kid } from "../../src/lib/api";
import { getHouseholdId } from "../../src/lib/auth";
import KidCard from "../components/KidCard";

/* ───────────────────────── constants ───────────────────────── */
const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.75;

/* ───────────────────────── component ───────────────────────── */
export default function KidsTab() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors =
    scheme === "dark"
      ? { bg: "#000", loader: "#888" }
      : { bg: "#FFF", loader: "#444" };

  const [kids, setKids] = useState<Kid[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [focused, setFocused] = useState(0);

  /* ---------------------- data fetcher ---------------------- */
  const loadKids = useCallback(async () => {
    try {
      const hh = await getHouseholdId();
      if (!hh) {
        // No household yet → bounce to register
        router.replace("/register");
        return;
      }
      const list = await getKidsByHousehold(hh);
      setKids(list);

      // If household exists but has no kids, go to register flow
      if (!list || list.length === 0) {
        router.replace("/register");
      }
    } catch (e) {
      console.error("Failed to load kids:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  // Refetch whenever this tab/screen gains focus (also runs on first mount)
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadKids();
      // no cleanup needed
    }, [loadKids])
  );

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
          data={{ username: "none", name: "No kids yet", role: "kid" as const }}
          width={CARD_WIDTH}
          onPress={() => {}}
        />
      </View>
    );
  }

  /* ------------------------ main UI ------------------------ */
  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.bg }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadKids();
          }}
        />
      }
    >
      <Carousel
        data={kids}
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        loop
        onSnapToItem={(idx) => {
          setFocused(idx);
          Haptics.selectionAsync(); // subtle tick
        }}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 60,
          parallaxAdjacentItemScale: 0.8,
        }}
        renderItem={({ item, index }) => (
          <KidCard
            data={ item }
            width={CARD_WIDTH}
            isCentered={index === focused}
            onPress={() =>
              router.push({
                pathname: "/kid/[id]",
                params: { id: item.username },
              })
            }
          />
        )}
      />
    </ScrollView> 
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
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
