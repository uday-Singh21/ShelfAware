import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Surface, Text, IconButton} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors} from '../../constants/colors';
import {fonts} from '../../constants/fonts';

const getExpiryColor = daysUntilExpiry => {
  if (daysUntilExpiry <= 0) return colors.error;
  if (daysUntilExpiry <= 7) return colors.warning;
  return colors.success;
};

const ProductCard = ({product, onPress, onMorePress}) => {
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

  const daysUntilExpiry = Math.ceil(
    (expiryDate - Date.now()) / (1000 * 60 * 60 * 24),
  );
  const expiryColor = getExpiryColor(daysUntilExpiry);

  return (
    <Surface style={styles.card} elevation={4}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text variant="titleMedium" style={styles.title}>
              {name}
            </Text>
            <Text variant="bodySmall" style={styles.category}>
              {category}
            </Text>
          </View>
          <IconButton
            icon="dots-vertical"
            size={20}
            onPress={event => onMorePress(event)}
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
            <Text style={[styles.detailText, {color: expiryColor}]}>
              {daysUntilExpiry <= 0
                ? 'Expired'
                : `Expires in ${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'day' : 'days'}`}
            </Text>
          </View>

          {notes && (
            <View style={styles.detailRow}>
              <Icon name="text" size={16} color={colors.primary} />
              <Text style={styles.detailText} numberOfLines={2}>
                {notes}
              </Text>
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
    backgroundColor: colors.card,
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
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  category: {
    color: colors.primary,
    marginTop: 2,
    fontFamily: fonts.regular,
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
    fontFamily: fonts.regular,
  },
});

export default ProductCard;
