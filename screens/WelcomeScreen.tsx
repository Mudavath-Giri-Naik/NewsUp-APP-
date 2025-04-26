import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/types';

const WelcomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigation.replace('Home');
    }, 2000);

    return () => clearTimeout(timeout); // clean up if component unmounts early
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
        <Text style={styles.news}>News</Text>
        <Text style={styles.up}>Up</Text>
      </View>
      <Text style={styles.welcome}>Welcome!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  news: {
    fontSize: 36,
    fontWeight: '700',
    fontFamily: 'serif',
    color: 'black',
  },
  up: {
    fontSize: 36,
    fontWeight: '700',
    fontFamily: 'serif',
    color: 'red',
    marginLeft: 5,
  },
  welcome: {
    fontSize: 24,
    color: 'gray',
    marginTop: 10,
    fontFamily: 'serif',
  },
});

export default WelcomeScreen;
