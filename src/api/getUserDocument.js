import firestore from '@react-native-firebase/firestore';

export async function getUserDocument(uid) {
  try {
    const userDoc = await firestore().collection('users').doc(uid).get();
    if (userDoc.exists) {
      return userDoc.data();
    } else {
      throw new Error('User document not found');
    }
  } catch (error) {
    console.error('Error fetching user document:', error);
    throw error;
  }
}
