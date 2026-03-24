import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useYogaStore, YOGA_FLOWS } from '../../store/yogaStore';
import { LinearGradient } from 'expo-linear-gradient';



export default function YogaSelectionScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { startFlow } = useYogaStore();

    const handleStartWorkout = (id: string) => {
        startFlow(id);
        router.push("/screen/yoga_active" as any);
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#e0f2fe' }]}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color={isDark ? '#e2e8f0' : '#0f172a'} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Yoga & Mindfulness</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.bannerContainer}>
                    <Text style={[styles.bannerTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
                        Find Your Center
                    </Text>
                    <Text style={styles.bannerSubtitle}>
                        Choose a guided flow based on your daily goal.
                    </Text>
                </View>

                {/* FLOWS LIST */}
                <View style={styles.flowsList}>
                    {YOGA_FLOWS.map((flow, index) => (
                        <TouchableOpacity
                            key={flow.id}
                            style={[styles.flowCard, styles.shadow]}
                            activeOpacity={0.9}
                            onPress={() => handleStartWorkout(flow.id)}
                        >
                            {/* Fake image using gradient background to simulate premium image */}
                            <LinearGradient
                                colors={isDark ? ['#1e293b', '#0f172a'] : ['#bae6fd', '#38bdf8']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.cardImageBg}
                            >
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{flow.level}</Text>
                                </View>
                                
                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle}>{flow.title}</Text>
                                    <View style={styles.cardMeta}>
                                        <Ionicons name="time-outline" size={14} color="#f8fafc" />
                                        <Text style={styles.metaText}>{flow.totalDurationMin} min • {flow.poses.length} Poses</Text>
                                    </View>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    bannerContainer: {
        marginBottom: 30,
        marginTop: 10,
    },
    bannerTitle: {
        fontSize: 32,
        fontWeight: '900',
        marginBottom: 8,
    },
    bannerSubtitle: {
        fontSize: 16,
        color: '#64748b',
    },
    flowsList: {
        marginTop: 10,
    },
    flowCard: {
        width: '100%',
        height: 180,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 20,
    },
    cardImageBg: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-between',
    },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backdropFilter: 'blur(10px)'
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    cardContent: {
        marginTop: 'auto',
    },
    cardTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 6,
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    cardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        color: '#f8fafc',
        fontSize: 14,
        marginLeft: 6,
        fontWeight: '600',
    },
    shadow: {
        shadowColor: '#0369a1',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    }
});
