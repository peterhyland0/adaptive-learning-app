import React, { Component } from "react";
import {View, Text, Dimensions, Image, StatusBar, SafeAreaView} from "react-native";
import BackArrow from "../../../util/BackArrow";
import SubmodulesList from "./components/SubmodulesList";
import {SessionContext} from "../../../util/SessionContext";

export default class SubmodulesManagementScreen extends Component {
  static contextType = SessionContext;

  constructor(props) {
    super(props);
    const windowDimensions = Dimensions.get("window");
    this.windowWidth = windowDimensions.width;
    this.windowHeight = windowDimensions.height;
  }

  render() {
    const { module, submodules } = this.props.route.params;
    // console.log("SubmodulesManagementScreen", module);
    // console.log("this.context.userUid", this.context.user.userUid)
    // console.log("Context Value:", this.context.session.userUid);

    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#fff",
          alignItems: "center"
      }}>
        <StatusBar
          backgroundColor="transparent"
          textColor="black"
          translucent
          barStyle="dark-content"
        />
        <BackArrow title={"Course Details"} color={"#000"} />
        <View style={{ alignItems: "center", padding: this.windowWidth * 0.1 }}>
          <View style={{ alignItems: "flex-start" }}>
            <Text style={{ fontSize: 20, color: "black", fontWeight: "bold", marginVertical: 15 }}>
              {module.name}
            </Text>
            <Image
              source={{ uri: module.image }
                // imageError
                //   ? require('../../../assets/images/modules.webp')
                //   : { uri: module.image }
              }
              style={{
                width: this.windowWidth * 0.9,
                height: this.windowWidth * 0.5,
                resizeMode: "cover",
                borderRadius: 10,
              }}
            />
            <Text style={{ fontSize: 16, fontWeight: "bold", marginVertical: 15 }}>
              About this Course
            </Text>
            <Text style={{ fontSize: 16, color: "#bbb" }}>{module.description}</Text>
          </View>

        </View>

        <SubmodulesList
          module={module}
          submodules={submodules}
          userUid={this.context.session.userUid}
          navigation={this.props.navigation}
        />
      </SafeAreaView>
    );
  }
}
