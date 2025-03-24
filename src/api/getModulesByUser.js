import { firebase } from "@react-native-firebase/auth";

export const getModulesByUser = async (userId) => {
  console.log("User ID passed to getModulesByUser:", userId);

  try {
    const modulesSnapshot = await firebase
    .firestore()
    .collection("modules")
    .where("createdBy", "array-contains", userId)
    .get();

    const modules = modulesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log(`Modules created by user ${userId}:`, modules);
    return modules;
  } catch (error) {
    console.error("Error fetching modules by user:", error);
    throw error;
  }
};
