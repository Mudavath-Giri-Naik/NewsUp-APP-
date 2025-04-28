// components/Header.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Assuming Ionicons is correctly installed/imported
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';

// --- Interface Correction ---
interface HeaderProps {
  selectedDate: Date; // Add selectedDate from HomeScreen
  setSelectedDate: (date: Date) => void; // Keep the setter function
  // If you were using React.Dispatch<React.SetStateAction<Date>>,
  // (date: Date) => void is generally compatible and often simpler.
}

// --- Component Correction ---
const Header = ({ selectedDate, setSelectedDate }: HeaderProps) => {
  // Remove internal date state -> use selectedDate prop
  // const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const navigation = useNavigation();

  const handleChange = (event: DateTimePickerEvent, newSelectedDate?: Date) => {
    // Always hide picker after selection/cancel on Android
    if (Platform.OS !== 'ios') {
        setShowPicker(false);
    }
    if (newSelectedDate) {
      // Call the parent's state setter directly
      // Ensure time is reset if necessary (optional, based on your app logic)
      const dateOnly = new Date(newSelectedDate);
      dateOnly.setHours(0, 0, 0, 0);
      setSelectedDate(dateOnly);

      // Hide picker on iOS after selection is confirmed
      if (Platform.OS === 'ios') {
         setShowPicker(false); // Hide after selection on iOS too
      }
    } else {
       // Handle cancellation if needed (e.g., just hide picker)
       setShowPicker(false);
    }
  };

  // Format the date received from props
  const formatDate = (d: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    };
    return d.toLocaleDateString('en-GB', options);
  };

  // --- Check JSX Structure Carefully ---
  // The structure below seems correct regarding the Text rendering rule.
  // Ensure there are absolutely no stray spaces or characters outside <Text> tags
  // in your actual file.
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Calendar Icon Button */}
        <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateSection}>
          {/* Ensure Ionicons are rendering correctly */}
          <Ionicons name="calendar" size={35} color="black" />
        </TouchableOpacity>

        {/* Middle Section: Title and Date */}
        <View style={styles.middleContainer}>
          <Text style={styles.title}>
            News
            {/* Nested Text is the correct way to style parts differently */}
            <Text style={{ color: 'red' }}>Up</Text>
          </Text>
          {/* Display the date passed via props */}
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
        </View>

        {/* Profile Icon Button */}
        <TouchableOpacity onPress={() => navigation.navigate('Profile' as never)}>
          {/* Ensure Ionicons are rendering correctly */}
          <Ionicons name="person-circle-outline" size={45} color="black" />
        </TouchableOpacity>
      </View>

      {/* DateTimePicker Modal */}
      {showPicker && (
        <DateTimePicker
          value={selectedDate} // Use selectedDate prop as the current value
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'} // Use spinner on iOS for better UX
          onChange={handleChange}
          maximumDate={new Date()} // Prevent future dates
        />
      )}
    </SafeAreaView>
  );
};

export default Header;

// --- Styles (Unchanged) ---
const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#fff', // Apply background to safe area if needed
    // Consider adding borderBottom here if it should span the full width including notches
    // borderBottomWidth: 1,
    // borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  container: {
    height: 80, // Adjust height as needed
    paddingHorizontal: 20,
    // paddingTop: 2, // Removed fixed padding, rely on SafeAreaView/container height
    // paddingBottom: 8, // Removed fixed padding
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    // If safeArea handles the border, remove it from here
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000', // Ensure base title color is set
  },
  dateSection: {
    // Removed flexDirection as it's just an icon now
    // alignItems: 'center', // Already centered by parent container
    padding: 5, // Add padding for easier tapping
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4, // Space between title and date
    color: '#333', // Slightly less prominent color for date
  },
  middleContainer: {
    // flex: 1, // Allow it to take space, but maybe not fully flex: 1
    alignItems: 'center', // Center title and date vertically
    justifyContent: 'center', // Center content horizontally within its space
    // Add marginHorizontal if needed to prevent touching icons
    marginHorizontal: 10,
  },
  // Added style for profile button touchable area
  profileButton: {
     padding: 5, // Add padding for easier tapping
  }
});