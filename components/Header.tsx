import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Header = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity>
        <Ionicons name="menu" size={40} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>
        News<Text style={{ color: 'red' }}>Up</Text>
      </Text>
      <TouchableOpacity>
        <Ionicons name="person-circle-outline" size={40} color="black" />
      </TouchableOpacity>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    height: 60,
    paddingHorizontal: 20,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
  },
});
