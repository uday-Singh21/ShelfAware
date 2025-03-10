import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import NavigationStack from './navigation/NavigationStack';
import { theme } from './constants/theme';
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import { initializeNotifications } from './services/notifications';
import { NotificationProvider } from './contexts/NotificationContext';
import SplashScreen from "react-native-splash-screen";


// Initialize Firebase if it hasn't been initialized yet
if (!firebase.apps.length) {
  firebase.initializeApp();
}

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const navigationRef = useRef();

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide(); // Hide splash screen after a delay
    }, 2000);
  }, []);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async (user) => {
      setUser(user);
      
      if (user && navigationRef.current) {
        try {
          // Initialize notifications when user logs in
          await initializeNotifications(user.uid, navigationRef.current);
        } catch (error) {
          console.error('Failed to initialize notifications:', error);
        }
      }
      
      if (initializing) setInitializing(false);
    });
    
    return subscriber;
  }, [initializing]);

  if (initializing) return null;

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <NotificationProvider>
          <NavigationContainer ref={navigationRef}>
            <NavigationStack isAuthenticated={!!user} />
          </NavigationContainer>
        </NotificationProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

export default App; 