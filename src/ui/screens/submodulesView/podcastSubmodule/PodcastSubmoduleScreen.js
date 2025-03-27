import React, { Component } from "react";
import { View, Text, Dimensions, StatusBar, Modal, TouchableOpacity } from "react-native";
import BackArrow from "../../../../util/BackArrow";
import AudioPlayer from "../components/AudioPlayer";
import LinearGradient from "react-native-linear-gradient";
import { updateUserProgress } from "../../../../api/updateUserProgress";
import { SessionContext } from "../../../../util/SessionContext";

export default class PodcastSubmoduleScreen extends Component {
  static contextType = SessionContext;

  constructor(props) {
    super(props);
    const windowDimensions = Dimensions.get("window");
    this.windowWidth = windowDimensions.width;
    this.windowHeight = windowDimensions.height;
    this.state = {
      currentProgress: 0,
      hasNavigated: false, // flag to prevent repeated actions
      showModal: false,    // controls modal visibility when finished
    };
  }

  handleProgressUpdate = async (currentTime, duration) => {
    console.log("Updating progress:", currentTime, duration);
    this.setState({ currentProgress: currentTime }, () => {
      console.log("State updated:", this.state.currentProgress);
    });

    const { submodule } = this.props.route.params;
    const { session } = this.context;

    let completionPercentage = (currentTime / duration) * 100;
    let progressStatus = "Not Started";
    if (completionPercentage === 100) {
      completionPercentage = 100;
      progressStatus = "Completed";
    } else {
      completionPercentage = Math.round(completionPercentage);
      progressStatus = "In Progress";
    }
    console.log("progressStatus", progressStatus);

    const now = new Date().toISOString();
    const completionDate = completionPercentage === 100 ? now : null;
    console.log("completionPercentage", completionPercentage);

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
                  lastTime: currentTime,
                  lastUpdated: now,
                  completionDate:
                    (currentTime / submodule.duration) >= 0.99 ? now : null,
                  completionPercentage: completionPercentage,
                  progressStatus: progressStatus,
                },
              }
              : sub
          ),
        }
        : mod
    );
    console.log("Updated modules:", JSON.stringify(updatedModules, null, 2));

    this.context.setSession({ ...session, modules: updatedModules });

    try {
      await updateUserProgress(
        [
          {
            id: submodule.id,
            completionPercentage: completionPercentage,
            lastUpdated: now,
            completionDate: completionDate,
            lastTime: currentTime,
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

    if (completionPercentage === 100 && !this.state.hasNavigated) {
      this.setState({ hasNavigated: true, showModal: true });
    }
  };

  handleRestart = () => {
    this.setState({ currentProgress: 0, hasNavigated: false, showModal: false });
  };

  handleSeeResults = () => {
    this.setState({ showModal: false }, () => {
      this.props.navigation.navigate("SubmoduleResultsScreen", {
        correctPercentage: 100,
        learningStyle: "auditory",
      });
    });
  };

  render() {
    const { submodule, module } = this.props.route.params;
    const transcript =
      typeof submodule.transcript === "string"
        ? JSON.parse(submodule.transcript)
        : submodule.transcript;

    return (
      <LinearGradient
        colors={["#A91D3A", "#700E23", "#3D0511", "#000000"]}
        locations={[0, 0.3, 0.7, 1]}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <StatusBar
          backgroundColor="transparent"
          translucent
          barStyle="light-content"
        />

        <View
          style={{
            flex: 1,
            width: "100%",
            alignItems: "center",
            paddingTop: 20,
          }}
        >
          <BackArrow
            title={submodule.style}
            color={"#000"}
            AIModal={true}
            module={module}
          />
        </View>

        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <AudioPlayer
            audioUrl={submodule.localFilePath}
            transcript={transcript}
            width={this.windowWidth}
            onProgressUpdate={this.handleProgressUpdate}
          />
        </View>

        <Modal
          visible={this.state.showModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {}}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              // backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            <View
              style={{
                width: this.windowWidth * 0.8,
                backgroundColor: "#fff",
                borderRadius: 10,
                padding: 20,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
                Podcast Finished!
              </Text>
              <Text style={{ fontSize: 16, marginBottom: 20, textAlign: "center" }}>
                Would you like to restart the podcast or see your results?
              </Text>
              <View style={{ flexDirection: "row", justifyContent: "space-around", width: "100%" }}>
                <TouchableOpacity
                  onPress={this.handleRestart}
                  style={{
                    backgroundColor: "#A91D3A",
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 16 }}>Keep Studying</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={this.handleSeeResults}
                  style={{
                    backgroundColor: "#700E23",
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 16 }}>See Results</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    );
  }
}
