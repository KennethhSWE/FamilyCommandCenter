// frontend/app/components/KidCard.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";

export interface Kid {
  id: string;
  name: string;
  points?: number;
  avatar?: string;           // optional avatar URL / local asset
  role: "kid" | "parent";
}

interface KidCardProps {
  data: Kid;                 // kid object passed from the carousel
  width: number;             // width of the card (passed from carousel)
  onPress: () => void;       // navigate handler
}

export default function KidCard({ data, width, onPress }: KidCardProps) {
  return (
    <TouchableOpacity style={[styles.card, { width }]} onPress={onPress}>
      {/* Avatar (optional) */}
      {data.avatar ? (
        <Image source={{ uri: data.avatar }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.placeholder]} />
      )}

      {/* Kid name & points */}
      <Text style={styles.name}>{data.name}</Text>
      <Text style={styles.points}>{data.points} pts</Text>
    </TouchableOpacity>
  );
}

/* ───────────────────── styles ───────────────────── */
const styles = StyleSheet.create({
  card: {
    height: "100%",
    borderRadius: 24,
    backgroundColor: "#fff",
    elevation: 4,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
  },
  placeholder: {
    backgroundColor: "#e0e0e0",
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  points: {
    fontSize: 16,
    color: "#777",
  },
});
