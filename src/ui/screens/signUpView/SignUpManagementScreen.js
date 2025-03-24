import React, { Component } from "react";
import {View, Alert, BackHandler, StatusBar} from "react-native";
import { SessionContext } from "../../../util/SessionContext";
import SignUpView from "./components/SignUpView";
import LogInView from "./components/LogInView";
import WelcomeView from "./components/WelcomeView";

import auth from "@react-native-firebase/auth";
import checkNetworkConnected from "../../../util/checkNetworkConnected";
import {login} from "../../../api/LogIn";

export default class SignUpManagementScreen extends Component {
  static contextType = SessionContext;


  constructor(props) {
    super(props);
    this.state = {
      deviceSignUpView: true,
      deviceLogInView: false,
      deviceWelcomeView: false,
      deviceLearningStyleFormView: false,
      isLoggedIn: false,
    };
  }

  componentDidMount() {
    this.checkInitialNetworkAndAuthentication();
  }

  checkInitialNetworkAndAuthentication = async () => {
    const networkConnected = await checkNetworkConnected();
    if (!networkConnected) {
      Alert.alert("Network Error", "Please check your network connection and try again.");
      return;
    }

    this.authSubscriber = auth().onAuthStateChanged(user => {
      if (user) {
        user.getIdToken().then(token => {
          this.context.setSession({ token, userUid: user.uid, email: user.email });
          this.setState({
            isLoggedIn: true,
            deviceSignUpView: false,
            deviceLogInView: false,
            deviceWelcomeView: true,
          });
        }).catch(error => {
          console.error("Failed to retrieve token:", error);
          Alert.alert("Session Error", "Failed to verify user session.");
        });
      } else {
        this.context.setSession({ token: null });
        this.setState({
          isLoggedIn: false,
          deviceSignUpView: true,
          deviceLogInView: false,
          deviceWelcomeView: false,
        });
      }
    });
  }

  componentWillUnmount() {
    if (this.authSubscriber) {
      this.authSubscriber();
    }
  }

  handleLogOut = async () => {
    try {
      await auth().signOut();
      this.context.setSession({ token: null });
      this.setState({
        isLoggedIn: false,
        deviceSignUpView: true,
        deviceLogInView: false,
        deviceWelcomeView: false,
      });
    } catch (error) {
      Alert.alert("Logout Error", "Failed to log out properly.");
    }
  };

  handleLogIn = async (email, password) => {
    try {
      await login(email, password);

      this.setState({
        isLoggedIn: true,
        deviceSignUpView: false,
        deviceLogInView: false,
        deviceWelcomeView: false,
      });
      this.props.navigation.navigate("SplashScreen");
    } catch (error) {
      Alert.alert("Log In Error", "Failed to log in properly.");
    }
  }

  openSignUpView = () => {
    this.setState({
      deviceSignUpView: true,
      deviceLogInView: false,
      deviceWelcomeView: false,
    });
  };

  openLogInView = () => {
    this.setState({
      deviceSignUpView: false,
      deviceLogInView: true,
      deviceWelcomeView: false,
    });
  };




  render() {
    const { deviceSignUpView, deviceLogInView, deviceWelcomeView, isLoggedIn } = this.state;

    return (
      <View style={{ flex: 1 }}>
        <StatusBar
          backgroundColor="transparent"
          textColor="black"
          translucent
          barStyle="dark-content"
        />
        {deviceSignUpView && !isLoggedIn && (
          <SignUpView
            openLogInView={this.openLogInView}
          />
        )}
        {deviceLogInView && !isLoggedIn && (
          <LogInView
            openSignUpView={this.openSignUpView}
            openSplashScreen={this.handleLogIn}
          />
        )}
        {deviceWelcomeView && isLoggedIn && (
          <WelcomeView
            handleLogOut={this.handleLogOut}
            openLearningStyleForm={() => this.props.navigation.replace("LearningStyleForm")}
          />
        )}
      </View>
    );
  }
}
