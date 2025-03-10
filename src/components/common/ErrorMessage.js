import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../../constants/colors';
import { fonts } from '../../constants/fonts';

const ErrorMessage = ({ message }) => {
  if (!message) return null;
  
  return (
    <Text style={styles.error}>{message}</Text>
  );
};

const styles = StyleSheet.create({
  error: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
    fontFamily: fonts.medium,
  },
});

export default ErrorMessage; 