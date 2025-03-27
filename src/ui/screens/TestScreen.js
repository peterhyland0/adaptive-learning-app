import React from 'react';
import { View } from 'react-native';
import AnimatedLoading from "../../components/animations/AnimatedLoading";
import COLORS from "../../constants/COLORS";

export default function TestScreen() {
  // Use a string of comma-separated preferences
  const preferences = "Auditory, Visual";
  const selectedPreferences = preferences.split(", ").map(pref => pref.trim());

  const getSentences = (selectedPreferences) => {
    const sentences = ["Extracting Text from Document"];
    if (selectedPreferences.includes("Auditory")) {
      sentences.push("Creating Auditory Submodule");
      sentences.push("Retrieving Podcast Conversation from LLM");
      sentences.push("Individually fetching speech to text of sentences");
      sentences.push("Creating Audio File");
    }
    if (selectedPreferences.includes("Visual")) {
      sentences.push("Creating Visual Submodule");
      sentences.push("Retrieving Tree Layout from LLM");
      sentences.push("Creating Mind Map")
    }
    if (selectedPreferences.includes("Kinesthetic")) {
      sentences.push("Creating Kinesthetic Submodule");
      sentences.push("Retrieving Question and Answers from LLM");
      sentences.push("Creating Interactive Flash Cards");
    }
    sentences.push("Creating Multiple Choice Quiz");
    sentences.push("Creating Module");
    sentences.push("Almost done!");
    return sentences;
  };

  return (
    <View style={{ flex: 1 }}>
      <AnimatedLoading
        sentences={[
          "Welcome to the Adaptive Learning App!",
          "We are loading your data...",
          "Almost done!"
        ]}
        size={1.5}
        fontSize={20}
        animationMarginTop={0}
        textBottom={100}
        backgroundColor={COLORS.MAROON_LIGHT}
        textColor={COLORS.MAROON}
        animationSource={require("../../assets/animations/loading-circle-fall.json")}
        fadeDuration={800}
        displayDuration={2000}
        cycle={true}
        speed={0.5}
      />
    </View>
  );
}
