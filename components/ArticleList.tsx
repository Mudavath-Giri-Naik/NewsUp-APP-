// src/components/ArticleList.tsx

import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';

type Article = {
  id: string;
  title: string;
  source: string;
};

type Props = {
  articles: Article[];
  onSelect: (id: string, source: string) => void;
  onEndReached: () => void;
  ListFooterComponent: JSX.Element | null;
};

const ArticleList: React.FC<Props> = ({ articles, onSelect, onEndReached, ListFooterComponent }) => {
  return (
    <FlatList
      data={articles}
      // 🔥 FIX: Made the keyExtractor globally unique using source + id
      keyExtractor={(item) => `${item.source}-${item.id}`}
      contentContainerStyle={styles.container}
      renderItem={({ item, index }) => (
        <TouchableOpacity onPress={() => onSelect(item.id, item.source)} style={styles.item}>
          <Text style={styles.title}>
            {index + 1}. {item.title}
          </Text>
          <Text style={styles.subtitle}>({item.source})</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No articles available for this date.</Text>
        </View>
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={ListFooterComponent}
    />
  );
};

export default ArticleList;

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    paddingTop: 0,
    paddingBottom: 650,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    paddingLeft: 25,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});
