import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  FlatList,
} from "react-native";
import { RadioButton } from "react-native-paper";
import COLORS from "../../../constants/COLORS";
import BackArrow from "../../../util/BackArrow";

export default class LearningStyleForm extends Component {
  constructor(props) {
    super(props);
    const windowDimensions = Dimensions.get("window");
    this.windowWidth = windowDimensions.width;
    this.windowHeight = windowDimensions.height;
  }

  state = {
    answers: Array(16).fill(null),
  };

  handleSelect = (questionIndex, value) => {
    this.setState((prevState) => {
      const newAnswers = [...prevState.answers];
      newAnswers[questionIndex] = value;
      return { answers: newAnswers };
    });
  };

  handleNext = async () => {
    const { answers } = this.state;

    // Make sure your questions array is the same length as answers
    const questions = [
      "I want to find out more about a tour that I am going on. I would ",
      "When I am learning I ",
      "I have finished a competition or test and I would like some feedback ",
      "I want to learn how to play a new board game or card game. I would ",
      "When learning from the Internet I like ",
      "When choosing a career or area of study, these are important for me ",
      // "I want to find out about a house or an apartment. Before visiting it I would want ",
      // "When finding my way, I ",
      // "I prefer a presenter or a teacher who uses ",
      // "I want to learn about a new project. I would ask for ",
      // "I have been advised by the doctor that I have a medical problem and I have some questions about it. I would ",
      // "I am having trouble assembling a wooden table that came in parts (kitset). I would ",
      // "I want to learn to do something new on a computer. I would ",
      // "I want to learn how to take better photos. I would ",
      // "I want to save more money and to decide between a range of options. I would ",
      // "A website has a video showing how to make a special graph or chart. There is a person speaking, some lists and words describing what to do and some diagrams. I would learn most from ",
    ];

    const mappedAnswers = questions.map((question, index) => {
      return {
        answer: question + answers[index],
      };
    });

    const raw = JSON.stringify({ answers: mappedAnswers });

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    try {
      // const requestOptions = {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ answers: mappedAnswers }), // mappedAnswers must have 16 items
      // };
      //
      // const response = await fetch(
      //   "http://0.0.0.0:8000/api/predict-learning-style",
      //   requestOptions
      // );
      //
      // console.log("Response status:", response.status);
      // if (!response.ok) {
      //   throw new Error("HTTP error! status: " + response.status);
      // }
      //
      // const result = await response.text();
      this.props.navigation.navigate("Upload")
      // console.log("Prediction result:", result);

    } catch (error) {
      console.error("Error submitting answers:", error);
    }
}

