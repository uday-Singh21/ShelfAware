import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Chip, Text, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../constants/colors';
import ProductListItem from '../../components/common/ProductListItem';

const FILTER_OPTIONS = ['All', 'Expired', 'Expiring Soon'];

const ExpiredProductsScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [products] = useState([]); // Replace with actual products

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Expiring Items" />
        <Appbar.Action icon="filter-variant" onPress={() => {}} />
      </Appbar.Header>

      <View style={styles.filterContainer}>
        {FILTER_OPTIONS.map((filter) => (
          <Chip
            key={filter}
            selected={selectedFilter === filter}
            onPress={() => setSelectedFilter(filter)}
            style={styles.chip}
            mode="outlined"
          >
            {filter}
          </Chip>
        ))}
      </View>

      <ScrollView>
        {products.length > 0 ? (
          products.map((product) => (
            <ProductListItem
              key={product.id}
              product={product}
              onPress={() => {}}
            />
          ))
        ) : (
          <Surface style={styles.emptyState}>
            <Icon 
              name="calendar-check-outline" 
              size={64} 
              color={colors.disabled}
            />
            <Text style={styles.emptyText}>
              No expired items found
            </Text>
          </Surface>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  chip: {
    marginRight: 8,
  },
  emptyState: {
    margin: 16,
    padding: 32,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  emptyText: {
    marginTop: 16,
    color: colors.disabled,
    fontSize: 16,
  },
});

export default ExpiredProductsScreen; 