// frontend/app/(tabs)/kids.tsx
//--------------------------------------------------------------
//  Kids tab – family dashboard for choosing a child
//--------------------------------------------------------------
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getKidsByHousehold, Kid } from "../../src/lib/api";
import { getHouseholdId } from "../../src/lib/auth";
import KidCard from "../components/KidCard";

const screenWidth = Dimensions.get("window").width;

const getGridSettings = () => {
  const isTablet = screenWidth >= 560; // change for screen width of tablet
  const columns = isTablet ? 2 : 1;
  const screenPadding = 16;
  const cardGap = 14;

  const cardWidth =
    columns === 2
      ? (screenWidth - screenPadding * 2 - cardGap) / 2
      : screenWidth - screenPadding * 2;

  const cardHeight = isTablet ? 260 : 300;

  return {
    columns,
    cardWidth,
    cardHeight,
  };
};

export default function KidsTab() {
  const router = useRouter();

  const [kids, setKids] = useState<Kid[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const grid = useMemo(() => getGridSettings(), []);

  const loadKids = useCallback(async () => {
    try {
      const householdId = await getHouseholdId();

      if (!householdId) {
        router.replace("/setup/parent" as any);
        return;
      }

      const list = await getKidsByHousehold(householdId);
      setKids(list);

      if (!list || list.length === 0) {
        router.replace("/setup/kids" as any);
        return;
      }
    } catch (error) {
      console.error("Failed to load kids:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadKids();
    }, [loadKids]),
  );

  const openKidChores = (kid: Kid) => {
    router.push({
      pathname: "/kid/[id]",
      params: { id: kid.username },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        key={grid.columns}
        data={kids}
        numColumns={grid.columns}
        keyExtractor={(kid) => String(kid.id ?? kid.username)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadKids();
            }}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerBox}>
            <Text style={styles.header}>Family Dashboard</Text>
            <Text style={styles.subtitle}>
              Tap your card to see today&apos;s chores.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={grid.columns > 1 ? styles.columnWrapper : undefined}
        renderItem={({ item }) => (
          <View style={styles.cardSlot}>
            <KidCard
              data={item}
              width={grid.cardWidth}
              height={grid.cardHeight}
              isCentered
              onPress={() => openKidChores(item)}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    padding: 16,
    paddingBottom: 120,
  },
  headerBox: {
    marginBottom: 18,
    alignItems: "center",
  },
  header: {
    fontSize: 32,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  columnWrapper: {
    gap: 14,
  },
  cardSlot: {
    marginBottom: 14,
  },
});
