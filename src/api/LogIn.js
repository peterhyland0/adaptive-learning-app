import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Login Function
export const login = async (email, password) => {
  console.log('Attempting to log in with:', email, password);

  try {
    // Sign in with email and password
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    const user = userCredential.user;
    console.log(user);

    // Fetch user data from Firestore
    const userDoc = await firestore().collection('users').doc(user.uid).get();

    // if (!userDoc.exists) {
    //   throw new Error('User not found in Firestore.');
    // }

    // const userData = userDoc.data();

    // console.log('User logged in successfully:', userData);

    return {
      uid: user.uid,
      email: user.email,
      // username: userData.username,
    };
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};
