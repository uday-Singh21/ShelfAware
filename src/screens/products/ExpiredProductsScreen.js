import React, {useState, useEffect, useCallback} from 'react';
import {View, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Alert} from 'react-native';
import {Appbar, Chip, Text, Surface} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors} from '../../constants/colors';
import ProductListItem from '../../components/common/ProductListItem';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import moment from 'moment';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';

const FILTER_OPTIONS = ['All', 'Expired', 'Expiring Soon'];
const EXPIRING_SOON_DAYS = 7; // Products expiring in 7 days are considered "expiring soon"

const ExpiredProductsScreen = ({navigation}) => {
  const tabBarHeight = useBottomTabBarHeight();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const userId = auth().currentUser?.uid;
      if (!userId) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      console.log('Fetching products for user:', userId);
      const snapshot = await firestore()
        .collection('products')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .orderBy('expiryDate', 'asc')
        .get();

      console.log('Number of products fetched:', snapshot.docs.length);
      const fetchedProducts = snapshot.docs.map(doc => {
        const data = doc.data();
        const expiryDate = data.expiryDate?.toDate();
        
        // Debug raw data
        console.log('Raw product data:', {
          name: data.name,
          rawExpiryDate: data.expiryDate,
          convertedExpiryDate: expiryDate,
        });

        // Use start of day for both dates
        const today = moment().startOf('day');
        const expiryMoment = moment(expiryDate).startOf('day');
        const daysUntilExpiry = expiryMoment.diff(today, 'days');
        
        // Debug dates
        console.log('Date calculations:', {
          today: today.format('YYYY-MM-DD'),
          expiryDate: expiryMoment.format('YYYY-MM-DD'),
          daysUntilExpiry,
        });

        const product = {
          id: doc.id,
          ...data,
          expiryDate: expiryDate,
          daysUntilExpiry,
          isExpired: daysUntilExpiry <= 0,
          isExpiringSoon: daysUntilExpiry > 0 && daysUntilExpiry <= EXPIRING_SOON_DAYS,
        };

        // Debug final product state
        console.log('Final product state:', {
          name: product.name,
          daysUntilExpiry: product.daysUntilExpiry,
          isExpired: product.isExpired,
          isExpiringSoon: product.isExpiringSoon
        });

        return product;
      });

      console.log('Total products processed:', fetchedProducts.length);
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, [fetchProducts]);

  const getFilteredProducts = () => {
    console.log('Filtering products. Total products:', products.length, 'Current filter:', selectedFilter);
    let filtered;
    switch (selectedFilter) {
      case 'Expired':
        filtered = products.filter(product => product.isExpired);
        break;
      case 'Expiring Soon':
        filtered = products.filter(product => product.isExpiringSoon);
        break;
      default:
        filtered = products.filter(product => product.isExpired || product.isExpiringSoon);
    }
    console.log('Filtered products count:', filtered.length);
    return filtered;
  };

  const handleProductPress = (product) => {
    // navigation.navigate('ProductInput', {
    //   product,
    //   isEditing: true,
    // });
  };

  const filteredProducts = getFilteredProducts();

  const renderItem = ({item}) => (
    <ProductListItem
      key={item.id}
      product={item}
      onPress={() => handleProductPress(item)}
      showExpiryStatus
    />
  );

  const renderEmptyComponent = () => (
    <Surface style={styles.emptyState}>
      <Icon
        name="calendar-check-outline"
        size={64}
        color={colors.disabled}
      />
      <Text style={styles.emptyText}>
        {selectedFilter === 'All'
          ? 'No expired or expiring items found'
          : selectedFilter === 'Expired'
          ? 'No expired items found'
          : 'No items expiring soon'}
      </Text>
    </Surface>
  );

  const renderHeader = () => (
      <View style={styles.filterContainer}>
        {FILTER_OPTIONS.map(filter => (
          <Chip
            key={filter}
            selected={selectedFilter === filter}
            onPress={() => setSelectedFilter(filter)}
            style={styles.chip}
            mode="outlined">
            {filter}
          </Chip>
        ))}
      </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.Content title="Expired Products" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Expired Products" />
      </Appbar.Header>

      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: tabBarHeight + 16, // Add extra padding to account for the filter chips
            flexGrow: filteredProducts.length === 0 ? 1 : undefined
          }
        ]}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
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
  content: {
    flexGrow: 1,
    padding: 16,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ExpiredProductsScreen;
