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
  StatusBar, // Import StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchArticleDetails } from '../utils/api'; // Assuming this path is correct
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

// --- Enhanced Color Palette ---
const COLORS = {
  primary: '#007AFF', // Vibrant Blue (Apple style)
  primarySubtle: '#E5F1FF', // Light blue background
  secondaryAccent: '#34C759', // Vibrant Green (Apple style) - For Exam Mode
  secondaryAccentSubtle: '#EAF9EC', // Light green background

  textPrimary: '#1C1C1E',   // Almost Black (iOS system dark gray)
  textSecondary: '#636366', // Medium Gray (iOS system gray)
  textTertiary: '#8E8E93', // Lighter Gray (iOS system gray 2) - For meta text, bullets
  textMuted: '#AEAEB2',    // Even Lighter Gray (iOS system gray 3)

  background: '#FFFFFF', // White background
  backgroundSubtle: '#F2F2F7', // Off-white/Very Light Gray (iOS grouped background)
  backgroundElevated: '#FFFFFF', // White for cards/elevated sections

  border: '#D1D1D6', // Light gray border (iOS Separator)
  divider: '#E5E5EA', // Slightly lighter divider

  error: '#FF3B30',   // Vibrant Red (iOS system red)
  warning: '#FF9500', // Vibrant Orange (iOS system orange)
  warningBackground: '#FFF8E6', // Light orange background
  warningBorder: '#FFE6B3',
  warningText: '#A66300',

  highlightBg: 'rgba(255, 220, 0, 0.5)', // Brighter yellow highlight

  // Specific Exam Mode colors
  examSectionBorder: '#A0DBC7', // A border matching the accent green
  examHeadingColor: '#008240', // Darker Green for contrast on subtle bg
};

// --- Helper Types & Functions (Keep as is) ---
type JsonValue = string | number | boolean | null | JsonArray | JsonObject;
interface JsonObject { [key: string]: JsonValue; }
interface JsonArray extends Array<JsonValue> {}
type ParsedJsonData = JsonObject;

const parseJsonSafely = (jsonString: string | undefined | null): ParsedJsonData | null => {
    if (!jsonString || typeof jsonString !== 'string') { return null; }
    try {
        let cleanedString = jsonString.trim();
        if (cleanedString.startsWith('```json') && cleanedString.endsWith('```')) {
        cleanedString = cleanedString.substring(7, cleanedString.length - 3).trim();
        } else if (cleanedString.startsWith('```') && cleanedString.endsWith('```')) {
        cleanedString = cleanedString.substring(3, cleanedString.length - 3).trim();
        }
        // Attempt to fix trailing commas before parsing
        cleanedString = cleanedString.replace(/,\s*([}\]])/g, '$1');
        const parsed = JSON.parse(cleanedString);
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
            return parsed as ParsedJsonData;
        } else if (Array.isArray(parsed)) {
            return { data: parsed } as ParsedJsonData; // Wrap array if necessary
        } else {
            return null; // Return null for non-objects
        }
    } catch (error: any) {
        console.error("Error parsing JSON:", error.message, "Original string snippet:", jsonString.substring(0, 150));
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
     if (trimmed === '.' || /^\d+\.?$/.test(trimmed) || /^[a-zA-Z]\.$/.test(trimmed)) return '';
     // Only capitalize if it doesn't already start with an uppercase letter
     return trimmed ? (/^[A-Z]/.test(trimmed) ? trimmed : trimmed.charAt(0).toUpperCase() + trimmed.slice(1)) : '';
}

const formatJsonKey = (key: string): string => {
      // Improved formatting - make it more human-readable
      return key
        .replace(/_/g, ' ') // Underscores to spaces
        .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase to spaces
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // PascalCase to spaces
        .replace(/([0-9])([A-Za-z])/g, '$1 $2') // numberLetter
        .replace(/([A-Za-z])([0-9])/g, '$1 $2') // letterNumber
        .toLowerCase() // Convert to lowercase first
        .replace(/^./, (str) => str.toUpperCase()) // Capitalize the very first letter
        .replace(/ id /g, ' ID ') // Specific common terms like ID
        .replace(/ url /g, ' URL ') // Specific common terms like URL
        .replace(/ api /g, ' API ') // Specific common terms like API
        .replace(/ +/g, ' ') // Collapse multiple spaces
        .trim();
};


