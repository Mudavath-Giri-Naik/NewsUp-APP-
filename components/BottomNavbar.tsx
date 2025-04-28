// src/components/BottomNavbar.tsx
// This code is correct based on its internal implementation.
// It defines its own 'papers' list with logos and does not expect 'papers' as a prop.

import React from 'react';
import { TouchableOpacity, Image, StyleSheet, View, Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Import useSafeAreaInsets


// Props type only includes what the component actually uses from its parent
type Props = {
  selected: string;
  onSelect: (paper: string) => void;
  // No 'papers' prop is needed here because the list is defined internally
};

// Paper list with logos - defined inside the component
const papers = [
  { key: 'The Hindu', logo: require('../assets/logos/th.png') },
  { key: 'Times of India', logo: require('../assets/logos/toi.png') },
  { key: 'Hindustan Times', logo: require('../assets/logos/ht.jpg') },
  { key: 'Exam', logo: require('../assets/logos/pib.jpg') }, // Assuming pib.jpg is the intended logo for Exam
  { key: 'Indian Express', logo: require('../assets/logos/ie.jpg') },
  { key: 'Economic Times', logo: require('../assets/logos/et.png') },
  { key: 'Bussiness Standard', logo: require('../assets/logos/bs.png') },
];

const BottomNavbar: React.FC<Props> = ({ selected, onSelect }) => {
  const insets = useSafeAreaInsets(); // Get safe area insets for proper padding

  return (
    // Use a wrapper that respects safe area for the background and container
    <View style={[styles.safeAreaWrapper, { paddingBottom: insets.bottom }]}>
      <View style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {/* Map over the *internal* papers constant */}
          {papers.map((paper) => (
            <TouchableOpacity
              key={paper.key}
              onPress={() => onSelect(paper.key)}
              style={styles.iconWrapper}
              activeOpacity={0.8} // Add feedback on press
            >
              <View
                style={[
                  styles.iconContainer,
                  selected === paper.key && styles.selectedIcon, // Apply selected style
                ]}
              >
                <Image
                  source={paper.logo}
                  style={styles.icon}
                  // Consider resizeMode="contain" if logos have varying aspect ratios
                  // and you don't want them stretched/cropped.
                  resizeMode="contain" // Changed to 'contain' for potentially better logo display
                />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default BottomNavbar;

const ICON_SIZE = 60; // Define size constants
const BORDER_WIDTH = 3;
const NAVBAR_HEIGHT = 80; // Adjusted height
const NAVBAR_BORDER_RADIUS = 20; // Adjusted radius

const styles = StyleSheet.create({
  safeAreaWrapper: {
    // Position absolutely at the bottom
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // The background color is applied here to cover safe area
    backgroundColor: 'white',
    // Add a top border for visual separation
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  container: {
    // Let the container manage its height and padding within the safe area wrapper
    height: NAVBAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center', // Vertically center the scrollview/icons
    paddingHorizontal: 5, // Padding for the scroll view ends
    marginBottom: 8,
    // Removed fixed width, absolute positioning, excessive margins/borders from here
  },
  scrollContainer: {
    // Ensure items are centered vertically within the ScrollView's content area
    alignItems: 'center',
    paddingHorizontal: 5, // Prevent icons touching the edges
  },
  iconWrapper: {
    // Margin provides spacing between icons
    marginHorizontal: 8, // Increased spacing slightly
    // No fixed width/height here, controlled by iconContainer
  },
  iconContainer: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2, // Perfect circle
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // A light background for the circle
    overflow: 'hidden', // Ensure image stays within bounds
    // Border is applied conditionally using selectedIcon style
    borderWidth: BORDER_WIDTH,
    borderColor: 'transparent', // Default to transparent border
  },
  selectedIcon: {
    // Apply border styles when selected
    borderColor: '#000000', // Example: Use a primary color for selected border
    // Optional: Add shadow for elevation effect (can impact performance)
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.2,
    // shadowRadius: 2,
    // elevation: 3,
  },
  icon: {
    // Make image slightly smaller than container to prevent border overlap issues
    width: ICON_SIZE - (BORDER_WIDTH * 2), // Account for border width on both sides
    height: ICON_SIZE - (BORDER_WIDTH * 2),
    borderRadius: (ICON_SIZE - (BORDER_WIDTH * 2)) / 2, // Make inner image circular
  },
});