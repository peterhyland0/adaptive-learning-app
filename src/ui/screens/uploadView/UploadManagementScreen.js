import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Modal,
  Platform
} from "react-native";

import DocumentPicker from "react-native-document-picker";
import CustomBottomBar from "../../../components/CustomBottomBar";
import COLORS from "../../../constants/COLORS";
import Icon from "react-native-vector-icons/Ionicons";
import uploadPDF from "../../../api/uploadFile";
import { SessionContext } from "../../../util/SessionContext";
import auth from "@react-native-firebase/auth";
import { getModulesByUser } from "../../../api/getModulesByUser";
import { getSubmodulesByModuleId } from "../../../api/getSubmodulesByModuleId";
import { getSubmoduleProgressByUser } from "../../../api/getSubmoduleProgressByUser";
import { downloadAudioFile } from "../../../util/downloadAudioFile";
import { launchCamera } from "react-native-image-picker"; // <-- Import camera picker
import FontAwesome from "react-native-vector-icons/FontAwesome";
import AntDesign from "react-native-vector-icons/AntDesign"
import LottieView from "lottie-react-native";
import AudioRecorderPlayer from "react-native-audio-recorder-player";
import RNFS from 'react-native-fs';
import uploadFile from "../../../api/uploadFile";

export default class UploadManagementScreen extends Component {
  static contextType = SessionContext;

  constructor(props) {
    super(props);
    const windowDimensions = Dimensions.get("window");
    this.windowWidth = windowDimensions.width;
    this.windowHeight = windowDimensions.height;

    this.audioRecorderPlayer = new AudioRecorderPlayer();

    this.state = {
      files: [],
      isLoading: false,
      createCourse: false,
      successAnimation: new Animated.Value(0),
      isRecordModalVisible: false,
      isRecording: false,
      recordSecs: 0,
      recordTime: "00:00"
    };
  }

  fetchProgressForSubmodules = async (submodules, userId) => {
    const submodulesWithData = await Promise.all(
      submodules.map(async (submodule) => {
        try {
          const progress = await getSubmoduleProgressByUser(userId, submodule.id);
          let localFileName = null;
          let localFilePath = null;
          if (submodule.style === "Podcast") {
            localFileName = `podcast-${submodule.id}.mp3`;
            localFilePath = await downloadAudioFile(submodule.lessonData, localFileName);
          }
          return {
            ...submodule,
            progress,
            localFileName,
            localFilePath,
          };
        } catch (error) {
          console.error(`Error fetching data for submodule ${submodule.id}:`, error);
          return {
            ...submodule,
            progress: null,
            localFileName: null,
            localFilePath: null,
          };
        }
      })
    );
    return submodulesWithData;
  };

  fetchSubmodulesForModules = async (modules, userId) => {
    const modulesWithSubmodules = await Promise.all(
      modules.map(async (module) => {
        try {
          const submodules = await getSubmodulesByModuleId(module.id);
          const submodulesWithProgressAndPodcasts = await this.fetchProgressForSubmodules(
            submodules,
            userId
          );
          return { ...module, submodules: submodulesWithProgressAndPodcasts };
        } catch (error) {
          console.error(`Error fetching submodules for module ${module.id}:`, error);
          return { ...module, submodules: [] };
        }
      })
    );
    return modulesWithSubmodules;
  };

  fetchUserModules = async (user) => {
    try {
      const token = await user.getIdToken();
      const modules = await getModulesByUser(user.uid);
      const modulesWithSubmodules = await this.fetchSubmodulesForModules(modules, user.uid);
      this.context.setSession({
        token,
        userUid: user.uid,
        // username: user.email,
        modules: modulesWithSubmodules,
      });
    } catch (error) {
      console.error("Error fetching modules:", error);
      Alert.alert("Error", "Failed to fetch user modules. Please try again later.");
      this.setState({ isLoading: false });
    }
  };

  handlePostUpload = async () => {
    await this.fetchUserModules(auth().currentUser);
    this.props.navigation.replace('Modules');
  };

