import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";

const DURATION_MS = 2000;

interface SplashAnimationProps {
  onFinish: () => void;
}

export default function SplashAnimation({ onFinish }: SplashAnimationProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(opacity, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    });

    const timeout = setTimeout(onFinish, DURATION_MS);

    animation.start();

    return () => {
      animation.stop();
      clearTimeout(timeout);
    };
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
