import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import { useTheme } from '../../context/ThemeContext';
import { useSleepStore } from '../../store/sleepStore';

const ALARMS = [
  { id: 'casio', name: 'Casio Digital', requirePath: require('../../assets/audio/bao-thuc-dong-ho-casio-nhacchuongwow.com.mp3') },
  { id: 'chongTrom', name: 'Tiếng còi hú', requirePath: require('../../assets/audio/bao-thuc-tieng-coi-chong-trom-nhacchuongwow.com.mp3') },
  { id: 'despertador', name: 'Báo động Despertador', requirePath: require('../../assets/audio/despertador-militar-nhacchuongwow.com.mp3') },
  { id: 'siren', name: 'Siren Remix', requirePath: require('../../assets/audio/military-alarm-siren-remix-nhacchuongwow.com.mp3') },
  { id: 'swedish', name: 'Quân đội Thuỵ Điển', requirePath: require('../../assets/audio/swedish-army-2-nhacchuongwow.com.mp3') },
];

export default function SleepAlarmSetupScreen() {
    const router = useRouter();
    const { isDark } = useTheme();
    const { startSleep } = useSleepStore();

    const [alarmTime, setAlarmTime] = useState(new Date());
    const [selectedAlarm, setSelectedAlarm] = useState(ALARMS[0]);
    const [isSmartAlarm, setIsSmartAlarm] = useState(true);
    const [sleepDurationText, setSleepDurationText] = useState('');
    const [soundPreview, setSoundPreview] = useState<Audio.Sound | null>(null);

    // Dừng nhạc preview khi unmount màn hình
    useEffect(() => {
        return () => {
            if (soundPreview) {
                soundPreview.unloadAsync();
            }
        };
    }, [soundPreview]);

    const playPreview = async (alarmItem: typeof ALARMS[0]) => {
        setSelectedAlarm(alarmItem);
        try {
            if (soundPreview) {
                await soundPreview.unloadAsync();
            }
            const { sound } = await Audio.Sound.createAsync(alarmItem.requirePath, { shouldPlay: true });
            setSoundPreview(sound);
        } catch (error) {
            console.error('Lỗi khi phát nhạc chuông', error);
        }
    };

    // Calculate AI prediction whenever time changes
    useEffect(() => {
        const now = new Date();
        let diff = alarmTime.getTime() - now.getTime();
        
        // If selected time is in the past (today), it means tomorrow
        if (diff < 0) {
            diff += 24 * 60 * 60 * 1000;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        setSleepDurationText(`Nếu ngủ bây giờ, bạn sẽ có ${hours}h ${minutes}m thời lượng ngủ`);
    }, [alarmTime]);

    const handleSave = async () => {
        try {
            // Request permissions
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                alert('Vui lòng cấp quyền thông báo để chuông báo thức có thể hoạt động!');
                return;
            }

            // Calculate trigger info
            const now = new Date();
            let triggerTime = new Date(alarmTime);
            if (triggerTime.getTime() <= now.getTime()) {
                triggerTime.setDate(triggerTime.getDate() + 1);
            }

            // Optionally, handle smart alarm offset
            if (isSmartAlarm) {
                // Wake up slightly earlier in light sleep theoretically
                // We'll keep the exact time for simplicity currently
            }

            // Dừng nhạc preview nếu đang phát
            if (soundPreview) {
                await soundPreview.unloadAsync();
            }

            // Schedule notification
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Đã đến giờ tính giấc!',
                    body: 'Chào buổi sáng! Hãy thức dậy và bắt đầu một ngày mới.',
                    sound: true, // we might have to register custom sounds
                    data: { alarmId: selectedAlarm.id }
                },
                trigger: triggerTime as any,
            });

            // Update store
            const timeToSleep = alarmTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            startSleep(timeToSleep, undefined, selectedAlarm.id);
            
            // Navigate to actual sleep execution/tracking screen
            router.push({
                pathname: "/screen/sleep_alarm",
                params: { alarmId: selectedAlarm.id }
            } as any);
        } catch (error) {
            console.error('Failed to schedule alarm', error);
            alert('Không thể cài đặt báo thức');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <Ionicons name="close" size={28} color={isDark ? '#fff' : '#0f172a'} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#0f172a' }]}>Đặt báo thức</Text>
                <View style={styles.iconBtn} />
            </View>

            {/* Time Picker */}
            <View style={styles.timePickerContainer}>
                <DateTimePicker
                    value={alarmTime}
                    mode="time"
                    display="spinner"
                    is24Hour={true}
                    onChange={(event, date) => {
                        if (date) setAlarmTime(date);
                    }}
                    textColor={isDark ? '#fff' : '#000'}
                    style={{ height: 200, flex: 1 }}
                />
            </View>

            {/* AI Prediction */}
            <View style={styles.aiPredictionBox}>
                <Ionicons name="planet" size={18} color="#8b5cf6" />
                <Text style={styles.aiPredictionText}>{sleepDurationText}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Settings */}
                <View style={[styles.optionsGroup, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
                    <View style={styles.optionRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.optionLabel, { color: isDark ? '#fff' : '#0f172a' }]}>Báo thức thông minh</Text>
                            <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Đánh thức trong pha ngủ nông</Text>
                        </View>
                        <Switch trackColor={{ false: '#cbd5e1', true: '#8b5cf6' }} value={isSmartAlarm} onValueChange={setIsSmartAlarm} />
                    </View>
                </View>

                {/* Sounds List */}
                <Text style={styles.sectionTitle}>CHỌN NHẠC CHUÔNG</Text>
                <View style={[styles.optionsGroup, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
                    {ALARMS.map((alarm, index) => (
                        <View key={alarm.id}>
                            <TouchableOpacity 
                                style={styles.optionRow}
                                onPress={() => playPreview(alarm)}
                            >
                                <Text style={[styles.optionLabel, { color: isDark ? '#fff' : '#0f172a' }]}>{alarm.name}</Text>
                                {selectedAlarm.id === alarm.id && (
                                    <Ionicons name="checkmark-circle" size={24} color="#8b5cf6" />
                                )}
                            </TouchableOpacity>
                            {index < ALARMS.length - 1 && <View style={styles.divider} />}
                        </View>
                    ))}
                </View>
                <View style={{ height: 120 }} />
            </ScrollView>

            {/* BẮT ĐẦU NGỦ BUTTON */}
            <View style={styles.bottomAction}>
                <TouchableOpacity style={styles.startSleepBtn} onPress={handleSave}>
                    <Ionicons name="moon" size={24} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.startSleepText}>Bắt đầu ngủ</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 50 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
    iconBtn: { padding: 5, width: 40, alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },

    timePickerContainer: { alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginBottom: 15 },
    
    aiPredictionBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3e8ff', alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, marginBottom: 30 },
    aiPredictionText: { marginLeft: 8, fontSize: 13, color: '#6b21a8', fontWeight: 'bold' },

    optionsGroup: { borderRadius: 16, marginHorizontal: 20, paddingHorizontal: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
    optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18 },
    optionLabel: { fontSize: 16, fontWeight: '600' },
    optionValue: { fontSize: 16, color: '#94a3b8', marginRight: 5 },
    divider: { height: 1, backgroundColor: '#f1f5f9' },

    sectionTitle: { fontSize: 14, color: '#64748b', marginHorizontal: 35, marginTop: 30, marginBottom: 10, fontWeight: 'bold', letterSpacing: 1 },

    bottomAction: { position: 'absolute', bottom: 30, left: 20, right: 20 },
    startSleepBtn: { flexDirection: 'row', height: 64, borderRadius: 32, backgroundColor: '#8b5cf6', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 15 },
    startSleepText: { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: 1 },
});
