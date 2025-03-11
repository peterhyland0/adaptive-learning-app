import React, { Component } from "react";
import { View, Text, Dimensions, StatusBar } from "react-native";
import BackArrow from "../../../../util/BackArrow";
import AudioPlayer from "../components/AudioPlayer";
import LinearGradient from "react-native-linear-gradient";
import {updateUserProgress} from "../../../../api/updateUserProgress";
import {SessionContext} from "../../../../util/SessionContext";

export default class PodcastSubmoduleScreen extends Component {
  static contextType = SessionContext;

  constructor(props) {
    super(props);
    const windowDimensions = Dimensions.get("window");
    this.windowWidth = windowDimensions.width;
    this.windowHeight = windowDimensions.height;
    this.state = {
      currentProgress: 0,
    };
  }
  handleProgressUpdate = async (currentTime, duration) => {
    console.log("Updating progress:", currentTime, duration); // Log received currentTime

    this.setState({currentProgress: currentTime}, () => {
      console.log("State updated:", this.state.currentProgress); // Verify state update
    });

    const {submodule} = this.props.route.params;
    const {session} = this.context;

    let completionPercentage = (currentTime / duration) * 100;
    let progressStatus = "Not Started"
    if (completionPercentage >= 95) {
      completionPercentage = 100;
      progressStatus = "Completed"
    } else {
      completionPercentage = Math.round(completionPercentage);
      progressStatus = "In Progress"
    }
    console.log("progressStatus1", progressStatus);

    const now = new Date().toISOString();
    const completionDate = completionPercentage === 100 ? now : null;
    console.log("completionPercentage1", completionPercentage)
    console.log("session", session.submodules)
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
                  completionDate: (currentTime / submodule.duration) >= 0.99 ? now : null,
                  completionPercentage: completionPercentage,
                  progressStatus: progressStatus
                }
              }
              : sub
          ),
        }
        : mod
    );
    console.log("submodule duration: ", submodule.duration);
    console.log("Updated modules:", JSON.stringify(updatedModules, null, 2));

    this.context.setSession({...session, modules: updatedModules});

    try {
      await updateUserProgress(
        [{
          id: submodule.id,
          completionPercentage: Math.min((currentTime / duration) * 100, 100),
          lastUpdated: now,
          completionDate: completionDate,
          lastTime: currentTime,
          progressStatus: progressStatus,

        }],
        submodule.moduleId,
        session.userUid
      );
      console.log("Firestore update success");
    } catch (err) {
      console.error("Firestore update failed:", err);
    }
  }


  render() {
    const { submodule, module } = this.props.route.params;
    const transcript = typeof submodule.transcript === 'string'
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
      </LinearGradient>
    );
  }
}
