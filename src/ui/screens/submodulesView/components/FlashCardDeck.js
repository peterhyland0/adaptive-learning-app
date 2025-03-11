import React, { Component } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Swiper from "react-native-deck-swiper";
import FlashCard from "./FlashCard"; // Adjust the path as needed
import CircularProgress from "react-native-circular-progress-indicator";

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
  }

  onSwipedLeft = (cardIndex) => {
    const card = this.state.cards[cardIndex];
    if (card) {
      this.setState((prevState) => ({
        dontKnowList: [...prevState.dontKnowList, card],
      }));
    }
  };

  onSwipedRight = (cardIndex) => {
    const card = this.state.cards[cardIndex];
    if (card) {
      this.setState((prevState) => ({
        knowList: [...prevState.knowList, card],
      }));
    }
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

  componentDidUpdate(prevProps, prevState) {
    const total = this.state.knowList.length + this.state.dontKnowList.length;
    if (
      this.state.sessionComplete &&
      !this.state.progressUpdated &&
      total === this.props.lessonData.flashcards.length
    ) {
      this.props.updateQuizProgress({ score: this.state.knowList.length, total });
      this.setState({ progressUpdated: true });
    }
  }

  render() {
    const { knowList, dontKnowList, sessionComplete } = this.state;
    const total = knowList.length + dontKnowList.length;
    const correctPercentage = total ? (knowList.length / total) * 100 : 0;

    if (sessionComplete) {
      return (
        <View style={{ padding: 24 }}>
          {/* Top Section with Title & Progress */}
          <View style={{ alignItems: "center", marginTop: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: "600", marginBottom: 16 }}>
              Session Complete
            </Text>
            <View style={{ position: "relative", marginBottom: 16 }}>
              <CircularProgress
                value={correctPercentage}
                radius={100}
                inActiveStrokeOpacity={0.7}
                inActiveStrokeColor="red"
                activeStrokeWidth={40}
                inActiveStrokeWidth={40}
                progressValueStyle={{
                  fontWeight: "bold",
                  color: "#ccc",
                }}
              />
              <View style={{ justifyContent: "center", alignItems: "center" }}>
                <Text style={{ fontSize: 24, fontWeight: "bold" }}>
                  {knowList.length} / {total}
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom Section with Buttons */}
          <View style={{ width: "100%", marginBottom: 16 }}>
            {dontKnowList.length > 0 && (
              <TouchableOpacity
                onPress={this.reviseUnknown}
                style={{
                  width: "100%",
                  paddingVertical: 12,
                  borderRadius: 12,
                  marginBottom: 16,
                  alignItems: "center",
                  backgroundColor: "red",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 18 }}>Revise Unknown</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={this.restartSession}
              style={{
                width: "100%",
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
                backgroundColor: "#007aff",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 18 }}>Restart</Text>
            </TouchableOpacity>
          </View>
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
