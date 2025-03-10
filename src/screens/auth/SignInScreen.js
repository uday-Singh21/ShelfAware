import React, {useState} from 'react';
import {StyleSheet, View, Keyboard, Image} from 'react-native';
import {TextInput, Button, Text, Surface, IconButton} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors} from '../../constants/colors';
import {signIn} from '../../services/auth';
import ErrorMessage from '../../components/common/ErrorMessage';
import {fonts} from '../../constants/fonts';

const SignInScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return false;
    }
    if (!password) {
      setError('Please enter your password');
      return false;
    }
    return true;
  };

  const handleSignIn = async () => {
    Keyboard.dismiss();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');
      await signIn(email.trim().toLowerCase(), password);
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
            Welcome Back
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Sign in to continue managing your inventory
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

          <ErrorMessage message={error} />

          <Button
            mode="contained"
            onPress={handleSignIn}
            loading={loading}
            // disabled={loading || !email.trim() || !password}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}>
            Sign In
          </Button>

          <Button
            mode="text"
            onPress={() => {
              setError('');
              navigation.navigate('ForgotPassword');
            }}
            style={styles.textButton}
            textColor={colors.text}>
            Forgot Password?
          </Button>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Button
              mode="text"
              onPress={() => {
                setError('');
                navigation.navigate('SignUp');
              }}
              textColor={colors.primary}
              style={styles.signUpButton}>
              Sign Up
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
    color: '#fff',
    fontFamily: fonts.bold,
    marginBottom: 8,
  },
  subtitle: {
    color: '#fff',
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
  textButton: {
    marginTop: 8,
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
  signUpButton: {
    marginLeft: 4,
  },
});

export default SignInScreen;
