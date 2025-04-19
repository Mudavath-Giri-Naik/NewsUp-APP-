import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchArticleDetails } from '../utils/api';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

const ArticleDetailScreen = ({ route, navigation }: any) => {
  const { paper, id } = route.params;
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<string>('');

  useLayoutEffect(() => {
    navigation.setOptions({
      title: paper,
      headerTitleAlign: 'center',
      headerStyle: { backgroundColor: '#f4f4f8' },
      headerTitleStyle: {
        color: '#3b5998',
        fontSize: 20,
        fontWeight: 'bold',
      },
    });
  }, [navigation, paper]);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const res = await fetchArticleDetails(paper, id);
        setArticle(res.data);
      } catch (err) {
        console.error("Error loading article details", err);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();

    const getCurrentDate = () => {
      const today = new Date();
      const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      };
      setCurrentDate(today.toLocaleDateString('en-GB', options));
    };

    getCurrentDate();
  }, []);

  const formatToList = (text: string) =>
    text
      .split('.')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

  const capitalizeFirst = (word: string) =>
    word.charAt(0).toUpperCase() + word.slice(1);

  const capitalizeSentence = (sentence: string) =>
    sentence.charAt(0).toUpperCase() + sentence.slice(1);

  const renderBulletList = (items: string[]) => (
    <>
      {items.map((item, index) => (
        <View key={index} style={styles.bulletContainer}>
          <Text style={styles.bulletSymbol}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <LottieView
          source={require('../assets/funny-loader.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
        <Text style={styles.loadingText}>Loading something awesome...</Text>
      </View>
    );
  }

  if (!article) {
    return (
      <Text style={{ marginTop: 30, textAlign: 'center' }}>
        Article not found.
      </Text>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{article.title}</Text>

      <View style={styles.metaInfo}>
        <View style={styles.leftInfo}>
          <Text style={styles.date}>{currentDate}</Text>
          {article.category && (
            <>
              <Text style={styles.separator}> | </Text>
              <Text style={styles.category}>{capitalizeFirst(article.category)}</Text>
            </>
          )}
        </View>
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => console.log('Share Pressed')}>
            <Icon name="share-outline" size={24} color="#555" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('Save Pressed')}>
            <Icon name="bookmark-outline" size={24} color="#555" style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Divider after meta info */}
      <View style={styles.divider} />

      {article.involvement && (
        <>
          <Text style={styles.heading}>Involvement:</Text>
          {renderBulletList(formatToList(article.involvement))}
        </>
      )}

      {article.past && (
        <>
          <Text style={styles.heading}>Past:</Text>
          <Text style={styles.paragraph}>{article.past.trim()}</Text>
        </>
      )}

      {article.present && (
        <>
          <Text style={styles.heading}>Present:</Text>
          <Text style={styles.paragraph}>{article.present.trim()}</Text>
        </>
      )}

      {article.description && (
        <>
          <Text style={styles.heading}>Description:</Text>
          <Text style={styles.paragraph}>{article.description.trim()}</Text>
        </>
      )}

      {article.points && (
        <>
          <Text style={styles.heading}>Points:</Text>
          {renderBulletList(article.points.split('\n').map((point: string) => point.trim()))}
        </>
      )}

      {article.glossary && (
        <>
          <Text style={styles.heading}>Glossary:</Text>
          {Object.entries(article.glossary).map(([key, value]) => (
            <Text key={key} style={styles.glossaryItem}>
              • <Text style={{ fontWeight: 'bold' }}>
                {capitalizeFirst(key)}:
              </Text> {capitalizeSentence(String(value))}
            </Text>
          ))}
        </>
      )}
    </ScrollView>
  );
};

export default ArticleDetailScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 80,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'serif',
    color: '#000000',
    marginBottom: 10,
    lineHeight: 34,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'sans-serif',
    color: '#777',
  },
  separator: {
    marginHorizontal: 5,
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'sans-serif',
    color: '#777',
  },
  category: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'sans-serif',
    color: '#555',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 5,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginLeft: 15,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'sans-serif-medium',
    marginTop: 24,
    marginBottom: 8,
    color: '#333',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: 'serif',
    color: '#333',
    marginBottom: 12,
  },
  bulletContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: 8,
  },
  bulletSymbol: {
    fontSize: 18,
    lineHeight: 24,
    marginRight: 8,
    fontFamily: 'serif',
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'serif',
    color: '#444',
  },
  glossaryItem: {
    fontSize: 15,
    fontFamily: 'sans-serif',
    marginVertical: 5,
    lineHeight: 22,
    color: '#444',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  lottie: {
    width: width * 0.3,
    height: width * 0.3,
  },
  loadingText: {
    marginTop: 5,
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
    fontFamily: 'sans-serif-medium',
  },
});
