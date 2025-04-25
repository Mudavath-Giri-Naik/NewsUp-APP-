// src/components/Header.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface HeaderProps {
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
}

const Header = ({ setSelectedDate }: HeaderProps) => {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

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
    return d.toLocaleDateString('en-GB', options); // e.g., 25 Apr 2025
  };

  return (
    <View style={styles.container}>
      {/* Left: Calendar Icon */}
      <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateSection}>
        <Ionicons name="calendar-sharp" size={30} color="black" />
      </TouchableOpacity>

      {/* Middle: App Name and Date */}
      <View style={styles.middleContainer}>
        <Text style={styles.title}>
          News<Text style={{ color: 'red' }}>Up</Text>
        </Text>
        <Text style={styles.dateText}>{formatDate(date)}</Text>
      </View>

      {/* Right: Profile Icon */}
      <TouchableOpacity>
        <Ionicons name="person-circle-outline" size={40} color="black" />
      </TouchableOpacity>

      {/* DateTimePicker */}
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    height: 80, // Increased to give space for date below the title
    paddingHorizontal: 20,
    paddingTop: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 25,
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
    marginTop: 4, // Space between title and date
  },
  middleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
