import React from "react";
import { View, StyleSheet } from "react-native";
import WordFade from "./WordFade";

const WordRow = React.memo(({ row, rowIndex, width }) => {
  return (
    <View
      key={`row-${rowIndex}`}
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 5,
      }}>
      {row.map((word, index) => (
        <WordFade key={`${word.start}-${index}`} text={word.word} width={width} />
      ))}
    </View>
  );
});

export default WordRow;