  render() {
    const questions = [
      "I want to find out more about a tour that I am going on. I would:",
      "When I am learning I:",
      "I have finished a competition or test and I would like some feedback:",
      "I want to learn how to play a new board game or card game. I would:",
      "When learning from the Internet I like:",
      "When choosing a career or area of study, these are important for me:",
      // "I want to find out about a house or an apartment. Before visiting it I would want:",
      // "When finding my way, I:",
      // "I prefer a presenter or a teacher who uses:",
      // "I want to learn about a new project. I would ask for:",
      // "I have been advised by the doctor that I have a medical problem and I have some questions about it. I would:",
      // "I am having trouble assembling a wooden table that came in parts (kitset). I would:",
      // "I want to learn to do something new on a computer. I would:",
      // "I want to learn how to take better photos. I would:",
      // "I want to save more money and to decide between a range of options. I would:",
      // "A website has a video showing how to make a special graph or chart. There is a person speaking, some lists and words describing what to do and some diagrams. I would learn most from:",
    ];

    const options = [
      [
        "Use a map and see where the places are.",
        "Read about the tour on the itinerary.",
        "Look at details about the highlights and activities on the tour.",
        "Talk with the person who planned the tour or others who are going on the tour.",
      ],
      [
        "Use examples and applications.",
        "Like to talk things through.",
        "Read books, articles and handouts.",
        "See patterns in things.",
      ],
      [
        "Using graphs showing how my performance has improved.",
        "Using a written description of my results.",
        "From somebody who talks it through with me.",
        "Using examples from what I have done.",
      ],
      [
        "Listen to somebody explaining it and ask questions.",
        "Use the diagrams that explain the various stages, moves and strategies in the game.",
        "Watch others play the game before joining in.",
        "Read the instructions.",
      ],
      [
        "Interesting design and visual features.",
        "Videos showing how to do things.",
        "Detailed articles.",
        "Podcasts and videos where I can listen to experts.",
      ],
      [
        "Communicating with others through discussion.",
        "Using words well in written communications.",
        "Working with designs, maps or charts.",
        "Applying my knowledge in real situations.",
      ],
      // [
      //   "A printed description of the rooms and features.",
      //   "To view a video of the property.",
      //   "A plan showing the rooms and a map of the area.",
      //   "A discussion with the owner.",
      // ],
      // [
      //   "Rely on verbal instructions from GPS or from someone traveling with me.",
      //   "Rely on paper maps or GPS maps.",
      //   "Head in the general direction to see if I can find my destination without instructions.",
      //   "Like to read instructions from GPS or instructions that have been written.",
      // ],
      // [
      //   "Handouts, books, or readings.",
      //   "Question and answer, talk, group discussion, or guest speakers.",
      //   "Demonstrations, models or practical sessions.",
      //   "Diagrams, charts, maps or graphs.",
      // ],
      // [
      //   "A written report describing the main features of the project.",
      //   "An opportunity to discuss the project.",
      //   "Diagrams to show the project stages with charts of benefits and costs.",
      //   "Examples where the project has been used successfully.",
      // ],
      // [
      //   "Have a detailed discussion with my doctor.",
      //   "Read an article that explains the problem.",
      //   "Use a 3D model to see what is wrong.",
      //   "Look at a diagram showing what was wrong.",
      // ],
      // [
      //   "Read the instructions that came with the table.",
      //   "Ask for advice from someone who assembles furniture.",
      //   "Watch a video of a person assembling a similar table.",
      //   "Study diagrams showing each stage of the assembly.",
      // ],
      // [
      //   "Talk with people who know about the program.",
      //   "Read the written instructions that came with the program.",
      //   "Follow the diagrams in a book.",
      //   "Start using it and learn by trial and error.",
      // ],
      // [
      //   "Use the written instructions about what to do.",
      //   "Use diagrams showing the camera and what each part does.",
      //   "Ask questions and talk about the camera and its features.",
      //   "Use examples of good and poor photos showing how to improve them.",
      // ],
      // [
      //   "Consider examples of each option using my financial information.",
      //   "Read a print brochure that describes the options in detail.",
      //   "Talk with an expert about the options.",
      //   "Use graphs showing different options for different time periods.",
      // ],
      // [
      //   "Reading the words.",
      //   "Listening.",
      //   "Watching the actions.",
      //   "Seeing the diagrams.",
      // ],
    ];

    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: COLORS.SPACE_GREY,
          // paddingTop: 30,
          paddingHorizontal: this.windowWidth * 0.05,
        }}
      >
        <BackArrow
          title="Obtain Your Learning Style"
          color={"#000"}

        />

        <FlatList
          data={questions}
          keyExtractor={(_, index) => index.toString()}
          style={{ flex: 1, backgroundColor: COLORS.SPACE_GREY }}
          // ListHeaderComponent={() => (
          //   <Text
          //     style={{
          //       fontSize: 22,
          //       fontWeight: "bold",
          //       color: "black",
          //       textAlign: "center",
          //       marginBottom: 30,
          //     }}
          //   >
          //     Obtain Your Learning Style
          //   </Text>
          // )}
          renderItem={({ item, index }) => {
            const question = item;
            const currentOptions = options[index];

            return (
              <View
                style={{
                  marginBottom: 20,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 8,
                  padding: 15,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: COLORS.MAROON,
                    fontWeight: "600",
                    marginBottom: 10,
                  }}
                >
                  {question}
                </Text>

                {/* Render each option for this question */}
                {currentOptions.map((option, optIndex) => (
                  <RadioButton.Item
                    key={optIndex}
                    label={option}
                    value={option}
                    status={
                      this.state.answers[index] === option
                        ? "checked"
                        : "unchecked"
                    }
                    onPress={() => this.handleSelect(index, option)}
                    style={{ marginVertical: 4 }}
                    labelStyle={{ fontSize: 14, color: "#333" }}
                    color={COLORS.MAROON}
                    uncheckedColor={"#777"}
                  />
                ))}
              </View>
            );
          }}
          ListFooterComponent={() => (
            <TouchableOpacity
              onPress={this.handleNext}
              style={{
                backgroundColor: COLORS.MAROON,
                padding: 15,
                borderRadius: 8,
                alignItems: "center",
                marginTop: 10,
                marginBottom: 30,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              >
                Next
              </Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  }
}
