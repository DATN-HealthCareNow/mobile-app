import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { axiosClient } from '../../api/axiosClient';

interface MedicationSchedule {
    time: string;
    dosage: string;
}

interface Medication {
    name: string;
    duration_days?: number;
    duration?: string;
    schedules?: MedicationSchedule[];
    dosage?: string; // fallback
    note: string;
}

export default function MedicationScheduleScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { colors, isDark } = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [recordTitle, setRecordTitle] = useState('');

    const weekDays = [
        { key: 'M', label: 'Mon' },
        { key: 'T', label: 'Tue' },
        { key: 'W', label: 'Wed' },
        { key: 'Th', label: 'Thu' },
        { key: 'F', label: 'Fri' },
        { key: 'S', label: 'Sat' },
        { key: 'Su', label: 'Sun' },
    ];

    const todayKey = useMemo(() => {
        const jsDay = new Date().getDay();
        const dayMap: Record<number, string> = {
            0: 'Su', 1: 'M', 2: 'T', 3: 'W', 4: 'Th', 5: 'F', 6: 'S',
        };
        return dayMap[jsDay] || 'M';
    }, []);

    useEffect(() => {
        const fetchRecord = async () => {
            try {
                if (params.recordId) {
                    const response = await axiosClient.get(`/api/v1/medical-records/${params.recordId}`) as any;

                    // Defensive check: if response has a .data property (sometimes interceptors behave differently)
                    const data = response.data || response;
                    
                    setRecordTitle(data.diagnosis || data.title || "Medical Record");
                    
                    let meds = [];
                    if (data.medications && Array.isArray(data.medications)) {
                        meds = data.medications;
                    } else {
                        const aiAnalysis = data.ai_analysis || data.aiAnalysis;
                        if (aiAnalysis) {
                            const parsed = typeof aiAnalysis === 'string' ? JSON.parse(aiAnalysis) : aiAnalysis;
                            if (parsed.medications && Array.isArray(parsed.medications)) {
                                meds = parsed.medications;
                            }
                        }
                    }
                    
                    if (meds.length === 0 && (data.medication_list || data.medicationList)) {
                        meds = data.medication_list || data.medicationList;
                    }
                    
                    setMedications(meds);
                }
            } catch (error: any) {
                // Silently fail or handle error gracefully in UI
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecord();
    }, [params.recordId]);

    // Mock scheduling for UI demonstration - in reality, this would come from the schedule service
    // For medications, we usually assume daily or specific interval
    const getMedicationsForDay = (dayKey: string) => {
        return medications.map(med => {
            const timeList = med.schedules?.map(s => s.time) || [];
            // Fallback for old data structure
            if (timeList.length === 0 && med.dosage) {
                timeList.push("08:00");
                if (med.dosage.toLowerCase().includes("2 lần")) {
                    timeList.push("20:00");
                }
            }
            return {
                ...med,
                timeList,
                displayDosage: med.schedules?.[0]?.dosage || med.dosage || ""
            };
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Medication Schedule</Text>
                    <Text style={styles.headerSub} numberOfLines={1}>{recordTitle}</Text>
                </View>
            </View>

            {isLoading ? (
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color="#10b981" />
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    {medications.length === 0 ? (
                        <View style={styles.centerBox}>
                            <Ionicons name="medical-outline" size={60} color="#94a3b8" />
                            <Text style={{color: '#94a3b8', marginTop: 10, textAlign: 'center', paddingHorizontal: 20}}>
                                No medication info found. If you just created this schedule, please delete it and scan again to fix corrupted data.
                            </Text>
                        </View>
                    ) : (
                        weekDays.map((day, index) => {
                            const dayMeds = getMedicationsForDay(day.key);
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

                                        {dayMeds.map((med, idx) => (
                                            <View key={idx} style={styles.card}>
                                                <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}> 
                                                    <MaterialCommunityIcons name="pill" size={22} color="#10b981" />
                                                </View>
                                                <View style={styles.cardContent}>
                                                    <Text style={[styles.cardTitle, { color: colors.text }]}>{med.name}</Text>
                                                    <Text style={styles.cardDesc}>
                                                        <Ionicons name="flask-outline" size={12} /> {med.displayDosage} {med.duration_days ? `- ${med.duration_days} days` : (med.duration ? `- ${med.duration}` : '')}
                                                    </Text>
                                                    <View style={styles.timeRow}>
                                                        {med.timeList.map((t, tIdx) => (
                                                            <View key={tIdx} style={styles.timeTag}>
                                                                 <Ionicons name="time-outline" size={12} color="#10b981" />
                                                                 <Text style={styles.timeText}>{t}</Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            );
                        })
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 20 },
    header: { flexDirection: 'row', alignItems: 'center', marginTop: 60, marginBottom: 30 },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { fontSize: 24, fontWeight: '900', color: '#10b981' },
    headerSub: { fontSize: 13, color: '#10b981', fontWeight: '600', marginTop: 4 },
    centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },

    treeRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
    treeRail: { width: 30, alignItems: 'center' },
    treeNode: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#94a3b8', marginTop: 16 },
    treeNodeToday: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#10b981' },
    treeLine: { width: 2, flex: 1, backgroundColor: '#cbd5e1', marginTop: 6 },
    treeLineToday: { backgroundColor: '#10b981' },

    dayBlock: { flex: 1, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: 'rgba(148,163,184,0.25)' },
    dayBlockToday: { borderColor: '#10b981', borderWidth: 2 },
    dayTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
    dayTitleToday: { fontWeight: '900' },

    card: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(148,163,184,0.1)' },
    iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
    cardDesc: { fontSize: 13, color: '#64748b', marginBottom: 6 },
    timeRow: { flexDirection: 'row', gap: 8 },
    timeTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    timeText: { fontSize: 12, color: '#10b981', fontWeight: '700', marginLeft: 4 }
});
