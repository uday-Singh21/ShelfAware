import React, { useState } from 'react';
import { StyleSheet, Keyboard } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';
import { resetPassword } from '../../services/auth';
import ErrorMessage from '../../components/common/ErrorMessage';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return false;
    }
    return true;
  };

  const handleResetPassword = async () => {
    Keyboard.dismiss();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');
      await resetPassword(email.trim().toLowerCase());
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.form}>
        <Text variant="headlineMedium" style={styles.title}>Reset Password</Text>
        
        {success ? (
          <>
            <Text style={styles.successText}>
              Password reset instructions have been sent to your email.
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('SignIn')}
              style={styles.button}
            >
              Back to Sign In
            </Button>
          </>
        ) : (
          <>
            <Text style={styles.description}>
              Enter your email address and we'll send you instructions to reset your password.
            </Text>

            <TextInput
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              error={error && !email.trim()}
            />

            <ErrorMessage message={error} />

            <Button
              mode="contained"
              onPress={handleResetPassword}
              loading={loading}
              disabled={loading || !email.trim()}
              style={styles.button}
            >
              Send Reset Instructions
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.goBack()}
              style={styles.textButton}
            >
              Back to Sign In
            </Button>
          </>
        )}
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
  form: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    color: colors.primary,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    color: colors.disabled,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
  textButton: {
    marginTop: 8,
  },
  successText: {
    textAlign: 'center',
    marginBottom: 24,
    color: colors.success,
  },
});

export default ForgotPasswordScreen; 