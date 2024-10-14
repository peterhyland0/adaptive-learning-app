import React, {Component} from 'react';
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {NavigationContainer} from "@react-navigation/native";


import {SessionContext} from "./src/util/SessionContext";
import SplashScreen from "./src/ui/screens/splashScreen/SplashScreen";

const Stack = createNativeStackNavigator();

export default class App extends Component {
  render() {
    return (
      <SessionContext.Provider value={{}}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName={"SplashScreen"} screenOptions={{headerShown: false}}>
            {/* screens of the app are called here */}
            <Stack.Screen name="SplashScreen" component={SplashScreen} />

          </Stack.Navigator>
        </NavigationContainer>
      </SessionContext.Provider>
    );
  }
}
