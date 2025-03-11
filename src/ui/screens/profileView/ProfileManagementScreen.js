import React, { Component } from "react";
import {View, Text, StatusBar, Alert, TouchableOpacity} from "react-native";
import CustomBottomBar from "../../../components/CustomBottomBar";
import auth from "@react-native-firebase/auth";
import COLORS from "../../../constants/COLORS";
import {SessionContext} from "../../../util/SessionContext";

export default class ProfileManagementScreen extends Component {
  static contextType = SessionContext;

  handleLogOut = async () => {
    try {
      await auth().signOut();
      this.context.setSession({ token: null });
      this.props.navigation.navigate("SignUp"); // Corrected navigation usage
    } catch (error) {
      Alert.alert("Logout Error", "Failed to log out properly.");
    }
  };

  navigateToLearningStyleForm = () => {
    this.props.navigation.navigate('LearningStyleForm'); // Corrected navigation usage
  };

  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center"
      }}>
        <StatusBar
          backgroundColor="transparent"
          textColor="black"
          translucent
          barStyle="dark-content"
        />
        <TouchableOpacity
          onPress={this.navigateToLearningStyleForm} // Corrected onPress event
          style={{
            alignItems: "center",
            backgroundColor: COLORS.MAROON,
            padding: 10,
            borderRadius: 25,
            marginTop: 20,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Take Survey</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={this.handleLogOut}
          style={{
            alignItems: "center",
            backgroundColor: COLORS.MAROON,
            padding: 10,
            borderRadius: 25,
            marginTop: 20,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Log Out</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 24 }}>Profile Screen</Text>
        <CustomBottomBar
          navigation={this.props.navigation}
          activeTab="Profile"
        />
      </View>
    );
  }
}
