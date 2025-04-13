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
      imageError: false,
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
    this.setState({
      selectedModule: module,
      modalVisible: true,
      // Preselect those already enrolled.
      selectedUserIds: module.createdBy ? [...module.createdBy] : [],
    });
  };

  // Toggle selection for any student.
  toggleUserSelection = (userId) => {
    const { selectedUserIds } = this.state;
    if (selectedUserIds.includes(userId)) {
      this.setState({
        selectedUserIds: selectedUserIds.filter((id) => id !== userId),
      });
    } else {
      this.setState({ selectedUserIds: [...selectedUserIds, userId] });
    }
  };

  confirmAddUsers = async () => {
    const { selectedModule, selectedUserIds } = this.state;
    // Retrieve the admin uid and current modules from the session.
    const { userUid, modules } = this.context.session;
    if (!selectedModule || selectedUserIds.length === 0) {
      alert("Please select at least one user.");
      return;
    }

    // Combine admin UID with selected user IDs.
    const combinedUserIds = Array.from(new Set([userUid, ...selectedUserIds]));
    // Pass only non-admin user IDs to the endpoint (for creating progress).
    const nonAdminUserIds = selectedUserIds.filter((uid) => uid !== userUid);

    try {
      const response = await fetch("http://0.0.0.0:8000/api/addUsersToModule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Pass adminUid separately and only send non‑admin user IDs as new users.
        body: JSON.stringify({
          moduleId: selectedModule.id,
          userIds: nonAdminUserIds,
          adminUid: userUid,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        // Update the module's createdBy list in this.context.session.modules.
        const updatedModules = modules.map((m) => {
          if (m.id === selectedModule.id) {
            return { ...m, createdBy: combinedUserIds };
          }
          return m;
        });
        // Directly update the session's modules (in many cases you would use a setter).
        this.context.session.modules = updatedModules;
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
      (submodule) => submodule?.progress && submodule.progress.progressStatus === "Completed"
    );
    return (completedSubmodules.length / submodules.length) * 100;
  };

  handleImageError = () => {
    this.setState({ imageError: true });
  };

  render() {
    const { modules, adminMode, myStudents, userUid } = this.context.session;
    const { modalVisible, selectedUserIds, selectedModule, imageError } = this.state;
    const sortedModules = Array.isArray(modules)
      ? modules.slice().sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
      })
      : [];
    console.log("dates", modules)

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
            sortedModules.map((module) => {
              const progress = this.calculateProgress(module.submodules);
              return (
                <View
                  key={module.id}
                  style={{
                    position: "relative",
                    width: this.windowWidth * 0.9,
                    marginBottom: 20,
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
                          ? require("../../../assets/images/modules.webp")
                          : { uri: module.image }
                      }
                      style={{
                        width: "100%",
                        height: 150,
                        resizeMode: "cover",
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
                      <Text style={{ color: "#fff", fontSize: 20 }}>Manage Users</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          ) : (
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 18, color: "#777", marginTop: 20 }}>
                No modules found,
              </Text>
              <Text style={{ fontSize: 18, color: "#777", marginTop: 20 }}>
                Upload content to create a module.
              </Text>
            </View>
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
                padding: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  marginBottom: 10,
                }}
              >
                Select Users for Course
              </Text>
              <ScrollView style={{ maxHeight: 300 }}>
                {myStudents &&
                  myStudents.map((student) => {
                    // Determine if the student was originally enrolled
                    const isOriginallyEnrolled =
                      selectedModule &&
                      selectedModule.createdBy &&
                      selectedModule.createdBy.includes(student.uid);
                    // Check if the student is currently selected
                    const isSelected = selectedUserIds.includes(student.uid);
                    // For originally enrolled students, always show "Enrolled"
                    // For non-enrolled students, always show "Not Enrolled"
                    const enrollmentText = isOriginallyEnrolled ? "Enrolled" : "Not Enrolled";
                    const enrollmentColor = isOriginallyEnrolled ? "green" : "red";

                    // Base button style
                    let buttonStyle = {
                      padding: this.windowWidth * 0.03,
                      marginBottom: this.windowWidth * 0.02,
                      borderWidth: this.windowWidth * 0.005,
                      borderColor: "#ccc",
                      borderRadius: this.windowWidth * 0.02,
                      backgroundColor: "#f9f9f9",
                    };

                    // Apply "selected" style if the student is currently selected.
                    if (isSelected) {
                      buttonStyle = {
                        ...buttonStyle,
                        borderColor: COLORS.MAROON,
                        backgroundColor: COLORS.MAROON + "33",
                      };
                    }

                    return (
                      <TouchableOpacity
                        key={student.uid}
                        onPress={() => this.toggleUserSelection(student.uid)}
                        style={buttonStyle}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Text style={{ fontSize: 14, color: "#333" }}>
                            {student.email}
                          </Text>
                          <Text style={{ fontSize: 12, color: enrollmentColor }}>
                            {enrollmentText}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
              </ScrollView>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  marginTop: 20,
                }}
              >
                <TouchableOpacity
                  onPress={this.cancelModal}
                  style={{
                    marginRight: 10,
                    backgroundColor: COLORS.MAROON_LIGHT,
                    borderRadius: 5,
                    padding: 10,
                  }}
                >
                  <Text style={{ color: COLORS.MAROON }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={this.confirmAddUsers}
                  style={{
                    backgroundColor: COLORS.MAROON,
                    borderRadius: 5,
                    padding: 10,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "bold",
                    }}
                  >
                    Confirm Users
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
      // <SafeAreaView style={{ flex: 1, backgroundColor: "#121212" }}>
      //   <StatusBar backgroundColor="#1e1e1e" barStyle="light-content" />
      //
      //   <View style={{
      //     justifyContent: "center",
      //     alignItems: "center",
      //     paddingHorizontal: 20,
      //     paddingTop: 50,
      //     paddingBottom: 20,
      //     backgroundColor: "#1E1E1E",
      //   }}>
      //     <Text style={{ fontSize: 24, fontWeight: "bold", color: "#fff" }}>
      //       Modules
      //     </Text>
      //   </View>
      //
      //   <ScrollView contentContainerStyle={{ alignItems: "center", paddingTop: 20, paddingBottom: 100 }}>
      //     {modules && modules.length > 0 ? (
      //       sortedModules.map((module) => {
      //         const progress = this.calculateProgress(module.submodules);
      //         return (
      //           <View key={module.id} style={{ width: this.windowWidth * 0.9, marginBottom: 20 }}>
      //             <TouchableOpacity
      //               onPress={() => this.handleModulePress(module)}
      //               style={{
      //                 backgroundColor: "#1e1e1e",
      //                 borderRadius: 15,
      //                 elevation: 5,
      //                 shadowColor: "#000",
      //                 shadowOffset: { width: 0, height: 4 },
      //                 shadowOpacity: 0.2,
      //                 shadowRadius: 4,
      //                 overflow: "hidden",
      //               }}
      //             >
      //               <Image
      //                 source={
      //                   imageError
      //                     ? require("../../../assets/images/modules.webp")
      //                     : { uri: module.image }
      //                 }
      //                 style={{ width: "100%", height: 150, resizeMode: "cover" }}
      //                 onError={this.handleImageError}
      //               />
      //               <View style={{ padding: 15 }}>
      //                 <Text
      //                   numberOfLines={3}
      //                   ellipsizeMode="tail"
      //                   style={{ fontSize: 20, color: "#fff", textAlign: "center", marginBottom: 15 }}
      //                 >
      //                   {module.name}
      //                 </Text>
      //                 <View style={{ alignItems: "center" }}>
      //                   <Progress.Bar
      //                     progress={progress / 100}
      //                     width={this.windowWidth * 0.7}
      //                     height={10}
      //                     borderRadius={5}
      //                     color="#A91D3A"
      //                     unfilledColor="#333"
      //                     style={{ marginBottom: 10 }}
      //                   />
      //                   <Text style={{ color: "#ccc", fontSize: 16 }}>
      //                     {module.submodules.length} Submodules
      //                   </Text>
      //                 </View>
      //               </View>
      //             </TouchableOpacity>
      //
      //             {adminMode && (
      //               <TouchableOpacity
      //                 onPress={() => this.handleAddUsers(module)}
      //                 style={{
      //                   position: "absolute",
      //                   top: 10,
      //                   right: 10,
      //                   backgroundColor: COLORS.MAROON,
      //                   paddingVertical: 5,
      //                   paddingHorizontal: 10,
      //                   borderRadius: 5,
      //                   zIndex: 10,
      //                 }}
      //               >
      //                 <Text style={{ color: "#fff", fontSize: 20 }}>Manage Users</Text>
      //               </TouchableOpacity>
      //             )}
      //           </View>
      //         );
      //       })
      //     ) : (
      //       <View style={{ alignItems: "center" }}>
      //         <Text style={{ fontSize: 18, color: "#ccc", marginTop: 20 }}>
      //           No modules found.
      //         </Text>
      //         <Text style={{ fontSize: 18, color: "#ccc", marginTop: 5 }}>
      //           Upload content to create a module.
      //         </Text>
      //       </View>
      //     )}
      //   </ScrollView>
      //
      //   <CustomBottomBar navigation={this.props.navigation} activeTab="Modules" />
      //
      //   <Modal visible={modalVisible} animationType="fade" transparent onRequestClose={this.cancelModal}>
      //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.6)" }}>
      //       <View style={{ width: "80%", backgroundColor: "#1c1c1c", borderRadius: 10, padding: 20 }}>
      //         <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10, color: "#fff" }}>
      //           Select Users for Course
      //         </Text>
      //         <ScrollView style={{ maxHeight: 300 }}>
      //           {myStudents &&
      //             myStudents.map((student) => {
      //               const isEnrolled = selectedModule?.createdBy?.includes(student.uid);
      //               const isSelected = selectedUserIds.includes(student.uid);
      //               const enrollmentText = isEnrolled ? "Enrolled" : "Not Enrolled";
      //               const enrollmentColor = isEnrolled ? "lightgreen" : "tomato";
      //
      //               let buttonStyle = {
      //                 padding: this.windowWidth * 0.03,
      //                 marginBottom: this.windowWidth * 0.02,
      //                 borderWidth: this.windowWidth * 0.005,
      //                 borderColor: "#444",
      //                 borderRadius: this.windowWidth * 0.02,
      //                 backgroundColor: isSelected ? "#333" : "#2c2c2c",
      //               };
      //
      //               return (
      //                 <TouchableOpacity
      //                   key={student.uid}
      //                   onPress={() => this.toggleUserSelection(student.uid)}
      //                   style={buttonStyle}
      //                 >
      //                   <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      //                     <Text style={{ fontSize: 14, color: "#eee" }}>{student.email}</Text>
      //                     <Text style={{ fontSize: 12, color: enrollmentColor }}>{enrollmentText}</Text>
      //                   </View>
      //                 </TouchableOpacity>
      //               );
      //             })}
      //         </ScrollView>
      //
      //         <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
      //           <TouchableOpacity
      //             onPress={this.cancelModal}
      //             style={{
      //               marginRight: 10,
      //               backgroundColor: COLORS.MAROON_LIGHT,
      //               borderRadius: 5,
      //               padding: 10,
      //             }}
      //           >
      //             <Text style={{ color: COLORS.MAROON }}>Cancel</Text>
      //           </TouchableOpacity>
      //           <TouchableOpacity
      //             onPress={this.confirmAddUsers}
      //             style={{
      //               backgroundColor: COLORS.MAROON,
      //               borderRadius: 5,
      //               padding: 10,
      //             }}
      //           >
      //             <Text style={{ color: "#fff", fontWeight: "bold" }}>Confirm Users</Text>
      //           </TouchableOpacity>
      //         </View>
      //       </View>
      //     </View>
      //   </Modal>
      // </SafeAreaView>
    );
  }
}
