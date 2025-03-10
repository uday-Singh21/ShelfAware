import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  TouchableWithoutFeedback,
  View,
  Alert,
  PermissionsAndroid,
  Platform,
  Text,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Badge} from 'react-native-paper';
import {colors} from '../constants/colors';
import {useNotifications} from '../contexts/NotificationContext';
import {fonts} from '../constants/fonts';

// Import stacks/screens
import HomeStack from './HomeStack';
import ExpiredProductsScreen from '../screens/products/ExpiredProductsScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import AnimatedFAB from '../components/common/AnimatedFAB';
import {launchCamera} from 'react-native-image-picker';

const Tab = createBottomTabNavigator();

const TabButton = ({children, onPress}) => (
  <TouchableWithoutFeedback onPress={onPress}>
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {children}
    </View>
  </TouchableWithoutFeedback>
);

const TabNavigator = () => {
  const {unreadCount} = useNotifications();

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs camera permission to scan products',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleScan = async navigation => {
    const hasPermission = await requestCameraPermission();

    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Camera permission is needed to scan products',
      );
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
        navigation.navigate('Home', {
          screen: 'ProductInput',
          params: {
            photoPath: result.assets[0].uri,
            isEditing: false,
          },
        });
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  return (
    <>
      <StatusBar
        backgroundColor={colors.background}
        barStyle="dark-content"
      />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.disabled,
          tabBarStyle: {
            paddingBottom: 8,
            paddingTop: 8,
            height: 70,
            backgroundColor: colors.surface,
            borderTopWidth: 0,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            elevation: 0,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: fonts.medium,
            includeFontPadding: false,
          },
          tabBarButton: props => {
            if (props.accessibilityLabel == 'Add') {
              return <View style={{flex: 1}}>{props.children}</View>;
            }
            return <TabButton {...props} />;
          },
        }}>
        <Tab.Screen
          name="Home"
          component={HomeStack}
          options={{
            tabBarIcon: ({color, size}) => (
              <Icon name="home" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Expired"
          component={ExpiredProductsScreen}
          options={{
            tabBarIcon: ({color, size}) => (
              <Icon name="alert-circle" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Add"
          component={View}
          listeners={{
            tabPress: e => {
              // Prevent default action
              e.preventDefault();
            },
          }}
          options={({navigation}) => ({
            tabBarIcon: () => (
              <AnimatedFAB
                onScanPress={() => handleScan(navigation)}
                navigation={navigation}
              />
            ),
            tabBarLabel: () => null,
          })}
        />
        <Tab.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{
            tabBarIcon: ({color, size}) => (
              <View>
                <Icon name="bell" size={size} color={color} />
                {unreadCount > 0 && (
                  <Badge
                    size={16}
                    style={{
                      position: 'absolute',
                      top: -5,
                      right: -10,
                      backgroundColor: colors.error,
                    }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({color, size}) => (
              <Icon name="cog" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </>
  );
};

export default TabNavigator;
