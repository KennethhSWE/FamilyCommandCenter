// frontend/app/components/KidCard.tsx
import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export interface Kid {
  id: string;
  name: string;
  points?: number;
  avatar?: string;
  role: "kid" | "parent";
}

interface KidCardProps {
  data: Kid;
  width: number;
  onPress: () => void;
  isCentered?: boolean; // ★ new
}

export default function KidCard({
  data,
  width,
  onPress,
  isCentered = false, // default → not centered
}: KidCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={{ width }}>
      {/*  ⬇︎  subtle gradient for hero-card pop  */}
      <LinearGradient
        colors={isCentered ? ["#FFFFFF", "#F2F6FF"] : ["#FFF", "#FFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          isCentered && styles.cardFocused, // bigger shadow / scale
        ]}
      >
        {/* Avatar */}
        {data.avatar ? (
          <Image source={{ uri: data.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.placeholder]} />
        )}

        {/* Kid name & points */}
        <Text style={styles.name}>{data.name}</Text>
        <Text style={styles.points}>{data.points ?? 0} pts</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

/* ───────── styles ───────── */
const styles = StyleSheet.create({
  card: {
    height: "100%",
    borderRadius: 32,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    transform: [{ scale: 1 }],
  },
  cardFocused: {
    shadowOpacity: 0.25,
    elevation: 14,
    transform: [{ scale: 1.05 }],
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 20,
  },
  placeholder: {
    backgroundColor: "#e0e0e0",
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  points: {
    fontSize: 16,
    color: "#888",
  },
});
