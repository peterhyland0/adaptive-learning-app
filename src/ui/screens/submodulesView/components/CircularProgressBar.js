import React, { useRef } from "react";
import { View, TouchableOpacity, Animated } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Ionicons from "react-native-vector-icons/Ionicons";

const CircularProgressBar = ({ size = 100, strokeWidth = 10 }) => {
  const progress = useRef(new Animated.Value(0)).current;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const startAnimation = () => {
    Animated.timing(progress, {
      toValue: 100,
      duration: 5000,
      useNativeDriver: true,
    }).start();
  };

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg height={size} width={size} style={{ position: "absolute" }}>
        <Circle
          stroke="#eee"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Animated.Circle
          stroke="#ff6347"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>

      <TouchableOpacity onPress={startAnimation} style={{ position: "absolute" }}>
        <Ionicons name="play-circle" size={size / 2} color="#ff6347" />
      </TouchableOpacity>
    </View>
  );
};

export default CircularProgressBar;
