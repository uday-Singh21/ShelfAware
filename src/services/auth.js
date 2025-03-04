import auth from '@react-native-firebase/auth';

export const signUp = async (email, password) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    await userCredential.user.sendEmailVerification();
    // Don't sign out immediately - let the verification screen handle the state
    return userCredential.user;
  } catch (error) {
    throw handleAuthError(error);
  }
};

export const signIn = async (email, password) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    if (!userCredential.user.emailVerified) {
      // If email isn't verified, send another verification email and throw error
      await userCredential.user.sendEmailVerification();
      await auth().signOut();
      throw new Error('Please verify your email before signing in. A new verification email has been sent.');
    }
    return userCredential.user;
  } catch (error) {
    throw handleAuthError(error);
  }
};

export const signOut = async () => {
  try {
    await auth().signOut();
  } catch (error) {
    throw handleAuthError(error);
  }
};

export const resetPassword = async (email) => {
  try {
    await auth().sendPasswordResetEmail(email);
  } catch (error) {
    throw handleAuthError(error);
  }
};

export const resendVerificationEmail = async () => {
  try {
    const user = auth().currentUser;
    if (user) {
      await user.sendEmailVerification();
    } else {
      throw new Error('No user is currently signed in');
    }
  } catch (error) {
    throw handleAuthError(error);
  }
};

export const checkEmailVerification = async () => {
  try {
    const user = auth().currentUser;
    if (user) {
      await user.reload();
      return user.emailVerified;
    }
    return false;
  } catch (error) {
    throw handleAuthError(error);
  }
};

const handleAuthError = (error) => {
  let message = 'An error occurred. Please try again.';
  
  switch (error.code) {
    case 'auth/invalid-email':
      message = 'Invalid email address';
      break;
    case 'auth/user-disabled':
      message = 'This account has been disabled';
      break;
    case 'auth/user-not-found':
      message = 'No account found with this email';
      break;
    case 'auth/wrong-password':
      message = 'Invalid password';
      break;
    case 'auth/email-already-in-use':
      message = 'An account already exists with this email';
      break;
    case 'auth/weak-password':
      message = 'Password is too weak';
      break;
    case 'auth/too-many-requests':
      message = 'Too many attempts. Please try again later';
      break;
    default:
      if (error.message) {
        message = error.message;
      }
  }
  
  return new Error(message);
}; 