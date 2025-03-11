import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import CircularProgress from "react-native-circular-progress-indicator";

const FlashcardResults = ({ correct, total, onRestart, onRevise }) => {
  const incorrect = total - correct;
  const correctPercentage = (correct / total) * 100;
  const incorrectPercentage = (incorrect / total) * 100;

  return (
    <View className="flex items-center justify-center h-full bg-white p-6">
      <Text className="text-xl font-semibold mb-4">Flashcard Session Complete</Text>

      <View className="relative">
        {/* Outer Circle - Incorrect Answers (Red) */}
        <CircularProgress
          value={100}
          radius={120}
          activeStrokeColor={"#e84118"}
          inActiveStrokeColor={"#e84118"}
          activeStrokeWidth={18}
          inActiveStrokeWidth={18}
          duration={1500}
        />

        {/* Inner Circle - Correct Answers (Green) */}
        <View className="absolute inset-0 flex items-center justify-center">
          <CircularProgress
            value={correctPercentage}
            radius={90}
            activeStrokeColor={"#badc58"}
            inActiveStrokeColor={"#badc58"}
            activeStrokeWidth={18}
            inActiveStrokeWidth={18}
            duration={1500}
          />
        </View>

        {/* Score in the center */}
        <View className="absolute inset-0 flex items-center justify-center">
          <Text className="text-2xl font-bold">{correct} / {total}</Text>
        </View>
      </View>

      {/* Buttons */}
      <View className="mt-6 w-full">
        <TouchableOpacity
          onPress={onRevise}
          className="bg-red-500 w-full py-3 rounded-xl mb-4"
        >
          <Text className="text-white text-center text-lg">Revise Unknown</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onRestart}
          className="bg-blue-500 w-full py-3 rounded-xl"
        >
          <Text className="text-white text-center text-lg">Restart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FlashcardResults;
