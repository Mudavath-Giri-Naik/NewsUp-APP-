import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import Header from '../components/Header';
import CategoryChips from '../components/CategoryChips';
import ArticleList from '../components/ArticleList';
import BottomNavbar from '../components/BottomNavbar';
import {
  fetchCategories,
  fetchSecondCategories,
  fetchTitles,
  fetchTitlesBySecondCategory,
  fetchAllArticles,
  fetchTitlesBySecondCategoryAll,
} from '../utils/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../utils/types';

type CategoryType = { category: string; count: number };
type ArticleType = { id: string; title: string };

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [paper, setPaper] = useState('The Hindu');
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

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

      const category = selectedCategory === "All" ? "all" : selectedCategory;
      let res;

      if (paper === "All") {
        res = category === "all"
          ? { data: [] }
          : await fetchTitlesBySecondCategoryAll(category);
      } else if (paper === "Exam") {
        res = category === "all"
          ? await fetchAllArticles(paper)
          : await fetchTitlesBySecondCategory(paper, category);
      } else {
        res = category === "all"
          ? await fetchAllArticles(paper)
          : await fetchTitles(paper, category);
      }

      const formatted: ArticleType[] = res.data.map((a: any) => ({
        id: a.articleId?.toString() || a._id?.toString() || Math.random().toString(),
        title: a.title,
      }));

      setArticles(formatted);
    } catch (err) {
      console.error("Failed to load articles:", err);
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
  }, [selectedCategory, categories]);

  const handleArticlePress = (id: string) => {
    navigation.navigate('ArticleDetail', { id, paper });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      {loading ? (
        <View style={styles.loaderContainer}>
          <LottieView
            source={require('../assets/funny-loader.json')}
            autoPlay
            loop
            style={{ width: 150, height: 150 }}
          />
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
});
