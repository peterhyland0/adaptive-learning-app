import React, { Component } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import RealtimeAIButton from "../ui/screens/submodulesView/components/RealtimeAIButton";
import { SessionContext } from "./SessionContext";

class BackArrow extends Component {
  static contextType = SessionContext;

  render() {
    const { title, color, navigation, module } = this.props;
    const { width: windowWidth } = Dimensions.get("window");
    const { AIModal } = this.props;
    // if (AIModal === true) {
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

        {/* Realtime AI Button used as play/pause trigger */}
        { AIModal &&
          <View style={{ position: "absolute", right: 10, top: 15 }}>
            <RealtimeAIButton module={module} />
          </View>
        }

      </View>
    );
  }
}

// Functional wrapper to supply the navigation prop
function BackArrowWrapper(props) {
  const navigation = useNavigation();
  return <BackArrow {...props} navigation={navigation} />;
}

export default BackArrowWrapper;
