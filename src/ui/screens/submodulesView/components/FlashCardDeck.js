import React, { Component } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import Swiper from "react-native-deck-swiper";
import FlashCard from "./FlashCard";
import CircularProgress from "react-native-circular-progress-indicator";
import COLORS from "../../../../constants/COLORS";

class FlashCardDeck extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cards: props.lessonData.flashcards,
      knowList: [],
      dontKnowList: [],
      flipInProgress: false,
      sessionComplete: false,
      progressUpdated: false,
    };
    const windowDimensions = Dimensions.get("window");
    this.windowWidth = windowDimensions.width;
    this.windowHeight = windowDimensions.height;
  }

  componentDidUpdate(prevProps, prevState) {
    // When sessionComplete changes to true and progress hasn't been updated yet,
    // update the quiz progress.
    if (
      !prevState.sessionComplete &&
      this.state.sessionComplete &&
      !this.state.progressUpdated
    ) {
      const total = this.state.knowList.length + this.state.dontKnowList.length;
      const score = this.state.knowList.length;

      // Update the progress regardless of whether all answers are correct.
      this.props.updateQuizProgress({ score, total });

      // Mark progress as updated so we don't update again.
      this.setState({ progressUpdated: true });

      // If there are no unknown cards, navigate to the results screen.
      if (this.state.dontKnowList.length === 0) {
        const learningStyle = this.props.learningStyle || "kinesthetic";
        this.props.navigation.navigate("SubmoduleResultsScreen", {
          correctPercentage: total ? (score / total) * 100 : 0,
          learningStyle,
        });
      }
    }
  }
  onSwipedLeft = (cardIndex) => {
    const card = this.state.cards[cardIndex];
    if (card) {
      this.setState((prevState) => ({
        dontKnowList: [...prevState.dontKnowList, card],
      }));
    }
    if (cardIndex === this.state.cards.length - 1) {
      this.handleComplete();
    }
  };

  onSwipedRight = (cardIndex) => {
    const card = this.state.cards[cardIndex];
    if (card) {
      this.setState((prevState) => ({
        knowList: [...prevState.knowList, card],
      }));
    }
    if (cardIndex === this.state.cards.length - 1) {
      this.handleComplete();
    }
  };

  handleComplete = () => {
    this.setState({ sessionComplete: true });
  };

  restartSession = () => {
    this.setState({
      knowList: [],
      dontKnowList: [],
      cards: this.props.lessonData.flashcards, // Reset to the original deck
      sessionComplete: false,
      progressUpdated: false,
    });
  };

  reviseUnknown = () => {
    this.setState({
      cards: this.state.dontKnowList,
      knowList: [],
      dontKnowList: [],
      sessionComplete: false,
      progressUpdated: false,
    });
  };

  renderCard = (card, index) => {
    if (!card) {
      return (
        <Text style={{ fontSize: 22, color: "gray", textAlign: "center" }}>
          No more cards
        </Text>
      );
    }
    return (
      <FlashCard
        card={card}
        hideText={index !== 0 && this.state.flipInProgress}
        {...(index === 0 && {
          onFlipStart: () => this.setState({ flipInProgress: true }),
          onFlipEnd: () => this.setState({ flipInProgress: false }),
        })}
      />
    );
  };

  render() {
    const { knowList, dontKnowList, sessionComplete } = this.state;
    const total = knowList.length + dontKnowList.length;
    const correctPercentage = total ? (knowList.length / total) * 100 : 0;

    // Render a local results view if the session is complete and there are unknown cards.
    if (sessionComplete && dontKnowList.length > 0) {
      return (
        <View
          style={{
            width: 300,
            height: 500,
            marginTop: -this.windowWidth * 0.35,
            alignSelf: "center",
            backgroundColor: "#fff",
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
            elevation: 10,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              marginBottom: 16,
              color: COLORS.MAROON,
            }}
          >
            Session Results
          </Text>
          <View
            style={{
              marginBottom: 16,
              backgroundColor: "#fff",
              width: this.windowWidth * 0.55,
              height: this.windowWidth * 0.55,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress
              value={correctPercentage}
              radius={70}
              inActiveStrokeOpacity={0.7}
              inActiveStrokeColor={COLORS.MAROON}
              activeStrokeWidth={40}
              inActiveStrokeWidth={40}
              progressValueStyle={{
                fontWeight: "bold",
                color: "#ccc",
              }}
            />
          </View>
          <TouchableOpacity
            onPress={this.reviseUnknown}
            style={{
              width: this.windowWidth * 0.55,
              paddingVertical: 12,
              borderRadius: 12,
              marginBottom: 16,
              alignItems: "center",
              backgroundColor: COLORS.MAROON_LIGHT,
            }}
          >
            <Text
              style={{
                color: COLORS.MAROON,
                fontSize: 18,
              }}
            >
              Revise Unknown
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.restartSession}
            style={{
              width: this.windowWidth * 0.55,
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: "center",
              backgroundColor: COLORS.MAROON,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 18 }}>Restart All</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <Swiper
        cards={this.state.cards}
        renderCard={this.renderCard}
        onSwipedLeft={this.onSwipedLeft}
        onSwipedRight={this.onSwipedRight}
        onSwipedAll={this.handleComplete}
        cardIndex={0}
        backgroundColor="transparent"
        stackSize={3}
        cardVerticalMargin={50}
        animateCardOpacity
      />
    );
  }
}

export default FlashCardDeck;
