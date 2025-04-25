import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

type Article = {
  id: string;
  title: string;
};

type Props = {
  articles: Article[]; // No change here
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
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No articles available for this date.</Text>
        </View>
      }
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
