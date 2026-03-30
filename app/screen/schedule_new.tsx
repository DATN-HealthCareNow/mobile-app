import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../../context/ThemeContext';
import { useScheduleStore, ActivityType, FrequencyType } from '../../store/scheduleStore';

export default function ScheduleNewScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { addSchedule } = useScheduleStore();

    const [selectedType, setSelectedType] = useState<ActivityType>('Running');
    const [frequency, setFrequency] = useState<FrequencyType>('Weekly');
    const [selectedDays, setSelectedDays] = useState<string[]>(['M', 'W', 'F']);
    const [selectedTime, setSelectedTime] = useState(() => {
        const date = new Date();
        date.setHours(7, 30, 0, 0);
        return date;
    });
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [goalVal, setGoalVal] = useState('');
    const [goalError, setGoalError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatTime = (date: Date) => {
        const hour24 = date.getHours();
        const minute = date.getMinutes().toString().padStart(2, '0');
        const period = hour24 >= 12 ? 'PM' : 'AM';
        const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
        return `${hour12}:${minute} ${period}`;
    };

    const onTimeChange = (event: DateTimePickerEvent, date?: Date) => {
        setShowTimePicker(false);
        if (event.type === 'set' && date) {
            setSelectedTime(date);
        }
    };

    const activityTypes = [
        { type: 'Running', icon: 'run' },
        { type: 'Gym', icon: 'dumbbell' },
        { type: 'Calisthenics', icon: 'human-handsup' },
        { type: 'Yoga', icon: 'yoga' },
    ];

    const allDays = ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'];

    const toggleDay = (day: string) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    const handleCreate = async () => {
        if (!goalVal.trim()) {
            setGoalError('Goal is required. Please enter your training goal.');
            Alert.alert('Missing goal', 'Bạn cần nhập goal trước khi tạo lịch tập.');
            return;
        }

        if (frequency !== 'Daily' && selectedDays.length === 0) {
            Alert.alert('Missing days', 'Vui lòng chọn ít nhất 1 ngày tập.');
            return;
        }

        try {
            setIsSubmitting(true);
            
            await addSchedule({
                id: Date.now().toString(),
                type: selectedType,
                frequency,
                days: frequency === 'Daily' ? allDays : selectedDays,
                time: formatTime(selectedTime),
                goal: goalVal.trim(),
                isActive: true,
            });

            Alert.alert('Success', 'Lịch tập luyện được lưu thành công!');
            router.back();
        } catch (error) {
            console.error('Error creating schedule:', error);
            Alert.alert('Error', 'Không thể lưu lịch tập. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>New Activity</Text>
                    <Text style={styles.headerSub}>Design your personalized fitness routine</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* SELECT ACTIVITY TYPE */}
                <Text style={styles.sectionLabel}>SELECT ACTIVITY TYPE</Text>
                <View style={styles.typeGrid}>
                    {activityTypes.map((item) => {
                        const isSelected = selectedType === item.type;
                        return (
                            <TouchableOpacity
                                key={item.type}
                                style={[
                                    styles.typeCard,
                                    { backgroundColor: isDark ? '#1e293b' : '#fff' },
                                    isSelected && { backgroundColor: '#0ea5e9' }
                                ]}
                                onPress={() => setSelectedType(item.type as any)}
                            >
                                <MaterialCommunityIcons 
                                    name={item.icon as any} 
                                    size={30} 
                                    color={isSelected ? '#fff' : '#0ea5e9'} 
                                />
                                <Text style={[
                                    styles.typeLabel,
                                    { color: isSelected ? '#fff' : colors.text }
                                ]}>{item.type}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* SET FREQUENCY */}
                <Text style={styles.sectionLabel}>SET FREQUENCY</Text>
                <View style={[styles.segmentContainer, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                    {['Daily', 'Weekly', 'Custom'].map(f => {
                        const isSel = frequency === f;
                        return (
                            <TouchableOpacity 
                                key={f} 
                                style={[styles.segmentBtn, isSel && { backgroundColor: '#fff', shadowColor: '#000', elevation: 2 }]}
                                onPress={() => setFrequency(f as any)}
                            >
                                <Text style={[styles.segmentText, isSel && { color: '#0ea5e9', fontWeight: 'bold' }]}>{f}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* SELECT DAYS */}
                {frequency !== 'Daily' && (
                    <>
                        <Text style={styles.sectionLabel}>SELECT DAYS</Text>
                        <View style={styles.daysRow}>
                            {allDays.map(d => {
                                const isSel = selectedDays.includes(d);
                                return (
                                    <TouchableOpacity 
                                        key={d} 
                                        style={[
                                            styles.dayCircle,
                                            { backgroundColor: isDark ? '#1e293b' : '#fff' },
                                            isSel && { backgroundColor: '#0ea5e9' }
                                        ]}
                                        onPress={() => toggleDay(d)}
                                    >
                                        <Text style={[
                                            styles.dayText,
                                            { color: isSel ? '#fff' : '#64748b' }
                                        ]}>{d}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </>
                )}

                {/* SET TIME */}
                <Text style={styles.sectionLabel}>SET TIME</Text>
                <TouchableOpacity
                    style={[styles.inputBox, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}
                    onPress={() => setShowTimePicker(true)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="time" size={20} color="#0ea5e9" style={{ marginRight: 10 }} />
                    <Text style={[styles.input, { color: colors.text }]}>{formatTime(selectedTime)}</Text>
                    <Ionicons name="chevron-down" size={18} color="#94a3b8" />
                </TouchableOpacity>

                {showTimePicker && (
                    <DateTimePicker
                        value={selectedTime}
                        mode="time"
                        is24Hour={false}
                        display="default"
                        onChange={onTimeChange}
                    />
                )}

                {/* SET GOAL */}
                <Text style={styles.sectionLabel}>SET GOAL</Text>
                <View style={[styles.inputBox, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
                    <Ionicons name="flag" size={20} color="#0ea5e9" style={{ marginRight: 10 }} />
                    <TextInput 
                        style={[styles.input, { color: colors.text }]}
                        value={goalVal}
                        onChangeText={(text) => {
                            setGoalVal(text);
                            if (goalError && text.trim()) {
                                setGoalError('');
                            }
                        }}
                        placeholder="e.g. 45 mins"
                        placeholderTextColor="#94a3b8"
                    />
                </View>
                {!!goalError && <Text style={styles.errorText}>{goalError}</Text>}
            </ScrollView>

            {/* CREATE BUTTON */}
            <TouchableOpacity 
                style={[styles.createBtn, isSubmitting && { opacity: 0.6 }]} 
                onPress={handleCreate}
                disabled={isSubmitting}
            >
                <Text style={styles.createBtnText}>{isSubmitting ? 'Creating...' : 'Create Schedule'}</Text>
                <Ionicons name="add-circle" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    header: { flexDirection: 'row', alignItems: 'center', marginTop: 40, marginBottom: 30 },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { fontSize: 24, fontWeight: '900', color: '#0369a1' },
    headerSub: { fontSize: 12, color: '#38bdf8', fontWeight: '600', marginTop: 4 },
    sectionLabel: { fontSize: 12, fontWeight: 'bold', color: '#64748b', marginBottom: 15, marginTop: 10, letterSpacing: 1 },
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
    typeCard: { width: '48%', height: 100, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 15, elevation: 1 },
    typeLabel: { fontSize: 13, fontWeight: '700', marginTop: 10 },
    segmentContainer: { flexDirection: 'row', borderRadius: 16, padding: 4, height: 44, marginBottom: 30 },
    segmentBtn: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
    segmentText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
    daysRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    dayCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 1 },
    dayText: { fontSize: 14, fontWeight: 'bold' },
    inputBox: { height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginBottom: 30, elevation: 1 },
    input: { flex: 1, fontSize: 16, fontWeight: '600' },
    createBtn: {
        position: 'absolute', bottom: 30, left: 20, right: 20,
        backgroundColor: '#0ea5e9', height: 56, borderRadius: 28,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5
    },
    createBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginRight: 10 }
    ,
    errorText: { color: '#ef4444', fontSize: 12, marginTop: -20, marginBottom: 20, fontWeight: '600' }
});
