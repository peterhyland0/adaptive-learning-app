import React, { Component } from "react";
import {
  View,
  Text,
  Dimensions,
  Image,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  SafeAreaView,
  Modal,
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
    this.state = {
      modalVisible: false,
      selectedModule: null,
      selectedUserIds: [],
      imageError: false
    };
  }

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

  handleAddUsers = (module) => {
    this.setState({ selectedModule: module, modalVisible: true, selectedUserIds: [] });
  };

  toggleUserSelection = (userId) => {
    const { selectedUserIds } = this.state;
    if (selectedUserIds.includes(userId)) {
      this.setState({ selectedUserIds: selectedUserIds.filter((id) => id !== userId) });
    } else {
      this.setState({ selectedUserIds: [...selectedUserIds, userId] });
    }
  };

  confirmAddUsers = async () => {
    const { selectedModule, selectedUserIds } = this.state;
    if (!selectedModule || selectedUserIds.length === 0) {
      alert("Please select at least one user.");
      return;
    }
    try {
      const response = await fetch("http://0.0.0.0:8000/api/addUsersToModule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moduleId: selectedModule.id,
          userIds: selectedUserIds,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Users added successfully!");
      } else {
        alert("Error adding users: " + data.detail);
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
    this.setState({ modalVisible: false, selectedModule: null, selectedUserIds: [] });
  };

  cancelModal = () => {
    this.setState({ modalVisible: false, selectedModule: null, selectedUserIds: [] });
  };

  calculateProgress = (submodules) => {
    if (!submodules || submodules.length === 0) return 0;
    const completedSubmodules = submodules.filter(
      (submodule) => submodule?.progress.progressStatus === "Completed"
    );
    return (completedSubmodules.length / submodules.length) * 100;
  };

  handleImageError = () => {
    this.setState({ imageError: true });
  };

  render() {
    const { modules, adminMode, myStudents, userUid } = this.context.session;
    const { modalVisible, selectedUserIds, imageError } = this.state;
    console.log("userUid", userUid)
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f1f1f1" }}>
        <StatusBar
          backgroundColor={"#fff"}
          textColor="black"
          translucent
          barStyle="dark-content"
        />
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingTop: 50,
            paddingBottom: 20,
            backgroundColor: "#fff",
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: COLORS.MAROON,
            }}
          >
            Modules
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            paddingTop: 20,
            paddingBottom: 100,
          }}
        >
          {modules && modules.length > 0 ? (
            modules.map((module) => {
              const progress = this.calculateProgress(module.submodules);
              return (
                <View
                  key={module.id}
                  style={{
                    position: "relative",
                    width: this.windowWidth * 0.9,
                    marginBottom: 20
                  }}
                >
                  <TouchableOpacity
                    onPress={() => this.handleModulePress(module)}
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 15,
                      elevation: 5,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      source={
                        imageError
                          ? require('../../../assets/images/modules.webp')
                          : { uri: module.image }
                      }
                      style={{
                        width: '100%',
                        height: 150,
                        resizeMode: 'cover',
                      }}
                      onError={this.handleImageError}
                    />

                    <View style={{ padding: 15 }}>
                      <Text
                        numberOfLines={3}
                        ellipsizeMode="tail"
                        style={{
                          fontSize: 20,
                          color: "#000",
                          textAlign: "center",
                          marginBottom: 15,
                        }}
                      >
                        {module.name}
                      </Text>
                      <View style={{ alignItems: "center" }}>
                        <Progress.Bar
                          progress={progress / 100}
                          width={this.windowWidth * 0.7}
                          height={10}
                          borderRadius={5}
                          color="#A91D3A"
                          unfilledColor="#e0e0e0"
                          style={{ marginBottom: 10 }}
                        />
                        <Text style={{ color: "#777", fontSize: 16 }}>
                          {module.submodules.length} Submodules
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {adminMode && (
                    <TouchableOpacity
                      onPress={() => this.handleAddUsers(module)}
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        backgroundColor: COLORS.MAROON,
                        paddingVertical: 5,
                        paddingHorizontal: 10,
                        borderRadius: 5,
                        zIndex: 10,
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 12 }}>Add Users</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          ) : (
            <Text style={{ fontSize: 18, color: "#777", marginTop: 20 }}>
              No modules found.
            </Text>
          )}
        </ScrollView>
        <CustomBottomBar navigation={this.props.navigation} activeTab="Modules" />

        <Modal
          visible={modalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={this.cancelModal}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            <View
              style={{
                width: "80%",
                backgroundColor: "#fff",
                borderRadius: 10,
                padding: 20
            }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  marginBottom: 10
              }}>
                Select Users to Add
              </Text>
              <ScrollView style={{ maxHeight: 300 }}>
                {myStudents &&
                  myStudents.map((student) => (
                    <TouchableOpacity
                      key={student.uid}
                      onPress={() => this.toggleUserSelection(student.uid)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 10,
                      }}
                    >
                      <View
                        style={{
                          height: 20,
                          width: 20,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: "#ccc",
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 10,
                          backgroundColor: selectedUserIds.includes(student.uid)
                            ? COLORS.MAROON
                            : "#fff",
                        }}
                      >
                        {selectedUserIds.includes(student.uid) && (
                          <Text style={{ color: "#fff" }}>✓</Text>
                        )}
                      </View>
                      <Text>{student.email}</Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
              <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 20 }}>
                <TouchableOpacity onPress={this.cancelModal} style={{ marginRight: 10 }}>
                  <Text style={{ color: COLORS.MAROON }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.confirmAddUsers}>
                  <Text style={{ color: COLORS.MAROON, fontWeight: "bold" }}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }
}
