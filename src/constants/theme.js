import { colors } from './colors';
import { MD3LightTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  customVariant: {
    fontFamily: 'System',
    fontWeight: '400',
  },
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...colors,
  },
  fonts: configureFonts({
    config: {
      ...fontConfig,
    },
  }),
  roundness: 4,
  isV3: true, // This is important for MD3 theme
};