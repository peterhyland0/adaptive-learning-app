import React, { Component } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import RealtimeAIModal from "../ui/screens/submodulesView/components/RealtimeAIModal";
import {SessionContext} from "./SessionContext";

class BackArrow extends Component {
  constructor(props) {
    super(props);

    // Initialize state for controlling the modal visibility
    this.state = {
      isModalVisible: false,
    };
  }
  static contextType = SessionContext;


  // Toggle modal visibility
  toggleModal = () => {
    this.setState((prevState) => ({ isModalVisible: !prevState.isModalVisible }));
  };

  renderRealtimeAIButton = () => {
    const { AIModal } = this.props;
    if (AIModal === true) {
      const { session } = this.context;
      return (
        <TouchableOpacity
          onPress={this.toggleModal}
          style={{
            position: "absolute",
            right: 10,
            top: 15,
            padding: 5,
            backgroundColor: "black",
            borderRadius: 5,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16 }}>Realtime AI</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  render() {
    const { title, color, navigation, module } = this.props;
    console.log("module propss", module)
    const { width: windowWidth } = Dimensions.get("window");

    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          paddingHorizontal: 10,
          paddingTop: 15,
          backgroundColor: "transparent",
          marginTop: windowWidth * 0.1,
        }}
      >
        {/* Back Arrow Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            position: "absolute",
            left: 10,
            marginTop: 10,
            paddingTop: 15,
          }}
        >
          <Ionicons name="arrow-back" size={30} color={color} />
        </TouchableOpacity>

        {/* Centered Title */}
        <View style={{ alignItems: "center", marginLeft: 15 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: color }}>
            {title}
          </Text>
        </View>

        {/* Conditionally render the Realtime AI button */}
        {this.renderRealtimeAIButton()}

        {/* Conditionally render the modal */}
        {this.state.isModalVisible &&
          <RealtimeAIModal
            onClose={this.toggleModal}
            module={module}
          />}
      </View>
    );
  }
}

// Functional wrapper that uses useNavigation to pass the navigation prop
function BackArrowWrapper(props) {
  const navigation = useNavigation();
  return <BackArrow {...props} navigation={navigation} />;
}

export default BackArrowWrapper;
