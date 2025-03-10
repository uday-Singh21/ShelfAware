import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';
import { resendVerificationEmail } from '../../services/auth';
import ErrorMessage from '../../components/common/ErrorMessage';
import auth from '@react-native-firebase/auth';
import { fonts } from '../../constants/fonts';

const EmailVerificationScreen = ({ route, navigation }) => {
  const { email } = route.params;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    let unsubscribe;
    // Check verification status every 3 seconds
    const checkVerification = async () => {
      try {
        const currentUser = auth().currentUser;
        if (currentUser) {
          // Reload user data to get latest emailVerified status
          await currentUser.reload();
          if (currentUser.emailVerified) {
            setIsVerified(true);
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error('Error checking verification status:', err);
      }
    };

    const interval = setInterval(checkVerification, 3000);

    // Cleanup interval on unmount
    return () => {
      clearInterval(interval);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleResendEmail = async () => {
    try {
      setLoading(true);
      setError('');
      await resendVerificationEmail();
      setResendSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isVerified) {
    return (
      <SafeAreaView style={styles.container}>
        <Surface style={styles.content}>
          <Text variant="headlineMedium" style={styles.title}>Email Verified!</Text>
          <Text style={styles.successText}>
            Your email has been successfully verified.
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('SignIn')}
            style={styles.button}
          >
            Continue to Sign In
          </Button>
        </Surface>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>Verify Your Email</Text>
        
        <Text style={styles.description}>
          We've sent a verification email to:
        </Text>
        <Text style={styles.email}>{email}</Text>
        
        <View style={styles.steps}>
          <Text style={styles.stepsTitle}>Follow these steps:</Text>
          <Text style={styles.step}>1. Open your email app</Text>
          <Text style={styles.step}>2. Check your inbox (and spam folder)</Text>
          <Text style={styles.step}>3. Click the verification link in our email</Text>
          <Text style={styles.step}>4. Return to this app after verification</Text>
        </View>

        <Text style={styles.description}>
          Once verified, you'll be able to sign in to your account.
        </Text>

        <ErrorMessage message={error} />
        
        {resendSuccess && (
          <Text style={styles.successText}>
            Verification email has been resent successfully!
          </Text>
        )}

        <Text style={styles.smallText}>
          Didn't receive the email?
        </Text>
        <Button
          mode="contained"
          onPress={handleResendEmail}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Resend Verification Email
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('SignIn')}
          style={styles.textButton}
        >
          Back to Sign In
        </Button>
      </Surface>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  content: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    color: colors.primary,
    fontFamily: fonts.bold,
  },
  description: {
    textAlign: 'center',
    marginBottom: 16,
    color: colors.disabled,
    fontFamily: fonts.regular,
  },
  email: {
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  button: {
    marginTop: 24,
    paddingVertical: 6,
  },
  textButton: {
    marginTop: 8,
  },
  successText: {
    textAlign: 'center',
    marginBottom: 16,
    color: colors.success,
    fontFamily: fonts.medium,
  },
  steps: {
    marginVertical: 16,
    paddingHorizontal: 8,
  },
  stepsTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: 8,
  },
  step: {
    color: colors.text,
    marginBottom: 8,
    paddingLeft: 8,
    fontFamily: fonts.regular,
  },
  smallText: {
    textAlign: 'center',
    color: colors.disabled,
    marginTop: 24,
    marginBottom: 8,
    fontFamily: fonts.regular,
  },
});

export default EmailVerificationScreen; 