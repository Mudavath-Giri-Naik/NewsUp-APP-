// screens/ResourceDetailScreen.tsx
import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Platform
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/types'; // Adjust path if needed
import { DailyResource } from '../utils/api'; // Import the type definition

// --- Navigation Types ---
type ResourceDetailRouteProp = RouteProp<RootStackParamList, 'ResourceDetail'>;
type ResourceDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ResourceDetail'>;

// --- Helper Component for General Key Information Parsing ---
// Parses text blocks separated by "Heading:" patterns
const ParsedKeyInfoBlock = ({ blockText }: { blockText: string }) => {
    // Regex to find a heading ending with a colon at the beginning of the block
    // Allows letters, numbers, spaces, (), /, - before the colon
    const headingMatch = blockText.match(/^([A-Za-z0-9\s\(\)\/,-]+:)\s*/);
    let heading = '';
    let content = blockText.trim(); // Default content is the whole block

    if (headingMatch) {
        heading = headingMatch[1].trim(); // Capture the heading text including the colon
        // Remove the heading and leading/trailing spaces from the content
        content = blockText.substring(headingMatch[0].length).trim();
    }

    // Don't render empty blocks
    if (!heading && !content) {
        return null;
    }

    return (
        <View style={styles.keyInfoSubSection}>
            {/* Render heading only if found */}
            {heading ? <Text style={styles.keyInfoSubHeading}>{heading}</Text> : null}
            {/* Render content only if it exists */}
            {content ? <Text style={styles.keyInfoContentText}>{content}</Text> : null}
        </View>
    );
};


const ResourceDetailScreen = () => {
  const route = useRoute<ResourceDetailRouteProp>();
  const navigation = useNavigation<ResourceDetailNavigationProp>();
  const resource = route.params?.resource;

  useLayoutEffect(() => {
    if (navigation && resource) {
        navigation.setOptions({
         title: resource.Topic || 'Details',
         headerBackTitle: 'Back',
        });
    }
  }, [navigation, resource]);

  // --- Enhanced Content Rendering ---
  const renderKeyInformation = (keyInfoString: string | undefined | null) => {
      if (!keyInfoString) return null;

      // Split the text into blocks based on lines starting with a potential heading + colon
      // This regex looks for a newline (or start of string), followed by the heading pattern,
      // and splits *before* the heading line.
      const blocks = keyInfoString.split(/\n(?=[A-Za-z0-9\s\(\)\/,-]+:\s*)/).map(s => s.trim()).filter(Boolean);

      // If splitting didn't work (e.g., single block of text), render it as one block
      if (blocks.length <= 1 && keyInfoString.trim()) {
          return (
              <View style={styles.keyInfoContainer}>
                  <ParsedKeyInfoBlock blockText={keyInfoString.trim()} />
              </View>
          );
      }

      // Render each block using the helper component
      return (
          <View style={styles.keyInfoContainer}>
              {blocks.map((block, index) => (
                  <ParsedKeyInfoBlock key={`keyinfo-block-${index}`} blockText={block} />
              ))}
          </View>
      );
  };


  // --- Other Rendering Helpers (remain the same) ---
  const renderSimpleSection = (label: string, value: string | undefined | null) => {
      if (!value) return null;
      return (
          <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>{label}</Text>
              <Text style={styles.paragraphText}>{value}</Text>
          </View>
      );
  };

  const renderPYQ = (value: string | undefined | null) => {
       if (!value) return null;
        const match = value.match(/(.*)(\(.*\))/);
        let question = value;
        let source = '';
        if (match) { question = match[1].trim(); source = match[2].trim(); }
        return (
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Previous Year Question (PYQ)</Text>
                <Text style={styles.pyqText}>{question}</Text>
                {source ? <Text style={styles.pyqSource}>{source}</Text> : null}
            </View>
        );
  };

   const renderMetaItem = (label: string, value: string | undefined | null, allowWrap = false) => {
    if (!value) return null;
    return (
        <View style={styles.metaItemContainer}>
            <Text style={styles.metaLabel}>{label}:</Text>
            <Text style={[styles.metaValue, allowWrap && { flexShrink: 1 }]} numberOfLines={allowWrap ? 2 : 1} ellipsizeMode="tail">{value}</Text>
        </View>
    );
  }
  // --- End Rendering Helpers ---

  if (!resource) {
      return (
          <SafeAreaView style={styles.safeArea}>
              <View style={styles.errorContainer}><Text style={styles.errorText}>Resource data not found.</Text></View>
          </SafeAreaView>
      );
  }

  // Main return JSX using new rendering functions
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Header Section - Meta Info */}
        <View style={styles.headerMetaSection}>
           <Text style={styles.topicTitle}>{resource.Topic}</Text>
           <View style={styles.metaGrid}>
                {renderMetaItem('Category', resource.Category)}
                {renderMetaItem('Source', resource.Source)}
                {renderMetaItem('Syllabus', resource.Syllabus_Relevance, true)}
                {renderMetaItem('Date', resource.Date)}
           </View>
        </View>

        {/* Content Sections */}
        {renderSimpleSection('Context', resource.Context)}
        {/* Render Key Information Section Separately */}
        {resource.Key_Information && (
             <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Key Information</Text>
                  {renderKeyInformation(resource.Key_Information)}
             </View>
        )}
        {renderSimpleSection('Conclusion', resource.Conclusion)}
        {renderPYQ(resource.PYQ)}

      </ScrollView>
    </SafeAreaView>
  );
};


