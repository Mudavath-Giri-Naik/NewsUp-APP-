// File: screens/HomeScreen.tsx
// FIX: Removed the 'papers' prop from the <BottomNavbar> usage below

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Alert, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../components/Header';
import CategoryChips from '../components/CategoryChips';
import ArticleList from '../components/ArticleList'; // Expects ListFooterComponent: React.ReactElement | null
import BottomNavbar from '../components/BottomNavbar'; // This component defines its own papers list internally
import { fetchArticlesByPaperAndDate } from '../utils/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// Ensure types include ArticleListItemType with optional syllabusHeadings
import { RootStackParamList, ArticleListItemType, CategoryChipType, RawArticleDataType } from '../utils/types';
import axios from 'axios';

// --- Constants ---
// This list is now only used for fetching logic if needed, not passed to BottomNavbar
const papersForExamFetch: string[] = [
  'The Hindu', 'Times of India', 'Hindustan Times',
  'Indian Express', 'Economic Times', 'Bussiness Standard',
];

// --- Component ---
const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [paper, setPaper] = useState('The Hindu'); // Mode
  const [categories, setCategories] = useState<CategoryChipType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [articles, setArticles] = useState<ArticleListItemType[]>([]); // Formatted list items
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const formatDateForAPI = (date: Date): string => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
   };

  const generateCategories = (articleList: ArticleListItemType[]): CategoryChipType[] => {
    const categoryCountMap: { [key: string]: number } = {};
    articleList.forEach((article) => {
        const cat = article.category ? article.category.toLowerCase() : 'unknown';
        categoryCountMap[cat] = (categoryCountMap[cat] || 0) + 1;
    });
    const dynamicCategories: CategoryChipType[] = Object.entries(categoryCountMap)
      .map(([key, count]) => ({ category: key, count: count, }))
      .sort((a, b) => {
          if (a.category === 'unknown') return 1;
          if (b.category === 'unknown') return -1;
          return b.count - a.count;
      });
    const totalCount = articleList.length;
    return [{ category: 'All', count: totalCount }, ...dynamicCategories];
   };

  const loadArticlesAndCategories = useCallback(async () => {
    console.log(`Loading articles for mode: ${paper}, date: ${selectedDate.toDateString()}`);
    try {
      setLoading(true);
      setArticles([]); setCategories([]); setPage(1);
      setAllLoaded(false); setSelectedCategory('All');
      const formattedDate = formatDateForAPI(selectedDate);
      let allFetchedArticles: RawArticleDataType[] = [];

      if (paper === 'Exam') {
        console.log(`Mode: Exam - Fetching across ${papersForExamFetch.length} papers...`);
        const fetchPromises = papersForExamFetch.map(async (p): Promise<RawArticleDataType[]> => {
          try {
            const response = await fetchArticlesByPaperAndDate(p, formattedDate);
            const rawArticles: RawArticleDataType[] = response?.data || [];
            const examSpecificArticles = rawArticles
              .filter((a) => a.examSpecific === true)
              .map((a) => ({ ...a, source: p }));
            return examSpecificArticles;
          } catch (err: any) {
            if (axios.isAxiosError(err) && err.response?.status === 404) { console.log(`[${p}] 404 for ${formattedDate}`); }
            else { console.error(`[${p}] Error fetching ${formattedDate}:`, err.message); }
            return [];
          }
        });
        const allResults = await Promise.all(fetchPromises);
        allFetchedArticles = allResults.flat();
        console.log(`Combined ${allFetchedArticles.length} examSpecific articles.`);
      } else {
        console.log(`Mode: Single Paper (${paper}) - Fetching...`);
        try {
          const response = await fetchArticlesByPaperAndDate(paper, formattedDate);
          const rawArticles: RawArticleDataType[] = response?.data || [];
          allFetchedArticles = rawArticles.map((a) => ({ ...a, source: paper }));
          console.log(`Fetched ${allFetchedArticles.length} from ${paper}.`);
        } catch (err: any) {
           if (axios.isAxiosError(err) && err.response?.status === 404) { console.log(`[${paper}] 404 for ${formattedDate}`); allFetchedArticles = []; }
           else { console.error(`Error fetching from ${paper}:`, err); throw err; }
        }
      }

      // Map Raw Data -> List Item Type (ArticleListItemType)
      const formattedArticles: ArticleListItemType[] = allFetchedArticles.map((a) => ({
        id: a.articleId?.toString() || a._id?.toString() || `${a.source}-${a.title}-${Math.random()}`,
        title: a.title || 'Untitled Article',
        category: a.category || 'Unknown',
        source: a.source || paper,
        syllabusHeadings: a.syllabusHeadings,
      }));

      console.log(`Setting state with ${formattedArticles.length} formatted articles.`);
      setArticles(formattedArticles);
      setCategories(generateCategories(formattedArticles));
    } catch (err: any) {
      console.error("CRITICAL ERROR during article loading:", err);
      Alert.alert('Error', 'An unexpected error occurred loading data.');
      setArticles([]); setCategories([]);
    } finally {
      console.log("Setting loading false.");
      setLoading(false);
    }
  }, [paper, selectedDate]);

  const loadMoreArticles = (): void => {
    if (isFetchingMore || allLoaded) return;
    setIsFetchingMore(true);
    const pageSize = 10;
    const filteredArticles = articles.filter(article => selectedCategory === 'All' || (article.category || 'Unknown').toLowerCase() === selectedCategory.toLowerCase());
    const currentVisibleCount = filteredArticles.slice(0, page * pageSize).length;
    const totalFilteredCount = filteredArticles.length;

    if (currentVisibleCount >= totalFilteredCount) {
      // console.log("All filtered articles loaded."); // Keep console logs minimal if not debugging
      setAllLoaded(true);
      setIsFetchingMore(false);
      return;
    }

    setTimeout(() => {
      setPage((p) => p + 1);
      setIsFetchingMore(false);
    }, 300);
  };

  const getFilteredArticles = useCallback((): ArticleListItemType[] => {
    const pageSize = 10;
    const visibleCount = page * pageSize;
    let filtered = articles;
    if (selectedCategory !== 'All') {
        filtered = articles.filter((a) => (a.category || 'Unknown').toLowerCase() === selectedCategory.toLowerCase());
    }
    return filtered.slice(0, visibleCount);
  }, [articles, selectedCategory, page]); // Removed extra dependencies


  useEffect(() => {
    loadArticlesAndCategories();
  }, [loadArticlesAndCategories]);

  const handleArticlePress = (id: string, source: string): void => {
    navigation.navigate('ArticleDetail', {
        id: id,
        paper: source, // Actual source newspaper
        date: selectedDate.toISOString(),
        displayMode: paper, // The mode selected ('Exam' or 'The Hindu', etc.)
    });
  };

  const currentlyDisplayedArticles = getFilteredArticles();

  const renderListFooter = (): React.ReactElement | null => {
    if (isFetchingMore) {
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#6c757d" />
            </View>
        );
    }
    return null;
  };


  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

      {loading ? (
        <View style={styles.loaderContainer}><LottieView source={require('../assets/funny-loader.json')} autoPlay loop style={styles.lottieLoader} /></View>
      ) : articles.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Icon name="file-remove-outline" size={60} color="#adb5bd" />
          <Text style={styles.noDataText}>No articles found for</Text>
          <Text style={styles.noDataTextDate}>{selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          {paper === 'Exam' && <Text style={styles.noDataHint}>(Checked sources for 'Exam Specific = true')</Text>}
        </View>
      ) : (
        <>
          <CategoryChips
            categories={categories} selected={selectedCategory}
            onSelect={(category) => {
              setSelectedCategory(category);
              setPage(1);
              setAllLoaded(false); // Reset when filter changes
            }}
          />
          {currentlyDisplayedArticles.length === 0 && selectedCategory !== 'All' ? (
              <View style={styles.noDataContainer}>
                  <Icon name="filter-remove-outline" size={60} color="#adb5bd" />
                  <Text style={styles.noDataText}>No articles for category:</Text>
                  <Text style={styles.noDataTextCategory}>{selectedCategory}</Text>
                  <Text style={styles.noDataTextDate}>on {selectedDate.toLocaleDateString('en-GB')}</Text>
              </View>
          ) : (
             <ArticleList
                articles={currentlyDisplayedArticles}
                selectedPaper={paper}
                onSelect={handleArticlePress}
                onEndReached={loadMoreArticles}
                ListFooterComponent={renderListFooter()}
              />
          )}
        </>
      )}

      {/* // 🔥 FIX: Removed the 'papers' prop because BottomNavbar defines its own list */}
      <BottomNavbar
        selected={paper}
        onSelect={(selectedPaper: string) => {
            setPaper(selectedPaper);
            setPage(1);
            setAllLoaded(false);
            setSelectedCategory('All');
        }}
        // papers={papers} // <<< REMOVED THIS LINE
      />
    </SafeAreaView>
  );
};

export default HomeScreen;

// Styles remain the same
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', },
  loaderContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', },
  lottieLoader: { width: 150, height: 150, },
  noDataContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, paddingBottom: 80, minHeight: 200, },
  noDataText: { fontSize: 17, fontWeight: '600', color: '#6c757d', marginTop: 15, textAlign: 'center', },
  noDataTextCategory: { fontSize: 17, fontWeight: '700', color: '#495057', marginTop: 4, textAlign: 'center', textTransform: 'capitalize', },
  noDataTextDate: { fontSize: 15, fontWeight: '500', color: '#adb5bd', marginTop: 4, textAlign: 'center', },
  noDataHint: { fontSize: 13, fontWeight: '400', color: '#adb5bd', marginTop: 8, textAlign: 'center', fontStyle: 'italic'},
  footerLoader: { paddingVertical: 20, alignItems: 'center', },
  allLoadedText: {
      paddingVertical: 15,
      textAlign: 'center',
      color: '#adb5bd',
      fontSize: 14,
  },
});