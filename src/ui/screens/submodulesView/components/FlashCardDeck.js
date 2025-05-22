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
      flipTrigger: 0,
      currentCardIndex: 0,
    };
    const windowDimensions = Dimensions.get("window");
    this.windowWidth = windowDimensions.width;
    this.windowHeight = windowDimensions.height;
    this.swiperRef = React.createRef();
    this.topCardRef = React.createRef();  }

  componentDidUpdate(prevProps, prevState) {
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
// Update onSwipedLeft
  onSwipedLeft = (cardIndex) => {
    const card = this.state.cards[cardIndex];
    if (card) {
      this.setState((prevState) => ({
        dontKnowList: [...prevState.dontKnowList, card],
        currentCardIndex: prevState.currentCardIndex + 1,
      }));
    }
    if (cardIndex === this.state.cards.length - 1) {
      this.handleComplete();
    }
  };
// Update onSwipedRight (similarly)
  onSwipedRight = (cardIndex) => {
    const card = this.state.cards[cardIndex];
    if (card) {
      this.setState((prevState) => ({
        knowList: [...prevState.knowList, card],
        currentCardIndex: prevState.currentCardIndex + 1,
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

// Modify renderCard
  renderCard = (card) => {
    const index = this.state.cards.indexOf(card);
    const isTopCard = index === this.state.currentCardIndex;
    return (
      <FlashCard
        card={card}
        hideText={!isTopCard && this.state.flipInProgress}
        ref={isTopCard ? this.topCardRef : null}
        {...(isTopCard && {
          onFlipStart: () => this.setState({ flipInProgress: true }),
          onFlipEnd: () => this.setState({ flipInProgress: false }),
        })}
      />
    );
  };
// New method to swipe left programmatically
  swipeLeft = () => {
    if (this.swiperRef.current) {
      this.swiperRef.current.swipeLeft();
    }
  };

  // New method to swipe right programmatically
  swipeRight = () => {
    if (this.swiperRef.current) {
      this.swiperRef.current.swipeRight();
    }
  };
  flipCard = () => {
    if (this.topCardRef.current) {
      this.topCardRef.current.flip();
    }
  };
  render() {
    const { knowList, dontKnowList, sessionComplete } = this.state;
    const total = knowList.length + dontKnowList.length;
    const correctPercentage = total ? (knowList.length / total) * 100 : 0;
    const totalCards = this.props.lessonData.flashcards.length ;
    const currentCardNumber = (knowList.length + dontKnowList.length) ;
    const progressPercentage = (currentCardNumber / totalCards) * 100;
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
      <View
        style={{
          position: "absolute",
          top: 50,
          left: 0
        }}
      >
        {/*<View*/}
        {/*  style={{*/}
        {/*    width: this.windowWidth * 0.35,*/}
        {/*    alignItems: "center",*/}
        {/*    justifyContent: "center",*/}
        {/*  }}*/}
        {/*>*/}
        {/*  <Text*/}
        {/*    style={{*/}
        {/*      color: COLORS.BLACK,*/}
        {/*      fontSize: 20,*/}
        {/*    }}*/}
        {/*  >*/}
        {/*    {currentCardNumber}/{totalCards}*/}
        {/*  </Text>*/}
        {/*</View>*/}
        <View
          style={{
            width: this.windowWidth,
            alignItems: "center",
          }}
        >
        <View
          style={{
            height: 10,
            backgroundColor: "#808080", // Grey background
            borderRadius: 5,
            overflow: "hidden",
            width: this.windowWidth * 0.8,
          }}
        >
          <View
            style={{
              height: "100%",
              backgroundColor: "#FFFFFF",
              width: `${progressPercentage}%`,
              borderRadius: 5,
            }}
          />
        </View>
        </View>
        <Swiper
          ref={this.swiperRef}
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

        {/* Button Row */}
        <View
          style={{
            position: "absolute",
            bottom: -650,
            alignItems: "center",
            flexDirection: "row",
            width: this.windowWidth,
            justifyContent: "space-around",
            paddingBottom: 20,
            paddingHorizontal: 10,
            backgroundColor: "transparent",
          }}
        >
          <TouchableOpacity
            onPress={this.swipeLeft}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 20,
              backgroundColor: COLORS.MAROON_LIGHT,
              borderRadius: 8,
              width: this.windowWidth * 0.3,
              alignItems: "center"
            }}
          >
            <Text style={{ color: COLORS.MAROON, fontSize: 15 }}>
              Don't Know
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={this.flipCard}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 20,
              backgroundColor: COLORS.MAROON,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16 }}>Flip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={this.swipeRight}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 20,
              backgroundColor: COLORS.MAROON_LIGHT,
              borderRadius: 8,
              width: this.windowWidth * 0.3,
              alignItems: "center"
            }}
          >
            <Text style={{ color: COLORS.MAROON, fontSize: 15 }}>
              Know
            </Text>
          </TouchableOpacity>
        </View>
      </View>

    );
  }
}

export default FlashCardDeck;
