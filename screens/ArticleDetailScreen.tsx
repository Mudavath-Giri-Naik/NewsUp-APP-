// File: screens/ArticleDetailScreen.tsx

import React, { useEffect, useLayoutEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchArticleDetails } from '../utils/api';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

// --- Helper Types & Functions ---
type JsonValue = string | number | boolean | null | JsonArray | JsonObject;
interface JsonObject { [key: string]: JsonValue; }
interface JsonArray extends Array<JsonValue> {}
type ParsedJsonData = JsonObject;

const parseJsonSafely = (jsonString: string | undefined | null): ParsedJsonData | null => {
  if (!jsonString || typeof jsonString !== 'string') { return null; }
  try {
    let cleanedString = jsonString.trim();
    // Handle potential markdown code blocks around JSON
    if (cleanedString.startsWith('```json') && cleanedString.endsWith('```')) {
       cleanedString = cleanedString.substring(7, cleanedString.length - 3).trim();
    } else if (cleanedString.startsWith('```') && cleanedString.endsWith('```')) {
       cleanedString = cleanedString.substring(3, cleanedString.length - 3).trim();
    }
    const parsed = JSON.parse(cleanedString);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return parsed as ParsedJsonData;
    } else { console.warn("Parsed JSON is not a root object:", parsed); return null; }
  } catch (error: any) {
    console.error("Error parsing JSON:", error.message);
    const snippet = jsonString.length > 100 ? jsonString.substring(0, 100) + "..." : jsonString;
    // Keep this log for debugging problematic JSON
    // console.log("Problematic JSON string (snippet):", snippet);
    return null;
  }
};

const formatToList = (text: string | undefined | null): string[] =>
    text && typeof text === 'string'
      ? text.split('.').map(s => s.trim()).filter(s => s.length > 1).map(capitalizeSentence)
      : [];

const capitalizeFirst = (word: string | undefined | null): string =>
    word && typeof word === 'string' ? word.charAt(0).toUpperCase() + word.slice(1) : '';

const capitalizeSentence = (sentence: string | undefined | null): string => {
     if (!sentence || typeof sentence !== 'string') return '';
     const trimmed = sentence.trim();
     // Ensure it doesn't return just '.' if the sentence ends with it after splitting.
     if (trimmed === '.') return '';
     return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : '';
}

const formatJsonKey = (key: string): string => {
      // Improved key formatting: handle snake_case and camelCase
      return key
        .replace(/_/g, ' ') // Replace underscores with spaces
        .replace(/([A-Z])/g, ' $1') // Add space before capitals (for camelCase)
        .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
        .trim();
};


