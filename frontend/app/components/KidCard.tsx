import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import * as Haptics from "expo-haptics";
import axios from "axios";

export interface Kid {
  username: string;
  name: string;
  avatar?: string;
  role: "kid" | "parent";
}

interface KidCardProps {
  data: Kid;
  width: number;
  onPress: () => void;
  isCentered?: boolean;
}

const MAX_POINTS = 100; // You can make this dynamic later

export default function KidCard({
  data,
  width,
  onPress,
  isCentered = false,
}: KidCardProps) {
  const [points, setPoints] = useState<number>(0);
  const progressAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const res = await axios.get(
          `http://192.168.1.122:7070/api/points/${data.username}`
        );
        const fetchedPoints = res.data.total_points || 0;
        setPoints(fetchedPoints);

        // Animate progress ring
        Animated.timing(progressAnim, {
          toValue: fetchedPoints / MAX_POINTS,
          duration: 1000,
          useNativeDriver: false,
        }).start();
      } catch (err) {
        console.error("Failed to fetch points:", err);
      }
    };

    fetchPoints();
  }, [data.username]);

  const radius = 60;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={handlePress} style={{ width }}>
      <LinearGradient
        colors={isCentered ? ["#FFFFFF", "#F2F6FF"] : ["#FFF", "#FFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, isCentered && styles.cardFocused]}
      >
        <View style={styles.avatarWrapper}>
          {/* Progress Ring */}
          <Svg width={radius * 2 + 8} height={radius * 2 + 8}>
            <Circle
              stroke="#eee"
              cx={radius + 4}
              cy={radius + 4}
              r={radius}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <AnimatedCircle
              stroke="#00d4ff"
              cx={radius + 4}
              cy={radius + 4}
              r={radius}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${circumference}, ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </Svg>

          {/* Avatar */}
          {data.avatar ? (
            <Image source={{ uri: data.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.placeholder]} />
          )}
        </View>

        {/* Name and Points */}
        <Text style={styles.name}>{data.name}</Text>
        <Text style={styles.points}>{points} pts</Text>

        {/* Admin Badge */}
        {data.role === "parent" && <Text style={styles.adminBadge}>Admin</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );
}

// AnimatedCircle wrapper
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  card: {
    height: "100%",
    borderRadius: 32,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
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
  avatarWrapper: {
    position: "relative",
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholder: {
    backgroundColor: "#ccc",
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 4,
  },
  points: {
    fontSize: 16,
    color: "#666",
  },
  adminBadge: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
    backgroundColor: "#007AFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
