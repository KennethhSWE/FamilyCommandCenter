// app/components/SplashAnimation.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';

const loadingMessages = [
  'Loading assets...',
  'Preparing dashboard...',
  'Syncing chores...',
  'Fetching rewards...',
  'Almost ready...'
];

interface SplashProps {
  onFinish?: () => void; // ✅ make it optional
}

export default function SplashAnimation({ onFinish }: SplashProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const progress = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 4000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start(() => {
      if (onFinish) onFinish(); // ✅ safely call if defined
    });

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <ImageBackground
      source={require('../assets/images/FamilyCommandCenterSplash.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.text}>{loadingMessages[messageIndex]}</Text>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    padding: 40,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  text: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#444',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00d4ff',
  },
});

