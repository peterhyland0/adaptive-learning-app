import firestore from '@react-native-firebase/firestore';

export const getSubmodulesByModuleId = async (moduleId) => {
  try {
    const submodulesSnapshot = await firestore()
    .collection('submodules')
    .where('moduleId', '==', moduleId)
    .get();

    const submodules = submodulesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return submodules;
  } catch (error) {
    throw new Error('Error fetching submodules: ' + error.message);
  }
};
