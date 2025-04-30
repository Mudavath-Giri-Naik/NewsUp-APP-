// screens/ProfileScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView, // Use SafeAreaView for overall screen layout
  Dimensions,
  Platform,
  Alert,
  StatusBar, // Keep StatusBar import to explicitly set style
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { fetchDailyResourcesByDate, DailyResource } from '../utils/api'; // Verify path
import { RootStackParamList } from '../utils/types'; // Verify path

// --- Navigation & Route Types ---
type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Resources'
>;
type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Resources'>;

type TabType = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

// Helper function to format date - Remains the same
const formatDisplayDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Date Not Available';
    try {
        const parts = dateString.split('-');
        if (parts.length !== 3) return dateString;
        const dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        if (isNaN(dateObj.getTime())) return dateString;
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return dateObj.toLocaleDateString('en-GB', options);
    } catch (e) { return dateString; }
};


const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const route = useRoute<ProfileScreenRouteProp>();

  const [selectedTab, setSelectedTab] = useState<TabType>('Daily');
  const [resources, setResources] = useState<DailyResource[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const passedDate = route.params?.date;

  // Removed Sticky Header State

  // --- Core Logic (Data Fetching) - Remains the same ---
  const loadDailyResources = useCallback(async () => {
    if (selectedTab !== 'Daily' || !passedDate) {
        setResources([]); setLoading(false);
        if (!passedDate && selectedTab === 'Daily') { setError("Date parameter is missing."); }
        else { setError(null); }
        return;
    };
    setLoading(true); setError(null); setResources([]);
    try {
      const response = await fetchDailyResourcesByDate(passedDate);
      setResources(response.data);
      if (response.data.length === 0) { setError(`No resources found for ${formatDisplayDate(passedDate)}.`); }
      // Clear error on successful fetch with data
      else { setError(null); }
    } catch (err: any) {
      console.error(`Error fetching daily resources for ${passedDate}:`, err);
      const message = err.response?.data?.message || err.message || 'Failed to fetch resources';
      setError(`Error loading data: ${message}`); setResources([]);
    } finally { setLoading(false); }
  }, [selectedTab, passedDate]);

  useEffect(() => {
    loadDailyResources();
  }, [loadDailyResources]);
  // --- End Core Logic ---

  // --- UI Rendering ---

  // Determine dynamic header content based on selectedTab - Remains the same
  let headerTitlePrefix = 'UPSC ';
  let headerTitleDynamicPart = 'DAILY';
  let headerTitleSuffix = ' CURRENT AFFAIRS';
  let headerDisplaySource = 'Insights IAS';
  switch (selectedTab) {
      case 'Weekly': headerTitleDynamicPart = 'WEEKLY'; headerDisplaySource = 'ForumIAS Weekly CA Compilation'; break;
      case 'Monthly': headerTitleDynamicPart = 'MONTHLY'; headerDisplaySource = 'Vision IAS PT365'; break;
      case 'Yearly': headerTitleDynamicPart = 'YEARLY'; headerDisplaySource = 'Vision IAS PT365 Annual Booklets'; break;
  }

  // Card rendering function - Remains the same (already defensive)
  const renderResourceItem = ({ item }: { item: DailyResource }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ResourceDetail', { resource: item })}
      activeOpacity={0.8} >
       <View style={styles.cardHeaderContainer}>
         <Text style={styles.cardTopic}>{String(item.Topic ?? 'No Topic')}</Text>
         {item.Category ? (<View style={styles.categoryBadge}><Text style={styles.categoryText} numberOfLines={1} ellipsizeMode="tail">{String(item.Category)}</Text></View>) : null}
       </View>
       <Text style={styles.cardContext} numberOfLines={4} ellipsizeMode="tail">{String(item.Context ?? '')}</Text>
       <View style={styles.cardFooter}>
         {item.Syllabus_Relevance ? (<View style={styles.metaItem}><Ionicons name="book-outline" size={14} color={styles.metaIcon.color} style={styles.metaIcon} /><Text style={styles.metaText} numberOfLines={2} ellipsizeMode="tail">{String(item.Syllabus_Relevance)}</Text></View>) : null}
         {item.Source ? (<View style={[styles.metaItem, styles.metaItemRight]}><Ionicons name="newspaper-outline" size={14} color={styles.metaIcon.color} style={styles.metaIcon} /><Text style={styles.metaText} numberOfLines={1} ellipsizeMode="tail">{String(item.Source)}</Text></View>) : null}
       </View>
    </TouchableOpacity>
  );

  // Initial Header Component (Scrollable) - Remains the same
  const renderListHeader = () => (
    <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>
            {headerTitlePrefix}
            <Text style={styles.headerTitleDynamic}>{headerTitleDynamicPart}</Text>
            {headerTitleSuffix}
        </Text>
        <Text style={styles.headerSubtitle}>Date: {formatDisplayDate(passedDate)}</Text>
        <Text style={styles.headerSource}>Source: {headerDisplaySource}</Text>
    </View>
  );

  // Content Area Logic - Renders FlatList or status messages
  // Refined logic to explicitly return components
  const renderMainContent = () => {
    // Handle missing date parameter specifically for Daily tab
    if (!passedDate && selectedTab === 'Daily') {
        return <View style={styles.statusContainer}><Text style={styles.errorText}>Error: Date parameter not provided.</Text></View>;
    }

    // Handle 'Coming Soon' tabs first
    if (selectedTab === 'Weekly' || selectedTab === 'Monthly' || selectedTab === 'Yearly') {
        return <View style={styles.statusContainer}><Text style={styles.comingSoonText}>Coming Soon!</Text></View>;
    }

    // Handle states specific to the 'Daily' tab data fetching
    if (selectedTab === 'Daily') {
        if (loading) {
            return <View style={styles.statusContainer}><ActivityIndicator size="large" color="#007AFF" /></View>;
        }
        // Check for errors AFTER loading is false
        if (error) {
            // Show specific error message regardless of whether resources array has stale data
             return <View style={styles.statusContainer}><Text style={error.startsWith("No resources found") ? styles.infoText : styles.errorText}>{error}</Text></View>;
        }
        // If no error and not loading, check if resources exist
        if (resources.length > 0) {
            return (
                <FlatList
                    data={resources}
                    renderItem={renderResourceItem}
                    keyExtractor={(item, index) => `${item.Date}-${item.Topic}-${item.Category}-${index}`}
                    ListHeaderComponent={renderListHeader}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            );
        }
        // If no error, not loading, but resources array is empty (e.g., initial state before fetch or API returned empty)
        // Avoid showing "No resources found" if an error exists (handled above)
        return <View style={styles.statusContainer}><Text style={styles.infoText}>No resources available for this date.</Text></View>; // Fallback empty state
    }

    // Default fallback (should ideally not be reached with current logic)
    return <View style={styles.statusContainer}><Text style={styles.infoText}>Loading...</Text></View>;
  };


  // Tab Button Logic - Remains the same
  const renderTabButton = (title: TabType) => (
     <TouchableOpacity key={title} style={[ styles.tabButton, selectedTab === title && styles.activeTabButton ]} onPress={() => setSelectedTab(title)} activeOpacity={0.8} >
        <Text style={[ styles.tabButtonText, selectedTab === title && styles.activeTabButtonText ]}>{title}</Text>
      </TouchableOpacity>
  );

  // --- Main Return Structure ---
  return (
    // Use SafeAreaView as the main container with the desired background
    <SafeAreaView style={styles.safeArea}>
         {/* Set StatusBar style globally for this screen */}
         <StatusBar barStyle="dark-content" backgroundColor={styles.safeArea.backgroundColor} />

         {/* Main Content Area */}
         <View style={styles.contentArea}>
            {renderMainContent()}
         </View>

         {/* Bottom Tab Bar */}
         <View style={styles.tabContainer}>
          {renderTabButton('Daily')}
          {renderTabButton('Weekly')}
          {renderTabButton('Monthly')}
          {renderTabButton('Yearly')}
         </View>
    </SafeAreaView>
  );
};


