import React, { Component } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler"; // Import this!
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { SessionProvider } from "./src/util/SessionContext";
import SplashScreen from "./src/ui/screens/splashScreen/SplashScreen";
import SignUpManagementScreen from "./src/ui/screens/signUpView/SignUpManagementScreen";
import UploadManagementScreen from "./src/ui/screens/uploadView/UploadManagementScreen";
import ModulesManagementScreen from "./src/ui/screens/modulesView/ModulesManagementScreen";
import ProfileManagementScreen from "./src/ui/screens/profileView/ProfileManagementScreen";
import SubmodulesManagementScreen from "./src/ui/screens/submodulesView/SubmodulesManagementScreen";
import PodcastSubmoduleScreen from "./src/ui/screens/submodulesView/podcastSubmodule/PodcastSubmoduleScreen";
import { firebase } from "@react-native-firebase/auth";
import LearningStyleForm from "./src/ui/screens/learningStyleView/LearningStyleForm";
import FlashCardSubmoduleScreen from "./src/ui/screens/submodulesView/flashCardSubmodule/FlashCardSubmoduleScreen";
import MindMap from "./src/ui/screens/submodulesView/mindMapSubmodule/MindMapSubmoduleScreen";
import { TypographyMetaballScreen } from "./src/components/animations/TypographyMetaballScreen";
import QuizSubmoduleScreen from "./src/ui/screens/submodulesView/quizSubmodule/QuizSubmoduleScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const firebaseConfig = {
  // Your Firebase config object from Firebase Console
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      session: {
        token: null,
        username: null,
        modules: [],
      },
    };
  }

  setSession = (newSession) => {
    this.setState({ session: { ...this.state.session, ...newSession } });
  };

  render() {
    return (
      // Wrap your app with GestureHandlerRootView
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SessionProvider value={{ session: this.state.session, setSession: this.setSession }}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName={"SplashScreen"} screenOptions={{ headerShown: false }}>
              {/* Stack Screens */}
              {/*<Stack.Screen name="TypographyMetaball" component={TypographyMetaballScreen} />*/}
              {/*<Stack.Screen name="MindMapSubmodule" component={MindMap}/>*/}

              <Stack.Screen name="SplashScreen" component={SplashScreen} />
              <Stack.Screen name="SignUp" component={SignUpManagementScreen} />
              <Stack.Screen name="Upload" component={UploadManagementScreen} />
              <Stack.Screen name="LearningStyleForm" component={LearningStyleForm} />
              <Stack.Screen name="Modules" component={ModulesManagementScreen} />
              <Stack.Screen name="Submodules" component={SubmodulesManagementScreen} />
              <Stack.Screen name="PodcastSubmodule" component={PodcastSubmoduleScreen} />
              <Stack.Screen name="FlashCardsSubmodule" component={FlashCardSubmoduleScreen} />
              <Stack.Screen name="MindMapSubmodule" component={MindMap}/>
              <Stack.Screen name="QuizSubmodule" component={QuizSubmoduleScreen} />
              <Stack.Screen name="Profile" component={ProfileManagementScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </SessionProvider>
      </GestureHandlerRootView>
    );
  }
}
