import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Keyboard,
  ScrollView,
} from 'react-native';
import {Appbar, Text, Searchbar, Menu, Divider} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors} from '../../constants/colors';
import ProductCard from '../../components/common/ProductCard';
import {useNavigation} from '@react-navigation/native';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {fonts} from '../../constants/fonts';

const HomeScreen = () => {
  const navigation = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState({x: 0, y: 0});

  const fetchProducts = React.useCallback(async () => {
    const userId = auth().currentUser?.uid;
    if (!userId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      let query = firestore()
        .collection('products')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc');

      const snapshot = await query.get();
      const fetchedProducts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          expiryDate: data.expiryDate?.toMillis() || 0,
          name: data.name || '',
          category: data.category || '',
          quantity: data.quantity || 0,
          unit: data.unit || '',
          notes: data.notes || '',
          createdAt: data.createdAt?.toMillis() || 0,
        };
      });

      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error.code !== 'permission-denied') {
        Alert.alert('Error', 'Failed to load products. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, [fetchProducts]);

  const handleProductPress = product => {
    console.log('Product pressed:', product);
  };

  const handleDeleteProduct = async product => {
    try {
      await firestore().collection('products').doc(product.id).delete();

      // Refresh products list
      fetchProducts();
      Alert.alert('Success', 'Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      Alert.alert('Error', 'Failed to delete product. Please try again.');
    }
  };

  const showDeleteConfirmation = product => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => handleDeleteProduct(product),
          style: 'destructive',
        },
      ],
      {cancelable: true},
    );
  };

  const handleEditProduct = product => {
    navigation.navigate('ProductInput', {
      product: product,
      isEditing: true,
    });
  };

  const handleMenuOpen = (product, event) => {
    const {pageX, pageY} = event.nativeEvent;
    setMenuAnchor({x: pageX, y: pageY});
    setSelectedProduct(product);
    setMenuVisible(true);
  };

  const handleMenuClose = () => {
    setMenuVisible(false);
    setSelectedProduct(null);
  };

  const filteredProducts = products.filter(product => {
    const query = searchQuery.toLowerCase().trim();
    return (
      product.name.toLowerCase().includes(query) ||
      product.barcode?.includes(query) ||
      product.category?.toLowerCase().includes(query) ||
      product.notes?.toLowerCase().includes(query)
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="ShelfAware" color={colors.text} />
      </Appbar.Header>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              {paddingBottom: tabBarHeight},
            ]}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            {/* Search Section */}
            <View style={styles.searchContainer}>
              <Searchbar
                placeholder="Search products..."
                placeholderTextColor={colors.disabled}
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
                iconColor={colors.text}
                clearButtonMode="while-editing"
                autoCapitalize="none"
                returnKeyType="search"
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>

            {/* Header Section */}
            <View style={styles.sectionHeader}>
              <Icon name="barcode-scan" size={40} color={colors.primary} />
              <Text style={styles.sectionTitle}>
                {searchQuery ? 'Search Results' : 'Recently Scanned'}
              </Text>
            </View>

            {/* Products List Section */}
            {filteredProducts.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon
                  name="package-variant"
                  size={64}
                  color={colors.disabled}
                />
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No products found' : 'No products added yet'}
                </Text>
              </View>
            ) : (
              <View style={styles.productsContainer}>
                {filteredProducts.map(item => (
                  <ProductCard
                    key={item.id}
                    product={item}
                    onPress={() => handleProductPress(item)}
                    onMorePress={event => handleMenuOpen(item, event)}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        )}

        <Menu
          visible={menuVisible}
          onDismiss={handleMenuClose}
          anchor={menuAnchor}>
          <Menu.Item
            onPress={() => {
              handleMenuClose();
              handleEditProduct(selectedProduct);
            }}
            title="Edit"
            leadingIcon="pencil"
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              handleMenuClose();
              showDeleteConfirmation(selectedProduct);
            }}
            title="Delete"
            leadingIcon="delete"
            titleStyle={{color: colors.error}}
          />
        </Menu>
      </View>
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
    elevation: 0,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.background,
  },
  searchBar: {
    marginBottom: 16,
    backgroundColor: colors.card,
    elevation: 2,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: fonts.bold,
    marginLeft: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyText: {
    marginTop: 16,
    color: colors.disabled,
    fontSize: 16,
    fontFamily: fonts.regular,
  },
  productsContainer: {
    paddingHorizontal: 16,
  },
});

export default HomeScreen;
