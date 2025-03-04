import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Surface, Text, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../constants/colors';

const getExpiryColor = (daysUntilExpiry) => {
  if (daysUntilExpiry <= 0) return colors.error;
  if (daysUntilExpiry <= 7) return colors.warning;
  return colors.success;
};

const ProductCard = ({ product, onPress }) => {
  // Ensure we have all required data
  if (!product) return null;

  const {
    name,
    quantity = 0,
    unit = '',
    category = '',
    notes = '',
    expiryDate = 0,
  } = product;

  const daysUntilExpiry = Math.ceil((expiryDate - Date.now()) / (1000 * 60 * 60 * 24));
  const expiryColor = getExpiryColor(daysUntilExpiry);

  return (
    <Surface style={styles.card} elevation={2}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text variant="titleMedium" style={styles.title}>{name}</Text>
            <Text variant="bodySmall" style={styles.category}>{category}</Text>
          </View>
          <IconButton
            icon="dots-vertical"
            size={20}
            onPress={() => onPress(product)}
          />
        </View>
        
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Icon name="package-variant" size={16} color={colors.primary} />
            <Text style={styles.detailText}>
              {quantity} {unit}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Icon name="calendar" size={16} color={expiryColor} />
            <Text style={[styles.detailText, { color: expiryColor }]}>
              {daysUntilExpiry <= 0 
                ? 'Expired'
                : `Expires in ${daysUntilExpiry} days`}
            </Text>
          </View>

          {notes && (
            <View style={styles.detailRow}>
              <Icon name="text" size={16} color={colors.primary} />
              <Text style={styles.detailText} numberOfLines={2}>{notes}</Text>
            </View>
          )}
        </View>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
  },
  category: {
    color: colors.primary,
    marginTop: 2,
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
});

export default ProductCard; 