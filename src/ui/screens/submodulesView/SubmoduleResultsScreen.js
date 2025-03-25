import React, { Component } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Alert
} from "react-native";
import BackArrow from "../../../util/BackArrow";
import { SessionContext } from "../../../util/SessionContext";
import COLORS from "../../../constants/COLORS";
import Ionicons from "react-native-vector-icons/Ionicons";
import CircularProgress from "react-native-circular-progress-indicator";
import FontAwesome from "react-native-vector-icons/FontAwesome";

export default class SubmoduleResultsScreen extends Component {
  static contextType = SessionContext;

  constructor(props) {
    super(props);
    const windowDimensions = Dimensions.get("window");
    this.windowWidth = windowDimensions.width;
    this.windowHeight = windowDimensions.height;
  }

  render() {
    const {correctPercentage, learningStyle} = this.props.route.params;
    console.log(this.props.route.params);

    const getLearningStyleInfo = (styleName) => {
      switch (styleName.toLowerCase()) {
        case "visual":
          return { iconName: "eye-outline", textColor: COLORS.LIGHT_BLUE, title: "Visual" };
        case "auditory":
          return { iconName: "musical-notes-outline", textColor: COLORS.ORANGE, title: "Auditory" };
        case "kinesthetic":
          return { iconName: "walk-outline", textColor: COLORS.YELLOW, title: "Kinaesthetic" };
        case "quiz":
          return { iconName: "pencil-square-o", textColor: COLORS.MAROON, title: "Multiple Choice Quiz" };
        default:
          return { iconName: "help-circle-outline", textColor: COLORS.ORANGE, title: "" };
      }
    };

    const learningStyleInfo = getLearningStyleInfo(learningStyle);

    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: learningStyleInfo.textColor,
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <StatusBar backgroundColor={learningStyleInfo.textColor} barStyle="light-content" />
        {/* <BackArrow title="Your Learning Style" color="#fff" /> */}

        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 10,
            width: this.windowWidth * 0.9,
            padding: 30,

            marginVertical: 20,
            alignItems: "center",
            justifyContent: "space-evenly",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                textAlign: "center",
                color: learningStyleInfo.textColor,
                marginRight: 10,
                fontWeight: "bold",
                width: this.windowWidth * 0.6
              }}
            >
              {learningStyleInfo.title} Learning Complete
            </Text>
            {learningStyle.toLowerCase() === "quiz" ? (
              <FontAwesome name={learningStyleInfo.iconName} color={learningStyleInfo.textColor} size={50} />
            ) : (
              <Ionicons name={learningStyleInfo.iconName} color={learningStyleInfo.textColor} size={50} />
            )}
          </View>
          {learningStyle.toLowerCase() === "quiz" ? (
            <View style={{ marginBottom: 20 }}>
              <CircularProgress
                value={correctPercentage}
                progressValueColor={"#4be057"}
                radius={100}
                inActiveStrokeOpacity={0.7}
                inActiveStrokeColor={COLORS.MAROON}
                activeStrokeColor={"#4be057"}
                activeStrokeWidth={40}
                inActiveStrokeWidth={40}
                progressValueStyle={{
                  fontWeight: "bold",
                  color: "#ccc",
                }}
              />
            </View>
          ) : (
            <View style={{ marginBottom: 20 }}>
              <CircularProgress
                value={correctPercentage}
                progressValueColor={learningStyleInfo.textColor}
                radius={100}
                inActiveStrokeOpacity={0.7}
                inActiveStrokeColor={COLORS.MAROON}
                activeStrokeColor={learningStyleInfo.textColor}
                activeStrokeWidth={40}
                inActiveStrokeWidth={40}
                progressValueStyle={{
                  fontWeight: "bold",
                  color: "#ccc",
                }}
              />
            </View>
          )}


          <Text
            style={{
              fontSize: 18,
              color: COLORS.MAROON,
              textAlign: "center",
              marginBottom: 20,
              paddingHorizontal: 10,
            }}
          >
            Congratulations! You have completed the {learningStyleInfo.title} submodule.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => this.props.navigation.pop(2)}
          style={{
            backgroundColor: "#fff",
            marginTop: 30,
            paddingVertical: 15,
            borderRadius: 8,
            alignItems: "center",
            width: this.windowWidth * 0.9,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Text
            style={{
              color: COLORS.MAROON,
              fontWeight: "bold",
              fontSize: 18,
            }}
          >
            Finish
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
}
