import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  FlatList,
  Alert, StatusBar,
} from "react-native";
import BackArrow from "../../../util/BackArrow";
import { SessionContext } from "../../../util/SessionContext";
import COLORS from "../../../constants/COLORS";
import {updateUserLearningStyle} from "../../../api/updateUserLearningStyle";

export default class LearningStyleForm extends Component {
  static contextType = SessionContext;

  constructor(props) {
    super(props);
    const windowDimensions = Dimensions.get("window");
    this.windowWidth = windowDimensions.width;
    this.windowHeight = windowDimensions.height;
    this.state = {
      answers: Array(16).fill(null),
    };
  }

  // When an option is pressed, update the answer for that question
  handleSelect = (questionIndex, value) => {
    this.setState((prevState) => {
      const newAnswers = [...prevState.answers];
      newAnswers[questionIndex] = value;
      return { answers: newAnswers };
    });
  };

  handleNext = async () => {
    const { answers } = this.state;
    if (answers.includes(null)) {
      Alert.alert("Incomplete", "Please answer all questions before submitting.");
      return;
    }
    const questions = [
      "I want to find out more about a tour that I am going on. I would:",
      "When I am learning I:",
      "I have finished a competition or test and I would like some feedback:",
      "I want to learn how to play a new board game or card game. I would:",
      "When learning from the Internet I like:",
      "When choosing a career or area of study, these are important for me:",
      "I want to find out about a house or an apartment. Before visiting it I would want:",
      "When finding my way, I:",
      "I prefer a presenter or a teacher who uses:",
      "I want to learn about a new project. I would ask for:",
      "I have been advised by the doctor that I have a medical problem and I have some questions about it. I would:",
      "I am having trouble assembling a wooden table that came in parts (kitset). I would:",
      "I want to learn to do something new on a computer. I would:",
      "I want to learn how to take better photos. I would:",
      "I want to save more money and to decide between a range of options. I would:",
      "A website has a video showing how to make a special graph or chart. There is a person speaking, some lists and words describing what to do and some diagrams. I would learn most from:",
    ];

    const mappedAnswers = questions.map((question, index) => {
      // return { answer: question + " " + this.state.answers[index] };]
      return { answer: this.state.answers[index] };

    });

    try {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: mappedAnswers }),
      };

      const response = await fetch(
        "http://0.0.0.0:8000/api/predict-learning-style",
        requestOptions
      );

      console.log("Response status:", response.status);
      if (!response.ok) {
        throw new Error("HTTP error! status: " + response.status);
      }

      const result = await response.text();
      this.context.setSession((prevSession) => ({
        ...prevSession,
        user: {
          ...prevSession.user,
          myLearningStyle: result,
        },
      }));
      await updateUserLearningStyle(this.context.session.userUid, result)
      this.props.navigation.navigate("LearningStyleResults");
      console.log("Prediction result:", result);
    } catch (error) {
      console.error("Error submitting answers:", error);
    }
  };

  render() {
    const questions = [
      "I want to find out more about a tour that I am going on. I would:",
      "When I am learning I:",
      "I have finished a competition or test and I would like some feedback:",
      "I want to learn how to play a new board game or card game. I would:",
      "When learning from the Internet I like:",
      "When choosing a career or area of study, these are important for me:",
      "I want to find out about a house or an apartment. Before visiting it I would want:",
      "When finding my way, I:",
      "I prefer a presenter or a teacher who uses:",
      "I want to learn about a new project. I would ask for:",
      "I have been advised by the doctor that I have a medical problem and I have some questions about it. I would:",
      "I am having trouble assembling a wooden table that came in parts (kitset). I would:",
      "I want to learn to do something new on a computer. I would:",
      "I want to learn how to take better photos. I would:",
      "I want to save more money and to decide between a range of options. I would:",
      "A website has a video showing how to make a special graph or chart. There is a person speaking, some lists and words describing what to do and some diagrams. I would learn most from:",
    ];

    const options = [
      [
        "Use a map and see where the places are.",
        "Look at details about the highlights and activities on the tour.",
        "Talk with the person who planned the tour or others who are going on the tour.",
      ],
      [
        "Use examples and applications.",
        "Like to talk things through.",
        "See patterns in things.",
      ],
      [
        "Using graphs showing how my performance has improved.",
        "From somebody who talks it through with me.",
        "Using examples from what I have done.",
      ],
      [
        "Listen to somebody explaining it and ask questions.",
        "Use the diagrams that explain the various stages, moves and strategies in the game.",
        "Watch others play the game before joining in.",
      ],
      [
        "Interesting design and visual features.",
        "Videos showing how to do things.",
        "Podcasts and videos where I can listen to experts.",
      ],
      [
        "Communicating with others through discussion.",
        "Working with designs, maps or charts.",
        "Applying my knowledge in real situations.",
      ],
      [
        "To view a video of the property.",
        "A plan showing the rooms and a map of the area.",
        "A discussion with the owner.",
      ],
      [
        "Rely on verbal instructions from GPS or from someone traveling with me.",
        "Rely on paper maps or GPS maps.",
        "Head in the general direction to see if I can find my destination without instructions.",
      ],
      [
        "Question and answer, talk, group discussion, or guest speakers.",
        "Demonstrations, models or practical sessions.",
        "Diagrams, charts, maps or graphs.",
      ],
      [
        "An opportunity to discuss the project.",
        "Diagrams to show the project stages with charts of benefits and costs.",
        "Examples where the project has been used successfully.",
      ],
      [
        "Have a detailed discussion with my doctor.",
        "Use a 3D model to see what is wrong.",
        "Look at a diagram showing what was wrong.",
      ],
      [
        "Ask for advice from someone who assembles furniture.",
        "Watch a video of a person assembling a similar table.",
        "Study diagrams showing each stage of the assembly.",
      ],
      [
        "Talk with people who know about the program.",
        "Follow the diagrams in a book.",
        "Start using it and learn by trial and error.",
      ],
      [
        "Use diagrams showing the camera and what each part does.",
        "Ask questions and talk about the camera and its features.",
        "Use examples of good and poor photos showing how to improve them.",
      ],
      [
        "Consider examples of each option using my financial information.",
        "Talk with an expert about the options.",
        "Use graphs showing different options for different time periods.",
      ],
      [
        "Listening.",
        "Watching the actions.",
        "Seeing the diagrams.",
      ],
    ];

    const totalQuestions = questions.length;
    const answeredCount = this.state.answers.filter((a) => a !== null).length;
    const progressPercentage = (answeredCount / totalQuestions) * 100;

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.MAROON }}>
        <StatusBar backgroundColor={COLORS.MAROON} barStyle="light-content" />
        <BackArrow title="Obtain Your Learning Style" color={"#fff"} />

        <View style={{ flex: 1, paddingHorizontal: this.windowWidth * 0.05 }}>
          <View
            style={{
              height: 10,
              backgroundColor: "#bbb",
              borderRadius: 5,
              overflow: "hidden",
              marginTop: this.windowWidth * 0.075,
            }}
          >
            <View
              style={{
                height: "100%",
                backgroundColor: "#fff",
                width: `${progressPercentage}%`,
              }}
            />
          </View>

          <FlatList
            data={questions}
            keyExtractor={(_, index) => index.toString()}
            style={{
              flex: 1,
              backgroundColor: COLORS.MAROON,
              marginTop: this.windowWidth * 0.1,
            }}
            renderItem={({ item, index }) => {
              const currentOptions = options[index];
              return (
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 8,
                    padding: 15,
                    marginBottom: 20,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#333",
                      fontWeight: "600",
                      marginBottom: 10,
                    }}
                  >
                    {item}
                  </Text>
                  {currentOptions.map((option, optIndex) => {
                    let buttonStyle = {
                      padding: this.windowWidth * 0.03,
                      marginBottom: this.windowWidth * 0.02,
                      borderWidth: this.windowWidth * 0.005,
                      borderColor: "#ccc",
                      borderRadius: this.windowWidth * 0.02,
                      backgroundColor: "#f9f9f9",
                    };
                    if (this.state.answers[index] === option) {
                      buttonStyle = {
                        ...buttonStyle,
                        borderColor: COLORS.MAROON,
                        backgroundColor: COLORS.MAROON + "33",
                      };
                    }
                    return (
                      <TouchableOpacity
                        key={optIndex}
                        onPress={() => this.handleSelect(index, option)}
                        style={buttonStyle}
                      >
                        <Text style={{ fontSize: 14, color: "#333" }}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            }}
            ListFooterComponent={() => (
              <TouchableOpacity
                onPress={this.handleNext}
                style={{
                  backgroundColor: "#fff",
                  padding: 15,
                  borderRadius: 8,
                  alignItems: "center",
                  marginTop: 10,
                  marginBottom: 30,
                }}
              >
                <Text
                  style={{
                    color: COLORS.MAROON,
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  Next
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </SafeAreaView>
    );
  }
}