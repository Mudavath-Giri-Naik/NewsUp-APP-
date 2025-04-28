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
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchArticleDetails } from '../utils/api';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

// --- Color Palette (Adjust as needed) ---
const COLORS = {
  primary: '#0d6efd',
  textPrimary: '#212529',
  textSecondary: '#495057',
  textMuted: '#6c757d',
  background: '#ffffff',
  backgroundSubtle: '#f8f9fa', // Used for header and now Exam Sections
  border: '#dee2e6',
  error: '#dc3545',
  warning: '#ffc107',
  warningBackground: '#fff3cd',
  warningBorder: '#ffeeba',
  warningText: '#856404',
  highlightBg: 'rgba(255, 229, 100, 0.6)',
  examTagBg: '#e7f5ff',
  examTagBorder: '#cfe2ff',
  sectionBorder: '#ced4da', // Slightly darker border for section emphasis
};

// --- Helper Types & Functions (Keep existing ones) ---
type JsonValue = string | number | boolean | null | JsonArray | JsonObject;
interface JsonObject { [key: string]: JsonValue; }
interface JsonArray extends Array<JsonValue> {}
type ParsedJsonData = JsonObject;

const parseJsonSafely = (jsonString: string | undefined | null): ParsedJsonData | null => {
  if (!jsonString || typeof jsonString !== 'string') { return null; }
  try {
    let cleanedString = jsonString.trim();
    // Handle ```json ... ``` markdown fences more robustly
    if (cleanedString.startsWith('```json') && cleanedString.endsWith('```')) {
       cleanedString = cleanedString.substring(7, cleanedString.length - 3).trim();
    } else if (cleanedString.startsWith('```') && cleanedString.endsWith('```')) {
       cleanedString = cleanedString.substring(3, cleanedString.length - 3).trim();
    }
    const parsed = JSON.parse(cleanedString);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return parsed as ParsedJsonData;
    } else if (Array.isArray(parsed)) {
        // console.warn("Parsed JSON is a root array, wrapping in object:", parsed);
        return { data: parsed } as ParsedJsonData; // Wrap array if necessary
    } else {
        // console.warn("Parsed JSON is not a root object:", parsed);
        return null; // Return null for non-objects
    }
  } catch (error: any) {
    console.error("Error parsing JSON:", error.message, "Original string:", jsonString.substring(0, 100)); // Log part of original string
    return null;
  }
};

const formatToList = (text: string | undefined | null): string[] =>
    text && typeof text === 'string'
      ? text.split('.').map(s => s.trim()).filter(s => s.length > 1 && s !== '.' && !/^\d+\.?$/.test(s) && !/^[a-zA-Z]\.$/.test(s)).map(capitalizeSentence)
      : [];

const capitalizeFirst = (word: string | undefined | null): string =>
    word && typeof word === 'string' ? word.charAt(0).toUpperCase() + word.slice(1) : '';

const capitalizeSentence = (sentence: string | undefined | null): string => {
     if (!sentence || typeof sentence !== 'string') return '';
     const trimmed = sentence.trim();
     // Enhanced filtering to avoid single letters or numbers
     if (trimmed === '.' || /^\d+\.?$/.test(trimmed) || /^[a-zA-Z]\.$/.test(trimmed)) return '';
     return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : '';
}

const formatJsonKey = (key: string): string => {
      // Improved key formatting
      return key
        .replace(/_/g, ' ') // Replace underscores
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before caps after lowercase (camelCase)
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // Add space between consecutive caps and following word (PascalCase)
        .replace(/([0-9])([A-Za-z])/g, '$1 $2') // Add space between number and letter
        .replace(/([A-Za-z])([0-9])/g, '$1 $2') // Add space between letter and number
        .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
        .replace(/ +/g, ' ') // Collapse multiple spaces
        .trim();
};


