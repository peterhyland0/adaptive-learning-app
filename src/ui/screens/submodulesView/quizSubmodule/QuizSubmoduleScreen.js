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
import { updateUserProgress } from "../../../../api/updateUserProgress";
import { SessionContext } from "../../../../util/SessionContext";
import Colors from "../../../../constants/COLORS";
import CircularProgress from "react-native-circular-progress-indicator";
import LinearGradient from "react-native-linear-gradient";

const windowWidth = Dimensions.get("window").width;

const PROGRESS_BAR_CONSTANTS = {
  HEIGHT: 10,
  BACKGROUND_COLOR: "#808080",
  FILL_COLOR: "#FFFFFF",
  BORDER_RADIUS: 5,
  WIDTH_PERCENTAGE: 0.8,
};

class QuizSubmoduleScreen extends Component {
  static contextType = SessionContext;

  constructor(props) {
    super(props);
    const { submodule } = this.props.route.params;

    let parsedLessonData = {};
    if (submodule.lessonData) {
      try {
        parsedLessonData = eval("(" + submodule.lessonData + ")");
      } catch (error) {
        console.error("Error parsing lessonData:", error);
      }
    }
    this.originalQuestions = parsedLessonData.questions || [];
    this.questions = [...this.originalQuestions];

    this.state = {
      currentQuestionIndex: 0,
      selectedChoice: null,
      showExplanation: false,
      score: 0, // Score for current attempt
      totalScore: 0, // Cumulative score across attempts
      quizFinished: false,
      wrongQuestions: [],
    };
  }

  componentDidUpdate(prevProps, prevState) {
    // Navigate to SubmoduleResultsScreen when quiz finishes with a perfect score
    if (
      !prevState.quizFinished &&
      this.state.quizFinished &&
      this.state.totalScore === this.originalQuestions.length
    ) {
      const learningStyle = "quiz";
      this.props.navigation.navigate("SubmoduleResultsScreen", {
        correctPercentage: 100,
        learningStyle,
      });
    }
  }

  handleSelectChoice = (index) => {
    this.setState({ selectedChoice: index });
  };

  handleSubmitAnswer = () => {
    const { currentQuestionIndex, selectedChoice } = this.state;
    const currentQuestion = this.questions[currentQuestionIndex];
    if (selectedChoice === currentQuestion.Answer) {
      this.setState((prevState) => ({
        score: prevState.score + 1,
        totalScore: prevState.totalScore + 1,
      }));
    } else {
      this.setState((prevState) => ({
        wrongQuestions: [...prevState.wrongQuestions, currentQuestion],
      }));
    }
    this.setState({ showExplanation: true });
  };

  updateQuizProgress = async () => {
    const { totalScore } = this.state;
    const { submodule } = this.props.route.params;
    const { session, setSession } = this.context;
    const completionPercentage = Math.round((totalScore / this.originalQuestions.length) * 100);
    const progressStatus = completionPercentage === 100 ? "Completed" : "In Progress";
    const now = new Date().toISOString();
    const completionDate = completionPercentage === 100 ? now : null;

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
    this.questions = [...this.originalQuestions];
    this.setState({
      currentQuestionIndex: 0,
      selectedChoice: null,
      showExplanation: false,
      score: 0,
      totalScore: 0,
      quizFinished: false,
      wrongQuestions: [],
    });
  };

  reviseUnknown = () => {
    this.questions = [...this.state.wrongQuestions];
    this.setState((prevState) => ({
      currentQuestionIndex: 0,
      selectedChoice: null,
      showExplanation: false,
      score: 0, // Reset current attempt score
      // totalScore remains unchanged to keep cumulative score
      quizFinished: false,
      wrongQuestions: [],
    }));
  };

