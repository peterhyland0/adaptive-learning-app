import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
} from "react-native";
import BackArrow from "../../../../util/BackArrow";
import LinearGradient from "react-native-linear-gradient";
import { updateUserProgress } from "../../../../api/updateUserProgress";
import { SessionContext } from "../../../../util/SessionContext";
import Colors from "../../../../constants/COLORS"; // adjust path if necessary

const windowWidth = Dimensions.get("window").width;

class QuizSubmoduleScreen extends Component {
  static contextType = SessionContext;

  constructor(props) {
    super(props);
    const { submodule } = this.props.route.params;

    // Parse lessonData (using eval should only be done with trusted sources)
    let parsedLessonData = {};
    if (submodule.lessonData) {
      try {
        parsedLessonData = eval("(" + submodule.lessonData + ")");
      } catch (error) {
        console.error("Error parsing lessonData:", error);
      }
    }
    // Store questions as an instance property
    this.questions = parsedLessonData.questions || [];

    this.state = {
      currentQuestionIndex: 0,
      selectedChoice: null,
      showExplanation: false,
      score: 0,
      quizFinished: false,
    };
  }

  handleSelectChoice = (index) => {
    this.setState({ selectedChoice: index });
  };

  handleSubmitAnswer = () => {
    const { currentQuestionIndex, selectedChoice } = this.state;
    const currentQuestion = this.questions[currentQuestionIndex];
    if (selectedChoice === currentQuestion.Answer) {
      this.setState((prevState) => ({ score: prevState.score + 1 }));
    }
    this.setState({ showExplanation: true });
  };

  updateQuizProgress = async () => {
    const { score } = this.state;
    const { submodule } = this.props.route.params;
    const { session, setSession } = this.context;
    const completionPercentage = Math.round((score / this.questions.length) * 100);
    console.log(
      "completion percentage",
      completionPercentage,
      score,
      this.questions.length
    );
    const progressStatus = completionPercentage === 100 ? "Completed" : "In Progress";
    const now = new Date().toISOString();
    const completionDate = completionPercentage === 100 ? now : null;

    // Update the session by modifying the appropriate submodule progress
    const updatedModules = session.modules.map((mod) =>
      mod.id === submodule.moduleId
        ? {
          ...mod,
          submodules: mod.submodules.map((sub) =>
            sub.id === submodule.id
              ? {
                ...sub,
                progress: {
                  ...sub.progress,
                  lastUpdated: now,
                  completionDate: completionDate,
                  completionPercentage: completionPercentage,
                  progressStatus: progressStatus,
                },
              }
              : sub
          ),
        }
        : mod
    );
    this.context.setSession({ ...session, modules: updatedModules });

    try {
      await updateUserProgress(
        [
          {
            id: submodule.id,
            completionPercentage: completionPercentage,
            lastUpdated: now,
            completionDate: completionDate,
            lastTime: 0,
            progressStatus: progressStatus,
          },
        ],
        submodule.moduleId,
        session.userUid
      );
      console.log("Firestore update success");
    } catch (err) {
      console.error("Firestore update failed:", err);
    }
  };

  handleNextQuestion = async () => {
    if (this.state.currentQuestionIndex < this.questions.length - 1) {
      this.setState((prevState) => ({
        currentQuestionIndex: prevState.currentQuestionIndex + 1,
        selectedChoice: null,
        showExplanation: false,
      }));
    } else {
      await this.updateQuizProgress();
      this.setState({ quizFinished: true });
    }
  };

  resetQuiz = () => {
    this.setState({
      currentQuestionIndex: 0,
      selectedChoice: null,
      showExplanation: false,
      score: 0,
      quizFinished: false,
    });
  };

