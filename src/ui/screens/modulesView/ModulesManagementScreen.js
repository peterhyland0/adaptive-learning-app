import React, { Component } from "react";
import {
  View,
  Text,
  Dimensions,
  Image,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  StyleSheet, SafeAreaView
} from "react-native";
import CustomBottomBar from "../../../components/CustomBottomBar";
import { SessionContext } from "../../../util/SessionContext";
import * as Progress from "react-native-progress";
import COLORS from "../../../constants/COLORS";

export default class ModulesManagementScreen extends Component {
  static contextType = SessionContext;

  constructor(props) {
    super(props);
    const windowDimensions = Dimensions.get("window");
    this.windowWidth = windowDimensions.width;
    this.windowHeight = windowDimensions.height;
  }

  // Handle press on a module box
  handleModulePress = (module) => {
    if (module.submodules && module.submodules.length > 0) {
      this.props.navigation.navigate("Submodules", {
        module: module,
        submodules: module.submodules,
      });
    } else {
      console.log("No submodules found for this module.");
    }
  };

// Calculate completion progress of submodules
  calculateProgress = (submodules) => {
    console.log("submodules completed: ", submodules);
    if (!submodules || submodules.length === 0) return 0;

    const completedSubmodules = submodules.filter(
      (submodule) => submodule?.progress.progressStatus === 'Completed'
    );
    console.log("completedSubmodules completed: ", completedSubmodules);
    return (completedSubmodules.length / submodules.length) * 100;
  };


  render() {
    const { modules } = this.context.session;
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          backgroundColor={COLORS.SPACE_GREY}
          textColor="black"
          translucent
          barStyle="dark-content"
        />
        <ScrollView
          contentContainerStyle={[styles.scrollContainer, { paddingBottom: 100 }]} // Added extra bottom padding
        >
          <Text style={styles.title}>Your Modules</Text>
          {modules && modules.length > 0 ? (
            modules.map((module) => {
              const progress = this.calculateProgress(module.submodules);
              return (
                <TouchableOpacity
                  key={module.id}
                  onPress={() => this.handleModulePress(module)}
                  style={styles.moduleBox}
                >
                  <Image
                    source={require("../../../components/modules.webp")}
                    style={styles.moduleImage}
                  />
                  <View style={styles.moduleContent}>
                    <Text
                      numberOfLines={3}
                      ellipsizeMode="tail"
                      style={styles.moduleTitle}
                    >
                      {module.name}
                    </Text>
                    <View style={styles.bottomContainer}>
                      <Progress.Bar
                        progress={progress / 100}
                        width={this.windowWidth * 0.7}
                        height={10}
                        borderRadius={5}
                        color="#A91D3A"
                        unfilledColor="#e0e0e0"
                        style={styles.progressBar}
                      />
                      <Text style={styles.submodulesText}>
                        {module.submodules.length} Submodules
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.noModulesText}>No modules found.</Text>
          )}
        </ScrollView>
        <CustomBottomBar navigation={this.props.navigation} activeTab="Modules" />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f1f1",
  },
  scrollContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    color: "#333",
    fontWeight: "bold",
  },
  moduleBox: {
    width: Dimensions.get("window").width * 0.9,
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    overflow: "hidden",
  },
  moduleImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  moduleContent: {
    padding: 15,
  },
  moduleTitle: {
    fontSize: 20,
    color: "#000",
    textAlign: "center",
    marginBottom: 15,
  },
  bottomContainer: {
    alignItems: "center",
  },
  progressBar: {
    marginBottom: 10,
  },
  submodulesText: {
    color: "#777",
    fontSize: 16,
  },
  noModulesText: {
    fontSize: 18,
    color: "#777",
    marginTop: 20,
  },
});