  renderResultsScreen = () => {
    const { totalScore, wrongQuestions } = this.state;
    const completionPercentage = Math.round((totalScore / this.originalQuestions.length) * 100);

    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.MAROON,
        }}
      >
        <View
          style={{
            width: 300,
            height: 500,
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
              fontSize: 30,
              fontWeight: "600",
              marginBottom: 16,
              color: Colors.MAROON,
            }}
          >
            Quiz Results
          </Text>
          <View
            style={{
              marginBottom: 16,
              backgroundColor: "#fff",
              width: windowWidth * 0.55,
              height: windowWidth * 0.55,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress
              value={completionPercentage}
              radius={70}
              inActiveStrokeOpacity={0.7}
              inActiveStrokeColor={Colors.MAROON}
              activeStrokeWidth={40}
              inActiveStrokeWidth={40}
              progressValueStyle={{
                fontWeight: "bold",
                color: "#ccc",
              }}
            />
          </View>
          <Text
            style={{
              fontSize: 18,
              color: Colors.MAROON,
              marginBottom: 16,
            }}
          >
            Score: {totalScore} / {this.originalQuestions.length}
          </Text>
          {wrongQuestions.length > 0 && (
            <TouchableOpacity
              onPress={this.reviseUnknown}
              style={{
                width: windowWidth * 0.55,
                paddingVertical: 12,
                borderRadius: 12,
                marginBottom: 16,
                alignItems: "center",
                backgroundColor: Colors.MAROON_LIGHT,
              }}
            >
              <Text
                style={{
                  color: Colors.MAROON,
                  fontSize: 18,
                }}
              >
                Revise Unknown
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={this.resetQuiz}
            style={{
              width: windowWidth * 0.55,
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: "center",
              backgroundColor: Colors.MAROON,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 18 }}>Restart Quiz</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  render() {
    const { submodule } = this.props.route.params;
    const {
      currentQuestionIndex,
      selectedChoice,
      showExplanation,
      quizFinished,
    } = this.state;

    const total = this.questions.length;
    const progressPercentage = ((currentQuestionIndex) / total) * 100;

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

    if (quizFinished && this.state.totalScore < this.originalQuestions.length) {
      return this.renderResultsScreen();
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
        ? "rgba(40, 167, 69, 0.2)"
        : "rgba(255, 0, 0, 0.2)",
    };

    return (
      <LinearGradient
        colors={['#A91D3A', '#C73659', '#D96078']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, backgroundColor: Colors.MAROON }}
      >
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
        <BackArrow
          title={submodule.name}
          color={"#fff"}
          AIModal={true}
        />
        <View
          style={{
            width: windowWidth,
            alignItems: "center",
            marginTop: 20,
            marginBottom: windowWidth * (10 / 375),
          }}
        >
          <View
            style={{
              height: PROGRESS_BAR_CONSTANTS.HEIGHT,
              backgroundColor: PROGRESS_BAR_CONSTANTS.BACKGROUND_COLOR,
              borderRadius: PROGRESS_BAR_CONSTANTS.BORDER_RADIUS,
              overflow: "hidden",
              width: windowWidth * PROGRESS_BAR_CONSTANTS.WIDTH_PERCENTAGE,
            }}
          >
            <View
              style={{
                height: "100%",
                backgroundColor: PROGRESS_BAR_CONSTANTS.FILL_COLOR,
                width: `${progressPercentage}%`,
                borderRadius: PROGRESS_BAR_CONSTANTS.BORDER_RADIUS,
              }}
            />
          </View>
        </View>
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
                  buttonStyles = {
                    ...buttonStyles,
                    borderColor: Colors.MAROON,
                    backgroundColor: Colors.MAROON_LIGHT,
                  };
                }
                if (index === currentQuestion.Answer) {
                  buttonStyles = {
                    ...buttonStyles,
                    borderColor: "#28a745",
                    backgroundColor: "#d4edda",
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
                  disabled={showExplanation}
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
                  backgroundColor: Colors.MAROON,
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
                    <Text style={{ fontWeight: "bold" }}>Explanation: </Text>
                    {currentQuestion.Explanation}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={this.handleNextQuestion}
                  style={{
                    backgroundColor: Colors.MAROON,
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
      </LinearGradient>
    );
  }
}

export default QuizSubmoduleScreen;