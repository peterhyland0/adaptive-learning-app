import React, { Component } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert, StatusBar } from 'react-native';
import auth from '@react-native-firebase/auth';
import { SessionContext } from "../../../util/SessionContext";
import { getModulesByUser } from "../../../api/getModulesByUser";
import { getSubmodulesByModuleId } from "../../../api/getSubmodulesByModuleId";
import { getSubmoduleProgressByUser } from "../../../api/getSubmoduleProgressByUser";
import { downloadAudioFile } from "../../../util/downloadAudioFile";
import COLORS from "../../../constants/COLORS";

// Import PropTypes if you want to add prop type validation
// import PropTypes from 'prop-types';

export default class SplashScreen extends Component {
  // Set the contextType to access SessionContext
  static contextType = SessionContext;

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  // Lifecycle method to replicate useEffect on mount
  componentDidMount() {
    this.checkAuthState()
    .finally(() => this.setState({ loading: false }));
  }

  fetchProgressForSubmodules = async (submodules, userId) => {
    const submodulesWithData = await Promise.all(
      submodules.map(async (submodule) => {
        try {
          // 1. Fetch submodule progress
          const progress = await getSubmoduleProgressByUser(userId, submodule.id);

          // 2. If submodule is a podcast, download the file & store name + local path
          let localFileName = null;
          let localFilePath = null;
          console.log("This is podcast submodule download: ", submodule);
          if (submodule.style === "Podcast") {
            // e.g., store as "podcast-{submodule.id}.mp3"
            localFileName = `podcast-${submodule.id}.mp3`;
            localFilePath = await downloadAudioFile(submodule.lessonData, localFileName);
          }
          console.log(localFileName, localFilePath);
          // Return updated submodule with new fields
          return {
            ...submodule,
            progress,
            localFileName, // e.g., "podcast-123.mp3"
            localFilePath, // e.g., "file:///data/user/0/.../podcast-123.mp3"
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

          // Calculate module progress
          const moduleProgress = this.calculateModuleProgress(submodulesWithProgressAndPodcasts);

          return { ...module, submodules: submodulesWithProgressAndPodcasts, progress: moduleProgress };
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

    // Extract progress values, filtering out null or undefined values
    const validProgressValues = submodules
    .map(submodule => submodule.progress)
    .filter(progress => progress !== null && progress !== undefined);

    console.log("valid progress", validProgressValues);

    if (validProgressValues.length === 0) return 0; // Avoid division by zero

    // Compute average progress
    const totalProgress = validProgressValues.reduce((sum, value) => sum + value, 0);
    return totalProgress / validProgressValues.length;
  };


  fetchUserModules = async (user) => {
    try {
      const token = await user.getIdToken();
      const modules = await getModulesByUser(user.uid);
      console.log('Fetched Modules:', modules);

      // Fetch submodules (with progress & local downloads for podcasts)
      const modulesWithSubmodules = await this.fetchSubmodulesForModules(modules, user.uid);

      // Set session with modules and submodules
      this.context.setSession({ token, userUid: user.uid, username: user.email, modules: modulesWithSubmodules });

      // Navigate to the next screen
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
        <View style={styles.loadingContainer}>
          <StatusBar
            backgroundColor="transparent"
            translucent
            barStyle="dark-content"
          />
          <ActivityIndicator size="large" color={COLORS.MAROON} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    return null;
  }
}

// Optional: Define PropTypes for better type checking
/*
SplashScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};
*/

// Define your styles
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.MAROON,
  },
});
