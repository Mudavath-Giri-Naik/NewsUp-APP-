// File: App.tsx

import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Appearance } from 'react-native';

// Screens
import WelcomeScreen from './screens/WelcomeScreen'; // ✅ ADDED: Welcome screen
import HomeScreen from './screens/HomeScreen';
import ArticleDetailScreen from './screens/ArticleDetailScreen';
import ProfileScreen from './screens/profileScreen'; // ✅ ADDED: ProfileScreen import

// Force the system appearance to light (optional)
Appearance.setColorScheme('light');

// Custom light theme for Navigation
const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ffffff',
    text: '#000000',
  },
};

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer theme={LightTheme}>
      <Stack.Navigator initialRouteName="Welcome">
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ArticleDetail"
          component={ArticleDetailScreen}
        />
        <Stack.Screen
          name="Profile" // ✅ ADDED: Profile screen registration
          component={ProfileScreen} // ✅ ADDED: ProfileScreen component
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
