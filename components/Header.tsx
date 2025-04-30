// components/Header.tsx

import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
// Import useNavigation hook
import { useNavigation } from '@react-navigation/native';
// ✅ Import the specific Navigation Prop type and your Param List type
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/types'; // Adjust path if needed

interface HeaderProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

// Helper function to format date for the API call
const formatDateForAPI = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  // IMPORTANT: Ensure this format matches your API (e.g., DD-MM-YYYY or YYYY-MM-DD)
  return `${day}-${month}-${year}`;
};


const Header = ({ selectedDate, setSelectedDate }: HeaderProps) => {
  const [showPicker, setShowPicker] = useState(false);

  // ✅ Explicitly type the useNavigation hook
  // This tells TypeScript what screens and parameters this navigator understands
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Date change handler from picker - remains the same
  const handleChange = (event: DateTimePickerEvent, newSelectedDate?: Date) => {
    const currentDate = newSelectedDate || selectedDate;
    if (Platform.OS !== 'ios') {
        setShowPicker(false);
    }
    if (event.type === "set" && newSelectedDate) {
      const dateOnly = new Date(newSelectedDate);
      dateOnly.setHours(0, 0, 0, 0);
      setSelectedDate(dateOnly);
    }
    if (Platform.OS === 'ios') {
        setShowPicker(false);
    }
  };

  // Date formatting for display - remains the same
  const formatDate = (d: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    };
    return d.toLocaleDateString('en-GB', options);
  };

  // Handler for navigating to Resources - remains the same logic
  const handleNavigateToResources = () => {
    const dateStringForAPI = formatDateForAPI(selectedDate);
    console.log(`Navigating to Resources with date: ${dateStringForAPI}`);

    // ✅ This call is now type-safe because 'navigation' is typed correctly
    navigation.navigate('Resources', { date: dateStringForAPI });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
        <StatusBar
            barStyle="dark-content"
            backgroundColor="#fff"
            translucent={Platform.OS === 'android'}
        />
        <View style={styles.container}>
            {/* Calendar Icon Button */}
            <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.iconButton}>
                <Ionicons name="calendar-outline" size={28} color="#333" />
            </TouchableOpacity>

            {/* Middle Section: Title and Date */}
            <View style={styles.middleContainer}>
                <Text style={styles.title}>
                    News<Text style={{ color: '#E53935' }}>Up</Text>
                </Text>
                <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            </View>

            {/* Menu Icon Button */}
            <TouchableOpacity onPress={handleNavigateToResources} style={styles.iconButton}>
                <Ionicons name="book-outline" size={32} color="#333" />
            </TouchableOpacity>
        </View>

        {/* DateTimePicker Modal */}
        {showPicker && (
            <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleChange}
                maximumDate={new Date()}
            />
        )}
    </SafeAreaView>
  );
};

// Styles remain the same
const styles = StyleSheet.create({
  safeArea: {
  backgroundColor: '#fff', // Ensure SafeAreaView itself has the white background
  // Remove border here if it's handled by the container
  },
  container: {
  height: 70, // Slightly reduced height can feel cleaner
  paddingHorizontal: 15, // Adjusted padding
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#fff', // Header background
  borderBottomWidth: 1, // Keep the subtle border
  borderBottomColor: '#EAEAEA', // Lighter border color
  },
  title: {
  fontSize: 24, // Slightly smaller title for balance
  fontWeight: 'bold',
  textAlign: 'center',
  color: '#1C1C1E', // Darker title color
  },
  iconButton: { // Renamed from dateSection/profileButton for consistency
  padding: 8, // Standard padding for touchable areas
  },
  dateText: {
  fontSize: 14, // Slightly smaller date
  fontWeight: '500', // Medium weight
  textAlign: 'center',
  marginTop: 2, // Reduced space between title and date
  color: '#636366', // Softer color for date
  },
  middleContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  // No flex: 1 needed, let it size based on content
  marginHorizontal: 5, // Minimal horizontal margin
  },
  });

export default Header;