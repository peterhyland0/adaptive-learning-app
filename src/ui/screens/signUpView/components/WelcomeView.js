import React, { Component } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import COLORS from "../../../../constants/COLORS";
import LearningStyleForm from "../../learningStyleView/LearningStyleForm";

export default class WelcomeView extends Component {
  constructor(props) {
    super(props);
    const windowDimensions = Dimensions.get("window");
    this.windowWidth = windowDimensions.width;
    this.windowHeight = windowDimensions.height;
  }
  render() {
    const { handleLogOut, openLearningStyleForm, navigation } = this.props;
    const { width } = Dimensions.get("window");

    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.SPACE_GREY,
        }}
      >
        <Text
          style={{
            fontSize: 30,
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          Welcome
        </Text>
        <View
          style={{
            width: width * 0.75,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              textAlign: "center",
            }}
          >
            Before we begin, please take this short survey to determine what learning styles are best suited to you.
          </Text>
        </View>

        <TouchableOpacity
          onPress={openLearningStyleForm}
          style={{
            alignItems: "center",
            backgroundColor: COLORS.MAROON,
            padding: 10,
            borderRadius: 25,
            marginTop: 20,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Take Survey</Text>
        </TouchableOpacity>

        {/* Log Out Button */}
        <TouchableOpacity
          onPress={handleLogOut}
          style={{
            alignItems: "center",
            backgroundColor: COLORS.DARK_GREY,
            padding: 10,
            borderRadius: 25,
            marginTop: 20,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: "bold",
            }}
          >
            Log Out
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}
