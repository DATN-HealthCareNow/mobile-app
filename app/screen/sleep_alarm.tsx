import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Accelerometer } from 'expo-sensors';
import { Audio } from 'expo-av';
import { useTheme } from '../../context/ThemeContext';
import { useSleepStore } from '../../store/sleepStore';

const ALARMS = [
  { id: 'casio', requirePath: require('../../assets/audio/bao-thuc-dong-ho-casio-nhacchuongwow.com.mp3') },
  { id: 'chongTrom', requirePath: require('../../assets/audio/bao-thuc-tieng-coi-chong-trom-nhacchuongwow.com.mp3') },
  { id: 'despertador', requirePath: require('../../assets/audio/despertador-militar-nhacchuongwow.com.mp3') },
  { id: 'siren', requirePath: require('../../assets/audio/military-alarm-siren-remix-nhacchuongwow.com.mp3') },
  { id: 'swedish', requirePath: require('../../assets/audio/swedish-army-2-nhacchuongwow.com.mp3') },
];

const { width } = Dimensions.get('window');
const SHAKE_THRESHOLD = 15; // Độ nhạy lắc - tăng lên để yêu cầu lắc mạnh hơn
const SHAKE_DEBOUNCE_TIME = 300; // ms giữa các lần phát hiện lắc

