import React from 'react';
import { StyleSheet, View } from 'react-native';
import { List, Surface, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../constants/colors';

const CATEGORY_ICONS = {
  'Dairy': 'cheese',
  'Meat': 'food-steak',
  'Vegetables': 'carrot',
  'Fruits': 'fruit-cherries',
  'Beverages': 'cup',
  'Snacks': 'cookie',
  'Canned Goods': 'food-can',
  'Medicine': 'pill',
  'Cosmetics': 'spray',
  'Other': 'package-variant',
};

const getExpiryColor = (daysUntilExpiry) => {
  if (daysUntilExpiry <= 0) return colors.error;
  if (daysUntilExpiry <= 7) return colors.warning;
  return colors.success;
};

const ProductListItem = ({ product, onPress, showExpiryStatus }) => {
  if (!product) return null;

  const {
    name,
    category = 'Other',
    expiryDate,
    daysUntilExpiry,
    isExpired,
    isExpiringSoon
  } = product;

  const icon = CATEGORY_ICONS[category] || 'package-variant';
  const expiryColor = getExpiryColor(daysUntilExpiry);
  
  const getExpiryText = () => {
    if (isExpired) return 'Expired';
    return `Expires in ${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'day' : 'days'}`;
  };

  return (
    <Surface style={styles.surface} elevation={1}>
      <List.Item
        title={name}
        description={showExpiryStatus ? getExpiryText() : undefined}
        descriptionStyle={{ color: expiryColor }}
        left={props => (
          <View style={[styles.iconContainer, showExpiryStatus && { backgroundColor: colors.surface }]}>
            <Icon name={icon} size={24} color={colors.primary} />
          </View>
        )}
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
    backgroundColor: colors.surface,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderRadius: 20,
  },
});

export default ProductListItem; 