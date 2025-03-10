import auth from '@react-native-firebase/auth';

export const signUp = async (email, password) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    await userCredential.user.sendEmailVerification();
    // Don't sign out immediately - let the verification screen handle the state
    return userCredential.user;
  } catch (error) {
    console.error('Sign up error:', error);
    let errorMessage = 'Failed to create account. Please try again.';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Email address is already in use';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak';
    }
    throw new Error(errorMessage);
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
    console.error('Sign in error:', error);
    let errorMessage = 'Failed to sign in. Please try again.';
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      errorMessage = 'Invalid email or password';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    }
    throw new Error(errorMessage);
  }
};

export const signOut = async () => {
  try {
    await auth().signOut();
  } catch (error) {
    console.error('Sign out error:', error);
    throw new Error('Failed to sign out. Please try again.');
  }
};

export const resetPassword = async (email) => {
  try {
    await auth().sendPasswordResetEmail(email);
  } catch (error) {
    console.error('Password reset error:', error);
    let errorMessage = 'Failed to send reset email. Please try again.';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email address';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    }
    throw new Error(errorMessage);
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