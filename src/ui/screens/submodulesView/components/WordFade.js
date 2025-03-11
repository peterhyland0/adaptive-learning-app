import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet } from "react-native";

export default function WordFade({ text, onComplete, width }) {
  const opacity = useRef(new Animated.Value(0)).current;    // Start invisible
  const translateX = useRef(new Animated.Value(-50)).current; // Start left off-screen

  useEffect(() => {
    // 1. Animate in (slide + fade)
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // 2. Animate out (fade) when onComplete is triggered
  // (the parent can call a method or set a prop to fade out)
  // For a timed auto fade, see below.

  const fadeOut = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      onComplete?.(); // Let the parent remove it
    });
  };

  return (
    <Animated.View
      style={[
        styles.wordContainer,
        {
          opacity: opacity,
          transform: [{ translateX: translateX }],
        },
      ]}
    >
      <Text style={styles.word}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wordContainer: {
    // Spacing as needed
    width: this.width,
    marginRight: 6,
  },
  word: {
    color: "#fff",
    fontSize: 18,
  },
});
