// src/screens/HomeScreen.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Alert, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import Header from '../components/Header';
import CategoryChips from '../components/CategoryChips';
import ArticleList from '../components/ArticleList';
import BottomNavbar from '../components/BottomNavbar';
import { fetchArticlesByPaperAndDate } from '../utils/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/types';
import axios from 'axios';

type CategoryType = { category: string; count: number };
type ArticleType = { id: string; title: string; category: string; source: string };

const papers = [
  'The Hindu',
  'Times of India',
  'Hindustan Times',
  'Exam',
  'Indian Express',
  'Economic Times',
  'Bussiness Standard',
];


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

  const formatDateForAPI = (date: Date) => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const generateCategories = (articleList: ArticleType[]) => {
    const categoryCountMap: { [key: string]: number } = {};

    articleList.forEach((article) => {
      const cat = article.category || 'Unknown';
      if (categoryCountMap[cat]) {
        categoryCountMap[cat]++;
      } else {
        categoryCountMap[cat] = 1;
      }
    });

    const dynamicCategories: CategoryType[] = Object.keys(categoryCountMap).map((key) => ({
      category: key,
      count: categoryCountMap[key],
    }));

    const totalCount = articleList.length;

    // Sort dynamic categories by count descending
    dynamicCategories.sort((a, b) => b.count - a.count);

    return [{ category: 'All', count: totalCount }, ...dynamicCategories];
  };

  const loadArticlesAndCategories = async () => {
    try {
      setLoading(true);
      setArticles([]);
      setCategories([]);
      setPage(1);
      setAllLoaded(false);

      const formattedDate = formatDateForAPI(selectedDate);

      let allFetchedArticles: any[] = [];

      if (paper === 'Exam') {
        const papersToFetch = ['The Hindu', 'Indian Express', 'Times of India'];
        const fetchPromises = papersToFetch.map(async (p) => {
          try {
            const response = await fetchArticlesByPaperAndDate(p, formattedDate);
            return (response.data || []).map((a: any) => ({
              ...a,
              source: p, // Attach source paper manually
            }));
          } catch (err: any) {
            if (axios.isAxiosError(err) && err.response?.status === 404) {
              return [];
            } else {
              throw err;
            }
          }
        });

        const allResults = await Promise.all(fetchPromises);
        allFetchedArticles = allResults.flat();
      } else {
        try {
          const response = await fetchArticlesByPaperAndDate(paper, formattedDate);
          allFetchedArticles = (response.data || []).map((a: any) => ({
            ...a,
            source: paper, // Attach source paper manually
          }));
        } catch (err: any) {
          if (axios.isAxiosError(err) && err.response?.status === 404) {
            allFetchedArticles = [];
          } else {
            throw err;
          }
        }
      }

      const formattedArticles: ArticleType[] = allFetchedArticles.map((a: any) => ({
        id: a.articleId?.toString() || a._id?.toString() || Math.random().toString(),
        title: a.title,
        category: a.category || 'Unknown',
        source: a.source || 'Unknown',
      }));

      setArticles(formattedArticles);
      setCategories(generateCategories(formattedArticles));
      setSelectedCategory('All');

    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreArticles = async () => {
    if (isFetchingMore || allLoaded) return;

    try {
      setIsFetchingMore(true);

      const nextPage = page + 1;
      const pageSize = 10;
      const start = (nextPage - 1) * pageSize;
      const end = start + pageSize;

      const totalArticles = articles.length;

      if (start >= totalArticles) {
        setAllLoaded(true);
      } else {
        setPage(nextPage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const getFilteredArticles = useCallback(() => {
    const visibleCount = page * 10;
    let filtered = articles;

    if (selectedCategory !== 'All') {
      filtered = articles.filter((article) => article.category === selectedCategory);
    }

    return filtered.slice(0, visibleCount);
  }, [articles, selectedCategory, page]);

  useEffect(() => {
    loadArticlesAndCategories();
  }, [paper, selectedDate]);

  useEffect(() => {
    setCategories(generateCategories(articles));
  }, [articles]);

  const handleArticlePress = (id: string, source: string) => {
    navigation.navigate('ArticleDetail', { id, paper: source, date: selectedDate.toString() });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header setSelectedDate={setSelectedDate} />
      {loading ? (
        <View style={styles.loaderContainer}>
          <LottieView
            source={require('../assets/funny-loader.json')}
            autoPlay
            loop
            style={{ width: 150, height: 150 }}
          />
        </View>
      ) : getFilteredArticles().length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data available for selected date</Text>
        </View>
      ) : (
        <>
          <CategoryChips
            categories={categories}
            selected={selectedCategory}
            onSelect={(category) => {
              setSelectedCategory(category);
              setPage(1);
            }}
          />
          <ArticleList
            articles={getFilteredArticles()}
            onSelect={(id, source) => handleArticlePress(id, source)}
            onEndReached={loadMoreArticles}
            ListFooterComponent={
              isFetchingMore ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color="#000" />
                </View>
              ) : null
            }
          />
        </>
      )}
      <BottomNavbar selected={paper} onSelect={setPaper} />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loaderContainer: {
    marginTop: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataContainer: {
    marginTop: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'gray',
  },
  footerLoader: {
    paddingVertical: 20,
  },
});