// --- Component ---
const ArticleDetailScreen = ({ route, navigation }: any) => {
  const { paper, id, displayMode } = route.params; // paper=source, displayMode=selected mode in Home

  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Memoized Parsed JSON Data ---
  const parsedDeepAnalysis = useMemo<ParsedJsonData | null>(
      () => parseJsonSafely(article?.deepAnalysisJson), [article?.deepAnalysisJson]
  );
  const parsedSummaryPoints = useMemo<ParsedJsonData | null>(
      () => parseJsonSafely(article?.summaryPointsJson), [article?.summaryPointsJson]
  );

  // --- Header Configuration ---
  useLayoutEffect(() => {
    navigation.setOptions({
        title: displayMode || 'Article Details',
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: COLORS.backgroundSubtle },
        headerTintColor: COLORS.textSecondary,
        headerTitleStyle: {
          color: COLORS.primary,
          fontSize: 18,
          fontWeight: '800',
          fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
        },
        headerBackTitleVisible: false,
        headerShadowVisible: false,
        headerBackTitle: 'Back',
    });
  }, [navigation, displayMode]);

  // --- Data Fetching (No change needed) ---
  useEffect(() => {
    let isMounted = true;
    const loadDetails = async () => {
      if (!paper || !id) {
        if (isMounted) { setError("Missing required article information (source paper or id)."); setLoading(false); } return;
      }
      if (isMounted) { setLoading(true); setError(null); }
      try {
        const res = await fetchArticleDetails(paper, id); // Fetch using actual source 'paper'
        if (isMounted) {
            if (res && res.data) { setArticle(res.data); }
            else { setArticle(null); throw new Error("No data received from API."); }
        }
      } catch (err: any) {
        console.error("Error loading article details:", err);
        if (isMounted) { setError(err.message || "Failed to load article details."); setArticle(null); }
      } finally {
        if (isMounted) { setLoading(false); }
      }
    };
    loadDetails();
    return () => { isMounted = false; };
  }, [paper, id]);


  // --- Rendering Functions ---

  // Highlighted text rendering (unchanged)
  const renderHighlightedText = (text: string | undefined | null): React.ReactNode => {
     if (!text || typeof text !== 'string') { return null; }
     const parts = text.split(/({{highlighted}}|{{\/highlighted}})/g);
     let isHighlighted = false;
     const elements: React.ReactNode[] = [];
     parts.forEach((part, index) => {
       if (part === '{{highlighted}}') { isHighlighted = true; }
       else if (part === '{{/highlighted}}') { isHighlighted = false; }
       else if (part) {
         // Ensure part is not empty or just whitespace before pushing
         if (part.trim()) {
             elements.push(<Text key={index} style={isHighlighted ? styles.highlightedText : {}}>{part}</Text>);
         }
       }
     });
     if (elements.length === 0) { return null; }
     return <Text>{elements}</Text>;
   };

  // Bullet list rendering (handles nested objects)
  const renderBulletList = (items: (JsonValue | null | undefined)[], highlight = false, style = styles.bulletText): React.ReactNode => {
    const validItems = items.filter(item => item !== null && item !== undefined && String(item).trim() !== '');
    if (validItems.length === 0) return null;

    return (
      <View style={styles.bulletListContainer}>
        {validItems.map((item, index) => {
          let contentNode: React.ReactNode = null;
          if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
              contentNode = renderJsonObject(item as JsonObject, highlight, 1); // level 1 for nested object
          } else if (typeof item === 'string') {
              // Use highlight flag to determine if capitalization is needed
              const sentence = highlight ? item : capitalizeSentence(item);
              if (sentence) {
                  // Render highlighted or plain text
                  const textElement = highlight ? renderHighlightedText(sentence) : sentence;
                  if (textElement) { contentNode = <Text style={style}>{textElement}</Text>; }
              }
          } else {
              // Handle numbers, booleans etc. directly without capitalization
              const primitiveString = String(item);
              if (primitiveString) { contentNode = <Text style={style}>{primitiveString}</Text>; }
          }

          if (contentNode === null) { return null; }

          return (
            <View key={index} style={styles.bulletContainer}>
              <Text style={styles.bulletSymbol}>•</Text>
              <View style={styles.bulletContentContainer}>{contentNode}</View>
            </View>
          );
        })}
      </View>
    );
  };

  // Recursive JSON value rendering
  const renderJsonValue = (value: JsonValue, isSummary: boolean, level: number): React.ReactNode => {
     if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) return null;
     if (Array.isArray(value)) {
       // Filter out empty/null items before rendering list
       const validItems = value.filter(item => item !== null && item !== undefined && String(item).trim() !== '');
       if (validItems.length === 0) return null;
       return renderBulletList(validItems, isSummary, styles.jsonBulletText); // Use specific style for JSON lists
     }
     else if (typeof value === 'object') {
       if (Object.keys(value).length === 0) return null;
       // Filter out null/undefined values before rendering object
       const validData = Object.entries(value)
           .filter(([_, val]) => val !== null && val !== undefined && String(val).trim() !== '')
           .reduce((obj, [key, val]) => { obj[key] = val; return obj; }, {} as JsonObject);
       if (Object.keys(validData).length === 0) return null;
       return renderJsonObject(validData, isSummary, level + 1);
     }
     else { // Primitive value
         const content = String(value);
         // Only capitalize if NOT in summary mode and it's a string that needs it
         const displayContent = isSummary && typeof value === 'string' ? content : capitalizeSentence(content);
         if (displayContent === '') return null;
         // Render highlighted only if in summary mode AND it's a string
         const textElement = isSummary && typeof value === 'string' ? renderHighlightedText(displayContent) : displayContent;
         if (textElement === null) return null;
         return <Text style={styles.jsonValueText}>{textElement}</Text>;
     }
  };

  // Recursive JSON object rendering
 const renderJsonObject = (data: JsonObject, isSummary: boolean, level: number = 0): React.ReactNode => {
     // Filter out entries with null, undefined, or empty string values *before* mapping
     const entries = Object.entries(data).filter(([_, value]) => value !== null && value !== undefined && String(value).trim() !== '');
     if (entries.length === 0) return null;

     return (
         <View style={[styles.jsonObjectContainer, level > 0 && styles.jsonObjectNested]}>
             {entries.map(([key, value]) => {
                 const valueNode = renderJsonValue(value, isSummary, level); // Pass current level
                 // Do not render the key if the value itself renders nothing
                 if (valueNode === null) return null;
                 const keyStyle = level > 0 ? styles.jsonNestedKey : styles.jsonTopLevelKey;

                 return (
                     <View key={key} style={styles.jsonEntryContainer}>
                         <Text style={keyStyle}>{formatJsonKey(key)}:</Text>
                         {valueNode}
                     </View>
                 );
             })}
         </View>
     );
  };

  // --- Loading State ---
  if (loading && !article) {
    return (
      <View style={styles.stateContainer}>
        {typeof LottieView !== 'undefined' ? (
            <LottieView source={require('../assets/funny-loader.json')} autoPlay loop style={styles.lottie} />
         ) : ( <ActivityIndicator size="large" color={COLORS.primary} /> )}
        <Text style={styles.stateText}>Loading Article...</Text>
      </View>
    );
  }

  // --- Error State ---
  if (error) {
     return (
         <View style={styles.stateContainer}>
              <Icon name="alert-octagon-outline" size={50} color={COLORS.error} />
              <Text style={[styles.stateTitle, { color: COLORS.error }]}>Load Failed</Text>
              <Text style={styles.stateText}>{error}</Text>
         </View>
     );
  }

  // --- Not Found State ---
  if (!loading && !error && !article) {
    return (
        <View style={styles.stateContainer}>
             <Icon name="file-question-outline" size={50} color={COLORS.textMuted} />
             <Text style={styles.stateTitle}>Article Not Found</Text>
             <Text style={styles.stateText}>The requested article could not be loaded or does not exist.</Text>
        </View>
    );
  }

  // --- Date Formatting ---
  let formattedDate = 'Date unavailable';
  if (article?.date) {
      try {
         let parsed: Date | null = null;
         const dateStr = String(article.date).trim();
         // Handle DD-MM-YYYY format first
         if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
             const parts = dateStr.split('-');
             const day = parseInt(parts[0], 10);
             const month = parseInt(parts[1], 10); // 1-based month
             const year = parseInt(parts[2], 10);
             if (month >= 1 && month <= 12 && day >=1 && day <= 31) { // Basic validation
                 // Use UTC to avoid timezone shifts from just date strings
                 parsed = new Date(Date.UTC(year, month - 1, day));
             }
         } else {
             // Attempt standard parsing for ISO-like formats
             parsed = new Date(dateStr);
              // If standard parsing failed and it looks like a date without time, assume UTC midnight
              if (isNaN(parsed.getTime()) && !dateStr.includes('T') && !dateStr.includes('Z')) {
                  parsed = new Date(`${dateStr}T00:00:00Z`);
              }
         }
         // Final check for validity
         if (parsed && !isNaN(parsed.getTime()) && parsed.getUTCFullYear() > 1900) {
             formattedDate = parsed.toLocaleDateString('en-GB', {
                 day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' // Specify UTC
             });
         } else { formattedDate = dateStr; } // Fallback to original string if parsing failed
      } catch (e) { formattedDate = String(article.date); } // Fallback on any error
  }


  // --- Main Render ---
  if (!article) { // Fallback just in case
      return (
          <View style={styles.stateContainer}>
               <Icon name="information-outline" size={50} color={COLORS.textMuted} />
               <Text style={styles.stateTitle}>Article data unavailable</Text>
          </View>
      );
  }

  return (
    <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
    >
      {/* Optional: Loading indicator when refreshing */}
      {loading && <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 15 }} />}

      <View style={styles.contentContainer}>
        {/* === Title === */}
        <Text style={styles.title}>{article.title || 'Untitled Article'}</Text>

        {/* === Meta Info Section === */}
        <View style={styles.metaSection}>
            <View style={styles.metaInfoContainer}>
                {/* Date */}
                <View style={styles.metaItem}>
                    <Icon name="calendar-month-outline" size={15} color={COLORS.textMuted} style={styles.metaIcon}/>
                    <Text style={styles.metaText}>{formattedDate}</Text>
                </View>
                {/* Category */}
                {article.category && (
                    <>
                     <Text style={styles.metaSeparator}>•</Text>
                     <View style={styles.metaItem}>
                         <Icon name="tag-outline" size={15} color={COLORS.textMuted} style={styles.metaIcon}/>
                         <Text style={styles.metaText}>{capitalizeFirst(article.category)}</Text>
                     </View>
                    </>
                )}

            </View>
            {/* Action Icons */}
            <View style={styles.actionIcons}>
                <TouchableOpacity onPress={() => console.log('Share')} style={styles.actionButton}>
                    <Icon name="share-variant-outline" size={22} color={COLORS.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => console.log('Save')} style={styles.actionButton}>
                    <Icon name="bookmark-outline" size={22} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </View>

        </View>

        <View style={styles.divider} />

        {/* === Main Content (Conditional) === */}
        {displayMode !== 'Exam' ? (
          // --- Non-Exam Mode Content ---
          <>
            {/* (Keep existing rendering logic for non-exam fields like involvement, past, present, description, points, glossary) */}
            {article.involvement && typeof article.involvement === 'string' && article.involvement.trim() && (
              <View style={styles.contentBlock}>
                <Text style={styles.heading}>Involvement</Text>
                {renderBulletList(formatToList(article.involvement), false, styles.paragraphLikeBulletText)}
              </View>
            )}
            {article.past && typeof article.past === 'string' && article.past.trim() && (
              <View style={styles.contentBlock}>
                <Text style={styles.heading}>Past Context</Text>
                <Text style={styles.paragraph}>{capitalizeSentence(article.past.trim())}</Text>
              </View>
            )}
            {article.present && typeof article.present === 'string' && article.present.trim() && (
              <View style={styles.contentBlock}>
                <Text style={styles.heading}>Present Situation</Text>
                <Text style={styles.paragraph}>{capitalizeSentence(article.present.trim())}</Text>
              </View>
            )}
            {article.description && typeof article.description === 'string' && article.description.trim() && (
                <View style={styles.contentBlock}>
                    <Text style={styles.heading}>Description</Text>
                    <Text style={styles.paragraph}>{capitalizeSentence(article.description.trim())}</Text>
                </View>
            )}
            {article.points && typeof article.points === 'string' && article.points.trim() && (
              <View style={styles.contentBlock}>
                <Text style={styles.heading}>Key Points</Text>
                {renderBulletList(
                    article.points.split('\n').map((p: string) => p.trim()).filter(Boolean),
                    false,
                    styles.bulletText // Use standard bullet text style
                 )}
              </View>
            )}
             {article.glossary && typeof article.glossary === 'object' && Object.keys(article.glossary).length > 0 && (
              <View style={styles.contentBlock}>
                <Text style={styles.heading}>Glossary</Text>
                <View style={styles.bulletListContainer}>
                  {Object.entries(article.glossary)
                      .filter(([_, value]) => value !== null && value !== undefined && String(value).trim() !== '')
                      .map(([key, value]) => (
                         <View key={key} style={styles.bulletContainer}>
                             <Text style={styles.bulletSymbol}>•</Text>
                             <Text style={styles.bulletText}>
                                 <Text style={styles.glossaryTerm}>{capitalizeFirst(key.trim())}:</Text>{' '}
                                 {capitalizeSentence(String(value))}
                             </Text>
                         </View>
                     )
                  )}
                </View>
              </View>
            )}
          </>
        ) : (
          // --- Exam Mode Content ---
          <>
            {/* Deep Analysis Section */}
            {parsedDeepAnalysis ? (
              // 🔥 Wrap Deep Analysis in a styled container
              <View style={styles.examSectionContainer}>
                <Text style={styles.heading}>Deep Analysis</Text>
                {renderJsonObject(parsedDeepAnalysis, false, 0)}
              </View>
            ) : ( article?.deepAnalysisJson && !loading && (
                 <View style={styles.parsingErrorContainer}>
                     <Icon name="alert-circle-outline" size={30} color={COLORS.warningText} />
                     <Text style={styles.parsingErrorText}>Deep Analysis not available due to format issues.</Text>
                 </View>
            ))}

            {/* Summary Points Section */}
            {parsedSummaryPoints ? (
              // 🔥 Wrap Summary Points in a styled container (with potential top border)
              <View style={[styles.examSectionContainer, styles.summarySectionContainer]}>
                <Text style={styles.heading}>Summary & Exam Focus</Text>
                {/* Pass isSummary=true here to enable highlighting */}
                {renderJsonObject(parsedSummaryPoints, true, 0)}
              </View>
            ) : ( article?.summaryPointsJson && !loading && (
                 <View style={styles.parsingErrorContainer}>
                     <Icon name="alert-circle-outline" size={30} color={COLORS.warningText} />
                     <Text style={styles.parsingErrorText}>Summary Points not available due to format issues.</Text>
                 </View>
            ))}

            {/* Fallback if no exam data */}
            {!parsedDeepAnalysis && !parsedSummaryPoints && !loading && (
                <View style={[styles.stateContainer, { minHeight: 100, marginTop: 20 }]}>
                     <Icon name="information-outline" size={40} color={COLORS.textMuted} />
                     <Text style={styles.stateTitle}>Exam Analysis Unavailable</Text>
                     <Text style={styles.stateText}>Detailed analysis data is missing or could not be processed.</Text>
                </View>
            )}
          </>
        )}
        {/* === END OF Main Content === */}

      </View>
    </ScrollView>
  );
};

