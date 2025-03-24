import { firebase } from "@react-native-firebase/auth";

export const updateUserLearningStyle = async (userUid, myLearningStyle) => {
  try {
    console.log(userUid, myLearningStyle);
    await firebase
    .firestore()
    .collection("users")
    .doc(userUid)
    .update({ myLearningStyle });
    console.log("User learning style updated successfully");
  } catch (error) {
    console.error("Error updating user learning style:", error);
    throw error;
  }
};
