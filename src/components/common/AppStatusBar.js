import React from 'react';
import { StatusBar } from 'react-native';
import { colors } from '../../constants/colors';

const AppStatusBar = ({ isAuthScreen = false }) => {
  return (
    <StatusBar
      backgroundColor={isAuthScreen ? colors.primary : colors.background}
      barStyle={isAuthScreen ? "light-content" : "dark-content"}
      translucent={false}
    />
  );
};

export default AppStatusBar; 