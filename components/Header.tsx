// components/Header.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native'; // Added

interface HeaderProps {
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
}

const Header = ({ setSelectedDate }: HeaderProps) => {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const navigation = useNavigation(); // Added

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
      setSelectedDate(selectedDate);
    }
  };

  const formatDate = (d: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    };
    return d.toLocaleDateString('en-GB', options);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateSection}>
          <Ionicons name="calendar" size={35} color="black" />
        </TouchableOpacity>

        <View style={styles.middleContainer}>
          <Text style={styles.title}>
            News
            <Text style={{ color: 'red' }}>Up</Text> {/* Ensure 'Up' is wrapped in a Text component */}
          </Text>
          <Text style={styles.dateText}>{formatDate(date)}</Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Profile' as never)}> {/* Updated */}
          <Ionicons name="person-circle-outline" size={45} color="black" />
        </TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleChange}
          maximumDate={new Date()}
        />
      )}
    </SafeAreaView>
  );
};

export default Header;

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff',
  },
  container: {
    height: 80,
    paddingHorizontal: 20,
    paddingTop: 2,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  middleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
