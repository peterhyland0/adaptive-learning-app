import { firebase } from "@react-native-firebase/auth";
import '@react-native-firebase/firestore';

export const getSubmoduleProgressByUser = async (userId, submoduleId) => {
  console.log('User ID passed:', userId, submoduleId);

  try {
    const submoduleProgressSnapshot = await firebase
    .firestore()
    .collection('userProgress')  // Reference to 'userProgress' collection
    .doc(userId)  // Query specific document by userId
    .collection('submoduleProgress')  // Reference to submoduleProgress collection within the user's document
    .doc(submoduleId)  // Get specific submodule progress using submoduleId
    .get();  // Fetch the document snapshot

    if (!submoduleProgressSnapshot.exists) {
      console.log('No submodule progress found');
      return null;  // Return null if no progress is found for this submodule
    }

    const progress = submoduleProgressSnapshot.data();  // Extract progress data from snapshot
    console.log(`Submodule progress for submoduleId ${submoduleId}:`, progress);
    return progress;  // Return the progress data

  } catch (error) {
    console.error('Error fetching submodule progress:', error);
    throw error;  // Rethrow error to handle it in the calling function
  }
};
