import React, { Component } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { TextInput, Snackbar } from "react-native-paper";
import COLORS from "../../../../constants/COLORS";
import { signUp } from "../../../../api/SignUp";

export default class SignUpView extends Component {
  state = {
    email: "",
    password: "",
    username: "",
    errorMessage: "",
    loading: false,
    visible: false,
  };

  handleSignUp = async () => {
    const { email, password, username } = this.state;

    // Check for empty fields
    if (!email.trim() || !password.trim() || !username.trim()) {
      this.setState({
        errorMessage: "All fields are required.",
        visible: true,
      });
      return; // Prevent the sign-up process
    }

    this.setState({ loading: true, errorMessage: "" });

    try {
      await signUp(email, password, { username });
      // Handle successful signup, e.g., navigate to another screen or clear the form
    } catch (error) {
      this.setState({
        loading: false,
        errorMessage: "Sign up failed: " + error.message,
        visible: true,
      });
    }
  };

  render() {
    const { username, email, password, errorMessage, loading, visible } = this.state;
    const { openLogInView } = this.props;

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
          Sign Up
        </Text>

        <TextInput
          label="Username"
          mode="outlined"
          value={username}
          onChangeText={(text) => this.setState({ username: text })}
          style={{ marginBottom: 16, color: COLORS.MAROON }}
          theme={{ colors: { text: COLORS.MAROON, primary: COLORS.MAROON } }}
        />

        <TextInput
          label="Email"
          mode="outlined"
          value={email}
          onChangeText={(text) => this.setState({ email: text })}
          style={{ marginBottom: 16, color: COLORS.MAROON }}
          theme={{ colors: { text: COLORS.MAROON, primary: COLORS.MAROON } }}
        />

        <TextInput
          label="Password"
          mode="outlined"
          secureTextEntry
          value={password}
          onChangeText={(text) => this.setState({ password: text })}
          style={{ marginBottom: 16, color: COLORS.MAROON }}
          theme={{ colors: { text: COLORS.MAROON, primary: COLORS.MAROON } }}
        />

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.MAROON} />
        ) : (
          <TouchableOpacity
            onPress={this.handleSignUp}
            style={{
              marginTop: 20,
              backgroundColor: COLORS.MAROON,
              alignItems: "center",
              borderRadius: 25,
              padding: 10,
            }}
          >
            <Text style={{
              color: "#fff",
              fontSize: 14,
              fontWeight: "bold",
            }}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={openLogInView}
          style={{
            marginTop: 10,
            alignItems: "center",
          }}
        >
          <Text style={{
            fontSize: 15,
            color: COLORS.MAROON,
          }}
          >
            Already have an account? Log in
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
