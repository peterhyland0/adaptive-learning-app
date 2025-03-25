import React, { Component } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Dimensions,
  StatusBar,
  TouchableOpacity, Alert
} from "react-native";
import PieChart from "react-native-pie-chart";
import BackArrow from "../../../util/BackArrow";
import { SessionContext } from "../../../util/SessionContext";
import COLORS from "../../../constants/COLORS";
import Ionicons from "react-native-vector-icons/Ionicons";
import {updateSubmodulePreferences} from "../../../api/updateSubmodulePreferences";

export default class LearningStyleResultsScreen extends Component {
  static contextType = SessionContext;

  constructor(props) {
    super(props);
    const { width } = Dimensions.get("window");
    this.chartSize = width * 0.8;

    const windowDimensions = Dimensions.get("window");
    this.windowWidth = windowDimensions.width;
    this.windowHeight = windowDimensions.height;

    this.state = {
      selectedModules: []
    };
  }

  toggleModuleSelection = (moduleName) => {
    this.setState((prevState) => {
      const { selectedModules } = prevState;
      if (selectedModules.includes(moduleName)) {
        return { selectedModules: selectedModules.filter((name) => name !== moduleName) };
      } else {
        return { selectedModules: [...selectedModules, moduleName] };
      }
    });
  };

  handleSubmodulePreference = async (userUid) => {
    const { selectedModules } = this.state;
    if (selectedModules.length === 0) {
      Alert.alert(
        "Selection Required",
        "Please select at least one type of submodule preference.",
        [{ text: "OK" }]
      );
      return;
    }
    // Update session with selected preferences
    this.context.setSession((prevSession) => ({
      ...prevSession,
      user: {
        ...prevSession.user,
        submodulePreference: selectedModules,
      },
    }));
    // Update preferences in the backend then navigate
    updateSubmodulePreferences(userUid, selectedModules)
    .then(() => this.props.navigation.navigate("Upload"))
    .catch((error) => console.error("Error updating submodule preferences:", error));
  };

  render() {
    const { myLearningStyle } = this.context.session.user;
    console.log(myLearningStyle);
    const { userUid } = this.context.session;
    let resultObj = {};
    try {
      resultObj = JSON.parse(myLearningStyle);
    } catch (error) {
      console.error("Error parsing myLearningStyle:", error);
    }

    const series = [];
    const results = [];
    if (resultObj.Visual !== undefined) {
      const visualPercent = Number(resultObj.Visual.toFixed(0));
      series.push({
        value: visualPercent,
        color: COLORS.LIGHT_BLUE,
        label: { text: `${visualPercent}%`, fontWeight: "bold" }
      });
      results.push({ name: "Visual", percentage: visualPercent, color: COLORS.LIGHT_BLUE });
    }
    if (resultObj.Auditory !== undefined) {
      const auditoryPercent = Number(resultObj.Auditory.toFixed(0));
      series.push({
        value: auditoryPercent,
        color: COLORS.DARK_ORANGE,
        label: { text: `${auditoryPercent}%`, fontWeight: "bold" }
      });
      results.push({ name: "Auditory", percentage: auditoryPercent, color: COLORS.DARK_ORANGE });
    }
    if (resultObj.Kinesthetic !== undefined) {
      const kinestheticPercent = Number(resultObj.Kinesthetic.toFixed(0));
      series.push({
        value: kinestheticPercent,
        color: COLORS.YELLOW,
        label: { text: `${kinestheticPercent}%`, fontWeight: "bold" }
      });
      results.push({ name: "Kinesthetic", percentage: kinestheticPercent, color: COLORS.YELLOW });
    }

    // Helper function to determine the icon based on learning style.
    const getIconName = (styleName) => {
      switch (styleName.toLowerCase()) {
        case "visual":
          return "eye-outline";
        case "auditory":
          return "musical-notes-outline";
        case "kinesthetic":
          return "walk-outline";
        default:
          return "help-circle-outline";
      }
    };

    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: COLORS.MAROON,
          alignItems: "center"
        }}
      >
        <StatusBar backgroundColor={COLORS.MAROON} barStyle="light-content" />
        <BackArrow title="Your Learning Style" color="#fff" />
        <View
          style={{
            justifyContent: "space-between",
            padding: 20,
            alignItems: "center",
            backgroundColor: "#fff",
            borderRadius: 10,
            width: this.windowWidth * 0.9,
            marginTop: this.windowWidth * 0.1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 8
          }}
        >
          <PieChart
            widthAndHeight={this.windowWidth * 0.6}
            series={series}
            cover={0.45}
            style={{ marginBottom: 20 }}
          />
          <Text
            style={{
              fontSize: 16,
              color: "#333",
              marginBottom: 10,
              textAlign: "center"
            }}
          >
            Select the types of submodules you would like to create based on your learning style results:
          </Text>
          <View style={{ marginTop: 10, alignItems: "flex-start", width: "100%" }}>
            {results.map((slice, index) => {
              const isSelected = this.state.selectedModules.includes(slice.name);
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => this.toggleModuleSelection(slice.name)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginVertical: 4,
                    width: this.windowWidth * 0.8,
                    padding: 8,
                    borderRadius: 5,
                    backgroundColor: isSelected ? "rgba(0, 0, 0, 0.1)" : "transparent"
                  }}
                >
                  <Ionicons name={getIconName(slice.name)} size={50} color={slice.color} />
                  <Text style={{ fontSize: 16, color: "#333", marginLeft: 10 }}>
                    {slice.name}: {slice.percentage}%
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => this.handleSubmodulePreference(userUid)}
          style={{
            backgroundColor: "#fff",
            padding: 15,
            borderRadius: 8,
            alignItems: "center",
            marginTop: 20,
            width: this.windowWidth * 0.9,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4
          }}
        >
          <Text
            style={{
              color: COLORS.MAROON,
              fontWeight: "bold",
              fontSize: 16
            }}
          >
            Continue To Upload
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
}