// --- Enhanced Styles ---
const styles = StyleSheet.create({
  // Overall Screen
  safeArea: {
    flex: 1,
    // Set the desired background color that should extend to the status bar area
    backgroundColor: '#FFFFFF', // White background for header and status bar area
  },
  // Initial Scrollable Header Section (inside FlatList)
  headerContainer: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Match SafeAreaView background
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    // marginBottom: 15, // Removed margin, let listContainer handle spacing
  },
  headerTitle: {
    fontSize: 18, fontWeight: 'bold', color: '#212529',
    textAlign: 'center', marginBottom: 5, letterSpacing: 0.5,
  },
  headerTitleDynamic: { color: '#007AFF', fontWeight: 'bold', },
  headerSubtitle: { fontSize: 14, color: '#495057', textAlign: 'center', marginBottom: 4, },
  headerSource: { fontSize: 13, color: '#6C757D', textAlign: 'center', fontStyle: 'italic', },

  // Content Area
  contentArea: { flex: 1, backgroundColor: '#F8F9FA' /* Light grey background for list area */ },
  listContainer: {
      paddingHorizontal: 15,
      paddingTop: 15, // Space between header bottom and first card
      paddingBottom: 10,
      backgroundColor: '#F8F9FA', // Match contentArea background
 },
  statusContainer: {
      flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20,
      backgroundColor: '#F8F9FA', // Match contentArea background
  },

  // Card Styling - Remains the same
  card: { /* ... */ backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 18, padding: 0, shadowColor: '#ADB5BD', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5, borderWidth: 1, borderColor: '#F1F3F5', overflow: 'hidden', },
  cardHeaderContainer: { /* ... */ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 8, },
  categoryBadge: { /* ... */ backgroundColor: '#E7F5FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginLeft: 10, flexShrink: 0, alignSelf: 'center', },
  categoryText: { /* ... */ fontSize: 11, fontWeight: '600', color: '#007AFF', },
  cardTopic: { /* ... */ flex: 1, fontSize: 17, fontWeight: '600', color: '#343A40', },
  cardContext: { /* ... */ fontSize: 14, color: '#495057', lineHeight: 21, marginBottom: 15, paddingHorizontal: 18, },
  cardFooter: { /* ... */ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderTopWidth: 1, borderTopColor: '#F1F3F5', paddingTop: 12, paddingBottom: 18, paddingHorizontal: 18, marginTop: 5, },
  metaItem: { /* ... */ flexDirection: 'row', alignItems: 'center', flexShrink: 1, },
  metaItemRight: { /* ... */ },
  metaIcon: { /* ... */ color: '#6C757D', marginRight: 6, },
  metaText: { /* ... */ fontSize: 12, color: '#6C757D', flexShrink: 1, lineHeight: 16, },

  // Bottom Tab Bar Styles
  tabContainer: {
    flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: '#E9ECEF', backgroundColor: '#FFFFFF',
    // SafeAreaView automatically adds bottom padding on iOS
    paddingBottom: Platform.OS === 'android' ? 8 : 0, // Add some padding for Android if needed
  },
  tabButton: { /* ... */ flex: 1, paddingVertical: 10, marginHorizontal: 5, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FA', },
  activeTabButton: { /* ... */ backgroundColor: '#007AFF', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4, },
  tabButtonText: { /* ... */ fontSize: 14, fontWeight: '600', color: '#495057', },
  activeTabButtonText: { /* ... */ color: '#FFFFFF', },

  // Status Messages - Remains the same
  errorText: { /* ... */ textAlign: 'center', fontSize: 15, color: '#DC3545', lineHeight: 22, },
  infoText: { /* ... */ textAlign: 'center', fontSize: 15, color: '#6C757D', lineHeight: 22, },
  comingSoonText: { /* ... */ textAlign: 'center', fontSize: 16, fontWeight: '500', color: '#6C757D', },
});

export default ProfileScreen;