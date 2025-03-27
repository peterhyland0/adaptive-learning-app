import React, { Component } from 'react';
import { View, Animated, StyleSheet, StatusBar, Dimensions } from 'react-native';
import LottieView from "lottie-react-native";

export default class AnimatedLoading extends Component {
  static defaultProps = {
    sentences: [
      "Loading Your Data...",
      "Fetching the latest updates...",
      "Almost there...",
      "Preparing your experience..."
    ],
    backgroundColor: "#F5F5F5",
    textColor: "#333333",
    animationSource: require("../../assets/animations/loading-circle-maroon.json"),
    fadeDuration: 1000,
    displayDuration: 10000,
    cycle: true,
    size: 0.9,
    fontSize: 16,
    textMarginTop: 10,
    speed: 0.5,
    animationMarginTop: 0,
  };

  constructor(props) {
    super(props);
    this.state = {
      currentSentenceIndex: 0,
    };

    const windowDimensions = Dimensions.get("window");
    this.windowWidth = windowDimensions.width;
    this.windowHeight = windowDimensions.height;

    this.opacity = new Animated.Value(0);
  }

  componentDidMount() {
    this.animateSentence();
  }

  animateSentence = () => {
    const { fadeDuration, displayDuration, sentences, cycle } = this.props;
    const { currentSentenceIndex } = this.state;

    // Fade in the current sentence
    Animated.timing(this.opacity, {
      toValue: 1,
      duration: fadeDuration,
      useNativeDriver: true,
    }).start(() => {
      // If not cycling and we're on the last sentence, do nothing (keep it visible)
      if (!cycle && currentSentenceIndex === sentences.length - 1) {
        return;
      }

      // Otherwise, wait for the display duration then fade out
      setTimeout(() => {
        Animated.timing(this.opacity, {
          toValue: 0,
          duration: fadeDuration,
          useNativeDriver: true,
        }).start(() => {
          const nextIndex = cycle
            ? (currentSentenceIndex + 1) % sentences.length
            : currentSentenceIndex + 1;

          // Only animate if there is another sentence to show when not cycling
          if (!cycle && nextIndex >= sentences.length) {
            return;
          }

          this.setState(
            { currentSentenceIndex: nextIndex },
            this.animateSentence
          );
        });
      }, displayDuration);
    });
  };

  render() {
    const { currentSentenceIndex } = this.state;
    const {
      sentences,
      backgroundColor,
      textColor,
      animationSource,
      size,
      fontSize,
      textBottom,
      speed,
      animationMarginTop
    } = this.props;

    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: backgroundColor
      }}>
        <StatusBar
          backgroundColor="transparent"
          translucent
          barStyle="dark-content"
        />
        <LottieView
          source={animationSource}
          autoPlay={true}
          style={{
            width: this.windowWidth * size,
            height: this.windowWidth * size,
            elevation: 4,
            marginTop: animationMarginTop
          }}
          speed={speed}
        />
        <Animated.Text
          style={{
            position: "relative",
            fontSize: fontSize,
            fontWeight: "bold",
            opacity: this.opacity,
            color: textColor,
            bottom: textBottom,
            textAlign: "center",
            paddingHorizontal: 30,
            height: 50
          }}
        >
          {sentences[currentSentenceIndex]}
        </Animated.Text>
      </View>
    );
  }
}

