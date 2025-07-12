// frontend/app/components/SplashAnimation.tsx
//--------------------------------------------------------------
//  Simple splash + fade-in logo
//  onFinish() fires after `DURATION_MS` so the caller can redirect
//--------------------------------------------------------------
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

const DURATION_MS = 2000;          // total splash time

/* ------------ props ------------ */
interface SplashAnimationProps {
  onFinish: () => void;            // required callback
}

/* ------------ component ------------ */
export default function SplashAnimation({ onFinish }: SplashAnimationProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // fade-in animation
    Animated.timing(opacity, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start(() => {
      // hold for a moment, then exit
      const t = setTimeout(onFinish, DURATION_MS - 900);
      return () => clearTimeout(t);
    });
  }, [opacity, onFinish]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity }}>
        <Image
          source={require("../assets/images/FamilyCommandCenterSplash.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.tagline}>Family Command Center</Text>
      </Animated.View>
    </View>
  );
}

/* ------------ styles ------------ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 220,
    height: 220,
  },
  tagline: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "600",
    color: "#00D4FF",
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
