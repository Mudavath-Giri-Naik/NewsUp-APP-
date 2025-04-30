import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Define a professional color palette
const COLORS = {
  primary: '#007AFF', // Vibrant Blue
  primarySubtle: 'rgba(0, 122, 255, 0.1)', // Light blue tint for background
  textPrimary: '#1C1C1E', // Almost Black
  textSecondary: '#8A8A8E', // Medium Gray for count
  textOnPrimary: '#FFFFFF', // White text on selected chip
  border: '#E0E0E0', // Subtle border for unselected chips
};

type Props = {
  categories: { category: string; count: number }[];
  selected: string;
  onSelect: (category: string) => void;
};

const capitalize = (text: string) => {
  if (!text) return 'Unknown';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

const normalizeCategory = (category: string) => {
  return category.trim().toLowerCase();
};

const removeDuplicates = (categories: { category: string; count: number }[]) => {
  const uniqueCategoriesMap: Map<string, { category: string; count: number }> = new Map();

  categories.forEach((cat) => {
    const normalized = normalizeCategory(cat.category);
    if (uniqueCategoriesMap.has(normalized)) {
      const existing = uniqueCategoriesMap.get(normalized)!;
      existing.count += cat.count;
    } else {
      // Store a copy with the original casing for display
      uniqueCategoriesMap.set(normalized, { ...cat });
    }
  });

  return Array.from(uniqueCategoriesMap.values());
};

const CategoryChips: React.FC<Props> = ({ categories, selected, onSelect }) => {
  const uniqueCategories = removeDuplicates(categories);
  const normalizedSelected = normalizeCategory(selected);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer} // Added for inner padding
    >
      {uniqueCategories.map((cat, idx) => {
        const normalizedCategory = normalizeCategory(cat.category);
        const isSelected = normalizedSelected === normalizedCategory;
        const displayCategory = capitalize(cat.category); // Use original casing for display

        return (
          <TouchableOpacity
            key={`${normalizedCategory}-${idx}`} // More robust key
            style={[
              styles.chipBase,
              isSelected ? styles.selectedChip : styles.chip,
            ]}
            onPress={() => onSelect(cat.category)} // Use original category name for selection callback
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.textBase,
                isSelected ? styles.selectedText : styles.text,
              ]}
              numberOfLines={1} // Prevent text wrapping issues
            >
              {displayCategory}
              {/* Display count with subtle styling */}
              <Text style={isSelected ? styles.selectedCountText : styles.countText}>
                {' '}({cat.count})
              </Text>
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default CategoryChips;

const styles = StyleSheet.create({
  container: {
    flexGrow: 0, // Prevent ScrollView from taking full height if not needed
  },
  contentContainer: {
    paddingVertical: 12, // Vertical padding for the scroll area
    paddingHorizontal: 16, // Horizontal padding for the scroll area
  },
  chipBase: {
    height: 38, // Slightly smaller height
    borderRadius: 19, // Fully rounded corners (height / 2)
    paddingHorizontal: 16, // More horizontal padding
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1, // Add border for definition
  },
  chip: {
    backgroundColor: COLORS.primarySubtle, // Subtle background tint
    borderColor: COLORS.primarySubtle, // Border matches background or use a slightly darker one
    // borderColor: 'rgba(0, 122, 255, 0.2)', // Example darker border
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary, // Border matches background when selected
    shadowColor: '#000', // Optional: Add subtle shadow to selected chip
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  textBase: {
    fontSize: 14, // Slightly smaller font size
    fontWeight: '500', // Medium weight for better readability
  },
  text: {
    color: COLORS.primary, // Use primary color for unselected text
  },
  selectedText: {
    color: COLORS.textOnPrimary, // White text on selected
    fontWeight: '600', // Slightly bolder when selected
  },
  countText: {
    color: COLORS.textSecondary, // Use secondary color for count
    fontSize: 13, // Slightly smaller font size for count
  },
  selectedCountText: {
    color: 'rgba(255, 255, 255, 0.8)', // Slightly transparent white for count on selected
    fontSize: 13,
  },
});