// --- Component ---
const ArticleDetailScreen = ({ route, navigation }: any) => {
  const { paper, id, displayMode } = route.params;

  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parsedDeepAnalysis = useMemo<ParsedJsonData | null>(
      () => parseJsonSafely(article?.deepAnalysisJson), [article?.deepAnalysisJson]
  );
  const parsedSummaryPoints = useMemo<ParsedJsonData | null>(
      () => parseJsonSafely(article?.summaryPointsJson), [article?.summaryPointsJson]
  );

  // --- Header Configuration (Logic unchanged) ---
  useLayoutEffect(() => {
    let headerTitle;
    if (displayMode === 'Exam') {
        headerTitle = 'Exam Focus';
    } else {
        headerTitle = displayMode || 'Article Details';
    }

    navigation.setOptions({
        title: headerTitle,
        headerTitleAlign: 'center',
        headerStyle: {
            backgroundColor: COLORS.backgroundSubtle, // Use subtle background for header
            elevation: 0, // Remove shadow on Android
            shadowOpacity: 0, // Remove shadow on iOS
            borderBottomWidth: 0, // Remove bottom border if any
        },
        headerTintColor: COLORS.primary, // Use primary color for back arrow
        headerTitleStyle: {
          color: COLORS.textPrimary, // Use primary text color for title
          fontSize: 17, // Standard iOS Title size
          fontWeight: '600', // Standard iOS Title weight
        },
        headerBackTitleVisible: false,
        headerShadowVisible: false,
    });
  }, [navigation, displayMode]);

  // --- Data Fetching (Logic unchanged) ---
  useEffect(() => {
    let isMounted = true;
    const loadDetails = async () => {
      if (!paper || !id) {
        if (isMounted) { setError("Missing required article information (source paper or id)."); setLoading(false); } return;
      }
      if (isMounted) { setLoading(true); setError(null); }
      try {
        const res = await fetchArticleDetails(paper, id);
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

  const renderHighlightedText = (text: string | undefined | null): React.ReactNode => {
     if (!text || typeof text !== 'string') { return null; }
     const parts = text.split(/({{highlighted}}|{{\/highlighted}})/g);
     let isHighlighted = false;
     const elements: React.ReactNode[] = [];
     parts.forEach((part, index) => {
       if (part === '{{highlighted}}') { isHighlighted = true; }
       else if (part === '{{/highlighted}}') { isHighlighted = false; }
       else if (part) {
         if (part.trim()) {
             elements.push(<Text key={index} style={isHighlighted ? styles.highlightedText : {}}>{part}</Text>);
         }
       }
     });
     if (elements.length === 0) { return null; }
     // Wrap in a Text component to ensure consistent styling application
     return <Text style={styles.paragraph}>{elements}</Text>;
   };

  // Updated renderBulletList to handle potential highlighted text within list items
  const renderBulletList = (items: (JsonValue | null | undefined)[], highlight = false, style = styles.bulletText): React.ReactNode => {
      const validItems = items.filter(item => item !== null && item !== undefined && String(item).trim() !== '');
      if (validItems.length === 0) return null;

      return (
        <View style={styles.bulletListContainer}>
          {validItems.map((item, index) => {
            let contentNode: React.ReactNode = null;
            if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                contentNode = renderJsonObject(item as JsonObject, highlight, 1);
            } else if (typeof item === 'string') {
                const sentence = capitalizeSentence(item); // Always capitalize list items
                if (sentence) {
                    // Check if highlighting is needed for this list
                    contentNode = highlight ? renderHighlightedText(sentence) : <Text style={style}>{sentence}</Text>;
                }
            } else {
                // Handle numbers, booleans etc. directly
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


  // Updated JSON value rendering for better clarity
  const renderJsonValue = (value: JsonValue, isSummary: boolean, level: number): React.ReactNode => {
      if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) return null;
      if (Array.isArray(value)) {
          const validItems = value.filter(item => item !== null && item !== undefined && String(item).trim() !== '');
          if (validItems.length === 0) return null;
          // Use specific JSON bullet style, pass highlight flag
          return renderBulletList(validItems, isSummary, styles.jsonBulletText);
      }
      else if (typeof value === 'object') {
          if (Object.keys(value).length === 0) return null;
          const validData = Object.entries(value)
              .filter(([_, val]) => val !== null && val !== undefined && String(val).trim() !== '')
              .reduce((obj, [key, val]) => { obj[key] = val; return obj; }, {} as JsonObject);
          if (Object.keys(validData).length === 0) return null;
          return renderJsonObject(validData, isSummary, level + 1);
      }
      else { // Primitive value (string, number, boolean)
          const content = String(value);
          const displayContent = capitalizeSentence(content); // Capitalize sentences
          if (displayContent === '') return null;
          // Render highlighted only if in summary mode AND it's a string
          const textElement = isSummary && typeof value === 'string' ? renderHighlightedText(displayContent) : displayContent;
          if (textElement === null) return null;
          // Use jsonValueText which might contain nested Text for highlighting
          return <Text style={styles.jsonValueText}>{textElement}</Text>;
      }
  };


  // Updated JSON object rendering
  const renderJsonObject = (data: JsonObject, isSummary: boolean, level: number = 0): React.ReactNode => {
      const entries = Object.entries(data).filter(([_, value]) => value !== null && value !== undefined && String(value).trim() !== '');
      if (entries.length === 0) return null;

      return (
          <View style={[styles.jsonObjectContainer, level > 0 && styles.jsonObjectNested]}>
              {entries.map(([key, value]) => {
                  const valueNode = renderJsonValue(value, isSummary, level);
                  if (valueNode === null) return null;
                  // Use different styles based on level for visual hierarchy
                  const keyStyle = level === 0 ? styles.jsonTopLevelKey : styles.jsonNestedKey;
                  const keyColor = level === 0 ? (isSummary ? COLORS.examHeadingColor : COLORS.primary) : COLORS.textPrimary;

                  return (
                      <View key={key} style={styles.jsonEntryContainer}>
                          {/* Render Key */}
                          <View style={styles.jsonKeyContainer}>
                              <Text style={[keyStyle, { color: keyColor }]}>
                                  {formatJsonKey(key)}
                              </Text>
                          </View>
                          {/* Render Value (handles nested objects/arrays) */}
                          <View style={styles.jsonValueContainer}>
                            {valueNode}
                          </View>
                      </View>
                  );
              })}
          </View>
      );
  };


  // --- Section Rendering Helper ---
  const renderSection = (
      title: string,
      content: React.ReactNode | string | null | undefined,
      iconName: string,
      isExamSection: boolean = false,
      isList: boolean = false, // Flag if content should be treated as a pre-formatted list string
      isHighlightedList: boolean = false // Flag if list items should check for highlighting
  ): React.ReactNode => {
      if (!content || (typeof content === 'string' && !content.trim())) {
          return null;
      }

      let contentNode: React.ReactNode;
      if (React.isValidElement(content)) {
          contentNode = content; // Already rendered content (like from renderJsonObject)
      } else if (isList && typeof content === 'string') {
          // Handle content that's a string meant to be split into a list
          const listItems = content.split('\n').map(p => p.trim()).filter(Boolean);
          contentNode = renderBulletList(listItems, isHighlightedList, styles.bulletText);
      } else if (typeof content === 'string') {
          // Handle regular paragraph content
          contentNode = <Text style={styles.paragraph}>{capitalizeSentence(content.trim())}</Text>;
      } else {
          return null; // Should not happen with current usage, but good failsafe
      }

      const headingColor = isExamSection ? COLORS.examHeadingColor : COLORS.primary;

      return (
          <View style={styles.contentBlock}>
              <View style={styles.sectionHeaderContainer}>
                  <Icon name={iconName} size={20} color={headingColor} style={styles.sectionHeaderIcon}/>
                  <Text style={[styles.heading, { color: headingColor }]}>{title}</Text>
              </View>
              {contentNode}
          </View>
      );
  };


  // --- Loading State ---
  if (loading && !article) {
    return (
      <View style={styles.stateContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
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
             <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
             <Icon name="alert-octagon-outline" size={60} color={COLORS.error} />
             <Text style={[styles.stateTitle, { color: COLORS.error }]}>Load Failed</Text>
             <Text style={styles.stateText}>{error}</Text>
         </View>
     );
  }

  // --- Not Found State ---
  if (!loading && !error && !article) {
    return (
        <View style={styles.stateContainer}>
             <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
             <Icon name="file-question-outline" size={60} color={COLORS.textMuted} />
             <Text style={styles.stateTitle}>Article Not Found</Text>
             <Text style={styles.stateText}>The requested article could not be loaded.</Text>
        </View>
    );
  }

  // --- Date Formatting (Keep as is, but ensure robustness) ---
  let formattedDate = 'Date unavailable';
    if (article?.date) {
        try {
           let parsed: Date | null = null;
           const dateStr = String(article.date).trim();
           // Handle DD-MM-YYYY format first more reliably
           const ddMMyyyyMatch = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
           if (ddMMyyyyMatch) {
               const day = parseInt(ddMMyyyyMatch[1], 10);
               const month = parseInt(ddMMyyyyMatch[2], 10); // 1-based month
               const year = parseInt(ddMMyyyyMatch[3], 10);
               if (month >= 1 && month <= 12 && day >=1 && day <= 31 && year > 1900) {
                   parsed = new Date(Date.UTC(year, month - 1, day));
               }
           } else {
               // Attempt standard parsing for ISO-like formats or other recognizable formats
               parsed = new Date(dateStr);
               // If standard parsing failed and it looks like a date without time, assume UTC midnight
               if (isNaN(parsed.getTime()) && !dateStr.includes('T') && !dateStr.includes('Z') && dateStr.includes('-')) {
                   // Check common date-only formats like YYYY-MM-DD
                  try {
                      const parts = dateStr.split(/[-/]/);
                      if (parts.length === 3) {
                          const year = parseInt(parts[0]);
                          const month = parseInt(parts[1]);
                          const day = parseInt(parts[2]);
                           if (year > 1900 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                              parsed = new Date(Date.UTC(year, month - 1, day));
                          }
                      }
                  } catch { /* Ignore secondary parsing errors */ }
               }
           }
           // Final check for validity
           if (parsed && !isNaN(parsed.getTime()) && parsed.getUTCFullYear() > 1900) {
               formattedDate = parsed.toLocaleDateString('en-GB', {
                   day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' // Specify UTC
               });
           } else {
               console.warn("Could not parse date:", dateStr);
               formattedDate = dateStr; // Fallback to original string if parsing failed
           }
        } catch (e) {
            console.error("Error formatting date:", e);
            formattedDate = String(article.date); // Fallback on any error
        }
    }


  // --- Main Render ---
  if (!article) { // Should be caught earlier, but defensive check
      return (
          <View style={styles.stateContainer}>
              <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
              <Icon name="information-outline" size={60} color={COLORS.textMuted} />
              <Text style={styles.stateTitle}>Article data unavailable</Text>
          </View>
      );
  }

  // Determine status bar style based on background
  const scrollBackgroundColor = displayMode === 'Exam' ? COLORS.backgroundSubtle : COLORS.background;

  return (
    <>
    <StatusBar
        barStyle="dark-content" // Always dark content for light backgrounds
        backgroundColor={COLORS.backgroundSubtle} // Match header background
    />
    <ScrollView
        style={[styles.scrollView, { backgroundColor: scrollBackgroundColor }]} // Dynamic background
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
    >
      {/* Optional: Loading indicator ONLY when refreshing, not initial load */}
      {/* {loading && <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 15 }} />} */}

      <View style={styles.contentContainer}>
        {/* === Title === */}
        <Text style={styles.title}>{article.title || 'Untitled Article'}</Text>

        {/* === Meta Info Section === */}
        <View style={styles.metaSection}>
            <View style={styles.metaInfoContainer}>
                {/* Date */}
                <View style={styles.metaItem}>
                    <Icon name="calendar-month-outline" size={16} color={COLORS.textTertiary} style={styles.metaIcon}/>
                    <Text style={styles.metaText}>{formattedDate}</Text>
                </View>
                {/* Category */}
                {article.category && (
                    <>
                     <Text style={styles.metaSeparator}>•</Text>
                     <View style={styles.metaItem}>
                         <Icon name="tag-outline" size={16} color={COLORS.textTertiary} style={styles.metaIcon}/>
                         <Text style={styles.metaText}>{capitalizeFirst(article.category)}</Text>
                     </View>
                    </>
                )}
            </View>
            {/* Action Icons */}
            <View style={styles.actionIcons}>
                <TouchableOpacity onPress={() => console.log('Share')} style={styles.actionButton}>
                    <Icon name="share-variant-outline" size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => console.log('Save')} style={styles.actionButton}>
                    <Icon name="bookmark-plus-outline" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
        </View>

        <View style={styles.mainDivider} />

        {/* === Main Content (Conditional) === */}
        {displayMode !== 'Exam' ? (
          // --- Non-Exam Mode Content ---
          <View style={styles.standardContentArea}>
            {renderSection("Involvement", formatToList(article.involvement), 'account-group-outline')}
            {renderSection("Past Context", article.past, 'history')}
            {renderSection("Present Situation", article.present, 'timeline-text-outline')}
            {renderSection("Description", article.description, 'text-long')}
            {renderSection("Key Points", article.points, 'format-list-bulleted', false, true)}
            {/* Render Glossary differently */}
             {article.glossary && typeof article.glossary === 'object' && Object.keys(article.glossary).length > 0 && (
                 renderSection("Glossary", (
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
                 ), 'book-open-page-variant-outline')
             )}
          </View>
        ) : (
          // --- Exam Mode Content ---
          <View style={styles.examContentArea}>
            {/* Deep Analysis Section */}
            {parsedDeepAnalysis ? (
                renderSection("Deep Analysis", renderJsonObject(parsedDeepAnalysis, false, 0), 'brain-outline', true)
            ) : ( article?.deepAnalysisJson && !loading && (
                 <View style={styles.parsingErrorContainer}>
                     <Icon name="alert-circle-outline" size={30} color={COLORS.warningText} />
                     <Text style={styles.parsingErrorText}>Deep Analysis not available due to format issues.</Text>
                 </View>
            ))}

            {/* Summary Points Section */}
            {parsedSummaryPoints ? (
                 renderSection("Summary & Exam Focus", renderJsonObject(parsedSummaryPoints, true, 0), 'target-account', true)
            ) : ( article?.summaryPointsJson && !loading && (
                 <View style={styles.parsingErrorContainer}>
                     <Icon name="alert-circle-outline" size={30} color={COLORS.warningText} />
                     <Text style={styles.parsingErrorText}>Summary Points not available due to format issues.</Text>
                 </View>
            ))}

            {/* Fallback if no exam data */}
            {!parsedDeepAnalysis && !parsedSummaryPoints && !loading && (
                <View style={[styles.stateContainer, styles.inlineStateContainer]}>
                     <Icon name="information-outline" size={40} color={COLORS.textMuted} />
                     <Text style={styles.stateTitle}>Exam Analysis Unavailable</Text>
                     <Text style={styles.stateText}>Detailed analysis data is missing or could not be processed.</Text>
                </View>
            )}
          </View>
        )}
        {/* === END OF Main Content === */}

      </View>
    </ScrollView>
    </>
  );
};

export default ArticleDetailScreen;

// --- Styles ---
const styles = StyleSheet.create({
  scrollView: {
    // backgroundColor set dynamically
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 60, // More space at the bottom
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20, // Consistent padding
  },
  // --- Title & Meta ---
  title: {
    fontSize: 26, // Slightly smaller, more standard title size
    fontWeight: '700', // Bold
    color: COLORS.textPrimary,
    marginBottom: 12,
    lineHeight: 34,
    // fontFamily: 'System', // Use system font for titles if desired
  },
  metaSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'nowrap', // Prevent wrapping of action icons
  },
  metaInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1, // Allow text to shrink if needed
    marginRight: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: 6,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.textTertiary, // Use tertiary text color
    // fontFamily: 'System',
  },
  metaSeparator: {
    color: COLORS.textMuted, // Use muted color for separator
    marginHorizontal: 6,
    fontSize: 14, // Slightly larger dot
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 12, // Slightly less margin
    padding: 8, // Add padding for easier tap target
  },
  // --- Dividers ---
  mainDivider: {
    height: 1,
    backgroundColor: COLORS.divider, // Use specific divider color
    marginVertical: 25, // Consistent vertical margin
  },
  // --- Content Areas ---
  standardContentArea: {
    backgroundColor: COLORS.background, // Ensure white background for standard
    paddingBottom: 1, // Prevents margin collapse issues sometimes
  },
  examContentArea: {
    // backgroundColor: COLORS.backgroundSubtle, // Subtle background for exam area
    // borderRadius: 12, // Optional: Rounded corners for the whole exam section
    // padding: 15, // Optional: Padding around the exam sections
    // borderWidth: 1,
    // borderColor: COLORS.border,
  },
  contentBlock: { // Wrapper for each section (heading + content)
    marginBottom: 35, // Increased spacing between sections
  },
  // --- Section Heading ---
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18, // Space between heading and content
    // Optional: Add a top border for visual separation
    // borderTopWidth: 1,
    // borderTopColor: COLORS.divider,
    // paddingTop: 15,
  },
  sectionHeaderIcon: {
    marginRight: 10,
  },
  heading: {
    fontSize: 19, // Slightly larger heading
    fontWeight: '600', // Semibold
    flex: 1, // Allow text to wrap if needed
    // Color set dynamically in renderSection
    // fontFamily: 'System',
  },
  // --- Text Styles ---
  paragraph: {
    fontSize: 16,
    lineHeight: 27, // Improved line height for readability
    color: COLORS.textSecondary,
    // fontFamily: 'serif', // Keep serif for body text if desired, or switch to System
    textAlign: 'left',
    marginBottom: 8, // Space below paragraphs if needed
  },
  // --- Bullet List Styles ---
  bulletListContainer: {
    marginTop: 5, // Space above the list
    paddingLeft: 5, // Indentation for the list
  },
  bulletContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align items to the top
    marginBottom: 14, // Increased space between bullet points
  },
  bulletSymbol: {
    fontSize: 16,
    lineHeight: 27, // Match paragraph line height
    marginRight: 12, // More space after bullet
    color: COLORS.textTertiary, // Use tertiary color for bullets
    marginTop: Platform.OS === 'ios' ? 0 : 2, // Adjust vertical alignment
  },
  bulletContentContainer: {
    flex: 1, // Allow content to take remaining space
  },
  bulletText: { // Style for the text part of the bullet item
    fontSize: 16,
    lineHeight: 27,
    color: COLORS.textSecondary,
    // fontFamily: 'serif', // Match paragraph font
    textAlign: 'left',
  },
  // --- Glossary Styles ---
  glossaryTerm: {
    fontWeight: '600',
    color: COLORS.textPrimary, // Make term stand out
  },
  // --- JSON Rendering Styles (Refined) ---
  jsonObjectContainer: {
    marginTop: 10,
  },
  jsonObjectNested: {
      // Subtle indentation and border for clarity
      marginLeft: 15,
      paddingLeft: 15,
      borderLeftWidth: 2,
      borderLeftColor: COLORS.border,
      marginTop: 10,
      marginBottom: 5,
  },
  jsonEntryContainer: {
    marginBottom: 16, // More space between JSON entries
  },
  jsonKeyContainer: {
    marginBottom: 6, // Space between key and value
  },
  jsonValueContainer: {
    // Container for the value, helps with layout if value is complex (object/array)
  },
  jsonTopLevelKey: {
    fontSize: 17, // Larger key for top level
    fontWeight: '600',
    // Color set dynamically
    // fontFamily: 'System',
  },
  jsonNestedKey: {
    fontSize: 16, // Slightly smaller nested key
    fontWeight: '600',
    color: COLORS.textPrimary, // Consistent dark color for nested keys
    // fontFamily: 'System',
  },
  jsonValueText: { // Style for primitive values AND wrapper for highlighted text within JSON
    fontSize: 16,
    lineHeight: 26, // Consistent line height
    color: COLORS.textSecondary,
    // fontFamily: 'serif', // Match body text font
    textAlign: 'left',
  },
  jsonBulletText: { // Style specifically for bullet items rendered within JSON
    fontSize: 16,
    lineHeight: 26,
    color: COLORS.textSecondary,
    // fontFamily: 'serif',
    textAlign: 'left',
   },
  // --- Highlighted Text ---
  highlightedText: {
    fontWeight: '600', // Bolder highlight
    backgroundColor: COLORS.highlightBg, // Use updated color
    // Add slight horizontal padding and negative margin to make bg cover better
    paddingHorizontal: 3,
    marginHorizontal: -3,
    borderRadius: 3, // Slightly rounded highlight background
  },
  // --- Loader, Error, Not Found States ---
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: COLORS.background,
    minHeight: Dimensions.get('window').height * 0.6, // Ensure it takes significant space
  },
  inlineStateContainer: { // Style for state containers shown within content flow (e.g., Exam fallback)
      minHeight: 150,
      marginTop: 20,
      backgroundColor: COLORS.backgroundSubtle, // Match surrounding area if needed
      borderRadius: 8,
      padding: 20,
  },
  lottie: {
    width: width * 0.3, height: width * 0.3, marginBottom: 20,
  },
  stateTitle: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  stateText: {
    fontSize: 15,
    color: COLORS.textSecondary, // Use secondary text color
    textAlign: 'center',
    lineHeight: 22,
  },
  // --- Parsing Error Specific Styles ---
  parsingErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningBackground,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginVertical: 15,
    borderLeftWidth: 4, // Accent border on the left
    borderLeftColor: COLORS.warning,
  },
  parsingErrorText: {
    marginLeft: 12,
    color: COLORS.warningText,
    fontSize: 14,
    flexShrink: 1,
    lineHeight: 20,
  },
  // --- Exam Section Container (Optional Wrapper) ---
  // Remove specific examSectionContainer style if wrapping individual sections
  // examSectionContainer: {
  //     backgroundColor: COLORS.backgroundSubtle, // Subtle background for exam mode
  //     borderRadius: 10,
  //     paddingVertical: 10, // Padding applied within renderSection now
  //     paddingHorizontal: 15,
  //     marginBottom: 25,
  //     borderWidth: 1,
  //     borderColor: COLORS.border, // Use standard border or exam specific below
  //     // borderColor: COLORS.examSectionBorder, // Optional: Use exam accent border
  // },
  // summarySectionContainer: {}, // Not needed if styling individual sections
});