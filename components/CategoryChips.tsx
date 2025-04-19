import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  categories: { category: string; count: number }[];
  selected: string;
  onSelect: (category: string) => void;
};

const capitalize = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const CategoryChips: React.FC<Props> = ({ categories, selected, onSelect }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {categories.map((cat, idx) => (
        <TouchableOpacity
          key={idx}
          style={[
            styles.chip,
            selected === cat.category && styles.selectedChip
          ]}
          onPress={() => onSelect(cat.category)}
        >
          <Text style={[styles.text, selected === cat.category && styles.selectedText]}>
            {capitalize(cat.category || 'Unknown')} ({cat.count})
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default CategoryChips;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
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
    fontSize: 14,
    color: '#333',
  },
  selectedText: {
    color: '#fff',
  },
});
