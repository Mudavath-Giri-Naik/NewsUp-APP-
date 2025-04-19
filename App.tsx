import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Appearance } from 'react-native';

// Screens
import WelcomeScreen from './screens/WelcomeScreen'; // ✅ ADDED: Welcome screen
import HomeScreen from './screens/HomeScreen';
import ArticleDetailScreen from './screens/ArticleDetailScreen';

// Force the system appearance to light (optional)
Appearance.setColorScheme('light');

// Custom light theme for Navigation
const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ffffff', // Light background
    text: '#000000',        // Dark text
  },
};

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer theme={LightTheme}>
      <Stack.Navigator initialRouteName="Welcome">
        {/* ✅ ADDED: Welcome screen as the initial route */}
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />

        {/* Existing screens */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }} // Already handled inside HomeScreen
        />
        <Stack.Screen
          name="ArticleDetail"
          component={ArticleDetailScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
