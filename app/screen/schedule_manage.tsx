import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useScheduleStore, getNextScheduleDay } from '../../store/scheduleStore';

export default function ScheduleManageScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { schedules, toggleSchedule, deleteSchedule } = useScheduleStore();
    const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

    const activeCount = schedules.filter(s => s.isActive).length;
    const weekDays = [
        { key: 'M', label: 'Thu 2' },
        { key: 'T', label: 'Thu 3' },
        { key: 'W', label: 'Thu 4' },
        { key: 'Th', label: 'Thu 5' },
        { key: 'F', label: 'Thu 6' },
        { key: 'S', label: 'Thu 7' },
        { key: 'Su', label: 'Chu nhat' },
    ];

    const todayKey = useMemo(() => {
        const jsDay = new Date().getDay();
        const dayMap: Record<number, string> = {
            0: 'Su',
            1: 'M',
            2: 'T',
            3: 'W',
            4: 'Th',
            5: 'F',
            6: 'S',
        };
        return dayMap[jsDay] || 'M';
    }, []);

    const getSchedulesForDay = (dayKey: string) => {
        return schedules.filter((item) => {
            if (!item.isActive) return false;
            if (item.frequency === 'Daily') return true;
            return item.days.includes(dayKey);
        });
    };

    const getIconFormatType = (type: string) => {
        switch(type) {
            case 'Running': return { icon: 'run', color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.15)' };
            case 'Gym': return { icon: 'dumbbell', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)' };
            case 'Yoga': return { icon: 'yoga', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' };
            case 'Pool Laps': return { icon: 'swim', color: '#14b8a6', bg: 'rgba(20, 184, 166, 0.15)' };
            case 'HIIT Training': return { icon: 'flash', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)' };
            default: return { icon: 'human-handsup', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' };
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Activity</Text>
                    <Text style={styles.headerSub}>{activeCount} active schedules</Text>
                </View>
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>WEEKLY GOAL</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: '85%' }]} />
                    </View>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {weekDays.map((day, index) => {
                    const daySchedules = getSchedulesForDay(day.key);
                    const showAll = !!expandedDays[day.key];
                    const visibleSchedules = showAll ? daySchedules : daySchedules.slice(0, 3);
                    const isToday = day.key === todayKey;

                    return (
                        <View key={day.key} style={styles.treeRow}>
                            <View style={styles.treeRail}>
                                <View style={[styles.treeNode, isToday && styles.treeNodeToday]} />
                                {index < weekDays.length - 1 && (
                                    <View style={[styles.treeLine, isToday && styles.treeLineToday]} />
                                )}
                            </View>
                            <View style={[styles.dayBlock, { backgroundColor: isDark ? '#1e293b' : '#fff' }, isToday && styles.dayBlockToday]}>
                                <Text style={[styles.dayTitle, { color: colors.text }, isToday && styles.dayTitleToday]}>{day.label}</Text>

                                {daySchedules.length === 0 ? (
                                    <Text style={styles.emptyDayText}>Khong co lich tap.</Text>
                                ) : (
                                    <>
                                        {visibleSchedules.map((item) => {
                                            const themeObj = getIconFormatType(item.type);
                                            return (
                                                <View key={item.id} style={styles.card}>
                                                    <View style={[styles.iconBox, { backgroundColor: themeObj.bg }]}> 
                                                        <MaterialCommunityIcons name={themeObj.icon as any} size={22} color={themeObj.color} />
                                                    </View>
                                                    <View style={styles.cardContent}>
                                                        <Text style={[styles.cardTitle, { color: colors.text }]}>{item.type}</Text>
                                                        <Text style={styles.cardDesc}>
                                                            <Ionicons name="calendar-outline" size={12} /> {item.frequency === 'Daily' ? 'Daily' : item.days.join(', ')} at {item.time}
                                                        </Text>
                                                        <Text style={styles.cardNext}>
                                                            <Ionicons name="time-outline" size={12} color="#0ea5e9" /> Next: {getNextScheduleDay(item)}
                                                        </Text>
                                                    </View>
                                                    <Switch 
                                                        value={item.isActive} 
                                                        onValueChange={() => toggleSchedule(item.id)}
                                                        trackColor={{ false: '#cbd5e1', true: '#bae6fd' }}
                                                        thumbColor={item.isActive ? '#0ea5e9' : '#f8fafc'}
                                                    />
                                                </View>
                                            );
                                        })}

                                        {daySchedules.length > 3 && (
                                            <TouchableOpacity
                                                onPress={() => setExpandedDays((prev) => ({ ...prev, [day.key]: !prev[day.key] }))}
                                                style={styles.expandBtn}
                                            >
                                                <Text style={styles.expandText}>
                                                    {showAll ? 'Thu gon' : `Xem them (${daySchedules.length - 3})`}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </>
                                )}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            {/* Fab manually go to add schedule */}
            <TouchableOpacity 
                style={styles.fab} 
                onPress={() => router.push("/screen/schedule_new" as any)}
            >
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 20 },
    header: { flexDirection: 'row', alignItems: 'center', marginTop: 60, marginBottom: 30 },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { fontSize: 26, fontWeight: '900', color: '#0369a1' },
    headerSub: { fontSize: 13, color: '#0ea5e9', fontWeight: '600', marginTop: 4 },
    progressContainer: { alignItems: 'flex-end', marginLeft: 10 },
    progressText: { fontSize: 10, color: '#0ea5e9', fontWeight: 'bold', marginBottom: 4 },
    progressBar: { width: 60, height: 6, backgroundColor: '#e0f2fe', borderRadius: 3 },
    progressFill: { height: '100%', backgroundColor: '#0ea5e9', borderRadius: 3 },

    treeRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
    treeRail: { width: 30, alignItems: 'center' },
    treeNode: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#94a3b8', marginTop: 16 },
    treeNodeToday: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#0ea5e9' },
    treeLine: { width: 2, flex: 1, backgroundColor: '#cbd5e1', marginTop: 6 },
    treeLineToday: { backgroundColor: '#0ea5e9' },

    dayBlock: { flex: 1, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: 'rgba(148,163,184,0.25)' },
    dayBlockToday: { borderColor: '#0ea5e9', borderWidth: 2 },
    dayTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
    dayTitleToday: { fontWeight: '900' },
    emptyDayText: { fontSize: 13, color: '#64748b' },

    card: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
    iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
    cardDesc: { fontSize: 12, color: '#64748b', marginBottom: 4 },
    cardNext: { fontSize: 12, color: '#0ea5e9', fontWeight: '700' },
    expandBtn: { marginTop: 8, alignSelf: 'flex-start' },
    expandText: { color: '#0ea5e9', fontWeight: '700', fontSize: 13 },

    fab: {
        position: 'absolute', bottom: 30, right: 20, width: 64, height: 64,
        borderRadius: 32, backgroundColor: '#0ea5e9', justifyContent: 'center', alignItems: 'center',
        shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5
    }
});