export default function SleepAlarmScreen() {
    const router = useRouter();
    const { alarmId } = useLocalSearchParams();
    const { colors, isDark } = useTheme();
    const { startSleep, stopSleep } = useSleepStore();

    // Lắc thiết bị logic
    const [shakeCount, setShakeCount] = useState(0);
    const targetShakes = 10;
    const progress = Math.min((shakeCount / targetShakes) * 100, 100);
    const [isTriggered, setIsTriggered] = useState(false);
    const [lastShakeTime, setLastShakeTime] = useState(0);

    // Mock thời gian cho màn hình
    const [currentTime, setCurrentTime] = useState(new Date());
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [alarmPlaying, setAlarmPlaying] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        
        // Cài đặt và phát âm thanh báo thức lặp lại
        const playAlarm = async () => {
            try {
                // Thiết lập chế độ âm thanh cho báo thức
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: true,
                    shouldDuckAndroid: false,
                });

                const alarmItem = ALARMS.find(a => a.id === alarmId) || ALARMS[0];
                const { sound: newSound } = await Audio.Sound.createAsync(
                    alarmItem.requirePath,
                    { 
                        shouldPlay: true, 
                        isLooping: true,
                        progressUpdateIntervalMillis: 500
                    }
                );
                
                setSound(newSound);
                setAlarmPlaying(true);

                // Log để debug
                console.log('Alarm started playing:', alarmItem.id);
            } catch (error) {
                console.error('Error playing alarm:', error);
                alert('Lỗi khi phát báo thức. Vui lòng thử lại.');
            }
        };
        
        playAlarm();

        return () => {
            clearInterval(interval);
            if (sound) {
                sound.unloadAsync().catch(err => console.warn('Unload sound error:', err));
            }
        };
    }, []); // Empty array = only on mount

    useEffect(() => {
        if (isTriggered) return; // Ngừng lắc nghe nếu đã tắt báo thức
        
        // Cấu hình cập nhật cảm biến gia tốc
        Accelerometer.setUpdateInterval(100); // Quét nhanh hơn

        let lastX = 0, lastY = 0, lastZ = 0;
        let lastShakeTimeRef = lastShakeTime;

        const subscription = Accelerometer.addListener(accelerometerData => {
            const { x, y, z } = accelerometerData;
            
            // Tính độ lớn của vector gia tốc (magnitude)
            const magnitude = Math.sqrt(x * x + y * y + z * z);
            
            // Tính delta từ vị trí trước
            const deltaX = Math.abs(x - lastX);
            const deltaY = Math.abs(y - lastY);
            const deltaZ = Math.abs(z - lastZ);
            
            // Phát hiện lắc: nếu magnitude lớn hoặc delta lớn
            const isShaking = magnitude > SHAKE_THRESHOLD || 
                             (deltaX > 2 || deltaY > 2 || deltaZ > 2);
            
            const currentTime = Date.now();
            
            if (isShaking && (currentTime - lastShakeTimeRef) > SHAKE_DEBOUNCE_TIME) {
                setShakeCount(prev => {
                    const next = prev + 1;
                    console.log(`Shake detected: ${next}/${targetShakes}`);
                    if (next >= targetShakes) {
                        handleWakeUp();
                    }
                    return next;
                });
                lastShakeTimeRef = currentTime;
                setLastShakeTime(currentTime);
            }
            
            lastX = x;
            lastY = y;
            lastZ = z;
        });

        return () => subscription.remove();
    }, [isTriggered]);

    const handleWakeUp = () => {
        setIsTriggered(true);
        
        // Tắt âm thanh báo thức
        if (sound && alarmPlaying) {
            sound.stopAsync();
            sound.unloadAsync().catch(err => console.error('Error unloading sound:', err));
            setAlarmPlaying(false);
        }
        
        // Lưu thông tin log dữ liệu giấc ngủ
        stopSleep();
        
        // Hiển thị thông báo & điều hướng
        alert("Chúc buổi sáng tốt lành! 🌅\nBạn đã tắt báo thức thành công!");
        
        // Điều hướng về trang chủ
        // Điều hướng về trang chủ
        setTimeout(() => {
            // Clear sleep state trước khi navigate
            router.replace("/(tabs)" as any);
        }, 500);
    };

    const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(' ');

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f0f9ff' }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <Ionicons name="menu" size={24} color={isDark ? '#fff' : '#334155'} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#0f172a' }]}>HealthCareNow</Text>
                <View style={styles.profileBox}><Ionicons name="person" size={14} color="#0ea5e9" /></View>
            </View>

            {/* VITALS BADGE */}
            <View style={styles.vitalsBadge}>
                <View style={styles.pulseDot} />
                <Text style={styles.vitalsText}>VITALS WAKE-UP</Text>
            </View>

            {/* BIG CLOCK CIRCLE */}
            <View style={styles.clockCircleWrap}>
                <View style={[styles.clockCircle, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
                    <Text style={[styles.clockTime, { color: isDark ? '#fff' : '#1e3a8a' }]}>
                        {timeString[0]}
                    </Text>
                    <Text style={styles.clockAmPm}>{timeString[1] || 'AM'}</Text>
                </View>
            </View>

            {/* SHAKE INSTRUCTION */}
            <View style={styles.shakeBox}>
                <View style={styles.shakeIconBlock}>
                    <Ionicons name="phone-portrait-outline" size={24} color="#0ea5e9" />
                    <View style={styles.vibrateLines} />
                </View>
                <Text style={[styles.shakeTitle, { color: isDark ? '#fff' : '#0f172a' }]}>Shake to Stop</Text>
                <Text style={styles.shakeSub}>Wake up your body to deactivate</Text>
            </View>

            {/* CALIBRATION PROGRESS */}
            <View style={[styles.calibrationCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
                <View style={styles.calibHeader}>
                    <Text style={styles.calibLabel}>CALIBRATION</Text>
                    <Text style={styles.calibPercent}>{Math.floor(progress)}%</Text>
                </View>
                <View style={styles.calibTrack}>
                    <View style={[styles.calibFill, { width: `${progress}%` }]} />
                </View>
            </View>

            {/* BOTTOM BUTTONS */}
            <View style={styles.bottomRow}>
                <TouchableOpacity 
                    style={styles.snoozeBtn}
                    onPress={() => {
                        // Tạm dừng báo thức trong 5 phút
                        if (sound && alarmPlaying) {
                            sound.pauseAsync();
                            setAlarmPlaying(false);
                        }
                        
                        // Đặt lại bộ đếm lắc
                        setShakeCount(0);
                        
                        // Resume sau 5 phút
                        setTimeout(() => {
                            if (sound && !isTriggered) {
                                sound.playAsync();
                                setAlarmPlaying(true);
                            }
                        }, 5 * 60 * 1000);
                        
                        alert("Báo thức sẽ reo lại trong 5 phút");
                    }}
                >
                    <Text style={styles.snoozeText}>Snooze (5m)</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.settingBtn}
                    onPress={() => {
                        // Tắt báo thức mà không cần lắc
                        handleWakeUp();
                    }}
                >
                    <Ionicons name="power" size={24} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 25, paddingTop: 50 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 16, fontWeight: 'bold' },
    profileBox: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#e0f2fe', justifyContent: 'center', alignItems: 'center' },
    
    vitalsBadge: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', backgroundColor: '#e0f2fe', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 40 },
    pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3b82f6', marginRight: 6 },
    vitalsText: { fontSize: 10, color: '#3b82f6', fontWeight: '900', letterSpacing: 1 },

    clockCircleWrap: { alignItems: 'center', marginBottom: 60 },
    clockCircle: { width: 260, height: 260, borderRadius: 130, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 30 },
    clockTime: { fontSize: 64, fontWeight: '900', letterSpacing: -2 },
    clockAmPm: { fontSize: 16, fontWeight: 'bold', color: '#60a5fa', marginTop: 5 },

    shakeBox: { alignItems: 'center', marginBottom: 40 },
    shakeIconBlock: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#e0f2fe', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    vibrateLines: { position: 'absolute', width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#bae6fd', borderStyle: 'dashed' },
    shakeTitle: { fontSize: 22, fontWeight: '800', marginBottom: 5 },
    shakeSub: { fontSize: 13, color: '#64748b' },

    calibrationCard: { borderRadius: 20, padding: 20, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, shadowRadius: 10 },
    calibHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    calibLabel: { fontSize: 11, fontWeight: '800', color: '#3b82f6', letterSpacing: 1 },
    calibPercent: { fontSize: 12, fontWeight: '800', color: '#1e3a8a' },
    calibTrack: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 4 },
    calibFill: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 4 },

    bottomRow: { flexDirection: 'row', justifyContent: 'space-between' },
    snoozeBtn: { flex: 1, backgroundColor: '#e2e8f0', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    snoozeText: { fontSize: 15, fontWeight: '700', color: '#475569' },
    settingBtn: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#fee2e2', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#ef4444', shadowOpacity: 0.15, shadowRadius: 5 }
});
