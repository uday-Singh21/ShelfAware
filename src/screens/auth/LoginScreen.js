import { colors } from '../../constants/colors';
import { StatusBar } from 'react-native';

const LoginScreen = () => {
  
  return (
    <SafeAreaView style={styles.container}>
      <Surface style={styles.form}>
        <TextInput
          style={styles.input}
          // ... other props
        />
        {/* ... */}
      </Surface>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  form: {
    backgroundColor: colors.surface,
    // ... other styles
  },
}); 