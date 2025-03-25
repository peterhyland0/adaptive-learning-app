import React, { Component } from "react";
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Switch,
  Alert,
  Dimensions,
} from "react-native";
import CustomBottomBar from "../../../components/CustomBottomBar";
import auth from "@react-native-firebase/auth";
import COLORS from "../../../constants/COLORS";
import { SessionContext } from "../../../util/SessionContext";
import { fetchAdminStudents } from "../../../api/fetchAdminStudents";
import ManageStudentsModal from "./components/ManageStudentsModal";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

export default class ProfileManagementScreen extends Component {
  static contextType = SessionContext;

  constructor(props) {
    super(props);
    const windowDimensions = Dimensions.get("window");
    this.windowWidth = windowDimensions.width;
    this.windowHeight = windowDimensions.height;
    this.state = {
      adminToggle: false,
      modalVisible: false,
      myStudents: [],
      loadingStudents: false,
    };

  }

  fetchStudents = async () => {

    const { userUid } = this.context.session || {};
    // console.log("user", this.context);
    if (userUid) {
      this.setState({ loadingStudents: true });
      try {
        const students = await fetchAdminStudents(this.context.session.userUid);
        console.log(students);
        this.context.setSession((prevSession) => ({
          ...prevSession,
          myStudents: students,
        }));
        this.setState({ loadingStudents: false });
      } catch (error) {
        console.error("Error fetching students:", error);
        this.setState({ loadingStudents: false });
      }
    }
  };


  handleLogOut = async () => {
    try {
      await auth().signOut();
      this.context.setSession({ token: null });
      this.props.navigation.navigate("SignUp");
    } catch (error) {
      Alert.alert("Logout Error", "Failed to log out properly.");
    }
  };

  navigateToLearningStyleForm = () => {
    this.props.navigation.navigate("LearningStyleForm");
  };

  handleToggleChange = (value) => {
    this.setState({ adminToggle: value }, () => {
      if (value) {
        // Merge with existing session values instead of replacing them entirely
        this.context.setSession((prevSession) => ({
          ...prevSession,
          adminMode: true,
        }));
        this.fetchStudents();
      } else {
        this.context.setSession((prevSession) => ({
          ...prevSession,
          adminMode: false,
        }));
        this.setState({ myStudents: [] });
      }
    });
  };


  onUserDeleted = (deletedUserUid) => {
    this.context.setSession((prevSession) => ({
      ...prevSession,
      myStudents: prevSession.myStudents.filter(
        (student) => student.uid !== deletedUserUid
      ),
    }));
  };


  onUserAdded = () => {
    this.fetchStudents();
  };

