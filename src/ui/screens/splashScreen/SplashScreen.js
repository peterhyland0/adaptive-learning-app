import React, { Component } from 'react';
import {View, Text, ActivityIndicator, StyleSheet, Alert, StatusBar, Dimensions} from 'react-native';
import auth from '@react-native-firebase/auth';
import { SessionContext } from "../../../util/SessionContext";
import { getModulesByUser } from "../../../api/getModulesByUser";
import { getSubmodulesByModuleId } from "../../../api/getSubmodulesByModuleId";
import { getSubmoduleProgressByUser } from "../../../api/getSubmoduleProgressByUser";
import { downloadAudioFile } from "../../../util/downloadAudioFile";
import COLORS from "../../../constants/COLORS";
import {getUserDocument} from "../../../api/getUserDocument";
import LottieView from "lottie-react-native";
import AnimatedLoading from "../../../components/animations/AnimatedLoading";

export default class SplashScreen extends Component {
  static contextType = SessionContext;

  constructor(props) {

    super(props);
    this.state = {
      loading: true,
    };
    const windowDimensions = Dimensions.get("window");
    this.windowWidth = windowDimensions.width;
    this.windowHeight = windowDimensions.height;

  }

  componentDidMount() {
    this.checkAuthState()
    .finally(() => this.setState({ loading: false }));
  }

  fetchProgressForSubmodules = async (submodules, userId) => {
    const submodulesWithData = await Promise.all(
      submodules.map(async (submodule) => {
        try {
          const progress = await getSubmoduleProgressByUser(userId, submodule.id);

          let localFileName = null;
          let localFilePath = null;
          console.log("This is podcast submodule download: ", submodule);
          if (submodule.style === "Podcast") {
            localFileName = `podcast-${submodule.id}.mp3`;
            localFilePath = await downloadAudioFile(submodule.lessonData, localFileName);
          }
          console.log(localFileName, localFilePath);
          return {
            ...submodule,
            progress,
            localFileName,
            localFilePath,
          };
        } catch (error) {
          console.error(`Error fetching data for submodule ${submodule.id}:`, error);
          return {
            ...submodule,
            progress: null,
            localFileName: null,
            localFilePath: null,
          };
        }
      })
    );
    return submodulesWithData;
  };

  fetchSubmodulesForModules = async (modules, userId) => {
    const modulesWithSubmodules = await Promise.all(
      modules.map(async (module) => {
        try {
          const submodules = await getSubmodulesByModuleId(module.id);
          const submodulesWithProgressAndPodcasts = await this.fetchProgressForSubmodules(submodules, userId);

          const moduleProgress = this.calculateModuleProgress(submodulesWithProgressAndPodcasts);

          return { ...module, submodules: submodulesWithProgressAndPodcasts, progress: moduleProgress};
        } catch (error) {
          console.error(`Error fetching submodules for module ${module.id}:`, error);
          return { ...module, submodules: [], progress: 0 };
        }
      })
    );
    return modulesWithSubmodules;
  };

  calculateModuleProgress = (submodules) => {
    if (!submodules || submodules.length === 0) return 0;

    const validProgressValues = submodules
    .map(submodule => submodule.progress)
    .filter(progress => progress !== null && progress !== undefined);

    console.log("valid progress", validProgressValues);

    if (validProgressValues.length === 0) return 0;

    const totalProgress = validProgressValues.reduce((sum, value) => sum + value, 0);
    return totalProgress / validProgressValues.length;
  };



  fetchUserModules = async (user) => {
    try {
      const token = await user.getIdToken();
      const userDoc = await getUserDocument(user.uid);

      const modules = await getModulesByUser(user.uid);
      console.log("user doc", userDoc)

      const modulesWithSubmodules = await this.fetchSubmodulesForModules(modules, user.uid);
      this.context.setSession({
        token,
        userUid: user.uid,
        modules: modulesWithSubmodules,
        user: userDoc,
      });
      console.log("this.context", this.context);

      this.props.navigation.replace('Upload');
    } catch (error) {
      console.error('Error fetching modules:', error);
      Alert.alert('Error', 'Failed to fetch user modules. Please try again later.');
      this.setState({ loading: false });
    }
  };

  checkAuthState = async () => {
    const user = auth().currentUser;

    if (user) {
      await this.fetchUserModules(user);
    } else {
      this.context.setSession({ token: null });
      this.props.navigation.replace('SignUp');
    }
  };

  render() {
    const { loading } = this.state;

    if (loading) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: COLORS.MAROON_LIGHT
          }}>
          <StatusBar
            backgroundColor="transparent"
            translucent
            barStyle="dark-content"
          />
          <AnimatedLoading
            sentences={[
              "Welcome to the Adaptive Learning App!",
              "We are loading your data...",
              "Almost done!"
            ]}
            size={1.5}
            fontSize={20}
            animationMarginTop={0}
            textBottom={100}
            backgroundColor={COLORS.MAROON_LIGHT}
            textColor={COLORS.MAROON}
            animationSource={require("../../../assets/animations/loading-circle-fall.json")}
            fadeDuration={800}
            displayDuration={500}
            cycle={false}
            speed={0.5}
          />
        </View>
      );
    }
    return null;
  }
}

