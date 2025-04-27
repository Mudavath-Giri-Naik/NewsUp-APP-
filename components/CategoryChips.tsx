import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  categories: { category: string; count: number }[];
  selected: string;
  onSelect: (category: string) => void;
};

// Capitalizes the first letter of the category
const capitalize = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Normalizes the category name to lowercase for consistent comparison
const normalizeCategory = (category: string) => {
  return category.trim().toLowerCase();
};

// Helper function to remove duplicate categories based on normalized name
const removeDuplicates = (categories: { category: string; count: number }[]) => {
  const uniqueCategories: { [key: string]: { category: string; count: number } } = {};

  categories.forEach((cat) => {
    const normalizedCategory = normalizeCategory(cat.category);
    // If this category has been encountered before, we combine the count
    if (uniqueCategories[normalizedCategory]) {
      uniqueCategories[normalizedCategory].count += cat.count;
    } else {
      uniqueCategories[normalizedCategory] = { category: cat.category, count: cat.count };
    }
  });

  return Object.values(uniqueCategories); // Return an array of unique categories
};

const CategoryChips: React.FC<Props> = ({ categories, selected, onSelect }) => {
  // Remove duplicates before rendering categories
  const uniqueCategories = removeDuplicates(categories);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {uniqueCategories.map((cat, idx) => {
        const normalizedCategory = normalizeCategory(cat.category);
        const normalizedSelected = normalizeCategory(selected);

        return (
          <TouchableOpacity
            key={idx}
            style={[
              styles.chip,
              normalizedSelected === normalizedCategory && styles.selectedChip,
            ]}
            onPress={() => onSelect(cat.category)}
          >
            <Text
              style={[
                styles.text,
                normalizedSelected === normalizedCategory && styles.selectedText,
              ]}
            >
              {capitalize(cat.category || 'Unknown')} ({cat.count})
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
    flexDirection: 'row',
    paddingTop: 5,
    paddingVertical: 10,
    paddingLeft: 10,
    marginRight: 10,
  },
  chip: {
    backgroundColor: '#eee',
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedChip: {
    backgroundColor: '#000',
  },
  text: {
    fontSize: 15,
    color: '#333',
  },
  selectedText: {
    color: '#fff',
  },
});
