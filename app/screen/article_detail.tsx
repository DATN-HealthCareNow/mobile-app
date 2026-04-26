import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { articleService, MobileArticle } from '../../api/services/articleService';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ArticleDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { colors, isDark } = useTheme();
    
    const [article, setArticle] = useState<MobileArticle | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBookmarked, setIsBookmarked] = useState(false);

    useEffect(() => {
        const fetchArticle = async () => {
            if (!id) return;
            try {
                const data = await articleService.getById(id as string);
                // In case data is nested under .data or something
                setArticle((data as any).data || data);
            } catch (error) {
                console.error("Lỗi lấy bài viết:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchArticle();
    }, [id]);

    if (isLoading) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    if (!article) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.text }}>Không tìm thấy bài viết.</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: '#3b82f6' }}>Quay lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // A simple function to render markdown-like text
    const renderContent = (content: string) => {
        const blocks = content.split('\n\n');
        return blocks.map((block, index) => {
            if (block.startsWith('## ')) {
                return <Text key={index} style={[styles.contentHeading2, { color: colors.text }]}>{block.replace('## ', '')}</Text>;
            } else if (block.startsWith('### ')) {
                return <Text key={index} style={[styles.contentHeading3, { color: colors.text }]}>{block.replace('### ', '')}</Text>;
            } else if (block.startsWith('- ')) {
                const items = block.split('\n').map(item => item.replace('- ', ''));
                return (
                    <View key={index} style={styles.listContainer}>
                        {items.map((item, i) => (
                            <View key={i} style={styles.listItem}>
                                <View style={[styles.listDot, { backgroundColor: colors.textSecondary }]} />
                                <Text style={[styles.contentParagraph, { color: colors.textSecondary, flex: 1 }]}>{item}</Text>
                            </View>
                        ))}
                    </View>
                );
            }
            return <Text key={index} style={[styles.contentParagraph, { color: colors.textSecondary }]}>{block}</Text>;
        });
    };

    const formattedDate = article.publishedAt 
        ? new Date(article.publishedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' })
        : '15 Thg 10, 2023'; // fallback mockup

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Custom Header (Absolute) */}
            <View style={styles.headerAbsolute}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Article Details</Text>
                <TouchableOpacity onPress={() => setIsBookmarked(!isBookmarked)} style={styles.headerBtn}>
                    <Ionicons name={isBookmarked ? "bookmark" : "bookmark-outline"} size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* Hero Image */}
                <View style={styles.heroContainer}>
                    <Image 
                        source={{ uri: article.coverImageUrl || "https://img.freepik.com/free-vector/healthy-lifestyle-concept-illustration_114360-6003.jpg" }} 
                        style={styles.heroImage} 
                    />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.4)']}
                        style={StyleSheet.absoluteFillObject}
                    />
                </View>

                {/* Overlapping Info Card */}
                <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
                    <View style={styles.metaRow}>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeText}>{article.category?.toUpperCase() || 'SỨC KHỎE'}</Text>
                        </View>
                        <View style={styles.timeBadge}>
                            <Ionicons name="time" size={14} color="#64748b" />
                            <Text style={styles.timeBadgeText}>5 phút đọc</Text>
                        </View>
                    </View>

                    <Text style={[styles.articleTitle, { color: colors.text }]}>{article.title}</Text>

                    <View style={styles.authorRow}>
                        <View style={styles.authorAvatar}>
                            <Text style={styles.authorAvatarText}>HC</Text>
                        </View>
                        <View>
                            <Text style={[styles.authorName, { color: colors.text }]}>HealthCareNow AI</Text>
                            <Text style={styles.authorDesc}>Chuyên gia dinh dưỡng • {formattedDate}</Text>
                        </View>
                    </View>
                </View>

                {/* Content Section */}
                <View style={styles.contentSection}>
                    {/* Summary highlight line */}
                    {article.summary && (
                        <View style={styles.summaryBlock}>
                            <View style={styles.summaryLine} />
                            <Text style={[styles.summaryText, { color: colors.text }]}>
                                {article.summary}
                            </Text>
                        </View>
                    )}

                    {/* Main Content */}
                    <View style={styles.markdownContainer}>
                        {article.content ? renderContent(article.content) : (
                            <Text style={{color: colors.textSecondary}}>Chưa có nội dung chi tiết.</Text>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    headerAbsolute: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
        paddingTop: 45,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
    },
    headerBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },

    heroContainer: {
        width: '100%',
        height: 350,
        backgroundColor: '#e2e8f0',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },

    infoCard: {
        marginHorizontal: 20,
        marginTop: -60,
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    categoryBadge: {
        backgroundColor: '#e0e7ff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 12,
    },
    categoryBadgeText: {
        color: '#4f46e5',
        fontSize: 11,
        fontWeight: '800',
    },
    timeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeBadgeText: {
        color: '#64748b',
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '600',
    },
    articleTitle: {
        fontSize: 24,
        fontWeight: '800',
        lineHeight: 32,
        marginBottom: 20,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#dbeafe',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    authorAvatarText: {
        color: '#2563eb',
        fontWeight: 'bold',
        fontSize: 14,
    },
    authorName: {
        fontSize: 14,
        fontWeight: '700',
    },
    authorDesc: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 2,
    },

    contentSection: {
        padding: 24,
        paddingBottom: 60,
    },
    summaryBlock: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    summaryLine: {
        width: 4,
        backgroundColor: '#3b82f6',
        borderRadius: 2,
        marginRight: 16,
    },
    summaryText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 24,
        fontStyle: 'italic',
        opacity: 0.8,
    },
    
    markdownContainer: {
        marginTop: 10,
    },
    contentParagraph: {
        fontSize: 16,
        lineHeight: 26,
        marginBottom: 20,
    },
    contentHeading2: {
        fontSize: 22,
        fontWeight: '800',
        marginTop: 16,
        marginBottom: 12,
        lineHeight: 30,
    },
    contentHeading3: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 12,
        marginBottom: 8,
        lineHeight: 26,
    },
    listContainer: {
        marginBottom: 20,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    listDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 10,
        marginRight: 12,
    }
});
