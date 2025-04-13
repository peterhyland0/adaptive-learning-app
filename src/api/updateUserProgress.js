import firestore from "@react-native-firebase/firestore";  // Use the correct Firebase library

export const updateUserProgress = async (submodulesData, moduleId, createdBy) => {
  if (!Array.isArray(submodulesData)) {
    throw new Error("submodulesData must be an array.");
  }

  const batch = firestore().batch();
  console.log("Attempting progress update...");

  try {
    submodulesData.forEach((submodule) => {
      const userProgressDocRef = firestore()
      .collection("userProgress")
      .doc(createdBy)
      .collection("submoduleProgress")
      .doc(submodule.id);
      batch.set(userProgressDocRef, {
        completionPercentage: submodule.completionPercentage,
        lastUpdated: submodule.lastUpdated,
        completionDate: submodule.completionDate,
        progressStatus: submodule.progressStatus,
      }, { merge: true });
    });

    await batch.commit();
    console.log("Progress successfully updated in Firestore.");
  } catch (error) {
    console.error("Error updating progress:", error);
    throw error;
  }
};
