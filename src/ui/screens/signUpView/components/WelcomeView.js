import React, { Component } from "react";
import { View, Text, TouchableOpacity, Dimensions, StatusBar } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import COLORS from "../../../../constants/COLORS";
import LottieView from "lottie-react-native";
import {SessionContext} from "../../../../util/SessionContext";

export default class WelcomeView extends Component {
  static contextType = SessionContext; // <-- Add this line

  constructor(props) {
    super(props);
    const windowDimensions = Dimensions.get("window");
    this.windowWidth = windowDimensions.width;
    this.windowHeight = windowDimensions.height;
  }

  render() {
    const { handleLogOut, openLearningStyleForm, navigation } = this.props;
    const { width } = Dimensions.get("window");
    // if (this.context.session && this.context.session.token) {
    //   return null;
    // }
    return (
        <SafeAreaView
          style={{
            flex: 1,
            alignItems: "center",
            backgroundColor: COLORS.MAROON,
            justifyContent: "space-around",
        }}>
          <StatusBar
            backgroundColor={COLORS.MAROON}
            barStyle="light-content"
          />
          <View
            style={{
              alignItems: "center",
              marginBottom: this.windowWidth * -0.5
            }}
          >
            <Text
              style={{
                fontSize: 30,
                marginBottom: 20,
                textAlign: "center",
                width: this.windowWidth * 0.5,
                fontWeight: 'bold',
                color: '#fff',
              }}
            >
              Obtain Your Learning Style
            </Text>
            <View style={{ width: width * 0.9 }}>
              <Text style={{ fontSize: 15, textAlign: "center", color: '#fff' }}>
                Before we begin, please take this short survey to determine what learning styles are best suited to you.
              </Text>
            </View>
          </View>
          <LottieView
            source={require("../../../../assets/animations/survey.json")}
            autoPlay={true}
            style={{
              width: this.windowWidth * 0.9,
              height: this.windowWidth * 0.9,
              elevation: 4
            }}
            speed={0.5}
          />
          <TouchableOpacity
            onPress={openLearningStyleForm}
            style={{
              alignItems: "center",
              backgroundColor: "#fff",
              padding: 10,
              borderRadius: 50,
              width: this.windowWidth * 0.9,
              height: this.windowHeight * 0.075,
              justifyContent: "center",
              marginTop: this.windowWidth * -0.3,
            }}
          >
            <Text style={{ color: COLORS.MAROON, fontWeight: "bold", fontSize: 18 }}>
              Take Survey
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
    );
  }
}
