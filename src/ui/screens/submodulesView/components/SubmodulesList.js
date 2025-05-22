import React, { useRef, useState, useCallback } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import COLORS from "../../../../constants/COLORS";
import CircularProgress from "react-native-circular-progress-indicator";
import { getSubmoduleProgressByUser } from "../../../../api/getSubmoduleProgressByUser";

export default function SubmodulesList({ module, submodules, userUid }) {
  const navigation = useNavigation();
  const [updatedSubmodules, setUpdatedSubmodules] = useState(submodules);
  const windowWidth = Dimensions.get("window").width;

  const translateY = useRef(new Animated.Value(0)).current;

  console.log("userUid", userUid)
  const getIconForSubmoduleType = (type) => {
    switch (type) {
      case "auditory":
        return (
          <Ionicons name="musical-notes-outline" size={50} color={COLORS.ORANGE} />
        );
      case "visual":
        return <Ionicons name="eye-outline" size={50} color={COLORS.LIGHT_BLUE} />;
      case "kinaesthetic":
        return <Ionicons name="walk-outline" size={50} color={COLORS.YELLOW} />;
      case "quiz":
        return (
          <FontAwesome name="pencil-square-o" size={50} color={COLORS.MAROON} />
        );
      default:
        return (
          <Ionicons name="help-circle-outline" size={50} color={COLORS.MAROON} />
        );
    }
  };

  const getProgressColor = (completionPercentage) => {
    if (completionPercentage <= 20) {
      return "red";
    } else if (completionPercentage > 20 && completionPercentage < 80) {
      return "orange";
    } else {
      return ;
    }
  };

  const handleSubmodulePress = async (submodule, module) => {
    // your submoduleRoutes mapping
    const submoduleRoutes = {
      "auditory:Podcast Session": "PodcastSubmodule",
      "kinaesthetic:Flash Cards": "FlashCardsSubmodule",
      "visual:Mind Map": "MindMapSubmodule",
      "visual:Gallery": "GallerySubmodule",
      "text:Article": "ArticleSubmodule",
      "quiz:Multiple Choice Quiz": "QuizSubmodule",
    };

    try {
      const key = `${submodule.type}:${submodule.name}`;
      const routeName = submoduleRoutes[key];
      if (routeName) {
        navigation.navigate(routeName, { submodule, module });
      } else {
        console.warn("Unhandled submodule type or style:", key);
      }
    } catch (error) {
      console.error("Error handling submodule press:", error);
    }
  };

  const fetchUpdatedProgress = async () => {
    console.log("Fetching updated progress...");
    try {
      const newSubmodules = await Promise.all(
        submodules.map(async (submodule) => {
          const progress = await getSubmoduleProgressByUser(userUid, submodule.id);
          return {
            ...submodule,
            progress: progress || submodule.progress, // keep existing progress if none found
          };
        })
      );
      setUpdatedSubmodules(newSubmodules);
    } catch (error) {
      console.error("Error fetching updated progress:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      (async () => {
        try {
          if (isMounted) {
            await fetchUpdatedProgress();
            console.log("Fetched progress successfully.");
          }
        } catch (error) {
          console.error("Error fetching progress:", error);
        }
      })();
      return () => {
        isMounted = false;
      };
    }, [submodules])
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        const submoduleHeight = windowWidth * 0.15;
        if (
          gestureState.dy > -updatedSubmodules.length * submoduleHeight &&
          gestureState.dy < 0
        ) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        const submoduleHeight = windowWidth * 0.15;
        if (gestureState.dy < -submoduleHeight) {
          Animated.spring(translateY, {
            toValue: -updatedSubmodules.length * submoduleHeight,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Reorder submodules: place quizzes at the bottom.
  const sortedSubmodules = [
    ...updatedSubmodules.filter((sub) => sub.type !== "quiz"),
    ...updatedSubmodules.filter((sub) => sub.type === "quiz"),
  ];
  const darkStyles = {
    container: {
      flexDirection: "column",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      backgroundColor: "#121212",
      width: "100%",
    },
    dragHandleWrapper: {
      width: "100%",
      height: 30,
      alignItems: "center",
      justifyContent: "center",
    },
    dragHandle: {
      width: 50,
      height: 5,
      backgroundColor: "#888",
      borderRadius: 10,
    },
    submoduleWrapper: {
      paddingBottom: 10,
      width: "100%",
      alignItems: "center",
    },
    submoduleCard: (width) => ({
      width: width * 0.9,
      height: width * 0.25,
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 10,
      backgroundColor: "#1e1e1e",
      padding: 10,
      elevation: 3,
      justifyContent: "space-evenly",
    }),
    title: {
      color: "#ffffff",
      fontSize: 18,
      fontWeight: "bold",
    },
    status: {
      color: "#bbbbbb",
      marginTop: 5,
    },
    progressStyle: {
      fontWeight: "bold",
      color: "#ccc",
    },
    playButton: {
      height: 50,
      width: 50,
      alignItems: "center",
      justifyContent: "center",
    },
    divider: {
      height: 1,
      backgroundColor: "#444",
      width: "90%",
      alignSelf: "center",
      marginTop: 10,
    },
  };


  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={{
        transform: [{ translateY }],
        flexDirection: "column",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: COLORS.MAROON,
        width: "100%",
        height: updatedSubmodules.length * 300,
      }}
    >
      {/* Drag Handle */}
      <View
        style={{
          width: "100%",
          height: 30,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: 50,
            height: 5,
            backgroundColor: "#888",
            borderRadius: 10,
          }}
        />
      </View>

      {/* Submodules */}
      {sortedSubmodules && sortedSubmodules.length > 0 ? (
        sortedSubmodules.map((submodule, index) => (
          <View
            key={index}
            style={{
              paddingBottom: 10,
              width: "100%",
              alignItems: "center",
            }}
          >
            {submodule.type === "quiz" ? (
              // Quiz Submodule with custom style adjustments
              <View
                style={{
                  width: windowWidth * 0.9,
                  height: windowWidth * 0.25,
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 10,
                  backgroundColor: "#fff",
                  padding: 10,
                  elevation: 3,
                  justifyContent: "space-evenly",
                }}
              >
                <View style={{ marginRight: 15 }}>
                  {getIconForSubmoduleType(submodule.type)}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: "black",
                      fontSize: 18,
                      fontWeight: "bold",
                    }}
                  >
                    {submodule.name}
                  </Text>
                  <Text
                    style={{
                      color: "#bbb",
                      marginTop: 5,
                    }}
                  >
                    Status: {submodule.progress.progressStatus}
                  </Text>
                </View>
                <CircularProgress
                  value={
                    submodule.progress
                      ? submodule.progress["completionPercentage"]
                      : 0
                  }
                  radius={30}
                  inActiveStrokeOpacity={0.5}
                  activeStrokeWidth={20}
                  inActiveStrokeWidth={20}
                  activeStrokeColor={
                    submodule.progress
                      ? getProgressColor(submodule.progress["completionPercentage"])
                      : "red"
                  }
                  progressValueStyle={{
                    fontWeight: "bold",
                    color: "#ccc",
                  }}
                />
                <TouchableOpacity
                  onPress={async () =>
                    await handleSubmodulePress(submodule, module)
                  }
                  style={{
                    height: 50,
                    width: 50,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name="play"
                    size={30}
                    color="black"
                    style={{
                      marginLeft: 20,
                    }}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              // Default style for non-quiz submodules
              <View
                style={{
                  width: windowWidth * 0.9,
                  height: windowWidth * 0.25,
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 10,
                  backgroundColor: "#fff",
                  padding: 10,
                  elevation: 3,
                  justifyContent: "space-evenly",
                }}
              >
                <View style={{ marginRight: 15 }}>
                  {getIconForSubmoduleType(submodule.type)}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: "black",
                      fontSize: 18,
                      fontWeight: "bold",
                    }}
                  >
                    {submodule.name}
                  </Text>
                  <Text
                    style={{
                      color: "#bbb",
                      marginTop: 5,
                    }}
                  >
                    Status: {submodule.progress.progressStatus}
                  </Text>
                </View>
                <CircularProgress
                  value={
                    submodule.progress
                      ? submodule.progress["completionPercentage"]
                      : 0
                  }
                  radius={30}
                  inActiveStrokeOpacity={0.5}
                  activeStrokeWidth={20}
                  inActiveStrokeWidth={20}
                  activeStrokeColor={
                    submodule.progress
                      ? getProgressColor(submodule.progress["completionPercentage"])
                      : "red"
                  }
                  progressValueStyle={{
                    fontWeight: "bold",
                    color: "#ccc",
                  }}
                />
                <TouchableOpacity
                  onPress={async () =>
                    await handleSubmodulePress(submodule, module)
                  }
                  style={{
                    height: 50,
                    width: 50,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name="play"
                    size={30}
                    color="black"
                    style={{
                      marginLeft: 20,
                    }}
                  />
                </TouchableOpacity>
              </View>
            )}

            <View
              style={{
                height: 1,
                backgroundColor: "#aaa",
                width: "90%",
                alignSelf: "center",
                marginTop: 10,
              }}
            />
          </View>
        ))
      ) : (
        <Text>No submodules found.</Text>
      )}
    </Animated.View>
  // <Animated.View
  //   {...panResponder.panHandlers}
  //   style={[darkStyles.container, { height: updatedSubmodules.length * 300, transform: [{ translateY }] }]}
  // >
  //   <View style={darkStyles.dragHandleWrapper}>
  //     <View style={darkStyles.dragHandle} />
  //   </View>
  //
  //   {sortedSubmodules.map((submodule, index) => (
  //     <View key={index} style={darkStyles.submoduleWrapper}>
  //       <View style={darkStyles.submoduleCard(windowWidth)}>
  //         <View style={{ marginRight: 15 }}>
  //           {getIconForSubmoduleType(submodule.type)}
  //         </View>
  //         <View style={{ flex: 1 }}>
  //           <Text style={darkStyles.title}>{submodule.name}</Text>
  //           <Text style={darkStyles.status}>
  //             Status: {submodule.progress.progressStatus}
  //           </Text>
  //         </View>
  //         <CircularProgress
  //           value={submodule.progress?.completionPercentage || 0}
  //           radius={30}
  //           inActiveStrokeOpacity={0.5}
  //           activeStrokeWidth={20}
  //           inActiveStrokeWidth={20}
  //           activeStrokeColor={getProgressColor(submodule.progress?.completionPercentage || 0)}
  //           progressValueStyle={darkStyles.progressStyle}
  //         />
  //         <TouchableOpacity
  //           onPress={async () => await handleSubmodulePress(submodule, module)}
  //           style={darkStyles.playButton}
  //         >
  //           <Ionicons name="play" size={30} color="#ffffff" />
  //         </TouchableOpacity>
  //       </View>
  //       <View style={darkStyles.divider} />
  //     </View>
  //   ))}
  // </Animated.View>

);
}