// --- Updated Styles ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA', },
  container: { flex: 1, },
  scrollContent: { paddingBottom: 40, },
  // Header Meta Section
  headerMetaSection: {
      backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 25,
      paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#E9ECEF',
      marginBottom: 15,
  },
  topicTitle: {
      fontSize: 24, fontWeight: 'bold', color: '#212529',
      marginBottom: 20, textAlign: 'center',
  },
  metaGrid: { },
  metaItemContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, },
  metaLabel: { fontSize: 14, fontWeight: '600', color: '#495057', marginRight: 8, width: 80, },
  metaValue: { fontSize: 14, color: '#212529', flex: 1, },
  // General Content Sections
  sectionContainer: {
    backgroundColor: '#FFFFFF', padding: 20, borderRadius: 8,
    marginBottom: 15, marginHorizontal: 10, shadowColor: '#ADB5BD',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
    shadowRadius: 5, elevation: 2,
  },
  sectionTitle: {
    fontSize: 18, fontWeight: 'bold', color: '#007AFF', marginBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#E7F5FF', paddingBottom: 6,
  },
  paragraphText: { fontSize: 16, color: '#343A40', lineHeight: 24, },
  // Key Information Specific Styles (Updated)
  keyInfoContainer: { },
  keyInfoSubSection: {
      marginBottom: 15, // Space between distinct heading blocks
      paddingLeft: 5, // Slight indent for the whole block
  },
  keyInfoSubHeading: { // Style for headings like "History:", "Established:"
      fontSize: 16,
      fontWeight: 'bold', // Make heading bold
      color: '#343A40',
      marginBottom: 6, // Space below heading
  },
  keyInfoContentText: { // Style for the text content following a heading
      fontSize: 15,
      color: '#343A40',
      lineHeight: 22,
  },
  // Remove old KeyInfoPoint styles if not needed, or keep if nested numbered lists might occur
  // keyInfoPointContainer: { flexDirection: 'row', marginBottom: 6, marginLeft: 5, },
  // keyInfoPointNumber: { fontSize: 15, fontWeight: '600', color: '#495057', marginRight: 8, minWidth: 20, },
  // keyInfoPointText: { flex: 1, fontSize: 15, color: '#343A40', lineHeight: 22, },

  // PYQ Specific Styles
  pyqText: { fontSize: 16, color: '#343A40', lineHeight: 24, fontStyle: 'italic', marginBottom: 5, },
  pyqSource: { fontSize: 14, color: '#6C757D', textAlign: 'right', },
  // Error handling styles
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 18, color: 'red', textAlign: 'center' }
});

export default ResourceDetailScreen;