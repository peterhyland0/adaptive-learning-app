import { Component } from "react";
import { SessionContext } from "../../../../util/SessionContext";
import { Dimensions, View } from "react-native";
import FlashCardDeck from "../components/FlashCardDeck";
import BackArrow from "../../../../util/BackArrow";
import JSON5 from "json5";
import LinearGradient from "react-native-linear-gradient";
import {updateUserProgress} from "../../../../api/updateUserProgress";

export default class FlashCardSubmoduleScreen extends Component {
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
  updateQuizProgress = async ({ score, total }) => {
    const { submodule } = this.props.route.params;
    const { session, setSession } = this.context;
    // Use the total passed from FlashCardDeck
    const completionPercentage = total ? Math.round((score / total) * 100) : 0;
    console.log("completion percentage", completionPercentage, score, total);
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
    setSession({ ...session, modules: updatedModules });

    try {
      console.log("completion percentage 2", completionPercentage, score, total);
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


  render() {
    const { submodule, module } = this.props.route.params;
    const parsedFlashCards = JSON5.parse(submodule.lessonData);
    return (
      <LinearGradient
        colors={['#A91D3A', '#C73659', '#D96078']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        <BackArrow
          title={submodule.name}
          color={"#000"}
          AIModal={true}
          module={module}
        />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <FlashCardDeck
            lessonData={parsedFlashCards}
            updateQuizProgress={this.updateQuizProgress}
          />
        </View>
      </LinearGradient>
    );
  }
}
