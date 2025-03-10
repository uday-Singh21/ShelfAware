import { StyleSheet } from 'react-native';
import { fonts } from './fonts';
import { colors } from './colors';

export const typography = StyleSheet.create({
  h1: {
    fontFamily: fonts.bold,
    fontSize: 32,
    lineHeight: 40,
    color: colors.text,
  },
  h2: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    lineHeight: 32,
    color: colors.text,
  },
  h3: {
    fontFamily: fonts.medium,
    fontSize: 20,
    lineHeight: 28,
    color: colors.text,
  },
  subtitle1: {
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  subtitle2: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
  },
  body1: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  body2: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
  },
  button: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
    color: colors.text,
  },
  caption: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.disabled,
  },
  overline: {
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.disabled,
  },
}); 