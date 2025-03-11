import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Sign Up Function
export const signUp = async (email, password, username) => {
  console.log('Email:', email, 'Password:', password, 'Additional Info:', username);

  try {
    // Create user with email and password
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);

    const user = userCredential.user;

    // Add additional info to Firestore
    await firestore().collection('users').doc(user.uid).set({
      email: user.email,
      username: username || '',
      // phoneNumber: additionalInfo.phoneNumber || '',
      // profilePicture: additionalInfo.profilePicture || '',
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    console.log('User account created & additional info saved!');
    return userCredential;
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
};
