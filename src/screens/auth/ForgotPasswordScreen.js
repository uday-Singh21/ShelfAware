import React, {useState} from 'react';
import {StyleSheet, View, Keyboard} from 'react-native';
import {TextInput, Button, Text, Surface} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors} from '../../constants/colors';
import {resetPassword} from '../../services/auth';
import ErrorMessage from '../../components/common/ErrorMessage';
import {fonts} from '../../constants/fonts';

const ForgotPasswordScreen = ({navigation}) => {
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
    <View style={[styles.container, {backgroundColor: colors.primary}]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text variant="displaySmall" style={styles.title}>
            Reset Password
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Enter your email to receive reset instructions
          </Text>
        </View>

        <Surface style={styles.form} elevation={4}>
          {success ? (
            <>
              <Text style={styles.successText}>
                Password reset instructions have been sent to your email.
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('SignIn')}
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}>
                Back to Sign In
              </Button>
            </>
          ) : (
            <>
              <TextInput
                label="Email"
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  setError('');
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
                error={error && !email.trim()}
                left={<TextInput.Icon icon="email" />}
                mode="outlined"
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
              />

              <ErrorMessage message={error} />

              <Button
                mode="contained"
                onPress={handleResetPassword}
                loading={loading}
                disabled={loading || !email.trim()}
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}>
                Send Reset Instructions
              </Button>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Remember your password?</Text>
                <Button
                  mode="text"
                  onPress={() => navigation.goBack()}
                  textColor={colors.primary}
                  style={styles.signInButton}>
                  Sign In
                </Button>
              </View>
            </>
          )}
        </Surface>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  title: {
    color: colors.surface,
    fontFamily: fonts.bold,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.surface,
    opacity: 0.8,
    fontFamily: fonts.regular,
  },
  form: {
    margin: 20,
    padding: 20,
    borderRadius: 15,
    backgroundColor: colors.surface,
  },
  input: {
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
    elevation: 2,
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 10,
    color: colors.text,
    opacity: 0.6,
    fontFamily: fonts.regular,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: colors.text,
    fontFamily: fonts.regular,
  },
  signInButton: {
    marginLeft: 4,
  },
  successText: {
    textAlign: 'center',
    marginBottom: 24,
    color: colors.success,
    fontFamily: fonts.medium,
  },
});

export default ForgotPasswordScreen;
