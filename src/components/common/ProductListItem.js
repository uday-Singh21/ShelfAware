import React from 'react';
import { StyleSheet } from 'react-native';
import { List, Surface } from 'react-native-paper';
import { colors } from '../../constants/colors';

const ProductListItem = ({ product, onPress }) => {
  const daysUntilExpiry = Math.ceil((new Date(product.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  
  return (
    <Surface style={styles.surface} elevation={1}>
      <List.Item
        title={product.name}
        description={`Expires in ${daysUntilExpiry} days`}
        left={props => <List.Icon {...props} icon="package" />}
        right={props => <List.Icon {...props} icon="chevron-right" />}
        onPress={onPress}
      />
    </Surface>
  );
};

const styles = StyleSheet.create({
  surface: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
});

export default ProductListItem; 