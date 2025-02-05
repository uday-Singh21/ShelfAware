import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/home/HomeScreen';
import CameraScreen from '../screens/camera/CameraScreen';
import ProductInputScreen from '../screens/products/ProductInputScreen';

const Stack = createStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="ProductInput" component={ProductInputScreen} />
    </Stack.Navigator>
  );
};

export default HomeStack; 