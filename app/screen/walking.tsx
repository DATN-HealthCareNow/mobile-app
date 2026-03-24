import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Pedometer } from 'expo-sensors';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const GOAL_STEPS = 10000;

export default function WalkingScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();

    const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');
    const [pastStepCount, setPastStepCount] = useState(0);
    const [currentStepCount, setCurrentStepCount] = useState(0);
    const [milestonesReached, setMilestonesReached] = useState<number[]>([]);

    const totalSteps = pastStepCount + currentStepCount;

    useEffect(() => {
        let subscription: Pedometer.Subscription | null = null;
        
        const subscribe = async () => {
            const isAvailable = await Pedometer.isAvailableAsync();
            setIsPedometerAvailable(String(isAvailable));

            if (isAvailable) {
                const end = new Date();
                const start = new Date();
                start.setHours(0, 0, 0, 0); // Bắt đầu từ 0h hôm nay
                
                try {
                    const result = await Pedometer.getStepCountAsync(start, end);
                    if (result) {
                        setPastStepCount(result.steps);
                    }
                } catch (error) {
                    console.log("Could not get past steps", error);
                }

                subscription = Pedometer.watchStepCount(result => {
                    setCurrentStepCount(result.steps);
                });
            }
        };

        subscribe();

        return () => {
            if (subscription) {
                subscription.remove();
            }
        };
    }, []);

    // Theo dõi Milestone (25%, 50%, 75%, 100%, hoặc 1000 bước đầu tiên)
    useEffect(() => {
        const checkMilestone = (percentage: number, message: string) => {
            const threshold = (GOAL_STEPS * percentage) / 100;
            if (totalSteps >= threshold && !milestonesReached.includes(percentage)) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Speech.speak(message, { language: 'vi-VN', rate: 0.9 });
                setMilestonesReached(prev => [...prev, percentage]);
            }
        };

        if (totalSteps >= 1000 && !milestonesReached.includes(10)) {
            checkMilestone(10, 'Tuyệt vời, bạn đã đi được 1000 bước.');
        }
        checkMilestone(25, 'Bạn đã hoàn thành 25 phần trăm mục tiêu.');
        checkMilestone(50, 'Chúc mừng, bạn đã hoàn thành một nửa mục tiêu hôm nay.');
        checkMilestone(75, 'Cố lên, chỉ còn một chút nữa là đạt mục tiêu.');
        checkMilestone(100, 'Tuyệt cú mèo! Bạn đã hoàn thành 100 phần trăm mục tiêu bước chân hôm nay.');

    }, [totalSteps, milestonesReached]);

    // Tính toán theo công thức
    const calories = Math.round(totalSteps * 0.04);
    const distanceKm = (totalSteps * 0.000762).toFixed(2); // ~0.762m/step
    const progressPercent = Math.min((totalSteps / GOAL_STEPS) * 100, 100);

    return (
        <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? '#e2e8f0' : '#0f172a'} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Step Tracker</Text>
                <View style={styles.backBtn} />
            </View>

            {/* ERROR CARD IF TRACKER OFF */}
            {isPedometerAvailable === 'false' && (
                <View style={styles.errorCard}>
                    <Ionicons name="warning" size={20} color="#b45309" />
                    <Text style={styles.errorText}>Cảm biến bước chân không khả dụng trên thiết bị này hoặc chưa được cấp quyền.</Text>
                </View>
            )}

            {/* BIG CIRCULAR COUNTER */}
            <View style={styles.circleContainer}>
                <LinearGradient
                    colors={isDark ? ['#1e293b', '#0f172a'] : ['#ffffff', '#f1f5f9']}
                    style={[styles.outerCircle, styles.shadow]}
                >
                    {/* Ring background */}
                    <View style={styles.ringBg} />
                    {/* Fake Progress Arc */}
                    <View style={[styles.ringFill, { transform: [{ rotate: `${(progressPercent / 100) * 360}deg` }] }]} />
                    
                    <View style={[styles.innerCircle, { backgroundColor: isDark ? '#0f172a' : '#fff' }]}>
                        <MaterialCommunityIcons name="shoe-print" size={32} color="#10b981" style={{ marginBottom: 10 }} />
                        <Text style={[styles.stepCountText, { color: isDark ? '#f8fafc' : '#0f172a' }]}>{totalSteps.toLocaleString()}</Text>
                        <Text style={styles.stepCountLabel}>/ {GOAL_STEPS.toLocaleString()} bước</Text>
                    </View>
                </LinearGradient>
            </View>

            {/* PROGRESS BAR */}
            <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                    <Text style={[styles.progressTitle, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Mục tiêu hôm nay</Text>
                    <Text style={styles.progressPercent}>{Math.round(progressPercent)}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                    <AnimatedLinearGradient width={`${progressPercent}%`} />
                </View>
            </View>

            {/* STATS GRID */}
            <View style={styles.statsGrid}>
                {/* CALORIES */}
                <View style={[styles.statCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
                    <View style={[styles.iconBox, { backgroundColor: '#fef08a' }]}>
                        <Ionicons name="flame" size={24} color="#ca8a04" />
                    </View>
                    <Text style={[styles.statValue, { color: isDark ? '#f8fafc' : '#0f172a' }]}>{calories}</Text>
                    <Text style={styles.statLabel}>Kcal Đốt cháy</Text>
                </View>

                {/* DISTANCE */}
                <View style={[styles.statCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
                    <View style={[styles.iconBox, { backgroundColor: '#e0f2fe' }]}>
                        <MaterialCommunityIcons name="map-marker-distance" size={24} color="#0284c7" />
                    </View>
                    <Text style={[styles.statValue, { color: isDark ? '#f8fafc' : '#0f172a' }]}>{distanceKm}</Text>
                    <Text style={styles.statLabel}>Kilometers</Text>
                </View>
            </View>
            
            {/* RECORD WORKOUT PROMO */}
            <TouchableOpacity style={styles.promoCard} onPress={() => router.push("/screen/running")}>
                <LinearGradient colors={['#10b981', '#059669']} style={styles.promoGradient}>
                    <View>
                        <Text style={styles.promoTitle}>Đi bộ Thể Thao?</Text>
                        <Text style={styles.promoSubtitle}>Bật GPS để lưu lộ trình bản đồ</Text>
                    </View>
                    <Ionicons name="play-circle" size={40} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>

        </ScrollView>
    );
}

// Simple Fake Animated Gradient for Progress Bar
function AnimatedLinearGradient({ width }: { width: string }) {
    return (
        <LinearGradient
            colors={['#34d399', '#10b981']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: '100%', width: width as any, borderRadius: 5, zIndex: 2 }}
        />
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20,
    },
    backBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    errorCard: {
        marginHorizontal: 20, backgroundColor: '#fef3c7', padding: 15, borderRadius: 15,
        flexDirection: 'row', alignItems: 'center', marginBottom: 20,
    },
    errorText: { color: '#b45309', marginLeft: 10, flex: 1, fontSize: 13 },
    
    circleContainer: { alignItems: 'center', marginTop: 20, marginBottom: 40 },
    outerCircle: {
        width: width * 0.7, height: width * 0.7, borderRadius: (width * 0.7) / 2,
        justifyContent: 'center', alignItems: 'center', position: 'relative',
    },
    ringBg: {
        position: 'absolute', width: '90%', height: '90%', borderRadius: 1000,
        borderWidth: 15, borderColor: '#e2e8f0', zIndex: 0,
    },
    ringFill: {
        position: 'absolute', width: '90%', height: '90%', borderRadius: 1000,
        borderWidth: 15, borderColor: '#10b981', borderLeftColor: 'transparent',
        borderBottomColor: 'transparent', zIndex: 1,
    },
    innerCircle: {
        width: '80%', height: '80%', borderRadius: 1000,
        justifyContent: 'center', alignItems: 'center', zIndex: 2,
        shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5,
    },
    stepCountText: { fontSize: 48, fontWeight: '900', letterSpacing: -1 },
    stepCountLabel: { fontSize: 14, color: '#64748b', fontWeight: 'bold', marginTop: 4 },

    progressContainer: { paddingHorizontal: 25, marginBottom: 30 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    progressTitle: { fontSize: 16, fontWeight: 'bold' },
    progressPercent: { fontSize: 16, fontWeight: 'bold', color: '#10b981' },
    progressBarBg: { width: '100%', height: 10, backgroundColor: '#e2e8f0', borderRadius: 5, overflow: 'hidden' },

    statsGrid: { flexDirection: 'row', paddingHorizontal: 20, justifyContent: 'space-between' },
    statCard: {
        width: '47%', padding: 20, borderRadius: 20, alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5,
    },
    iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    statValue: { fontSize: 24, fontWeight: 'bold', paddingBottom: 4 },
    statLabel: { fontSize: 12, color: '#64748b', fontWeight: '600' },
    
    promoCard: { marginHorizontal: 20, marginTop: 30, borderRadius: 20, overflow: 'hidden' },
    promoGradient: { padding: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    promoTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
    promoSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
    shadow: {
        shadowColor: '#10b981', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.15, shadowRadius: 30, elevation: 15,
    }
});