// --- Component ---
const ArticleDetailScreen = ({ route, navigation }: any) => {
  const { paper, id } = route.params;
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Memoized Parsed JSON Data ---
  const parsedDeepAnalysis = useMemo<ParsedJsonData | null>(
      () => parseJsonSafely(article?.deepAnalysisJson),
      [article?.deepAnalysisJson]
  );

  const parsedSummaryPoints = useMemo<ParsedJsonData | null>(
      () => parseJsonSafely(article?.summaryPointsJson),
      [article?.summaryPointsJson]
  );

  // --- Header Configuration ---
  useLayoutEffect(() => {
    navigation.setOptions({
        title: paper || 'Article Details',
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: '#f8f9fa' },
        headerTintColor: '#343a40',
        headerTitleStyle: {
          color: '#0d6efd',
          fontSize: 20,
          fontWeight: 'bold',
          fontFamily: 'sans-serif-medium', // Ensure this font is available or use a default
        },
        headerBackTitleVisible: false,
    });
  }, [navigation, paper]);

  // --- Data Fetching ---
  useEffect(() => {
    let isMounted = true;
    const loadDetails = async () => {
      if (!paper || !id) {
        if (isMounted) {
          setError("Missing required article information (paper or id).");
          setLoading(false);
        }
        return;
      }
      // Reset state before fetching new data
      if (isMounted) {
        setLoading(true);
        setError(null);
        setArticle(null); // Clear previous article data
      }
      try {
        // console.log(`Fetching details for paper: ${paper}, id: ${id}`); // Removed this log
        const res = await fetchArticleDetails(paper, id);
        if (isMounted) {
            if (res && res.data) {
                // console.log("Article data received:", res.data); // Removed this log
                setArticle(res.data);
            } else {
                 console.error("No data received from API or data format incorrect.");
                 throw new Error("No data received from API.");
            }
        }
      } catch (err: any) {
        console.error("Error loading article details:", err); // Keep error logs
        if (isMounted) {
          setError(err.message || "Failed to load article details. Please try again later.");
          setArticle(null); // Ensure article is null on error
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    loadDetails();
    return () => { isMounted = false; }; // Cleanup function
  }, [paper, id]); // Dependencies for useEffect


  // --- Rendering Functions ---
  const renderHighlightedText = (text: string | undefined | null): React.ReactNode => {
     if (!text || typeof text !== 'string') {
         return <Text>{text === null || text === undefined ? '' : String(text)}</Text>;
     }
     // Split using a regex that captures the delimiters
     const parts = text.split(/({{highlighted}}|{{\/highlighted}})/g);
     let isHighlighted = false;
     const elements: React.ReactNode[] = [];

     parts.forEach((part, index) => {
       if (part === '{{highlighted}}') {
         isHighlighted = true;
       } else if (part === '{{/highlighted}}') {
         isHighlighted = false;
       } else if (part) { // Only push non-empty parts
         elements.push(
           <Text key={index} style={isHighlighted ? styles.highlightedText : {}}>
             {part}
           </Text>
         );
       }
     });
     // Wrap the elements in a single parent Text component
     return <Text>{elements}</Text>;
   };

  const renderBulletList = (items: (JsonValue | null | undefined)[], highlight = false, style = styles.bulletText) => (
    <View style={styles.bulletListContainer}>
      {items.map((item, index) => {
        let displayItem: React.ReactNode;
        if (typeof item === 'string') {
            // Capitalize only if not highlighting, as highlighting might span sentences
            const sentence = highlight ? item : capitalizeSentence(item);
            displayItem = highlight ? renderHighlightedText(sentence) : sentence;
        } else if (item === null || item === undefined) {
            return null; // Skip rendering null/undefined items
        } else {
            // Handle non-string items gracefully
            // console.warn(`Bullet list item at index ${index} is not a string:`, item); // Keep or remove as needed
            displayItem = String(item); // Convert to string
        }
        // Ensure valid displayItem before rendering
        if (displayItem === null || displayItem === undefined || displayItem === '') return null;

        return (
          <View key={index} style={styles.bulletContainer}>
            <Text style={styles.bulletSymbol}>•</Text>
            {/* Ensure no space between the bullet Text and item Text */}
            <Text style={style}>{displayItem}</Text>
          </View>
        );
      })}
    </View>
  );

  const renderJsonValue = (value: JsonValue, isSummary: boolean, level: number): React.ReactNode => {
     if (value === null || value === undefined) {
       return null; // Don't render anything for null/undefined
     }
     if (Array.isArray(value)) {
       // Pass the correct style for JSON bullets
       return renderBulletList(value, isSummary, styles.jsonBulletText);
     }
     else if (typeof value === 'object') {
       // Check if it's a plain object before rendering
       if (Object.keys(value).length === 0) return null; // Don't render empty objects
       return renderJsonObject(value, isSummary, level + 1);
     }
     else {
         // Handle primitive types (string, number, boolean)
         const content = String(value);
         // Only capitalize non-highlighted strings
         const displayContent = isSummary && typeof value === 'string' ? content : capitalizeSentence(content);
         const textElement = isSummary && typeof value === 'string' ? renderHighlightedText(displayContent) : displayContent;

         // Make sure textElement is not empty before rendering Text
         if(textElement === '') return null;

         // Note: The leading/trailing space inside the <Text> tag is fine.
         return (
            <Text style={styles.jsonValueText}> {textElement} </Text>
         );
     }
  };

 const renderJsonObject = (data: JsonObject, isSummary: boolean, level: number = 0): React.ReactNode => {
     const entries = Object.entries(data).filter(([_, value]) => value !== null && value !== undefined); // Filter out null/undefined values at this level

     if (entries.length === 0) return null; // Don't render if object becomes empty after filtering

     return (
         <View style={[styles.jsonObjectContainer, { marginLeft: level > 0 ? 15 : 0 }]}>
             {entries.map(([key, value]) => {
                 const valueNode = renderJsonValue(value, isSummary, level);
                 // Only render the entry if the value node is not null
                 if (valueNode === null) return null;

                 return (
                     <View key={key} style={styles.jsonEntryContainer}>
                         {/* Key Text */}
                         <Text style={level > 0 ? styles.jsonNestedKey : styles.jsonTopLevelKey}>
                             {formatJsonKey(key)}:
                         </Text>
                         {/* Value Node - Rendered directly after Key Text */}
                         {valueNode}
                     </View>
                 );
             })}
         </View>
     );
  };

  // --- Loading State ---
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        {/* Conditional rendering for LottieView based on availability */}
        {typeof LottieView !== 'undefined' ? (
            <LottieView
                source={require('../assets/funny-loader.json')} // Ensure this path is correct
                autoPlay
                loop
                style={styles.lottie}
            />
         ) : (
            <ActivityIndicator size="large" color="#0d6efd" />
         )}
        <Text style={styles.loadingText}>Loading Article...</Text>
      </View>
    );
  }

  // --- Error State ---
  if (error) {
     return (
         <View style={styles.errorContainer}>
              <Icon name="alert-octagon-outline" size={60} color="#dc3545" />
              <Text style={styles.errorTitle}>Load Failed</Text>
              <Text style={styles.errorText}>{error}</Text>
              {/* Optional: Add a retry button */}
              {/* <TouchableOpacity onPress={loadDetails}> <Text>Retry</Text> </TouchableOpacity> */}
         </View>
     );
  }

  // --- Not Found State ---
  if (!article) {
    // This state covers cases where loading finished but article is still null (e.g., API returned no data)
    return (
        <View style={styles.notFoundContainer}>
             <Icon name="file-question-outline" size={60} color="#6c757d" />
             <Text style={styles.notFoundText}>Article Not Found</Text>
             <Text style={styles.notFoundSubText}>The requested article could not be loaded or does not exist.</Text>
        </View>
    );
  }

  // --- Date Formatting ---
  let formattedDate = 'Date unavailable';
  if (article.date) {
      try {
         let parsed: Date | null = null;
         const dateStr = String(article.date).trim();

         // Try parsing DD-MM-YYYY
         if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
             const parts = dateStr.split('-'); // [DD, MM, YYYY]
             // Construct ISO-like format YYYY-MM-DD for Date constructor robustness
             parsed = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00Z`);
         } else {
             // Try parsing directly (might handle ISO 8601 etc.)
             parsed = new Date(dateStr);
             // If direct parsing results in Invalid Date or a year far in the past/future (heuristic for bad parse), try appending time
             if (isNaN(parsed.getTime()) || parsed.getFullYear() < 1970 || parsed.getFullYear() > 2100) {
                 // Check if it might be a format needing explicit UTC marker?
                 if (!dateStr.includes('T') && !dateStr.includes('Z')) {
                    parsed = new Date(`${dateStr}T00:00:00Z`);
                 } else {
                     parsed = new Date(dateStr); // Retry direct parse
                 }
             }
         }

         // Final check if date is valid
         if (parsed && !isNaN(parsed.getTime())) {
             formattedDate = parsed.toLocaleDateString('en-GB', { // Example: British English format
                day: 'numeric', // 1
                month: 'long',  // January
                year: 'numeric' // 2024
             });
         } else {
             console.warn("Could not parse date:", article.date); // Keep this warning
         }
      } catch (e) {
          console.error("Error formatting date:", article.date, e); // Keep this error
      }
  }

  // --- Main Render ---
  return (
    <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
    >
      <View style={styles.contentContainer}>
        {/* Title */}
        <Text style={styles.title}>{article.title || 'Untitled Article'}</Text>

        {/* Meta Info */}
        <View style={styles.metaInfoContainer}>
            <View style={styles.metaInfo}>
                <View style={styles.metaItem}>
                    <Icon name="calendar-month-outline" size={16} color="#6c757d" style={styles.metaIcon}/>
                    <Text style={styles.metaText}>{formattedDate}</Text>
                </View>
                {article.category && (
                    <>
                     <Text style={styles.metaSeparator}>|</Text>
                     <View style={styles.metaItem}>
                         <Icon name="tag-outline" size={16} color="#6c757d" style={styles.metaIcon}/>
                         <Text style={[styles.metaText, styles.categoryText]}>{capitalizeFirst(article.category)}</Text>
                     </View>
                    </>
                )}
                {/* Check for boolean true explicitly */}
                {article.examSpecific === true && (
                    <>
                        <Text style={styles.metaSeparator}>|</Text>
                        <View style={[styles.metaItem, styles.examSpecificTag]}>
                            <Icon name="star-circle" size={14} color="#0d6efd" style={styles.metaIcon}/>
                            <Text style={styles.examSpecificText}>Exam Specific</Text>
                        </View>
                    </>
                )}
            </View>
            {/* Action Icons */}
            <View style={styles.actionIcons}>
                <TouchableOpacity onPress={() => console.log('Share Pressed')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Icon name="share-variant-outline" size={24} color="#495057" style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => console.log('Save Pressed')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Icon name="bookmark-outline" size={24} color="#495057" style={styles.icon} />
                </TouchableOpacity>
            </View>
        </View>

        <View style={styles.divider} />

        {/* --- Standard Fields Rendering (Restored) --- */}
        {/* Render only if data exists and is non-empty string/object */}
        {article.involvement && typeof article.involvement === 'string' && article.involvement.trim() && (
          <>
            <Text style={styles.heading}>Involvement</Text>
            {renderBulletList(formatToList(article.involvement), false, styles.paragraphLikeBulletText)}
          </>
        )}
        {article.past && typeof article.past === 'string' && article.past.trim() && (
          <>
            <Text style={styles.heading}>Past Context</Text>
            <Text style={styles.paragraph}>{capitalizeSentence(article.past.trim())}</Text>
          </>
        )}
        {article.present && typeof article.present === 'string' && article.present.trim() && (
          <>
            <Text style={styles.heading}>Present Situation</Text>
            <Text style={styles.paragraph}>{capitalizeSentence(article.present.trim())}</Text>
          </>
        )}
        {article.description && typeof article.description === 'string' && article.description.trim() && (
            <>
                <Text style={styles.heading}>Description</Text>
                <Text style={styles.paragraph}>{capitalizeSentence(article.description.trim())}</Text>
            </>
        )}
        {article.points && typeof article.points === 'string' && article.points.trim() && (
          <>
            <Text style={styles.heading}>Key Points</Text>
            {renderBulletList(
                article.points.split('\n').map((p: string) => p.trim()).filter(Boolean)
             )}
          </>
        )}
        {/* Ensure glossary is an object and has keys */}
        {article.glossary && typeof article.glossary === 'object' && Object.keys(article.glossary).length > 0 && (
          <>
            <Text style={styles.heading}>Glossary</Text>
            <View style={styles.bulletListContainer}>
              {Object.entries(article.glossary).map(([key, value]) => (
                 // Ensure value is not null/undefined before rendering item
                 value !== null && value !== undefined && (
                     <View key={key} style={styles.bulletContainer}>
                         <Text style={styles.bulletSymbol}>•</Text>
                         {/* Ensure no space between bullet and text */}
                         <Text style={styles.bulletText}>
                             <Text style={styles.glossaryTerm}>{capitalizeFirst(key)}:</Text>
                             {/* Add explicit space inside the Text component */}
                             {' '}
                             {capitalizeSentence(String(value))}
                         </Text>
                     </View>
                 )
              ))}
            </View>
          </>
        )}
        {/* --- End of Standard Fields --- */}


         {/* --- Deep Analysis Section --- */}
         {/* Render only if parsed data exists */}
         {parsedDeepAnalysis && (
           <>
             <View style={styles.divider} />
             <Text style={styles.heading}>Deep Analysis</Text>
             {renderJsonObject(parsedDeepAnalysis, false, 0)}
           </>
         )}

        {/* --- Summary Points Section --- */}
        {/* Render only if parsed data exists */}
        {parsedSummaryPoints && (
          <>
            <View style={styles.divider} />
            <Text style={styles.heading}>Summary & Exam Focus</Text>
            {renderJsonObject(parsedSummaryPoints, true, 0)}
          </>
        )}

      </View>
    </ScrollView>
  );
};

export default ArticleDetailScreen;

// --- Styles ---
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 60, // Extra padding at the bottom
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    fontFamily: 'serif', // Consider platform differences or custom fonts
    color: '#212529',
    marginBottom: 12,
    lineHeight: 34,
  },
  metaInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    flexWrap: 'wrap', // Allow wrapping on smaller screens
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap', // Allow inner items to wrap
    flexShrink: 1, // Allow this section to shrink if needed
    marginRight: 10, // Space before action icons
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 5, // Spacing for wrapped items
  },
  metaIcon: {
    marginRight: 5,
  },
  metaText: {
    fontSize: 14,
    color: '#6c757d',
    fontFamily: 'sans-serif', // Use system sans-serif
  },
  categoryText: {
    fontWeight: '500',
    color: '#495057',
  },
  metaSeparator: {
    color: '#adb5bd',
    marginHorizontal: 6,
    fontSize: 14,
    alignSelf: 'center', // Align separator vertically
    marginBottom: 5, // Match marginBottom of metaItem
  },
  examSpecificTag: {
    backgroundColor: '#e7f5ff', // Lighter blue background
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#cfe2ff', // Lighter blue border
  },
  examSpecificText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'sans-serif-medium', // Use medium weight sans-serif
    color: '#0d6efd', // Primary blue color
    marginLeft: 2,
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto', // Push icons to the right if space allows
  },
  icon: {
    marginLeft: 18, // Space between icons
  },
  divider: {
    height: 1,
    backgroundColor: '#dee2e6', // Lighter grey divider
    marginVertical: 20,
  },
  heading: {
    fontSize: 19,
    fontWeight: '600',
    fontFamily: 'sans-serif-medium',
    color: '#343a40', // Darker grey heading
    marginBottom: 12,
    marginTop: 10, // Space above heading
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 25, // Improved readability
    fontFamily: 'serif',
    color: '#495057', // Slightly lighter paragraph text
    marginBottom: 16,
    textAlign: 'left', // Explicitly left-align
  },
  bulletListContainer: {
    marginBottom: 10,
    paddingLeft: 5, // Indent bullet list slightly
  },
  bulletContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align bullet with top of text
    marginBottom: 10,
    paddingRight: 5, // Prevent text touching edge
  },
  bulletSymbol: {
    fontSize: 16, // Match paragraph font size
    lineHeight: 24, // Match text line height
    marginRight: 9,
    color: '#495057',
    // marginTop: 1, // Adjust vertical alignment if needed
  },
  bulletText: {
    flex: 1, // Allow text to wrap
    fontSize: 15.5,
    lineHeight: 24,
    fontFamily: 'serif',
    color: '#495057',
    textAlign: 'left',
  },
   paragraphLikeBulletText: { // Style for lists that should look like paragraphs
    flex: 1,
    fontSize: 16, // Match paragraph size
    lineHeight: 25, // Match paragraph line height
    fontFamily: 'serif',
    color: '#495057',
    textAlign: 'left',
  },
  glossaryTerm: {
    fontWeight: '600', // Bolder term
    color: '#343a40',
  },
  highlightedText: {
    fontWeight: '600', // Make highlighted text stand out
    backgroundColor: 'rgba(255, 229, 100, 0.7)', // Yellow highlight
    // paddingHorizontal: 2, // Optional padding within highlight
  },
  jsonObjectContainer: {
    marginTop: 5,
    // marginLeft is applied dynamically based on level
  },
  jsonEntryContainer: {
    marginBottom: 12,
    // Removed flexDirection: 'row' to allow key/value stacking
  },
  jsonTopLevelKey: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'sans-serif-medium',
    color: '#0d6efd', // Blue top-level keys
    marginBottom: 4, // Reduced space below key when value follows directly
  },
  jsonNestedKey: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'sans-serif-medium',
    color: '#343a40', // Darker nested keys
    marginBottom: 4, // Reduced space below key
  },
  jsonValueText: { // Style for primitive values rendered as text
    fontSize: 15.5,
    lineHeight: 24,
    fontFamily: 'serif',
    color: '#495057',
    textAlign: 'left',
    // Removed paddingLeft to rely on container structure
  },
   jsonBulletText: { // Style specifically for items in JSON arrays
    flex: 1,
    fontSize: 15.5,
    lineHeight: 24,
    fontFamily: 'serif',
    color: '#495057',
    textAlign: 'left',
   },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa', // Light background for loading
  },
  lottie: {
    width: width * 0.25, // Responsive width
    height: width * 0.25, // Responsive height
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#6c757d',
    fontFamily: 'sans-serif',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
  },
  errorTitle: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: '600',
    color: '#dc3545', // Red error color
    textAlign: 'center',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 15,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
  },
  notFoundText: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: '600',
    color: '#495057',
    textAlign: 'center',
  },
  notFoundSubText: {
    marginTop: 8,
    fontSize: 15,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
  },
});