import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import { colors } from '../constants/colors';

const Stack = createStackNavigator();

const AuthStack = () => {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem('hasSeenOnboarding');
      setHasSeenOnboarding(value === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasSeenOnboarding(false);
    }
  };

  if (hasSeenOnboarding === null) {
    return null; // Or a loading screen
  }

  return (
    <>
      <StatusBar
        backgroundColor={colors.primary}
        barStyle="light-content"
      />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName={hasSeenOnboarding ? 'SignIn' : 'Onboarding'}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
      </Stack.Navigator>
    </>
  );
};

export default AuthStack; 