import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { articleService, MobileArticle } from '../../api/services/articleService';

export default function ArticleListScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState<MobileArticle[]>([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await articleService.get_published();
        setArticles(data);
      } catch (error) {
        console.error('Loi lay danh sach bai viet:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.circleBtn}>
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>All Articles</Text>
        <View style={{ width: 44 }} />
      </View>

      {isLoading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {articles.map((article) => (
            <TouchableOpacity
              key={article.id}
              style={[styles.card, { backgroundColor: isDark ? '#0f172a' : '#ffffff' }]}
              onPress={() => router.push({ pathname: '/screen/article_detail', params: { id: article.id } } as any)}
            >
              <Image
                source={{
                  uri:
                    article.coverImageUrl ||
                    'https://img.freepik.com/free-vector/healthy-lifestyle-concept-illustration_114360-6003.jpg',
                }}
                style={styles.cover}
              />
              <View style={styles.contentWrap}>
                <Text style={[styles.category, { color: '#3b82f6' }]}>{article.category || 'Health'}</Text>
                <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
                  {article.title}
                </Text>
                <Text style={[styles.summary, { color: colors.textSecondary }]} numberOfLines={2}>
                  {article.summary || 'No summary'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {!articles.length && (
            <View style={styles.emptyState}>
              <Text style={{ color: colors.textSecondary }}>Chua co bai viet nao.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(148,163,184,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: '800' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 60 },
  card: {
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.15)',
  },
  cover: { width: '100%', height: 170, resizeMode: 'cover' },
  contentWrap: { padding: 14 },
  category: { fontSize: 12, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase' },
  cardTitle: { fontSize: 16, fontWeight: '800', lineHeight: 22, marginBottom: 6 },
  summary: { fontSize: 13, lineHeight: 19 },
  emptyState: {
    marginTop: 40,
    alignItems: 'center',
  },
});
