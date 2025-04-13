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

    this.state = {
      imageError: false,
    }
  }

  handleImageError = () => {
    this.setState({ imageError: true });
  };

  render() {
    const { module, submodules } = this.props.route.params;
    const { imageError } = this.state;
    const darkStyles = {
      container: {
        flex: 1,
        backgroundColor: "#121212",
        alignItems: "center",
      },
      headerText: {
        fontSize: 20,
        color: "#ffffff",
        fontWeight: "bold",
        marginVertical: 15,
      },
      imageStyle: (windowWidth) => ({
        width: windowWidth * 0.9,
        height: windowWidth * 0.5,
        resizeMode: "cover",
        borderRadius: 10,
      }),
      aboutHeader: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#ffffff",
        marginVertical: 15,
      },
      descriptionText: {
        fontSize: 16,
        color: "#cccccc",
      },
      contentWrapper: (windowWidth) => ({
        alignItems: "center",
        padding: windowWidth * 0.1,
      }),
      alignStart: {
        alignItems: "flex-start",
      },
    };

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
              source={
                imageError
                  ? require("../../../assets/images/modules.webp")
                  : { uri: module.image }
              }
              style={{
                width: this.windowWidth * 0.9,
                height: this.windowWidth * 0.5,
                resizeMode: "cover",
                borderRadius: 10,
              }}
              onError={this.handleImageError}
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
      // <SafeAreaView style={darkStyles.container}>
      //   <StatusBar
      //     backgroundColor="transparent"
      //     translucent
      //     barStyle="light-content" // changed from dark-content
      //   />
      //   <BackArrow title={"Course Details"} color={"#fff"} />
      //
      //   <View style={darkStyles.contentWrapper(this.windowWidth)}>
      //     <View style={darkStyles.alignStart}>
      //       <Text style={darkStyles.headerText}>{module.name}</Text>
      //       <Image
      //         source={
      //           imageError
      //             ? require("../../../assets/images/modules.webp")
      //             : { uri: module.image }
      //         }
      //         style={darkStyles.imageStyle(this.windowWidth)}
      //         onError={this.handleImageError}
      //       />
      //       <Text style={darkStyles.aboutHeader}>About this Course</Text>
      //       <Text style={darkStyles.descriptionText}>{module.description}</Text>
      //     </View>
      //   </View>
      //   <SubmodulesList
      //     module={module}
      //     submodules={submodules}
      //     userUid={this.context.session.userUid}
      //     navigation={this.props.navigation}
      //   />
      //
      // </SafeAreaView>
    );
  }
}
