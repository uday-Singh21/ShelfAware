import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as StoreProvider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import NavigationStack from './navigation/NavigationStack';
import { theme } from './constants/theme';

const App = () => {
  return (
    // <StoreProvider store={{}}>
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <NavigationContainer>
            <NavigationStack />
          </NavigationContainer>
        </SafeAreaProvider>
      </PaperProvider>
    // </StoreProvider>
  );
};

export default App; 