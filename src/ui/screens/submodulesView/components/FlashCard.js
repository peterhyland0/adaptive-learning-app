import React, { useState } from "react";
import { Pressable, Text, View, Image } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Extrapolate,
  runOnJS,
} from "react-native-reanimated";

import CodeHighlighter from "react-native-code-highlighter";
import { atomOneDarkReasonable } from "react-syntax-highlighter/dist/esm/styles/hljs";
import COLORS from "../../../../constants/COLORS";

const FlashCard = ({ card }) => {
  const rotation = useSharedValue(0);
  const [flipped, setFlipped] = useState(false);

  const handlePress = () => {
    const newRotation = rotation.value === 0 ? 180 : 0;
    rotation.value = withTiming(newRotation, { duration: 500 }, (finished) => {
      if (finished) {
        runOnJS(setFlipped)(newRotation !== 0);
      }
    });
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = `${interpolate(rotation.value, [0, 180], [0, 180], Extrapolate.CLAMP)}deg`;
    const opacity = interpolate(rotation.value, [0, 90], [1, 0], Extrapolate.CLAMP);
    return {
      transform: [{ perspective: 1000 }, { rotateY }],
      opacity,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = `${interpolate(rotation.value, [0, 180], [180, 360], Extrapolate.CLAMP)}deg`;
    const opacity = interpolate(rotation.value, [90, 180], [0, 1], Extrapolate.CLAMP);
    return {
      transform: [{ perspective: 1000 }, { rotateY }],
      opacity,
    };
  });

  const renderAnswer = (answer, type) => {
    if (type === "code") {
      let codeString = answer.replace(/\\n/g, "\n");
      return (
        <View
          style={{
            flex: 1,
            alignSelf: "stretch",
            borderRadius: 10,
            padding: 10,
          }}
        >
          <View style={{ alignSelf: "center", paddingBottom: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}>
              Code Snippet
            </Text>
          </View>
          <CodeHighlighter
            hljsStyle={atomOneDarkReasonable}
            style={{ borderRadius: 10 }}
            containerStyle={{
              padding: 16,
              minWidth: "100%",
              backgroundColor: COLORS.BLACK,
              borderRadius: 10,
            }}
            textStyle={{ fontSize: 16 }}
            language="c"
          >
            {codeString}
          </CodeHighlighter>
        </View>
      );
    }

    if (type === "image" && answer.startsWith("http")) {
      return (
        <View
          style={{
            width: "90%",
            height: "80%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={{ uri: answer }}
            style={{
              width: "100%",
              height: "80%",
              borderRadius: 10,
            }}
            resizeMode="contain"
          />
          <Text style={{ fontSize: 14, color: "#fff", marginTop: 5 }}>
            Generated Image
          </Text>
        </View>
      );
    }

    return (
      <Text
        style={{
          fontSize: 18,
          textAlign: "center",
          padding: 10,
          color: "#fff",
        }}
      >
        {answer}
      </Text>
    );
  };

  return (
    <Pressable
      onPress={handlePress}
      style={{
        width: 300,
        height: 500,
        alignSelf: "center",
      }}
    >
      {/* Front Side: Question */}
      <Animated.View
        pointerEvents={flipped ? "none" : "auto"}
        style={[
          {
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            backfaceVisibility: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
            backgroundColor: COLORS.MAROON,
          },
          frontAnimatedStyle,
        ]}
      >
        <Text
          style={{
            fontSize: 18,
            textAlign: "center",
            padding: 10,
            color: "#fff",
          }}
        >
          {card.question}
        </Text>
      </Animated.View>

      {/* Back Side: Answer */}
      <Animated.View
        pointerEvents={flipped ? "auto" : "none"}
        style={[
          {
            position: "absolute",
            width: "100%",
            height: "100%",
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            backfaceVisibility: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 5,
            backgroundColor: COLORS.BLACK,
          },
          backAnimatedStyle,
        ]}
      >
        {renderAnswer(card.answer, card.type)}
      </Animated.View>
    </Pressable>
  );
};

export default FlashCard;
