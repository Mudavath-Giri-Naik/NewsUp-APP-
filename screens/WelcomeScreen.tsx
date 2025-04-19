import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/types';

const WelcomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Animated values
  const newsTranslateX = useRef(new Animated.Value(-300)).current;
  const updateTranslateX = useRef(new Animated.Value(300)).current;
  const updateDrop = useRef(new Animated.Value(0)).current;
  const updateOpacity = useRef(new Animated.Value(1)).current; // new fade out during up move
  const fadeInOpacity = useRef(new Animated.Value(0)).current;
  const finalFadeOutTranslateY = useRef(new Animated.Value(0)).current;

  const [secondWord, setSecondWord] = useState('Update');

  useEffect(() => {
    // Step 1: Animate News from left + fade in full container
    Animated.parallel([
      Animated.timing(newsTranslateX, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(fadeInOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Step 2: Animate Update from right
    setTimeout(() => {
      Animated.timing(updateTranslateX, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start(() => {
        // Step 3: Move Update up while fading out
        Animated.parallel([
          Animated.timing(updateDrop, {
            toValue: -50, // move upward
            duration: 500,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          }),
          Animated.timing(updateOpacity, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Step 4: After Update disappears, change to "Up" and bring it up from bottom
          setSecondWord('Up');
          updateDrop.setValue(50); // Reset below
          updateOpacity.setValue(0); // Reset invisible

          Animated.parallel([
            Animated.timing(updateDrop, {
              toValue: 0,
              duration: 500,
              easing: Easing.out(Easing.exp),
              useNativeDriver: true,
            }),
            Animated.timing(updateOpacity, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
          ]).start();
        });
      });
    }, 1000);



    // Step 6: Navigate to Home
    setTimeout(() => {
      navigation.replace('Home');
    }, 3000);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.rowContainer,
          {
            opacity: fadeInOpacity,
            transform: [{ translateY: finalFadeOutTranslateY }],
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.news,
            {
              transform: [{ translateX: newsTranslateX }],
            },
          ]}
        >
          News
        </Animated.Text>

        <Animated.Text
          style={[
            styles.up,
            {
              opacity: updateOpacity,
              transform: [
                { translateX: updateTranslateX },
                { translateY: updateDrop },
              ],
            },
          ]}
        >
          {secondWord}
        </Animated.Text>
      </Animated.View>
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
});

export default WelcomeScreen;