  render() {
    const { submodule, module } = this.props.route.params;
    const {
      currentQuestionIndex,
      selectedChoice,
      showExplanation,
      score,
      quizFinished,
    } = this.state;

    // If no questions are available, show an error screen.
    if (this.questions.length === 0) {
      return (
        <View style={{ flex: 1, backgroundColor: Colors.SPACE_GREY }}>
          <StatusBar
            translucent
            backgroundColor="transparent"
            barStyle="light-content"
          />
          <Text
            style={{
              color: Colors.SPACE_GREY_LIGHT,
              fontSize: windowWidth * (18 / 375),
            }}
          >
            No questions available.
          </Text>
        </View>
      );
    }

    // Final screen after quiz completion
    if (quizFinished) {
      return (
        <View style={{ flex: 1, backgroundColor: Colors.SPACE_GREY }}>
          <StatusBar
            translucent
            backgroundColor="transparent"
            barStyle="light-content"
          />
          <ScrollView
            contentContainerStyle={{
              paddingVertical: windowWidth * (20 / 375),
              alignItems: "center",
            }}
          >
            <BackArrow
              title={submodule.name}
              color={Colors.BLACK}
              isModal
              module={module}
            />
            <Text
              style={{
                fontSize: windowWidth * (24 / 375),
                color: Colors.RED,
                fontWeight: "bold",
                marginBottom: windowWidth * (20 / 375),
              }}
            >
              Quiz Finished!
            </Text>
            <Text
              style={{
                fontSize: windowWidth * (20 / 375),
                color: Colors.MAROON,
                marginVertical: windowWidth * (20 / 375),
              }}
            >
              Your score is: {score} / {this.questions.length}
            </Text>
            <TouchableOpacity
              onPress={this.resetQuiz}
              style={{
                backgroundColor: Colors.RED,
                padding: windowWidth * (12 / 375),
                borderRadius: windowWidth * (4 / 375),
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#FFF",
                  fontSize: windowWidth * (16 / 375),
                  fontWeight: "bold",
                }}
              >
                Restart Quiz
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }

    const currentQuestion = this.questions[currentQuestionIndex];
    const isAnswerCorrect = selectedChoice === currentQuestion.Answer;
    const explanationContainerStyle = {
      marginTop: windowWidth * (16 / 375),
      padding: windowWidth * (12 / 375),
      borderRadius: windowWidth * (4 / 375),
      borderWidth: windowWidth * (1 / 375),
      borderColor: isAnswerCorrect ? "#28a745" : Colors.RED,
      alignItems: "center",
      backgroundColor: isAnswerCorrect
        ? "rgba(40, 167, 69, 0.2)" // Green background with opacity if correct
        : "rgba(255, 0, 0, 0.2)", // Red background with opacity if incorrect
    };

    return (
      <View style={{ flex: 1, backgroundColor: Colors.BLACK_LIGHT }}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
        <BackArrow title={submodule.name} color={"#fff"} />
        <ScrollView
          contentContainerStyle={{
            paddingVertical: windowWidth * (20 / 375),
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: Colors.SPACE_GREY_LIGHT,
              padding: windowWidth * (16 / 375),
              borderRadius: windowWidth * (8 / 375),
              borderWidth: windowWidth * (1 / 375),
              borderColor: Colors.MAROON,
              marginBottom: windowWidth * (16 / 375),
              width: windowWidth * 0.95,
              shadowColor: Colors.BLACK,
              shadowOffset: {
                width: 0,
                height: windowWidth * (2 / 375),
              },
              shadowOpacity: 0.2,
              shadowRadius: windowWidth * (2 / 375),
              elevation: Math.ceil(windowWidth * (3 / 375)),
            }}
          >
            <Text
              style={{
                fontSize: windowWidth * (18 / 375),
                color: Colors.MAROON,
                marginBottom: windowWidth * (12 / 375),
                fontWeight: "bold",
              }}
            >
              Q{currentQuestionIndex + 1}: {currentQuestion.Question}
            </Text>
            {currentQuestion.Choices.map((choice, index) => {
              let buttonStyles = {
                padding: windowWidth * (12 / 375),
                marginBottom: windowWidth * (8 / 375),
                borderWidth: windowWidth * (2 / 375),
                borderColor: Colors.SPACE_GREY,
                borderRadius: windowWidth * (4 / 375),
                backgroundColor: Colors.SPACE_GREY_LIGHT,
              };

              if (showExplanation) {
                if (index === selectedChoice) {
                  // Style for the selected answer
                  buttonStyles = {
                    ...buttonStyles,
                    borderColor: Colors.MAROON,
                    backgroundColor: Colors.MAROON_LIGHT,
                  };
                } else if (index === currentQuestion.Answer) {
                  // Correct answer style if not selected
                  buttonStyles = {
                    ...buttonStyles,
                    borderColor: "#28a745",
                    backgroundColor: "#d4edda",
                  };
                } else {
                  // Incorrect answer style
                  buttonStyles = {
                    ...buttonStyles,
                    borderColor: Colors.RED,
                    backgroundColor: Colors.RED_LIGHT,
                  };
                }
              } else if (selectedChoice === index) {
                buttonStyles = {
                  ...buttonStyles,
                  borderColor: Colors.MAROON,
                  backgroundColor: Colors.MAROON_LIGHT,
                };
              }

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => this.handleSelectChoice(index)}
                  style={buttonStyles}
                >
                  <Text
                    style={{
                      fontSize: windowWidth * (16 / 375),
                      color: Colors.BLACK_LIGHT,
                    }}
                  >
                    {choice}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {selectedChoice !== null && !showExplanation && (
              <TouchableOpacity
                onPress={this.handleSubmitAnswer}
                style={{
                  backgroundColor: Colors.RED,
                  padding: windowWidth * (12 / 375),
                  borderRadius: windowWidth * (4 / 375),
                  alignItems: "center",
                  marginTop: windowWidth * (12 / 375),
                }}
              >
                <Text
                  style={{
                    color: "#FFF",
                    fontSize: windowWidth * (16 / 375),
                    fontWeight: "bold",
                  }}
                >
                  Submit Answer
                </Text>
              </TouchableOpacity>
            )}
            {showExplanation && (
              <View>
                <View style={explanationContainerStyle}>
                  {isAnswerCorrect ? (
                    <Text
                      style={{
                        fontSize: windowWidth * (16 / 375),
                        color: Colors.BLACK_LIGHT,
                        marginBottom: windowWidth * (12 / 375),
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      Correct!
                    </Text>
                  ) : (
                    <View>
                      <Text
                        style={{
                          fontSize: windowWidth * (16 / 375),
                          color: Colors.BLACK_LIGHT,
                          marginBottom: windowWidth * (12 / 375),
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        Incorrect!
                      </Text>
                      <Text
                        style={{
                          fontSize: windowWidth * (16 / 375),
                          color: Colors.BLACK_LIGHT,
                          marginBottom: windowWidth * (12 / 375),
                          textAlign: "center",
                        }}
                      >
                        <Text style={{ fontWeight: "bold" }}>
                          Correct Answer:{" "}
                        </Text>
                        {currentQuestion.Choices[currentQuestion.Answer]}
                      </Text>
                    </View>
                  )}
                  <Text
                    style={{
                      fontSize: windowWidth * (16 / 375),
                      color: Colors.BLACK_LIGHT,
                      marginBottom: windowWidth * (12 / 375),
                      textAlign: "center",
                    }}
                  >
                    <Text style={{ fontWeight: "bold" }}>Explanation:{" "}</Text>
                    {currentQuestion.Explanation}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={this.handleNextQuestion}
                  style={{
                    backgroundColor: Colors.RED,
                    padding: windowWidth * (12 / 375),
                    borderRadius: windowWidth * (4 / 375),
                    alignItems: "center",
                    marginTop: windowWidth * 0.1,
                  }}
                >
                  <Text
                    style={{
                      color: "#FFF",
                      fontSize: windowWidth * (16 / 375),
                      fontWeight: "bold",
                    }}
                  >
                    {currentQuestionIndex === this.questions.length - 1
                      ? "Finish Quiz"
                      : "Next Question"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }
}

export default QuizSubmoduleScreen;
