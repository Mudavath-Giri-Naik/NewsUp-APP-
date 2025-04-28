// src/components/ArticleList.tsx

import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Import Icon

// Import the type definition (ensure this path is correct and type includes syllabusHeadings)
import { ArticleListItemType as Article } from '../utils/types';

// --- Props Definition ---
type Props = {
  articles: Article[];
  onSelect: (id: string, source: string) => void;
  onEndReached: () => void;
  ListFooterComponent: React.ReactElement | null;
  selectedPaper: string; // Indicates the mode ('Exam' or paper name)
};

// --- Color Constants (adjust as needed) ---
const COLORS = {
  primary: '#0d6efd',    // Example primary color (Bootstrap Blue)
  text: '#212529',       // Dark text
  textSecondary: '#6c757d', // Lighter text
  background: '#ffffff',  // Card background
  border: '#dee2e6',      // Light border
  tagBackground: '#e9ecef', // Background for tags
  tagText: '#495057',      // Text color for tags
  syllabusTagBackground: '#e0f2fe', // Lighter blue background for syllabus
  syllabusTagText: '#0c5499',      // Darker blue text for syllabus
  numberBackground: '#f8f9fa',
  numberText: '#6c757d',
};

// --- Component Implementation ---
const ArticleList: React.FC<Props> = ({
  articles,
  onSelect,
  onEndReached,
  ListFooterComponent,
  selectedPaper,
}) => {

  // --- Render Helper for Tags ---
  const renderTags = (item: Article) => {
    const actualSource = item.source || 'Unknown Source';
    const hasSyllabus = selectedPaper === 'Exam' && item.syllabusHeadings && item.syllabusHeadings.length > 0;

    return (
      <View style={styles.tagsContainer}>
        {/* Source Tag */}
        <View style={[styles.tag, styles.sourceTag]}>
          <Icon name="newspaper-variant-outline" size={12} color={COLORS.tagText} style={styles.tagIcon} />
          <Text style={styles.tagText} numberOfLines={1}>{actualSource}</Text>
        </View>

        {/* Syllabus Tags (Conditional) */}
        {hasSyllabus && item.syllabusHeadings?.map((heading, index) => (
           <View key={`${item.id}-syllabus-${index}`} style={[styles.tag, styles.syllabusTag]}>
             <Icon name="file-document-outline" size={12} color={COLORS.syllabusTagText} style={styles.tagIcon} />
             <Text style={styles.syllabusTagText} numberOfLines={1}>{heading}</Text>
           </View>
        ))}
      </View>
    );
  };

  // --- Render Item Function ---
  const renderArticleItem = ({ item, index }: { item: Article; index: number }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => onSelect(item.id, item.source)}
        activeOpacity={0.7}
        key={item.id} // Key on the touchable opacity itself
      >
        {/* Left side: Number */}
        <View style={styles.numberContainer}>
            <Text style={styles.numberText}>{index + 1}</Text>
        </View>

        {/* Right side: Content */}
        <View style={styles.contentContainer}>
            {/* Title */}
            <Text style={styles.titleText}>{item.title}</Text>
            {/* Tags (Source & Syllabus) */}
            {renderTags(item)}
        </View>
      </TouchableOpacity>
    );
  };

  // --- Empty List Component ---
  const renderEmptyList = () => (
      <View style={styles.emptyContainer}>
        <Icon name="newspaper-variant-multiple-outline" size={50} color={COLORS.textSecondary} />
        <Text style={styles.emptyText}>No articles found.</Text>
        <Text style={styles.emptySubText}>Please check the selected date or try a different source.</Text>
      </View>
  );

  // --- FlatList Return ---
  return (
    <FlatList
      data={articles}
      renderItem={renderArticleItem}
      keyExtractor={(item) => item.id} // Use the unique item.id
      contentContainerStyle={styles.listContainer}
      ItemSeparatorComponent={() => <View style={styles.separator} />} // Add subtle separator
      ListEmptyComponent={renderEmptyList} // Use the custom empty component
      ListFooterComponent={ListFooterComponent}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      initialNumToRender={8} // Adjust based on item height
      maxToRenderPerBatch={5}
      windowSize={10}
    />
  );
};

export default ArticleList;

// --- Styles ---
const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 10, // Add horizontal padding to the list itself
    paddingVertical: 10,
    paddingBottom: 120, // Ensure space below the list
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 12,
    flexDirection: 'row', // Arrange number and content side-by-side
    alignItems: 'flex-start', // Align number to the top of the content
    // Add a subtle shadow (optional, adjust as needed)
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.08,
    // shadowRadius: 2,
    // elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  separator: {
    height: 8, // Space between cards
  },
  // Left side numbering
  numberContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.numberBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12, // Space between number and content
    marginTop: 2, // Fine-tune vertical alignment
  },
  numberText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.numberText,
  },
  // Right side content
  contentContainer: {
    flex: 1, // Take remaining horizontal space
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600', // Semi-bold for clarity
    color: COLORS.text,
    lineHeight: 22, // Improve readability
    marginBottom: 8, // Space below title
  },
  // Tags container
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allow tags to wrap to the next line
    alignItems: 'center',
    gap: 6, // Use gap for spacing between tags (React Native 0.71+)
    // If using older RN, use marginHorizontal/marginVertical on individual tags
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12, // Pill shape
    borderWidth: 1, // Subtle border for definition
  },
  tagIcon: {
    marginRight: 4,
  },
  sourceTag: {
    backgroundColor: COLORS.tagBackground,
    borderColor: '#ced4da',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.tagText,
  },
  syllabusTag: {
    backgroundColor: COLORS.syllabusTagBackground,
    borderColor: '#9ec5fe',
  },
  syllabusTagText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.syllabusTagText,
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 50, // Push it down a bit
    minHeight: 200, // Ensure it takes some vertical space
  },
  emptyText: {
    marginTop: 15,
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emptySubText: {
    marginTop: 5,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});