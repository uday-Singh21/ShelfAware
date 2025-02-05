import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../constants/colors';

// Import screens and stacks
import HomeStack from './HomeStack';
import ExpiredProductsScreen from '../screens/products/ExpiredProductsScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator();

const NotificationBadge = ({ count }) => count > 0 ? (
  <View style={{
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: colors.secondary,
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  }}>
    <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
      {count > 99 ? '99+' : count}
    </Text>
  </View>
) : null;

const NavigationStack = () => {
  const [unreadCount] = useState(5); // Replace with actual notification count

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.disabled,
        headerShown: false,
        tabBarStyle: {
          paddingVertical: 5,
          borderTopWidth: 0,
          elevation: 8,
          shadowOpacity: 0.1,
          backgroundColor: colors.surface,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Expired"
        component={ExpiredProductsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar-alert" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View>
              <Icon name="bell-outline" color={color} size={size} />
              <NotificationBadge count={unreadCount} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="cog-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default NavigationStack; 