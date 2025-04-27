// screens/ProfileScreen.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const menuItems = ['Bookmarks', 'Resources', 'Tests', 'Plans', 'About Us'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Ionicons name="person-circle-outline" size={80} color="white" style={styles.profileIcon} />
          <Text style={styles.username}>Your Name</Text>
          <Text style={styles.email}>youremail@gmail.com</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <Text style={styles.menuText}>{item}</Text>
              <Ionicons name="chevron-forward" size={20} color="#555" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#f8f8f8', // Soft background for the screen
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#2C3E50', // Darker background for a sleek feel
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
  },
  profileIcon: {
    marginBottom: 10,
  },
  username: {
    fontSize: 24, // Smaller font for username
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  email: {
    fontSize: 14, // Smaller font for email
    color: '#bdc3c7',
  },
  menuContainer: {
    width: '100%',
    marginTop: 10,
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },
  menuText: {
    fontSize: 16,  // Smaller font for menu items
    fontWeight: '500',
    color: '#34495E',  // Neutral color for menu text
  },
  logoutButton: {
    marginTop: 30,
    width: '100%',
    paddingVertical: 14,
    backgroundColor: '#e74c3c',  // Bright red for logout button
    borderRadius: 30, // Softer rounded corners for a more premium feel
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16, // Adjusted font size for better balance
    fontWeight: 'bold',
  },
});
