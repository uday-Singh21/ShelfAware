import React, {useState} from 'react';
import {StyleSheet, View, Keyboard} from 'react-native';
import {TextInput, Button, Text, Surface} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors} from '../../constants/colors';
import {signUp} from '../../services/auth';
import ErrorMessage from '../../components/common/ErrorMessage';
import {fonts} from '../../constants/fonts';

const SignUpScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return false;
    }
    if (!password) {
      setError('Please enter your password');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    Keyboard.dismiss();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');
      await signUp(email.trim().toLowerCase(), password);
      navigation.navigate('EmailVerification', {
        email: email.trim().toLowerCase(),
      });
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
            Create Account
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Join ShelfAware to manage your inventory efficiently
          </Text>
        </View>

        <Surface style={styles.form} elevation={4}>
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

          <TextInput
            label="Password"
            value={password}
            onChangeText={text => {
              setPassword(text);
              setError('');
            }}
            secureTextEntry={!showPassword}
            style={styles.input}
            error={error && !password}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            mode="outlined"
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
          />

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={text => {
              setConfirmPassword(text);
              setError('');
            }}
            secureTextEntry={!showConfirmPassword}
            style={styles.input}
            error={error && !confirmPassword}
            left={<TextInput.Icon icon="lock-check" />}
            right={
              <TextInput.Icon
                icon={showConfirmPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
            mode="outlined"
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
          />

          <ErrorMessage message={error} />

          <Button
            mode="contained"
            onPress={handleSignUp}
            loading={loading}
            // disabled={loading || !email.trim() || !password || !confirmPassword}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}>
            Sign Up
          </Button>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Button
              mode="text"
              onPress={() => {
                setError('');
                navigation.navigate('SignIn');
              }}
              textColor={colors.primary}
              style={styles.signInButton}>
              Sign In
            </Button>
          </View>
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
});

export default SignUpScreen;
