import { colors } from '../../constants/colors';

const EmptyState = ({ icon, message }) => {
  return (
    <View style={styles.container}>
      <Icon name={icon} size={64} color={colors.disabled} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  message: {
    marginTop: 16,
    color: colors.disabled,
    fontSize: 16,
  },
}); 