export default ArticleDetailScreen;

// --- Styles ---
const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  // --- Title & Meta ---
  title: {
    fontSize: 28,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    fontFamily: 'serif',
    color: COLORS.textPrimary,
    marginBottom: 15,
    lineHeight: 36,
  },
  metaSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  metaInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flexShrink: 1,
    marginRight: 15,
    rowGap: 5,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: 5,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  metaSeparator: {
    color: COLORS.textMuted,
    marginHorizontal: 8,
    fontSize: 13,
  },
  examSpecificTag: {
    backgroundColor: COLORS.examTagBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.examTagBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  examSpecificText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    color: COLORS.primary,
    marginLeft: 4,
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 15,
    padding: 5,
  },
  // --- Content Blocks ---
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 25,
  },
  contentBlock: { // Wrapper for non-exam content sections
    marginBottom: 30,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    color: COLORS.textPrimary,
    marginBottom: 15,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: 'serif',
    color: COLORS.textSecondary,
    textAlign: 'left',
  },
  // --- Bullet List Styles ---
  bulletListContainer: {
    paddingLeft: 5,
  },
  bulletContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletSymbol: {
    fontSize: 16,
    lineHeight: 26,
    marginRight: 10,
    color: COLORS.textSecondary,
    marginTop: Platform.OS === 'ios' ? 1 : 0,
  },
  bulletContentContainer: {
    flex: 1,
  },
  bulletText: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: 'serif',
    color: COLORS.textSecondary,
    textAlign: 'left',
  },
   paragraphLikeBulletText: { // Re-use paragraph style for consistency
    fontSize: 16,
    lineHeight: 26,
    fontFamily: 'serif',
    color: COLORS.textSecondary,
    textAlign: 'left',
  },
  // --- Glossary Styles ---
  glossaryTerm: {
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  // --- JSON Rendering Styles ---
  jsonObjectContainer: {
    marginTop: 8,
  },
  jsonObjectNested: {
      marginLeft: 10,
      paddingLeft: 10,
      borderLeftWidth: 2,
      borderLeftColor: COLORS.border,
      marginTop: 8,
      marginBottom: 8,
  },
  jsonEntryContainer: {
    marginBottom: 15,
  },
  jsonTopLevelKey: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    color: COLORS.primary, // Use primary color for top keys
    marginBottom: 8,
  },
  jsonNestedKey: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    color: COLORS.textPrimary, // Darker text for nested keys
    marginBottom: 6,
  },
  jsonValueText: { // Style for primitive values within JSON
    fontSize: 16,
    lineHeight: 26,
    fontFamily: 'serif',
    color: COLORS.textSecondary,
    textAlign: 'left',
  },
   jsonBulletText: { // Style for bullet items within JSON
    fontSize: 16,
    lineHeight: 26,
    fontFamily: 'serif',
    color: COLORS.textSecondary,
    textAlign: 'left',
   },
  // --- Highlighted Text ---
  highlightedText: {
    fontWeight: '600', // Make highlighted text stand out
    backgroundColor: COLORS.highlightBg,
    // Optional: Add slight padding for better visual appearance
    // paddingHorizontal: 2,
    // marginHorizontal: -2, // Counteract padding if added
  },
  // --- Loader, Error, Not Found States ---
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: COLORS.background,
    minHeight: 300,
  },
  lottie: {
    width: width * 0.25, height: width * 0.25, marginBottom: 15,
  },
  stateTitle: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  stateText: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  // --- Parsing Error Specific Styles ---
  parsingErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningBackground,
    padding: 15,
    borderRadius: 6,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.warningBorder,
  },
  parsingErrorText: {
    marginLeft: 10,
    color: COLORS.warningText,
    fontSize: 14,
    flexShrink: 1,
    lineHeight: 20,
  },

  // 🔥 --- NEW Styles for Exam Mode Sections --- 🔥
  examSectionContainer: {
      backgroundColor: COLORS.backgroundSubtle, // Subtle background like header
      borderRadius: 8,                       // Rounded corners
      padding: 20,                           // Inner padding
      marginBottom: 30,                      // Space below this section container
      borderWidth: 1,                        // Subtle border
      borderColor: COLORS.border,            // Use light border color
  },
  summarySectionContainer: {
      // Optional: Add a top border specifically to the summary section for extra separation
      // borderTopWidth: 2,
      // borderTopColor: COLORS.sectionBorder, // Use a slightly darker border for emphasis
      // marginTop: 30, // Ensure margin if border is added (adjust examSectionContainer marginBottom)
      // Or change background color slightly
      // backgroundColor: '#fdfdff', // Even subtler difference
  },
  // --- End New Styles --- 🔥
});