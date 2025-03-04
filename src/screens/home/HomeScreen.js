import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, PermissionsAndroid, Platform, RefreshControl, ScrollView, ActivityIndicator } from 'react-native';
import { Appbar, Text, Searchbar, SegmentedButtons } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../constants/colors';
import ScanButton from '../../components/common/ScanButton';
import ProductCard from '../../components/common/ProductCard';
import { launchCamera } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const SORT_OPTIONS = [
  { label: 'Recent', value: 'recent' },
  { label: 'Expiring', value: 'expiring' },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const fetchProducts = async () => {
    const userId = auth().currentUser?.uid;
    if (!userId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      let query = firestore()
        .collection('products')
        .where('userId', '==', userId);

      if (sortBy === 'expiring') {
        query = query.orderBy('expiryDate', 'asc');
      } else {
        query = query.orderBy('createdAt', 'desc');
      }

      const snapshot = await query.get();
      const fetchedProducts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert Firestore Timestamp to milliseconds for the ProductCard
          expiryDate: data.expiryDate?.toMillis() || 0,
          // Ensure all required fields have default values
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
      // Only show alert if there's an actual error, not just empty data
      if (error.code !== 'permission-denied') {
        Alert.alert('Error', 'Failed to load products. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [sortBy]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, []);

  const handleProductPress = (product) => {
    // TODO: Navigate to product details
    console.log('Product pressed:', product);
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "App needs camera permission to scan products",
            buttonPositive: "OK",
            buttonNegative: "Cancel",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleScan = async () => {
    const userId = auth().currentUser?.uid;
    if (!userId) {
      Alert.alert('Error', 'Please sign in to scan products');
      return;
    }

    const hasPermission = await requestCameraPermission();
    
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Camera permission is needed to scan products');
      return;
    }

    const options = {
      mediaType: 'photo',
      quality: 1,
      saveToPhotos: false,
      includeBase64: false,
      cameraType: 'back',
      presentationStyle: 'fullScreen',
    };

    try {
      const result = await launchCamera(options);
      
      if (result.didCancel) return;
      
      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage);
        return;
      }
      
      if (result.assets && result.assets[0]?.uri) {
        navigation.navigate('ProductInput', { 
          photoPath: result.assets[0].uri,
          userId: userId // Pass userId to ProductInput
        });
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode.includes(searchQuery)
  );

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Shelf Aware" />
      </Appbar.Header>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search products..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <View style={styles.sortContainer}>
        <SegmentedButtons
          value={sortBy}
          onValueChange={setSortBy}
          buttons={SORT_OPTIONS}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Icon name="barcode-scan" size={40} color={colors.primary} />
          <Text style={styles.sectionTitle}>Recently Scanned</Text>
        </View>

        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : filteredProducts.length > 0 ? (
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={() => handleProductPress(product)}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Icon name="package-variant" size={64} color={colors.disabled} />
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'No products found'
                : 'No products scanned yet'}
            </Text>
          </View>
        )}
      </View>

      <ScanButton onPress={handleScan} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    elevation: 0,
    borderWidth: 1,
    borderColor: colors.disabled,
  },
  sortContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    color: colors.disabled,
    fontSize: 16,
  },
});

export default HomeScreen; 