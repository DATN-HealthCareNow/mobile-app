import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useScheduleStore, getNextScheduleDay } from '../../store/scheduleStore';

export default function ScheduleManageScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { schedules, toggleSchedule, deleteSchedule } = useScheduleStore();

    const activeCount = schedules.filter(s => s.isActive).length;

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
                {schedules.map((item) => {
                    const themeObj = getIconFormatType(item.type);
                    return (
                        <View key={item.id} style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
                            <View style={[styles.iconBox, { backgroundColor: themeObj.bg }]}>
                                <MaterialCommunityIcons name={themeObj.icon as any} size={28} color={themeObj.color} />
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
    card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 24, marginBottom: 16, elevation: 1 },
    iconBox: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    cardDesc: { fontSize: 12, color: '#64748b', marginBottom: 4 },
    cardNext: { fontSize: 12, color: '#0ea5e9', fontWeight: '700' },
    fab: {
        position: 'absolute', bottom: 30, right: 20, width: 64, height: 64, 
        borderRadius: 32, backgroundColor: '#0ea5e9', justifyContent: 'center', alignItems: 'center',
        shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5
    }
});
