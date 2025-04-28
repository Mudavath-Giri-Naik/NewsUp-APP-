// File: screens/HomeScreen.tsx
// NOTE: The "Text strings must be rendered within a <Text>" warning
// needs to be fixed inside ../components/Header.tsx

import React, { useEffect, useState, useCallback, Dispatch, SetStateAction } from 'react';
import { View, StyleSheet, Alert, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../components/Header'; // <<<--- ERROR ORIGINATES INSIDE THIS COMPONENT
import CategoryChips from '../components/CategoryChips';
import ArticleList from '../components/ArticleList';
import BottomNavbar from '../components/BottomNavbar';
import { fetchArticlesByPaperAndDate } from '../utils/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/types';
import axios from 'axios';

// --- Type Definitions ---
type CategoryType = { category: string; count: number };
type ArticleType = { id: string; title: string; category: string; source: string; };
type RawArticleData = {
  _id?: any; articleId?: number | string; title: string;
  category?: string;
  examSpecific?: boolean | undefined;
  source?: string;
};

// --- Constants ---
const papers: string[] = [
  'The Hindu', 'Times of India', 'Hindustan Times', 'Exam',
  'Indian Express', 'Economic Times', 'Bussiness Standard',
];
const papersForExamFetch: string[] = [
  'The Hindu', 'Times of India', 'Hindustan Times',
  'Indian Express', 'Economic Times', 'Bussiness Standard',
];

// --- Component ---
const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [paper, setPaper] = useState('The Hindu');
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [articles, setArticles] = useState<ArticleType[]>([]);
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
  const generateCategories = (articleList: ArticleType[]): CategoryType[] => {
    const categoryCountMap: { [key: string]: number } = {};
    articleList.forEach((article) => { const cat = article.category ? article.category.toLowerCase() : 'unknown'; categoryCountMap[cat] = (categoryCountMap[cat] || 0) + 1; });
    const dynamicCategories: CategoryType[] = Object.entries(categoryCountMap).map(([key, count]) => ({ category: key, count: count, }));
    const totalCount = articleList.length;
    dynamicCategories.sort((a, b) => b.count - a.count);
    return [{ category: 'All', count: totalCount }, ...dynamicCategories];
   };

  const loadArticlesAndCategories = useCallback(async () => {
    console.log(`Loading articles for paper: ${paper}, date: ${selectedDate.toDateString()}`);
    try {
      setLoading(true);
      setArticles([]); setCategories([]); setPage(1);
      setAllLoaded(false); setSelectedCategory('All');
      const formattedDate = formatDateForAPI(selectedDate);
      let allFetchedArticles: RawArticleData[] = [];

      if (paper === 'Exam') {
        console.log(`Mode: Exam - Fetching across ${papersForExamFetch.length} papers...`);
        const fetchPromises = papersForExamFetch.map(async (p): Promise<RawArticleData[]> => {
          try {
            const response = await fetchArticlesByPaperAndDate(p, formattedDate);
            const rawArticles: RawArticleData[] = response?.data || [];
            // console.log(`[${p}] Received ${rawArticles.length} raw articles.`);
            const examSpecificArticles = rawArticles.filter((a) => a.examSpecific === true );
            // console.log(`[${p}] Filtered to ${examSpecificArticles.length} examSpecific articles.`);
            return examSpecificArticles.map((a) => ({ ...a, source: p, }));
          } catch (err: any) {
            if (axios.isAxiosError(err) && err.response?.status === 404) { console.log(`[${p}] 404`); }
            else { console.error(`[${p}] Error fetching:`, err.message); }
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
          const rawArticles: RawArticleData[] = response?.data || [];
          allFetchedArticles = rawArticles.map((a) => ({ ...a, source: paper, }));
          console.log(`Fetched ${allFetchedArticles.length} from ${paper}.`);
        } catch (err: any) {
           if (axios.isAxiosError(err) && err.response?.status === 404) { console.log(`[${paper}] 404`); allFetchedArticles = []; }
           else { console.error(`Error fetching from ${paper}:`, err); throw err; }
        }
      }

      const formattedArticles: ArticleType[] = allFetchedArticles.map((a) => ({
        id: a.articleId?.toString() || a._id?.toString() || `${a.source}-${a.title}-${Math.random()}`,
        title: a.title || 'Untitled', category: a.category || 'Unknown', source: a.source || paper,
      }));
      console.log(`Setting state with ${formattedArticles.length} formatted articles.`);
      if (formattedArticles.length === 0) { console.warn(`FINAL RESULT: No articles to display.`); }
      setArticles(formattedArticles);
      setCategories(generateCategories(formattedArticles));
    } catch (err: any) {
      console.error("CRITICAL ERROR during article loading:", err);
      Alert.alert('Error', 'An unexpected error occurred while loading data.');
      setArticles([]); setCategories([]);
    } finally {
      console.log("Setting loading false.");
      setLoading(false);
    }
  }, [paper, selectedDate]);

  const loadMoreArticles = (): void => {
    if (isFetchingMore || allLoaded) return;
    setIsFetchingMore(true);
    const pageSize = 10; const currentVisibleCount = page * pageSize;
    if (currentVisibleCount >= articles.length) { setAllLoaded(true); setIsFetchingMore(false); }
    else { setTimeout(() => { setPage((p) => p + 1); setIsFetchingMore(false); }, 500); }
  };
  const getFilteredArticles = useCallback((): ArticleType[] => {
    const visibleCount = page * 10; let filtered = articles;
    if (selectedCategory !== 'All') { filtered = articles.filter((a) => a.category.toLowerCase() === selectedCategory.toLowerCase()); }
    return filtered.slice(0, visibleCount);
  }, [articles, selectedCategory, page]);

  useEffect(() => {
    loadArticlesAndCategories();
  }, [loadArticlesAndCategories]);

  const handleArticlePress = (id: string, source: string): void => {
    navigation.navigate('ArticleDetail', { id: id, paper: source, date: selectedDate.toISOString(), });
  };

  const currentlyDisplayedArticles = getFilteredArticles();

  // Use 'as any' temporarily if needed for TS errors related to component props
  const HeaderComponent = Header as any;
  const ArticleListComponent = ArticleList as any;
  const BottomNavbarComponent = BottomNavbar as any;

  return (
    <SafeAreaView style={styles.container}>
      {/* This HeaderComponent is where the warning originates */}
      <HeaderComponent selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

      {loading ? (
        <View style={styles.loaderContainer}><LottieView source={require('../assets/funny-loader.json')} autoPlay loop style={styles.lottieLoader} /></View>
      ) : articles.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Icon name="file-remove-outline" size={60} color="#adb5bd" />
          <Text style={styles.noDataText}>No articles found for</Text>
          <Text style={styles.noDataTextDate}>{selectedDate.toLocaleDateString('en-GB')}</Text>
          {paper === 'Exam' && <Text style={styles.noDataHint}>(Checked for 'Exam Specific = true')</Text>}
        </View>
      ) : (
        <>
          <CategoryChips
            categories={categories} selected={selectedCategory}
            onSelect={(category) => {
              setSelectedCategory(category); setPage(1); setAllLoaded(false);
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
             <ArticleListComponent
                articles={currentlyDisplayedArticles}
                onSelect={handleArticlePress}
                onEndReached={loadMoreArticles}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                  isFetchingMore ? (
                    <View style={styles.footerLoader}><ActivityIndicator size="small" color="#6c757d" /></View>
                  ) : null
                }
              />
          )}
        </>
      )}
      <BottomNavbarComponent
        selected={paper}
        onSelect={setPaper}
        papers={papers}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', },
  loaderContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', },
  lottieLoader: { width: 150, height: 150, },
  noDataContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, },
  noDataText: { fontSize: 17, fontWeight: '600', color: '#6c757d', marginTop: 10, textAlign: 'center', },
  noDataTextCategory: { fontSize: 17, fontWeight: '700', color: '#495057', marginTop: 2, textAlign: 'center', textTransform: 'capitalize', },
  noDataTextDate: { fontSize: 15, fontWeight: '500', color: '#adb5bd', marginTop: 2, textAlign: 'center', },
  noDataHint: { fontSize: 13, fontWeight: '400', color: '#adb5bd', marginTop: 5, textAlign: 'center', fontStyle: 'italic'},
  footerLoader: { paddingVertical: 20, alignItems: 'center', },
});