import React, { Component } from "react";
import {View, Text, Dimensions, Image, StatusBar} from "react-native";
import BackArrow from "../../../util/BackArrow";
import SubmodulesList from "./components/SubmodulesList";

export default class SubmodulesManagementScreen extends Component {
  constructor(props) {
    super(props);
    const windowDimensions = Dimensions.get("window");
    this.windowWidth = windowDimensions.width;
    this.windowHeight = windowDimensions.height;
  }

  render() {
    const { module, submodules } = this.props.route.params;
    console.log("SubmodulesManagementScreen", module);
    return (
      <View style={{ flex: 1, backgroundColor: "#fff", alignItems: "center" }}>
        <StatusBar
          backgroundColor="transparent"  // Android-only, sets the status bar's background color
          textColor="black"
          translucent
          barStyle="dark-content"        // iOS & Android, sets the text/icons color
        />
        <BackArrow title={"Course Details"} color={"#000"} />
        <View style={{ alignItems: "center", padding: this.windowWidth * 0.1 }}>
          <View style={{ alignItems: "flex-start" }}>
            <Text style={{ fontSize: 20, color: "black", fontWeight: "bold", marginVertical: 15 }}>
              {module.name}
            </Text>
            {/* Display the image for the module */}
            <Image
              source={require("../../../components/modules.webp")}
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

        <SubmodulesList module={module} submodules={submodules} useruid={module.createdBy} />

        {/* Bottom Navigation Bar */}
        {/* <CustomBottomBar navigation={this.props.navigation} activeTab="Modules" /> */}
      </View>
    );
  }
}