  render() {
    const { modalVisible, loadingStudents } = this.state;
    const { adminMode, myStudents } = this.context.session;

    return (
      <View style={{ flex: 1, backgroundColor: "#F8F8F8" }}>
        <StatusBar
          backgroundColor="transparent"
          textColor="black"
          translucent
          barStyle="dark-content"
        />

        <View
          style={{
            alignItems: "center",
            paddingHorizontal: 20,
            paddingTop: 50,
            paddingBottom: 20,
            backgroundColor: "#fff",
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 3,
            marginBottom: this.windowWidth * 0.15,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: COLORS.MAROON
          }}>
            Profile
          </Text>
          <View
            style={{
              position: "absolute",
              // flexDirection: "row",
              right: this.windowWidth * 0.06,
              top: this.windowWidth * 0.13,
              alignItems: "center"
          }}>
            <Text style={{
              fontSize: 12,
              marginRight: 10,
              color: COLORS.MAROON
            }}>
              Admin Mode
            </Text>
            <Switch
              value={adminMode}
              onValueChange={this.handleToggleChange}
              trackColor={{ false: "#767577", true: COLORS.MAROON }}
              thumbColor={adminMode ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: this.windowWidth * 0.075,
          }}
        >
          <TouchableOpacity
            onPress={this.navigateToLearningStyleForm}
            style={{
              backgroundColor: COLORS.MAROON_LIGHT,
              borderColor: COLORS.MAROON,
              borderWidth: 1,
              height: this.windowWidth * 0.4,
              width: this.windowWidth * 0.4,
              alignItems: "center",
              justifyContent: "space-around",
              paddingVertical: 15,
              paddingHorizontal: 30,
              borderRadius: 30,
              marginVertical: 10,
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 5,
              elevation: 2,
            }}
          >
            <Ionicons
              name={"newspaper"}
              size={this.windowWidth * 0.15}
              color={COLORS.MAROON}
            />
            <Text
              style={{
                color: COLORS.MAROON,
                fontWeight: "bold",
                fontSize: 16,
                textAlign: "center",
            }}>
              Take VAK Survey
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.handleLogOut}
            style={{
              backgroundColor: COLORS.MAROON_LIGHT,
              borderColor: COLORS.MAROON,
              borderWidth: 1,
              height: this.windowWidth * 0.4,
              width: this.windowWidth * 0.4,
              alignItems: "center",
              justifyContent: "space-around",
              paddingVertical: 15,
              paddingHorizontal: 30,
              borderRadius: 30,
              marginVertical: 10,
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 5,
              elevation: 2,
            }}
          >
            <MaterialCommunityIcons
              name={"logout"}
              size={this.windowWidth * 0.15}
              color={COLORS.MAROON}
            />
            <Text style={{ color: COLORS.MAROON, fontWeight: "bold", fontSize: 16 }}>
              Log Out
            </Text>
          </TouchableOpacity>

        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: this.windowWidth * 0.075,
          }}
        >
        <TouchableOpacity
          onPress={() => this.props.navigation.navigate("LearningStyleResults")}
          style={{
            backgroundColor: COLORS.MAROON_LIGHT,
            borderColor: COLORS.MAROON,
            borderWidth: 1,
            height: this.windowWidth * 0.4,
            width: this.windowWidth * 0.4,
            alignItems: "center",
            justifyContent: "space-around",
            paddingVertical: 15,
            paddingHorizontal: 30,
            borderRadius: 30,
            marginVertical: 10,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 5,
            elevation: 2,
          }}
        >
          <View
            style={{
              flexDirection: "row",
            }}
          >
            <Ionicons name="walk-outline" size={50} color={COLORS.MAROON} />
            <Ionicons name="eye-outline" size={50} color={COLORS.MAROON} />
            <Ionicons name="musical-notes-outline" size={50} color={COLORS.MAROON} />
          </View>

          <Text style={{ color: COLORS.MAROON, fontWeight: "bold", fontSize: 16 }}>
            VAK Results
          </Text>
        </TouchableOpacity>
        {adminMode && (
          <TouchableOpacity
            onPress={() => this.setState({ modalVisible: true })}
            style={{
              backgroundColor: COLORS.MAROON_LIGHT,
              borderColor: COLORS.MAROON,
              borderWidth: 1,
              height: this.windowWidth * 0.4,
              width: this.windowWidth * 0.4,
              alignItems: "center",
              justifyContent: "space-around",
              paddingVertical: 15,
              paddingHorizontal: 30,
              borderRadius: 30,
              marginVertical: 10,
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 5,
              elevation: 2
          }}
            disabled={loadingStudents}
          >
            {loadingStudents ? (
              <ActivityIndicator size="small" color={COLORS.MAROON} />
            ) : (
              <>
                <FontAwesome5
                  name={"users"}
                  size={this.windowWidth * 0.15}
                  color={COLORS.MAROON}
                />
                <Text
                  style={{
                    color: COLORS.MAROON,
                    fontWeight: "bold",
                    fontSize: 16,
                    marginLeft: 10,
                  }}
                >
                  Manage Users
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
        </View>
        <CustomBottomBar navigation={this.props.navigation} activeTab="Profile" />

        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => this.setState({ modalVisible: false })}
        >
          <ManageStudentsModal
            students={myStudents}
            onClose={() => this.setState({ modalVisible: false })}
            onUserDeleted={this.onUserDeleted}
            onUserAdded={this.onUserAdded}
            adminUid={this.context.session.userUid}
          />
        </Modal>
      </View>
    );
  }
}
