import React from 'react';
import { View, StyleSheet, Alert, PermissionsAndroid, Platform } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../constants/colors';
import ScanButton from '../../components/common/ScanButton';
import { launchCamera } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();

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
        navigation.navigate('ProductInput', { photoPath: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Shelf Aware" />
        <Appbar.Action icon="magnify" onPress={() => console.log('Search')} />
      </Appbar.Header>

      <View style={styles.content}>
        <View style={styles.header}>
          <Icon name="barcode-scan" size={40} color={colors.primary} />
          <Text style={styles.sectionTitle}>Recently Scanned</Text>
        </View>
        <View style={styles.emptyState}>
          <Icon name="package-variant" size={64} color={colors.disabled} />
          <Text style={styles.emptyText}>No products scanned yet</Text>
        </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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