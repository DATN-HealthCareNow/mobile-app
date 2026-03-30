import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { BarChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

export default function SleepDashboardScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#334155'} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#0f172a' }]}>Sleep Tracking</Text>
                <View style={styles.iconBtn} />
            </View>

            {/* AI INSIGHTS & SLEEP SCORE */}
            <View style={styles.topSection}>
                <View style={[styles.scoreCircle, { borderColor: '#3b82f6', backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
                    <Text style={[styles.scoreText, { color: isDark ? '#fff' : '#0f172a' }]}>85</Text>
                    <Text style={styles.scoreSub}>/100</Text>
                </View>
                <View style={[styles.aiBox, { backgroundColor: isDark ? '#1e293b' : '#eff6ff' }]}>
                    <Ionicons name="sparkles" size={16} color="#3b82f6" />
                    <Text style={[styles.aiText, { color: isDark ? '#cbd5e1' : '#334155' }]}>
                        Đêm qua bạn có 2 tiếng ngủ sâu, phục hồi rất tốt sau buổi tập Yoga!
                    </Text>
                </View>
            </View>

            {/* CHART SECTION */}
            <View style={styles.chartSection}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#0f172a' }]}>Chu kỳ giấc ngủ</Text>
                <BarChart
                    data={{
                        labels: ['Thức', 'Nông', 'Sâu', 'REM'],
                        datasets: [{ data: [15, 50, 20, 15] }]
                    }}
                    width={width - 50}
                    height={180}
                    yAxisLabel=""
                    yAxisSuffix="%"
                    chartConfig={{
                        backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                        backgroundGradientFrom: isDark ? '#0f172a' : '#f8fafc',
                        backgroundGradientTo: isDark ? '#0f172a' : '#f8fafc',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                        labelColor: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
                        barPercentage: 0.6,
                    }}
                    style={{ borderRadius: 16, marginTop: 15 }}
                    showValuesOnTopOfBars={true}
                />
            </View>

            {/* BOTTOM BUTTONS */}
            <View style={styles.actionRow}>
                <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: '#3b82f6' }]}
                    onPress={() => router.push("/screen/sleep_alarm_setup" as any)}
                >
                    <Ionicons name="alarm-outline" size={24} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.startSleepText}>Đặt Báo Thức</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: isDark ? '#1e293b' : '#fff', borderWidth: 1, borderColor: '#3b82f6' }]}
                    onPress={() => router.push("/screen/sleep_music" as any)}
                >
                    <Ionicons name="musical-notes-outline" size={24} color="#3b82f6" style={{ marginRight: 8 }} />
                    <Text style={[styles.startSleepText, { color: '#3b82f6' }]}>Nghe Nhạc</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 25, paddingTop: 50 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 50 },
    iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    
    artworkContainer: { alignItems: 'center', marginVertical: 30 },
    artworkShadow: { 
        width: 180, height: 180, borderRadius: 90, 
        justifyContent: 'center', alignItems: 'center',
        elevation: 15, shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20
    },
    
    titleSection: { alignItems: 'center', marginBottom: 50 },
    songTitle: { fontSize: 24, fontWeight: '800' },
    
    cardsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
    infoCard: { width: '48%', borderRadius: 20, padding: 15, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, shadowRadius: 10 },
    cardIconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    cardLabel: { fontSize: 9, fontWeight: 'bold', color: '#94a3b8', letterSpacing: 1 },
    cardValue: { fontSize: 14, fontWeight: '800', marginTop: 2 },

    actionRow: { flexDirection: 'column', gap: 15, marginTop: 'auto', marginBottom: 20 },
    actionBtn: { flexDirection: 'row', height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 5 },
    startSleepText: { fontSize: 16, fontWeight: 'bold' },
    
    topSection: { alignItems: 'center', marginBottom: 20 },
    scoreCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 15, elevation: 5, shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
    scoreText: { fontSize: 36, fontWeight: '900' },
    scoreSub: { fontSize: 14, color: '#94a3b8', fontWeight: 'bold' },
    aiBox: { flexDirection: 'row', padding: 15, borderRadius: 16, alignItems: 'center', elevation: 1 },
    aiText: { flex: 1, marginLeft: 10, fontSize: 13, lineHeight: 20, fontWeight: '500' },
    chartSection: { marginTop: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 }
});