  showSuccessAnimation = () => {
    Animated.sequence([
      Animated.timing(this.state.successAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(1000),
      Animated.timing(this.state.successAnimation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  selectFile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      this.setState({ files: [...this.state.files, ...res] });
      this.showSuccessAnimation();
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
      } else {
        console.error("File selection error:", err);
      }
    }
  };

  deleteFile = (fileName) => {
    this.setState({
      files: this.state.files.filter((file) => file.name !== fileName),
    });
  };

  takePhotoOrUploadImage = async () => {
    console.log("Open Camera & Take Photo pressed");
    const options = {
      mediaType: "photo",
      saveToPhotos: true,
      quality: 0.8,
    };

    await launchCamera(options, async (response) => {
      if (response.didCancel) {
        console.log("User cancelled camera");
      } else if (response.errorCode) {
        console.error("Camera error:", response.errorMessage);
      } else {
        const asset = response.assets && response.assets[0];
        if (asset) {
          const { uri, fileName, type } = asset;
          const newFile = {
            uri,
            name: fileName || "captured_photo.jpg",
            type: type || "image/jpeg",
          };
          this.setState((prevState) => ({
            files: [...prevState.files, newFile],
          }));
          this.showSuccessAnimation();
        }
      }
    });
  };

  requestCameraPermissionAndLaunch = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
          message: "This app needs access to your camera to take photos.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // If permission is granted, proceed to open the camera.
        await this.takePhotoOrUploadImage();
      } else {
        Alert.alert("Permission Denied", "Camera permission is required to take photos.");
      }
    } catch (err) {
      console.warn(err);
    }
  };
  createCourse = async () => {
    const { files } = this.state;
    if (files.length === 0) {
      Alert.alert("No file selected", "Please select a file first!");
      return;
    }

    this.setState({ isLoading: true });
    try {
      const formData = new FormData();
      formData.append("useruid", auth().currentUser.uid);

      files.forEach(file => {
        let mimeType = file.type;
        let fileName = file.name;

        if (!mimeType) {
          if (file.uri.match(/\.(jpg|jpeg)$/)) {
            mimeType = "image/jpeg";
            fileName = fileName || "uploaded_photo.jpg";
          } else if (file.uri.match(/\.png$/)) {
            mimeType = "image/png";
            fileName = fileName || "uploaded_photo.png";
          } else {
            mimeType = "application/pdf";
            fileName = fileName || "uploaded_file.pdf";
          }
        }

        formData.append("file", {
          uri: file.uri,
          type: mimeType,
          name: fileName,
        });
      });

      const data = await uploadFile(auth().currentUser.uid, files, this.context.session.user.submodulePreference);
      console.log("Files uploaded successfully!", data);
      await this.handlePostUpload(auth().currentUser.uid);
    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert("Error", "An error occurred while uploading the files.");
    } finally {
      this.setState({ isLoading: false });
    }
  };

  requestAudioPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const permissions = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);
        if (
          permissions["android.permission.RECORD_AUDIO"] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log("Audio permission granted");
        } else {
          Alert.alert("Permission Denied", "Microphone permission is required for recording.");
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      console.log("iOS: No runtime permission request required");
    }
  };

  toggleRecordModal = () => {
    this.setState(
      (prevState) => ({
        isRecordModalVisible: !prevState.isRecordModalVisible,
      }),
      () => {
        if (this.state.isRecordModalVisible) {
          this.requestAudioPermission();
        } else if (!this.state.isRecordModalVisible && this.state.isRecording) {
          this.controlSoundWave(); // Stop recording if modal closes while recording
        }
      }
    );
  };
  formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const paddedMins = mins < 10 ? `0${mins}` : mins;
    const paddedSecs = secs < 10 ? `0${secs}` : secs;
    return `${paddedMins}:${paddedSecs}`;
  };

  controlSoundWave = async () => {
    if (!this.state.isRecording) {
      const path = Platform.select({
        ios: `${RNFS.DocumentDirectoryPath}/recordedAudio.m4a`,
        android: `${RNFS.CachesDirectoryPath}/recordedAudio.mp4`,
      });
      try {
        const uri = await this.audioRecorderPlayer.startRecorder(path);
        this.audioRecorderPlayer.addRecordBackListener((e) => {
          this.setState({
            recordSecs: e.currentPosition,
            recordTime: this.formatTime(e.currentPosition / 1000),
          });
          return;
        });
        this.setState({ isRecording: true });
      } catch (error) {
        console.error("Error starting recorder:", error);
      }
    } else {
      try {
        // Stop recording and store the URI
        const uri = await this.audioRecorderPlayer.stopRecorder();
        this.audioRecorderPlayer.removeRecordBackListener();
        this.setState({ isRecording: false, recordedAudioUri: uri });
        console.log("Recording stopped, file saved at:", uri);
      } catch (error) {
        console.error("Error stopping recorder:", error);
      }
    }
  };

  doneRecording = async () => {
    const { recordedAudioUri } = this.state;
    if (recordedAudioUri) {
      const newFile = {
        uri: recordedAudioUri,
        name: Platform.OS === "android" ? "recordedAudio.mp4" : "recordedAudio.m4a",
        type: Platform.OS === "android" ? "audio/mp4" : "audio/m4a",
        size: 0,
      };
      this.setState((prevState) => ({
        files: [...prevState.files, newFile],
        isRecordModalVisible: false,
        recordedAudioUri: null,
        recordSecs: 0,
        recordTime: "00:00",
      }));
    } else {
      this.setState({ isRecordModalVisible: false });
    }
  };


  renderRecordSessionModal = () => {
    return (
      <Modal
        visible={this.state.isRecordModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={this.toggleRecordModal}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              width: this.windowWidth * 0.7,
              height: this.windowWidth * 0.5,
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
            }}
          >
            {/* Close Button */}
            <View style={{ alignItems: "flex-end" }}>
              <TouchableOpacity onPress={this.toggleRecordModal}>
                <AntDesign name={"close"} size={24} />
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Recording Time */}
              <Text style={{ marginRight: 10, fontSize: 16 }}>
                {this.state.recordTime}
              </Text>
              <LottieView
                source={require("../../../assets/animations/soundwave.json")}
                autoPlay={this.state.isRecording}
                loop={this.state.isRecording}
                style={{ width: 100, height: 100 }}
                speed={this.state.isRecording ? 1 : 0}
              />
              <TouchableOpacity
                onPress={this.controlSoundWave}
                style={{ marginLeft: 10 }}
              >
                <FontAwesome name="microphone" size={30} />
              </TouchableOpacity>
            </View>
            {/* Done Button */}
            <View
              style={{
                alignItems: "center"
              }}
            >
              <TouchableOpacity
                onPress={this.doneRecording}
                style={{
                  paddingVertical: 10,
                  backgroundColor: COLORS.MAROON,
                  borderRadius: 10,
                  width: this.windowWidth * 0.5
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                    textAlign: "center"
                  }}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    );
  };

  render() {
    const { isLoading, files, successAnimation } = this.state;
    if (isLoading) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={COLORS.MAROON} />
          <Text>Loading...</Text>
        </View>
      );
    }

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <StatusBar
          backgroundColor="transparent"
          textColor="black"
          translucent
          barStyle="dark-content"
        />
        <View style={{
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
          width: this.windowWidth,
          paddingTop: 50,
          paddingBottom: 20,
          backgroundColor: "#fff",
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 3,
        }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: COLORS.MAROON
            }}>
            Upload Content
          </Text>

        </View>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 20,
          }}
        >
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <TouchableOpacity
              style={{
                backgroundColor: "#f1f1f1",
                borderWidth: 1,
                borderColor: COLORS.MAROON,
                padding: 15,
                borderRadius: 25,
                marginBottom: 15,
                width: this.windowWidth * 0.7,
                height: this.windowWidth * 0.5,
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
              onPress={this.selectFile}
            >
              <Icon name="image-outline" size={24} color="#aaa" />
              <Text style={{ color: "#aaa", fontSize: 16 }}>Select File</Text>
            </TouchableOpacity>
            {/* Success Animation */}
            <Animated.View
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: this.windowWidth * 0.2,
                height: this.windowWidth * 0.2,
                borderRadius: this.windowWidth * 0.1,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "white",
                transform: [
                  { translateX: -this.windowWidth * 0.1 },
                  { translateY: -this.windowWidth * 0.1 },
                  { scale: successAnimation },
                ],
                opacity: successAnimation,
              }}
            >
              <Icon
                name="checkmark-circle"
                size={this.windowWidth * 0.15}
                color="green"
              />
            </Animated.View>
          </View>
          {/* Divider */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 10,
              width: this.windowWidth * 0.7,
            }}
          >
            <View style={{ flex: 1, height: 1, backgroundColor: "#aaa" }} />
            <Text style={{ marginHorizontal: 10, fontSize: 16, color: "#aaa" }}>
              or
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: "#aaa" }} />
          </View>
          <View>
            <TouchableOpacity
              onPress={this.toggleRecordModal}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                backgroundColor: COLORS.MAROON_LIGHT,
                borderRadius: 25,
                width: this.windowWidth * 0.7,
                height: this.windowWidth * 0.13,
                justifyContent: "center",
                flexDirection: "row",
                alignItems: "center",
              }}
            >

              <Text
                style={{
                  color: COLORS.MAROON,
                  fontSize: 16,
                  marginRight: this.windowWidth * 0.05
              }}>
                Record Session
              </Text>
              <FontAwesome
                name="microphone"
                size={20}
                color={COLORS.MAROON}
              />

            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 10,
              width: this.windowWidth * 0.7,
            }}
          >
            <View style={{ flex: 1, height: 1, backgroundColor: "#aaa" }} />
            <Text style={{ marginHorizontal: 10, fontSize: 16, color: "#aaa" }}>
              or
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: "#aaa" }} />
          </View>
          <TouchableOpacity
            style={{
              paddingVertical: 10,
              paddingHorizontal: 20,
              backgroundColor: COLORS.MAROON_LIGHT,
              borderRadius: 25,
              marginBottom: 20,
              width: this.windowWidth * 0.7,
              height: this.windowWidth * 0.13,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={this.requestCameraPermissionAndLaunch}
          >
            <Text style={{ color: COLORS.MAROON, fontSize: 16 }}>
              Open Camera & Take Photo
            </Text>
          </TouchableOpacity>
          <View
            style={{
              marginBottom: 15,
              maxHeight: this.windowWidth * 0.9,
              backgroundColor: "#fff",
            }}
          >
            <ScrollView style={{ maxHeight: this.windowWidth * 0.5 }}>
              {files.map((file, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 10,
                    width: this.windowWidth * 0.7,
                  }}
                >
                  <Text
                    style={{
                      marginRight: 10,
                      flex: 1,
                      flexWrap: "wrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    numberOfLines={1}
                  >
                    {file.name || "Unnamed"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => this.deleteFile(file.name)}
                    style={{ position: "absolute", right: 0 }}
                  >
                    <Icon name="close-circle" size={24} color="grey" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
        {/* Upload File Button */}
        <TouchableOpacity
          style={{
            position: "absolute",
            bottom: 20,
            backgroundColor: COLORS.MAROON,
            padding: 15,
            borderRadius: 25,
            width: this.windowWidth * 0.7,
            height: this.windowWidth * 0.13,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 60,
          }}
          onPress={this.createCourse}
        >
          <Text style={{ color: "white", fontSize: 16 }}>Create Course</Text>
        </TouchableOpacity>
        <CustomBottomBar navigation={this.props.navigation} activeTab="Upload" />
        {this.renderRecordSessionModal()}
      </View>
    );
  }
}
