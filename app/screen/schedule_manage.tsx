import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useScheduleStore, getNextScheduleDay } from '../../store/scheduleStore';

export default function ScheduleManageScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { schedules, toggleSchedule, deleteSchedule, deleteSchedules } = useScheduleStore();
    const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
    
    // Batch delete state
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const activeCount = schedules.filter(s => s.isActive).length;
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

    const getSchedulesForDay = (dayKey: string) => {
        const rawSchedules = schedules.filter((item) => {
            if (!isEditMode && !item.isActive) return false;
            if (item.frequency === 'Daily') return true;
            return item.days.includes(dayKey);
        });

        // Group Medical schedules by their goal (medication name)
        const normalSchedules = rawSchedules.filter(s => s.type !== 'Medical');
        const medicalSchedules = rawSchedules.filter(s => s.type === 'Medical');
        
        const groupedMedicals: Record<string, any> = {};
        medicalSchedules.forEach(med => {
            if (!groupedMedicals[med.goal]) {
                groupedMedicals[med.goal] = {
                    ...med,
                    isGroupedMedical: true,
                    times: [med.time],
                    originalIds: [med.id]
                };
            } else {
                if (!groupedMedicals[med.goal].times.includes(med.time)) {
                    groupedMedicals[med.goal].times.push(med.time);
                }
                groupedMedicals[med.goal].originalIds.push(med.id);
            }
        });

        // Sort times for each medical group
        Object.values(groupedMedicals).forEach(group => {
            group.times.sort();
        });

        return [...normalSchedules, ...Object.values(groupedMedicals)];
    };

    const getIconFormatType = (type: string) => {
        switch(type) {
            case 'Running': return { icon: 'run', color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.15)' };
            case 'Gym': return { icon: 'dumbbell', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)' };
            case 'Yoga': return { icon: 'yoga', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' };
            case 'Pool Laps': return { icon: 'swim', color: '#14b8a6', bg: 'rgba(20, 184, 166, 0.15)' };
            case 'HIIT Training': return { icon: 'flash', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)' };
            case 'Medical': return { icon: 'pill', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
            default: return { icon: 'human-handsup', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' };
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleSelectAll = () => {
        if (selectedIds.size === schedules.length) {
            setSelectedIds(new Set()); // Deselect all
        } else {
            setSelectedIds(new Set(schedules.map(s => s.id))); // Select all
        }
    };

    const handleDeleteSelected = () => {
        if (selectedIds.size === 0) return;
        deleteSchedules(Array.from(selectedIds));
        setSelectedIds(new Set());
        setIsEditMode(false);
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
                {!isEditMode ? (
                    <TouchableOpacity onPress={() => setIsEditMode(true)} style={styles.editBtn}>
                        <Ionicons name="create-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={() => { setIsEditMode(false); setSelectedIds(new Set()); }} style={styles.editBtn}>
                        <Text style={{color: '#0ea5e9', fontWeight: 'bold'}}>Done</Text>
                    </TouchableOpacity>
                )}
            </View>

            {isEditMode && (
                <View style={styles.batchActionsContainer}>
                    <TouchableOpacity onPress={handleSelectAll} style={styles.selectAllBtn}>
                        <Ionicons name={selectedIds.size === schedules.length && schedules.length > 0 ? "checkbox" : "square-outline"} size={20} color="#0ea5e9" />
                        <Text style={styles.selectAllText}>Select All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDeleteSelected} disabled={selectedIds.size === 0} style={[styles.deleteBatchBtn, selectedIds.size === 0 && { opacity: 0.5 }]}>
                         <Ionicons name="trash-outline" size={18} color="#ef4444" />
                         <Text style={styles.deleteBatchText}>Delete ({selectedIds.size})</Text>
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {weekDays.map((day, index) => {
                    const daySchedules = getSchedulesForDay(day.key);
                    const showAll = !!expandedDays[day.key] || isEditMode;
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
                                    <Text style={styles.emptyDayText}>No scheduled tasks.</Text>
                                ) : (
                                    <>
                                        {visibleSchedules.map((item) => {
                                            const themeObj = getIconFormatType(item.type);
                                            const isSelected = selectedIds.has(item.id);
                                            return (
                                                <TouchableOpacity 
                                                    key={item.id} 
                                                    style={styles.card}
                                                    activeOpacity={isEditMode ? 0.7 : 1}
                                                    onPress={() => isEditMode ? toggleSelection(item.id) : null}
                                                >
                                                    {isEditMode && (
                                                        <View style={styles.checkboxContainer}>
                                                            <Ionicons name={isSelected ? "checkbox" : "square-outline"} size={24} color="#0ea5e9" />
                                                        </View>
                                                    )}
                                                    <View style={[styles.iconBox, { backgroundColor: themeObj.bg }]}> 
                                                        <MaterialCommunityIcons name={themeObj.icon as any} size={22} color={themeObj.color} />
                                                    </View>
                                                    
                                    <View style={styles.cardContent}>
                                         <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                                             {item.type === 'Medical' ? 'Medication' : item.type}
                                         </Text>
                                         
                                         {item.type === 'Medical' && item.medications && item.medications.length > 0 ? (
                                             <View style={{marginTop: 4, marginBottom: 8}}>
                                                 {item.medications.slice(0, 2).map((med: any, idx: number) => {
                                                     const timeSpecificDosage = med.schedules?.find((s: any) => s.time === item.time)?.dosage || med.dosage || "1 dose";
                                                     return (
                                                         <Text key={idx} style={{fontSize: 12, color: '#64748b'}} numberOfLines={1}>
                                                             • {med.name} ({timeSpecificDosage})
                                                         </Text>
                                                     );
                                                 })}
                                                 {item.medications.length > 2 && (
                                                     <Text style={{fontSize: 10, color: '#0ea5e9', fontWeight: '600'}}>+ {item.medications.length - 2} more</Text>
                                                 )}
                                             </View>
                                         ) : (
                                             <Text style={[styles.cardGoal, { color: '#64748b' }]}>{item.goal}</Text>
                                         )}

                                         <View style={styles.metaRow}>
                                             <View style={styles.metaItem}>
                                                 <Ionicons name="time-outline" size={14} color="#94a3b8" />
                                                 <Text style={styles.metaText}>{item.time}</Text>
                                             </View>
                                             <View style={styles.metaItem}>
                                                 <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                                                 <Text style={styles.metaText}>{item.frequency === 'Daily' ? 'Daily' : item.days.join(', ')}</Text>
                                             </View>
                                         </View>
                                     </View>

                                    {item.type === 'Medical' ? (
                                        <TouchableOpacity 
                                            style={styles.detailBtn}
                                            onPress={() => router.push({ pathname: '/screen/medication_schedule', params: { recordId: item.sourceId } })}
                                        >
                                            <Text style={styles.detailBtnText}>Details</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <Switch
                                            value={item.isActive}
                                            onValueChange={() => toggleSchedule(item.id)}
                                            trackColor={{ false: '#94a3b8', true: '#10b981' }}
                                        />
                                    )} 
                                                </TouchableOpacity>
                                            );
                                        })}

                                        {daySchedules.length > 3 && !isEditMode && (
                                            <TouchableOpacity
                                                onPress={() => setExpandedDays((prev) => ({ ...prev, [day.key]: !prev[day.key] }))}
                                                style={styles.expandBtn}
                                            >
                                                <Text style={styles.expandText}>
                                                    {showAll ? 'Show less' : `Show more (${daySchedules.length - 3})`}
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
            {!isEditMode && (
                 <TouchableOpacity 
                    style={styles.fab} 
                    onPress={() => router.push("/screen/schedule_new" as any)}
                 >
                    <Ionicons name="add" size={32} color="#fff" />
                 </TouchableOpacity>
            )}
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
    editBtn: { padding: 8 },
    batchActionsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 },
    selectAllBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f9ff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    selectAllText: { color: '#0ea5e9', fontWeight: '600', marginLeft: 6, fontSize: 13 },
    deleteBatchBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    deleteBatchText: { color: '#ef4444', fontWeight: '600', marginLeft: 6, fontSize: 13 },
    checkboxContainer: { marginRight: 10, justifyContent: 'center' },

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

    card: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, justifyContent: 'space-between' },
    iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    cardContent: { flex: 1, marginRight: 8 },
    cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
    cardGoal: { fontSize: 12, color: '#64748b', marginBottom: 4 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 11, color: '#94a3b8' },
    detailBtn: { backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    detailBtnText: { color: '#10b981', fontSize: 12, fontWeight: '700' },
    expandBtn: { marginTop: 8, alignSelf: 'flex-start' },
    expandText: { color: '#0ea5e9', fontWeight: '700', fontSize: 13 },

    fab: {
        position: 'absolute', bottom: 30, right: 20, width: 64, height: 64,
        borderRadius: 32, backgroundColor: '#0ea5e9', justifyContent: 'center', alignItems: 'center',
        shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5
    }
});
