// src/screens/HomeScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import Header from '../components/Header';
import CategoryChips from '../components/CategoryChips';
import ArticleList from '../components/ArticleList';
import BottomNavbar from '../components/BottomNavbar';
import {
  fetchCategories,
  fetchSecondCategories,
  fetchTitlesBySecondCategory,
  fetchTitlesBySecondCategoryAll,
  fetchArticlesByPaperAndDate,
} from '../utils/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/types'; // Make sure types are imported
import axios from 'axios';

type CategoryType = { category: string; count: number };
type ArticleType = { id: string; title: string };

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [paper, setPaper] = useState('The Hindu');
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const formatDateForAPI = (date: Date) => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const loadCategories = async () => {
    try {
      setLoading(true);

      const res =
        paper === 'Exam'
          ? await fetchSecondCategories(paper)
          : await fetchCategories(paper);

      const formattedCategories: CategoryType[] = res.data.map((item: any) => ({
        category: item._id || 'Unknown',
        count: item.count,
      }));

      const allCount = formattedCategories.reduce(
        (acc: number, c: CategoryType) => acc + c.count,
        0
      );

      const sortedCategories = formattedCategories.sort(
        (a: CategoryType, b: CategoryType) => b.count - a.count
      );

      setCategories([{ category: 'All', count: allCount }, ...sortedCategories]);
      setSelectedCategory('All');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const loadArticles = async () => {
    try {
      setLoading(true);
      setArticles([]); // Clear old data before loading new

      const category = selectedCategory === 'All' ? 'all' : selectedCategory;
      let res;

      const formattedDate = formatDateForAPI(selectedDate);

      if (paper === 'All') {
        res = category === 'all'
          ? { data: [] }
          : await fetchTitlesBySecondCategoryAll(category);
      } else {
        try {
          const response = await fetchArticlesByPaperAndDate(paper, formattedDate);
          const allArticles: any[] = response.data;

          const filteredArticles =
            category === 'all'
              ? allArticles
              : allArticles.filter((a) => a.category === category);

          res = { data: filteredArticles };
        } catch (err: any) {
          if (axios.isAxiosError(err) && err.response?.status === 404) {
            res = { data: [] }; // Gracefully handle no data
          } else {
            throw err; // Unexpected error — let it be handled
          }
        }
      }

      if (!res || res.data.length === 0) {
        setArticles([]);
      } else {
        const formatted: ArticleType[] = res.data.map((a: any) => ({
          id: a.articleId?.toString() || a._id?.toString() || Math.random().toString(),
          title: a.title,
        }));
        setArticles(formatted);
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong while loading articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [paper]);

  useEffect(() => {
    if (categories.length > 0) {
      loadArticles();
    }
  }, [selectedCategory, categories, selectedDate]);

  const handleArticlePress = (id: string) => {
    // Update navigation to pass 'selectedDate' along with 'id' and 'paper'
    navigation.navigate('ArticleDetail', { id, paper, date: selectedDate.toString() });
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
      ) : articles.length === 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data available for selected date</Text>
        </View>
      ) : (
        <>
          <CategoryChips
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
          <ArticleList
            articles={articles}
            onSelect={handleArticlePress}
            source={paper}
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'gray',
  },
});
