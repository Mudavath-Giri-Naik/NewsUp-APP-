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
  fetchArticlesByPaperAndDate,
} from '../utils/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/types';
import axios from 'axios';

type CategoryType = { category: string; count: number };
type ArticleType = { id: string; title: string; category: string };

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

  const loadArticlesAndCategories = async () => {
    try {
      setLoading(true);
      setArticles([]);
      setCategories([]);

      const formattedDate = formatDateForAPI(selectedDate);
      let res;

      if (paper === 'All') {
        res = { data: [] };
      } else {
        try {
          const response = await fetchArticlesByPaperAndDate(paper, formattedDate);
          res = { data: response.data };
        } catch (err: any) {
          if (axios.isAxiosError(err) && err.response?.status === 404) {
            res = { data: [] };
          } else {
            throw err;
          }
        }
      }

      const allFetchedArticles: any[] = res.data || [];

      const formattedArticles: ArticleType[] = allFetchedArticles.map((a: any) => ({
        id: a.articleId?.toString() || a._id?.toString() || Math.random().toString(),
        title: a.title,
        category: a.category || 'Unknown',
      }));

      setArticles(formattedArticles);

      // Now dynamically calculate categories from filtered articles
      const categoryCountMap: { [key: string]: number } = {};

      formattedArticles.forEach((article) => {
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

      const totalCount = formattedArticles.length;

      setCategories([{ category: 'All', count: totalCount }, ...dynamicCategories]);
      setSelectedCategory('All');

    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredArticles = () => {
    if (selectedCategory === 'All') {
      return articles;
    }
    return articles.filter((article) => article.category === selectedCategory);
  };

  useEffect(() => {
    loadArticlesAndCategories();
  }, [paper, selectedDate]);

  const handleArticlePress = (id: string) => {
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
      ) : getFilteredArticles().length === 0 ? (
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
            articles={getFilteredArticles()}
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
    marginTop: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'gray',
  },
});
