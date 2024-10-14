import React, { Component } from "react";
import { Dimensions, SafeAreaView, Text, Platform, Alert, PermissionsAndroid } from "react-native";
import { SessionContext } from "../../../util/SessionContext";


export default class SplashScreen extends Component {
  constructor(props) {
    super(props);
    const dimensions = Dimensions.get("window");
    this.windowWidth = dimensions.width;
    this.windowHeight = dimensions.height;
    this.state = {

    };
  }

  static contextType = SessionContext;

  async componentDidMount() {


  }



  async initializeAppContext() {
    this.context.userEmail = "Tester.email@skillsbase.io";
    this.context.appName = "SkillsBase Fault Locator (React Native)";
    this.context.version = "1.0.0";
    this.context.status = "opened";

    // const deviceName = await DeviceInfo.getDeviceName();
    // const deviceVersion = DeviceInfo.getSystemVersion();
    // this.context.deviceName = deviceName;
    // this.context.deviceVersion = deviceVersion;
  }

  // async handleLocationAndSession() {
  //   try {
  //     const location = await this.getCurrentLocation();
  //     if (location) {
  //       this.context.location = {
  //         "type": "Point",
  //         "coordinates": [
  //           location.longitude,
  //           location.latitude
  //         ]
  //       };
  //       this.context.latitude = location.latitude;
  //       this.context.longitude = location.longitude;
  //
  //       this.context.initialApiCallResponse = [];
  //       const { userEmail, appName, version, status, latitude, longitude } = this.context;
  //
  //       if (!userEmail || !appName || !version) {
  //         this.setState({ errorMessage: 'Missing essential context data' });
  //         console.error('Missing essential context data');
  //         return;
  //       }
  //
  //       const response = await createSessionAPI({
  //         Email: userEmail,
  //         status: status,
  //         location: this.context.location,
  //         Latitude: latitude,
  //         Longitude: longitude,
  //       });
  //
  //       if (response.sessionID) {
  //         this.context.sessionID = response.sessionID;
  //         this.props["navigation"].replace("FlowManagementScreen");
  //       } else {
  //         console.error('Failed to create session', response);
  //         this.setState({ errorMessage: response.message || 'Failed to create session' });
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error getting location permission or location:', error);
  //     this.setState({ errorMessage: 'Error getting location permission or location' });
  //   }
  // }

  // async requestLocationPermission() {
  //   if (Platform.OS === 'android') {
  //     return new Promise((resolve, reject) => {
  //       Alert.alert(
  //         'Location Permission',
  //         'This app needs to access your location',
  //         [
  //           {
  //             text: 'Cancel',
  //             onPress: () => {
  //               console.log('Cancel Pressed');
  //               reject(new Error('Location permission denied'));
  //             },
  //             style: 'cancel',
  //           },
  //           {
  //             text: 'OK',
  //             onPress: () => {
  //               console.log('OK Pressed');
  //               resolve();
  //             },
  //           },
  //         ],
  //         { cancelable: false }
  //       );
  //     });
  //   } else {
  //     return GetLocation.requestForegroundPermissionsAsync()
  //     .then(({ status }) => {
  //       if (status !== 'granted') {
  //         return Promise.reject(new Error('Location permission denied'));
  //       }
  //     });
  //   }
  // }


  render() {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Text>
          {"Splash Screen\nLoading..."}
        </Text>
        {this.state.errorMessage && <Text style={{ color: 'red' }}>{this.state.errorMessage}</Text>}
      </SafeAreaView>
    );
  }
}
