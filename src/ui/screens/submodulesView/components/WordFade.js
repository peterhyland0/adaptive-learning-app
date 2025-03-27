import React, { useEffect } from "react";
import { Text, Animated } from "react-native";

const WordFade = ({ text, width, isActive }) => {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500 + text.length * 50, // Longer words fade slower
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        delay: 1000, // Stay visible briefly
        useNativeDriver: true,
      }),
    ]).start();
  }, [text]);

  return (
    <Animated.Text
      style={{
        opacity: fadeAnim,
        marginRight: 5,
        fontSize: 16,
        color: isActive ? "#FFD700" : "#fff", // Gold for active word
        fontWeight: isActive ? "bold" : "normal",
      }}
    >
      {text}
    </Animated.Text>
  );
};

export default WordFade;