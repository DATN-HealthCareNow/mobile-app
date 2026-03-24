import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useStretchStore, STRETCH_WORKOUTS } from '../../store/stretchStore';
import { LinearGradient } from 'expo-linear-gradient';

export default function StretchSelectionScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { startWorkout } = useStretchStore();

    const handleStart = (id: string) => {
        startWorkout(id);
        router.push("/screen/stretch_active" as any);
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#1e1b4b' : '#f5f3ff' }]}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? '#e0e7ff' : '#312e81'} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? '#e0e7ff' : '#312e81' }]}>Stretching</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.bannerContainer}>
                    <Text style={[styles.bannerTitle, { color: isDark ? '#e0e7ff' : '#312e81' }]}>
                        Khởi động nhanh
                    </Text>
                    <Text style={styles.bannerSubtitle}>
                        Chỉ với 5-10 phút để cơ thể linh hoạt hơn. Bấm để bắt đầu ngay!
                    </Text>
                </View>

                {/* 3 BIG BUTTONS */}
                <TouchableOpacity
                    style={[styles.flowCard, styles.shadow]}
                    activeOpacity={0.9}
                    onPress={() => handleStart('s2')}
                >
                    <LinearGradient colors={['#8b5cf6', '#6d28d9']} style={styles.cardImageBg} start={{x:0,y:0}} end={{x:1,y:1}}>
                        <MaterialCommunityIcons name="timer" size={48} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', top: -10, right: -10 }} />
                        <Text style={styles.cardTitle}>5 Phút Giãn Cơ</Text>
                        <Text style={styles.metaText}>Đánh thức cơ thể nhẹ nhàng</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.flowCard, styles.shadow]}
                    activeOpacity={0.9}
                    onPress={() => handleStart('s3')}
                >
                    <LinearGradient colors={['#ec4899', '#be185d']} style={styles.cardImageBg} start={{x:0,y:0}} end={{x:1,y:1}}>
                        <MaterialCommunityIcons name="clock-fast" size={48} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', top: -10, right: -10 }} />
                        <Text style={styles.cardTitle}>10 Phút Giãn Toàn Thân</Text>
                        <Text style={styles.metaText}>Phục hồi sâu sau khi chạy tập</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.flowCard, styles.shadow]}
                    activeOpacity={0.9}
                    onPress={() => handleStart('s1')}
                >
                    <LinearGradient colors={['#06b6d4', '#0369a1']} style={styles.cardImageBg} start={{x:0,y:0}} end={{x:1,y:1}}>
                        <MaterialCommunityIcons name="human-handsup" size={48} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', top: -10, right: -10 }} />
                        <Text style={styles.cardTitle}>Cổ Vai Gáy</Text>
                        <Text style={styles.metaText}>Giảm đau nhức cho dân văn phòng</Text>
                    </LinearGradient>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20,
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
    bannerContainer: { marginBottom: 30, marginTop: 10 },
    bannerTitle: { fontSize: 32, fontWeight: '900', marginBottom: 8 },
    bannerSubtitle: { fontSize: 15, color: '#6b7280', lineHeight: 22 },
    
    flowCard: { width: '100%', height: 160, borderRadius: 24, overflow: 'hidden', marginBottom: 20 },
    cardImageBg: { flex: 1, padding: 25, justifyContent: 'center' },
    cardTitle: { color: '#fff', fontSize: 26, fontWeight: '900', marginBottom: 8, letterSpacing: -0.5 },
    metaText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '500' },
    shadow: { shadowColor: '#312e81', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 15 }
});
