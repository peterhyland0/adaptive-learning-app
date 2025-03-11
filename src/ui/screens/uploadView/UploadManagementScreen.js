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
  PermissionsAndroid
} from "react-native";

import DocumentPicker from "react-native-document-picker";
import CustomBottomBar from "../../../components/CustomBottomBar";
import COLORS from "../../../constants/COLORS";
import Icon from "react-native-vector-icons/Ionicons";
import { SessionContext } from "../../../util/SessionContext";
import auth from "@react-native-firebase/auth";
import { getModulesByUser } from "../../../api/getModulesByUser";
import { getSubmodulesByModuleId } from "../../../api/getSubmodulesByModuleId";
import { getSubmoduleProgressByUser } from "../../../api/getSubmoduleProgressByUser";
import { downloadAudioFile } from "../../../util/downloadAudioFile";
import { launchCamera } from "react-native-image-picker";
import ml from "@react-native-firebase/ml";
import storage from "@react-native-firebase/storage";
import firestore from "@react-native-firebase/firestore";
import { Component } from "react";
function getFilenameFromUri(uri) {
  return uri.substring(uri.lastIndexOf('/') + 1);
}
export default class UploadManagementScreen extends Component {
  static contextType = SessionContext;

  constructor(props) {
    super(props);
    const windowDimensions = Dimensions.get("window");
    this.windowWidth = windowDimensions.width;
    this.windowHeight = windowDimensions.height;

    this.state = {
      files: [],
      isLoading: false,
      createCourse: false,
      successAnimation: new Animated.Value(0),
    };
  }

  // ------------------ Data Fetching Methods ------------------

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
        username: user.email,
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
    this.props.navigation.replace("Modules");
  };

  // ------------------ UI Animation ------------------

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

  // ------------------ File Selection ------------------

  selectFile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      // Immediately process image files
      res.forEach((file) => {
        if (
          (file.type && (file.type === "image/jpeg" || file.type === "image/png")) ||
          file.uri.match(/\.(jpg|jpeg|png)$/)
        ) {
          this.uploadImageAndWaitForExtractedText(file)
          .then((extractedText) => {
            console.log("OCR result:", extractedText);
            file.extractedText = extractedText;
            this.setState((prevState) => ({
              files: prevState.files.map((f) =>
                f.uri === file.uri ? { ...f, extractedText } : f
              )
            }));
          })
          .catch((err) =>
            console.error("Error processing OCR for selected file:", err)
          );
        }
      });
      this.setState({ files: [...this.state.files, ...res] });
      this.showSuccessAnimation();
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User canceled the picker
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

  // ------------------ Camera ------------------

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
          // Immediately trigger OCR for the captured image
          this.uploadImageAndWaitForExtractedText(newFile)
          .then((extractedText) => {
            console.log("OCR result from camera:", extractedText);
            newFile.extractedText = extractedText;
            this.setState((prevState) => ({
              files: [...prevState.files, newFile]
            }));
          })
          .catch((err) => {
            console.error("Error processing OCR for camera image:", err);
            // Even if OCR fails, still add the file
            this.setState((prevState) => ({
              files: [...prevState.files, newFile]
            }));
          });
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
        await this.takePhotoOrUploadImage();
      } else {
        Alert.alert("Permission Denied", "Camera permission is required to take photos.");
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // ------------------ Image Upload & OCR via Firebase Extension ------------------
  /**
   * Uploads an image file from the device to Firebase Storage and polls Firestore
   * for the extracted text. Assumes the Cloud Vision extension writes to the
   * "extractedText" collection using an ID that includes a timestamp and the original file name.
   */


  uploadImageAndWaitForExtractedText = async (file) => {
    // 1. Determine a file name and storage path
    // Use the 'uri' from the 'file' object
    const fileName = getFilenameFromUri(file.uri);
    const storageDestination = `images/${fileName}`;

    // 2. Upload the file to Firebase Storage
    const reference = storage().ref(storageDestination);

    console.log(`Uploading file to: ${storageDestination}`);
    await reference.putFile(file.uri);
    console.log('Upload complete!');

    // 3. Poll Firestore for the extracted text
    const docRef = firestore().collection('extractedText').doc(fileName);

    let extractedText = null;
    const timeoutSeconds = 200;  // Adjust as needed
    const pollInterval = 2000;   // in milliseconds
    const startTime = Date.now();

    console.log('Polling Firestore for extracted text...');
    while (!extractedText && (Date.now() - startTime) < timeoutSeconds * 1000) {
      const docSnap = await docRef.get();

      if (docSnap.exists) {
        const data = docSnap.data();
        // The extension might store text in 'extractedText' or 'text'
        extractedText = data.extractedText || data.text || null;

        if (extractedText) {
          console.log('Extracted text found!');
          return extractedText;
        }
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    console.warn('Timeout reached; no extracted text found.');
    return null;
  };

  // ------------------ Course Creation ------------------
  // In this version, course creation is separate.
  // The OCR for images is triggered immediately upon selection or capture.
  createCourse = async () => {
    const { files } = this.state;
    if (files.length === 0) {
      Alert.alert("No file selected", "Please select a file first!");
      return;
    }
    this.setState({ isLoading: true });
    try {
      console.log("Files ready for course creation:", files);
      await this.handlePostUpload(auth().currentUser.uid);
    } catch (error) {
      console.error("Error creating course:", error);
      Alert.alert("Error", "An error occurred while creating the course.");
    } finally {
      this.setState({ isLoading: false });
    }
  };

  // ------------------ Render ------------------

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
      <View style={{ flex: 1, backgroundColor: "white", alignItems: "center", justifyContent: "center" }}>
        <StatusBar backgroundColor="transparent" textColor="black" translucent barStyle="dark-content" />
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 20,
          }}
        >
          <Text style={{ fontSize: 24, marginBottom: 20 }}>Upload File</Text>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            {/* Select File Button */}
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
              <Icon name="checkmark-circle" size={this.windowWidth * 0.15} color="green" />
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
            <Text style={{ marginHorizontal: 10, fontSize: 16, color: "#aaa" }}>or</Text>
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
          {/* Display Selected Files */}
          <View style={{ marginBottom: 15, maxHeight: this.windowWidth * 0.9, backgroundColor: "#fff" }}>
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
                  <TouchableOpacity onPress={() => this.deleteFile(file.name)} style={{ position: "absolute", right: 0 }}>
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
      </View>
    );
  }
}
