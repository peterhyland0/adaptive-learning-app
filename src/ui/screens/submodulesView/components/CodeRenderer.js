import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CodeHighlighter from 'react-native-code-highlighter';
import { atomOneDarkReasonable } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const ContentRenderer = ({ content }) => {
  // Trim any extra whitespace from the content
  const trimmedContent = content.trim();

  // Check if the content is wrapped in triple single quotes
  if (trimmedContent.startsWith("'''") && trimmedContent.endsWith("'''")) {
    // Remove the triple quotes from the beginning and end
    const codeString = trimmedContent.slice(3, -3).trim();

    return (
      <CodeHighlighter
        hljsStyle={atomOneDarkReasonable}
        containerStyle={styles.codeContainer}
        textStyle={styles.codeText}
        language="javascript"
      >
        {codeString}
      </CodeHighlighter>
    );
  }

  // Fallback: render as plain text
  return (
    <View style={styles.textContainer}>
      <Text style={styles.plainText}>{content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  codeContainer: {
    padding: 16,
    minWidth: '100%',
  },
  codeText: {
    fontSize: 16,
  },
  textContainer: {
    padding: 10,
  },
  plainText: {
    fontSize: 16,
  },
});

export default ContentRenderer;
