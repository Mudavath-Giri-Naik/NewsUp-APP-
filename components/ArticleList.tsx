import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

type Article = {
  id: string;
  title: string;
};

type Props = {
  articles: Article[];
  onSelect: (id: string) => void;
  source: string;
};

const ArticleList: React.FC<Props> = ({ articles, onSelect, source }) => {
  return (
    <FlatList
      data={articles}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: 80 }}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          onPress={() => onSelect(item.id)}
          style={styles.item}
        >
          <Text style={styles.title}>
            {index + 1}. {item.title}
          </Text>
          <Text style={styles.subtitle}>({source})</Text>
        </TouchableOpacity>
      )}
    />
  );
};

export default ArticleList;

const styles = StyleSheet.create({
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
});
