import { firebase } from "@react-native-firebase/auth";

export const updateSubmodulePreferences = async (userUid, submodulePreferences) => {
  try {
    console.log(userUid, submodulePreferences);
    await firebase
    .firestore()
    .collection("users")
    .doc(userUid)
    .update({ submodulePreferences });
    console.log("User learning style updated successfully");
  } catch (error) {
    console.error("Error updating user learning style:", error);
    throw error;
  }
};
