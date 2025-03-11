// Import necessary components and functions
import React, { Component } from "react";
import {View, Text, TouchableOpacity, ActivityIndicator, Dimensions} from "react-native";
import { TextInput, Snackbar } from "react-native-paper";
import COLORS from "../../../../constants/COLORS";
import { login } from "../../../../api/LogIn"; // Make sure this is the correct import path

export default class LogInView extends Component {
  constructor(props) {
    super(props);
    const windowDimensions = Dimensions.get("window");
    this.windowWidth = windowDimensions.width;
    this.windowHeight = windowDimensions.height;
  }
  state = {
    email: "",
    password: "",
    errorMessage: "",
    loading: false,
    visible: false,
  };

  handleLogIn = async () => {
    const { email, password } = this.state;
    this.setState({ loading: true, errorMessage: "" });

    try {
      await login(email, password);  // Assuming this function authenticates the user
      this.props.navigation.navigate('SplashScreen');  // Navigate to SplashScreen after successful login
      this.setState({ loading: false });
    } catch (error) {
      let message = "Login failed: " + error.message; // Default error message
      if (error.code) {
        switch (error.code) {
          case 'auth/invalid-email':
            message = "The email address is badly formatted.";
            break;
          case 'auth/invalid-credential':
            message = "The supplied auth credential is incorrect, malformed, or has expired.";
            break;
          case 'auth/user-not-found':
            message = "No user found with this email address.";
            break;
          case 'auth/wrong-password':
            message = "Incorrect password, please try again.";
            break;
          default:
            // Keep the default error message if the error code is not handled explicitly
            break;
        }
      }
      this.setState({
        loading: false,
        errorMessage: message,
        visible: true,
      });
    }
  };


  render() {
    const { email, password, errorMessage, loading, visible } = this.state;
    const { openSignUpView, openSplashScreen } = this.props;

    return (
      <View style={{
        flex: 1,
        padding: 20,
        justifyContent: "center",
        backgroundColor: COLORS.SPACE_GREY,
      }}
      >
        <Text style={{
          fontSize: 24,
          marginBottom: 20,
          textAlign: "center",
        }}
        >
          Log In
        </Text>

        <TextInput
          label="Email"
          mode="outlined"
          value={email}
          onChangeText={email => this.setState({ email })}
          style={{ marginBottom: 16 }}
          theme={{ colors: { primary: COLORS.MAROON } }}
        />

        <TextInput
          label="Password"
          mode="outlined"
          secureTextEntry
          value={password}
          onChangeText={password => this.setState({ password })}
          style={{ marginBottom: 16 }}
          theme={{ colors: { primary: COLORS.MAROON } }}
        />

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.MAROON} />
        ) : (
          <TouchableOpacity
            onPress={() => {
              const { email, password } = this.state;
              this.setState({ loading: true, errorMessage: "" });
              openSplashScreen(email, password)
            }}
            style={{
              marginTop: 20,
              backgroundColor: COLORS.MAROON,
              alignItems: "center",
              borderRadius: 25,
              padding: 10,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>
              Log In
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={openSignUpView}
          style={{
            marginTop: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 15, color: COLORS.MAROON }}>
            Don’t have an account? Sign Up
          </Text>
        </TouchableOpacity>

        <Snackbar
          visible={visible}
          onDismiss={() => this.setState({ visible: false })}
          duration={3000}
        >
          {errorMessage}
        </Snackbar>
      </View>
    );
  }
}
