import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Switch, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { useDailyHealthMetric } from '../../hooks/useDailyHealthMetric';
import { useSleepStore } from '../../store/sleepStore';

const { width } = Dimensions.get('window');

export default function SleepDashboardScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { alarms, toggleAlarm, removeAlarm } = useSleepStore();

    const today = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());

    const { data: dailyHealth, isLoading } = useDailyHealthMetric(today);
    
    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc', justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }
    
    // Lấy dữ liệu 100% từ IoT Service (Daily Health Metric)
    const metrics = dailyHealth?.metrics as any;
    const sleepMinutes = Number(
        metrics?.sleep_minutes ??
        metrics?.sleepMinutes ??
        metrics?.sleep ??
        0
    );
    const sleepHours = Math.floor(sleepMinutes / 60);
    const sleepMins = sleepMinutes % 60;
    
    // Tính điểm số tương đối
    const targetSleep = 420; // 7h = 420mins
    const sleepScore = sleepMinutes >= targetSleep ? 84 : Math.min(Math.floor((sleepMinutes / targetSleep) * 80), 100);
    const sleepQuality = sleepScore >= 80 ? 'Excellent' : sleepScore >= 60 ? 'Good' : 'Fair';

    // Tính fake Deep Sleep từ tổng thời gian (khoảng 20%)
    const deepMinutes = Math.floor(sleepMinutes * 0.2);
    const deepHours = Math.floor(deepMinutes / 60);
    const deepMins = deepMinutes % 60;

    const radius = 93;
    const strokeWidth = 14;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (sleepScore / 100) * circumference;

    return (
        <View style={[styles.mainContainer, { backgroundColor: colors.background }]}> 
            {!isDark && (
                <LinearGradient
                    colors={["#b9dbf5", "#d7ebfa", "#e7f2fb"]}
                    style={styles.heroBg}
                />
            )}
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}> 
                    <Ionicons name="arrow-back" size={22} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Sleep</Text>
                <View style={{ width: 40, height: 40 }} />
            </View>

            {/* SLEEP SCORE CIRCLE GRAPHIC */}
            <View style={styles.scoreContainer}>
                <View style={styles.svgWrapper}>
                    <Svg width="200" height="200">
                        {/* Background Track */}
                        <Circle 
                            cx="100" 
                            cy="100" 
                            r={radius} 
                            stroke={isDark ? '#1e293b' : '#eff6ff'} 
                            strokeWidth={strokeWidth} 
                            fill="transparent" 
                        />
                        {/* Animated/Dynamic Foreground */}
                        <Circle 
                            cx="100" 
                            cy="100" 
                            r={radius} 
                            stroke="#3b82f6" 
                            strokeWidth={strokeWidth} 
                            strokeLinecap="round"
                            fill="transparent" 
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                        />
                    </Svg>
                    <View style={styles.innerCircleContent}>
                        <Text style={styles.scoreTopLabel}>SLEEP SCORE</Text>
                        <Text style={[styles.scoreValue, { color: isDark ? '#fff' : '#0f172a' }]}>{sleepScore}</Text>
                        <Text style={styles.scoreBottomLabel}>{sleepQuality}</Text>
                    </View>
                </View>
            </View>

            {/* DURATION CARD */}
            <View style={[styles.durationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.durationCol}>
                    <Text style={styles.durationLabel}>TOTAL DURATION</Text>
                    <Text style={[styles.durationText, { color: isDark ? '#fff' : '#0f172a' }]}>
                        {sleepHours}h {sleepMins}m
                    </Text>
                </View>
                <View style={[styles.separator, { backgroundColor: isDark ? '#334155' : '#f1f5f9' }]} />
                <View style={styles.durationCol}>
                    <Text style={styles.durationLabel}>DEEP SLEEP</Text>
                    <Text style={[styles.durationText, { color: isDark ? '#fff' : '#0f172a' }]}>
                        {deepHours}h {deepMins}m
                    </Text>
                </View>
            </View>

            {/* RELAXING SOUNDS */}
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#0f172a' }]}>Relaxing Sounds</Text>
                <TouchableOpacity onPress={() => router.push("/screen/sleep_music" as any)}>
                    <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.soundsRow}>
                {/* Sound 1: Rain */}
                <TouchableOpacity style={[styles.soundCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push("/screen/sleep_music" as any)}>
                    <View style={styles.soundIconCircle}>
                        <Ionicons name="water" size={24} color="#3b82f6" />
                    </View>
                    <Text style={[styles.soundName, { color: isDark ? '#fff' : '#0f172a' }]}>Rain</Text>
                    <View style={styles.playBtn}>
                        <Ionicons name="play" size={12} color="#fff" style={{ marginLeft: 2 }} />
                    </View>
                </TouchableOpacity>

                {/* Sound 2: Forest */}
                <TouchableOpacity style={[styles.soundCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push("/screen/sleep_music" as any)}>
                    <View style={[styles.soundIconCircle, { backgroundColor: '#ede9fe' }]}>
                        <MaterialCommunityIcons name="pine-tree" size={24} color="#8b5cf6" />
                    </View>
                    <Text style={[styles.soundName, { color: isDark ? '#fff' : '#0f172a' }]}>Forest</Text>
                    <View style={styles.playBtn}>
                        <Ionicons name="play" size={12} color="#fff" style={{ marginLeft: 2 }} />
                    </View>
                </TouchableOpacity>

                {/* Sound 3: Wave */}
                <TouchableOpacity style={[styles.soundCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push("/screen/sleep_music" as any)}>
                    <View style={[styles.soundIconCircle, { backgroundColor: '#e0f2fe' }]}>
                        <Ionicons name="water-outline" size={24} color="#0284c7" />
                    </View>
                    <Text style={[styles.soundName, { color: isDark ? '#fff' : '#0f172a' }]}>Wave</Text>
                    <View style={styles.playBtn}>
                        <Ionicons name="play" size={12} color="#fff" style={{ marginLeft: 2 }} />
                    </View>
                </TouchableOpacity>
            </ScrollView>

            {/* SMART ALARM */}
            <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#0f172a', marginTop: 30, marginBottom: 15 }]}>Smart Alarm</Text>
            
            {alarms.length > 0 ? (
                alarms.map((alarm) => (
                    <View key={alarm.id} style={[styles.alarmCard, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 15 }]}>
                        <View>
                            <Text style={[styles.alarmTime, { color: (isDark && alarm.enabled) ? '#fff' : (!isDark && alarm.enabled) ? '#0f172a' : '#94a3b8' }]}>
                                {alarm.time}
                            </Text>
                            <Text style={styles.alarmDays}>{alarm.days}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Switch 
                                trackColor={{ false: '#cbd5e1', true: '#3b82f6' }} 
                                thumbColor="#fff" 
                                value={alarm.enabled} 
                                onValueChange={(val) => toggleAlarm(alarm.id, val)}
                            />
                            <TouchableOpacity onPress={() => removeAlarm(alarm.id)} style={{ marginLeft: 15, padding: 5 }}>
                                <Ionicons name="trash-outline" size={20} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            ) : (
                <View style={[styles.alarmCard, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 15 }]}>
                    <View>
                        <Text style={[styles.alarmTime, { color: '#94a3b8' }]}>--:--</Text>
                        <Text style={styles.alarmDays}>Chưa có báo thức</Text>
                    </View>
                </View>
            )}
            
            <View style={{ height: 30 }} />
            </ScrollView>

            {/* FIXED FOOTER ALARM BUTTON */}
            <View style={styles.footerContainer}>
                <TouchableOpacity 
                    style={[styles.setupAlarmBtn, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.18)' : '#e6f3ff' }]}
                    onPress={() => router.push("/screen/sleep_alarm_setup" as any)}
                >
                    <Ionicons name="alarm-outline" size={22} color="#3b82f6" style={{ marginRight: 8 }} />
                    <Text style={styles.setupAlarmBtnText}>Cài Đặt Báo Thức</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, paddingTop: 50 },
    heroBg: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 320,
    },
    container: { flex: 1, paddingHorizontal: 25 },
    footerContainer: {
        paddingHorizontal: 25,
        paddingBottom: 25,
        paddingTop: 10,
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    iconBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    
    scoreContainer: { alignItems: 'center', marginBottom: 30 },
    svgWrapper: {
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ rotate: '-90deg' }], // Start from Top
    },
    innerCircleContent: {
        position: 'absolute',
        transform: [{ rotate: '90deg' }], // Counter rotate text
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreTopLabel: { fontSize: 11, fontWeight: '700', color: '#94a3b8', letterSpacing: 1, marginBottom: 8 },
    scoreValue: { fontSize: 56, fontWeight: '900', lineHeight: 65 },
    scoreBottomLabel: { fontSize: 14, fontWeight: '600', color: '#3b82f6', marginTop: 0 },
    
    durationCard: {
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        marginBottom: 30,
    },
    durationCol: { alignItems: 'center', flex: 1 },
    separator: { width: 1, height: '80%', alignSelf: 'center' },
    durationLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 1, marginBottom: 6 },
    durationText: { fontSize: 20, fontWeight: '800' },
    
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold' },
    viewAll: { fontSize: 13, fontWeight: '600', color: '#3b82f6' },
    
    soundsRow: { overflow: 'visible' },
    soundCard: { 
        borderRadius: 16, 
        borderWidth: 1,
        padding: 16, 
        alignItems: 'center', 
        marginRight: 15, 
        width: 100, 
        elevation: 2, 
        shadowColor: '#000', 
        shadowOpacity: 0.03, 
        shadowRadius: 8, 
        shadowOffset: { width: 0, height: 3 } 
    },
    soundIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    soundName: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
    playBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' },
    
    alarmCard: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },
    alarmTime: { fontSize: 36, fontWeight: '800', marginBottom: 4 },
    alarmDays: { fontSize: 12, color: '#94a3b8', fontWeight: '500' },

    setupAlarmBtn: {
        flexDirection: 'row',
        backgroundColor: '#eff6ff', // light sky blue
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
    },
    setupAlarmBtnText: {
        color: '#3b82f6',
        fontSize: 16,
        fontWeight: 'bold',
    }
});

