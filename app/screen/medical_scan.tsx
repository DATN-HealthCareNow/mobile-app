import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { axiosClient } from '../../api/axiosClient';
import { scheduleService } from '../../api/services/scheduleService';
import { useScheduleStore } from '../../store/scheduleStore';
import * as Notifications from 'expo-notifications';

interface MedicationInfo {
  name: string;
  dosage?: string;
  duration?: string;
  duration_days?: number;
  note: string;
  schedules?: { time: string; dosage: string }[];
}

interface AnalysisResult {
  diagnosis?: string;
  medications?: MedicationInfo[];
  forbidden_foods?: string[];
  error?: string;
}

export default function MedicalScanScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    
    const [savingRecordId, setSavingRecordId] = useState<string | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const params = useLocalSearchParams();
    const [expandedRecordId, setExpandedRecordId] = useState<string | null>(params.expandRecordId as string || null);
    const { schedules: allSchedules, deleteSchedules, loadSchedules } = useScheduleStore();

    const fetchHistory = async () => {
        try {
            const response = await axiosClient.get('/api/v1/medical-records');
            const list = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
            setHistory(list);
        } catch (err) {
            console.log("Error fetching history:", err);
        }
    };

    React.useEffect(() => {
        fetchHistory();
    }, []);

    const pickImage = async (useCamera = false) => {
        let pickerResult;
        
        if (useCamera) {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (permission.status !== 'granted') {
                Alert.alert("Quyền", "Cần cấp quyền camera để chụp ảnh");
                return;
            }
            pickerResult = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                quality: 0.8,
            });
        } else {
            pickerResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.8,
            });
        }

        if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
            const uri = pickerResult.assets[0].uri;
            setImageUri(uri);
            analyzeImage(uri);
        }
    };

    const analyzeImage = async (uri: string) => {
        setIsAnalyzing(true);
        setResult(null);

        try {
            const filename = uri.split('/').pop() || 'image.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            const formData = new FormData();
            // @ts-ignore
            formData.append('file', { uri, name: filename, type });

            // Axios thường lỗi ERR_NETWORK khi upload FormData lớn hoặc timeout 10s là quá ngắn cho AI
            // Sử dụng fetch API native là giải pháp ổn định nhất trên React Native
            const token = await require('expo-secure-store').getItemAsync('accessToken');
            const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://52.220.93.185';
            
            const fetchResponse = await fetch(`${apiUrl}/api/v1/analysis/medical-record`, {
                method: 'POST',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    // Không set Content-Type, fetch sẽ tự động set boundary cho multipart/form-data
                },
                body: formData,
            });
            
            const rawText = await fetchResponse.text();
            let data;
            try {
                data = JSON.parse(rawText);
            } catch(e) {
                data = { error: "Không thể parse JSON từ server" };
            }
            
            // Xử lý nested result nếu có
            if (data.result) {
                try {
                    data = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
                } catch(e) {}
            }

            if (!fetchResponse.ok || data.error) {
                // Lấy message lỗi (ví dụ như 429 Quota Exceeded)
                const errorMsg = data.error_message || data.error || data.message || `Server error: ${fetchResponse.status}`;
                Alert.alert("AI Error", errorMsg);
            } else {
                setResult(data);
            }
        } catch (error: any) {
            console.error("Upload error:", error);
            Alert.alert("Analysis Error", error.message || "Failed to send image to AI server. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };


    const handleSaveScheduleForRecord = async (targetRecordId: string, medications: MedicationInfo[], diagnosisTitle: string) => {
        // Check if we are toggling OFF
        const existingSchedules = allSchedules.filter(s => s.sourceId === targetRecordId || s.id.includes(targetRecordId));
        if (existingSchedules.length > 0) {
            setSavingRecordId(targetRecordId);
            try {
                // 1. Delete from backend
                const idsToDelete = existingSchedules.map(s => s.id);
                await deleteSchedules(idsToDelete);
                
                // 2. Cancel local notifications
                await Notifications.cancelAllScheduledNotificationsAsync(); 
                await loadSchedules();
                
                Alert.alert("Success", "All reminders for this record have been disabled.");
            } catch (e) {
                Alert.alert("Error", "Could not disable reminders.");
            } finally {
                setSavingRecordId(null);
            }
            return;
        }

        if (!medications || medications.length === 0) {
            Alert.alert("Notice", "No medications found to schedule.");
            return;
        }

        setSavingRecordId(targetRecordId);
        try {
            let actualRecordId = targetRecordId;
            
            // Only create a new medical record if this is a NEW scan
            if (targetRecordId.startsWith("scan_")) {
                const recordPayload = {
                    title: diagnosisTitle || "Medical Record",
                    diagnosis: diagnosisTitle || "Medical Record",
                    medications: medications || [],
                    forbiddenFoods: result?.forbidden_foods || [],
                    aiAnalysis: JSON.stringify(result) 
                };

                const recordResponse = await axiosClient.post('/api/v1/medical-records', recordPayload);
                const savedRecord = recordResponse.data || recordResponse;
                actualRecordId = savedRecord.id || targetRecordId;
            }

            // 2. Request permissions
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Notification Permission", "Record saved, but please enable notifications to receive medication reminders.");
                setSavingRecordId(null);
                fetchHistory(); // Refresh to show the new record anyway
                setResult(null);
                setImageUri(null);
                return;
            }

            const allReminderTimes = new Set<string>();

            for (const med of medications) {
                let medSchedules = med.schedules && med.schedules.length > 0 ? med.schedules : [];
                
                // Fallback logic for frequency
                if (medSchedules.length === 0) {
                    const note = (med.note || "").toLowerCase();
                    const dosage = (med.dosage || "").toLowerCase();
                    
                    if (note.includes("2 lần") || dosage.includes("2 lần")) {
                        medSchedules = [{ time: "08:00", dosage: med.dosage || "" }, { time: "20:00", dosage: med.dosage || "" }];
                    } else if (note.includes("3 lần") || dosage.includes("3 lần")) {
                        medSchedules = [{ time: "08:00", dosage: med.dosage || "" }, { time: "13:00", dosage: med.dosage || "" }, { time: "20:00", dosage: med.dosage || "" }];
                    } else {
                        // Default: 1 time per day at 8:00 AM
                        medSchedules = [{ time: "08:00", dosage: med.dosage || "" }];
                    }
                }

                for (const sched of medSchedules) {
                    const timeStr = sched.time;
                    allReminderTimes.add(timeStr);
                    const dosageText = sched.dosage || med.dosage || "";
                    const [hour, minute] = timeStr.split(':').map(Number);
                    
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: "💊 Medication Reminder",
                            body: `It's time to take ${med.name} (${dosageText})`,
                            data: { screen: 'medication_schedule', recordId: actualRecordId },
                            sound: true,
                            priority: Notifications.AndroidNotificationPriority.HIGH,
                        },
                        trigger: {
                            type: 'daily',
                            hour,
                            minute,
                            repeats: true,
                        } as any,
                    });
                }
            }

            // Create ONE document in backend for all times
            if (medications && medications.length > 0) {
                await scheduleService.createSchedule({
                    title: `Medication: ${diagnosisTitle}`,
                    schedule_type: 'RECURRING',
                    start_date: new Date().toISOString(),
                    reminder_enabled: true,
                    source_id: actualRecordId,
                    diagnosis: diagnosisTitle,
                    medications: medications,
                    // Send an empty recurrence_config or just repeatDays since medications contain the times
                    recurrence_config: { 
                        repeat_days: [0, 1, 2, 3, 4, 5, 6]
                    }
                });
            }
            
            await loadSchedules();
            Alert.alert("Success", `Medical record saved and reminders created for ${medications.length} medications!`);
            
            // 3. Refresh history and clear current scan
            fetchHistory();
            setResult(null);
            setImageUri(null);
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Could not save record or create reminders.");
        } finally {
            setSavingRecordId(null);
        }
    };


    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.circleBtn}>
                    <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Scan Medical Record</Text>
                <View style={{width: 44}} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                <Text style={[styles.desc, { color: colors.textSecondary }]}>
                    Capture or upload prescriptions and medical records for AI to automatically extract medication schedules and forbidden foods.
                </Text>

                <View style={styles.imageBox}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                    ) : (
                        <View style={[styles.imagePlaceholder, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                            <Ionicons name="document-text" size={60} color="#94a3b8" />
                            <Text style={{color: '#94a3b8', marginTop: 10}}>No image selected</Text>
                        </View>
                    )}
                </View>

                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.btnOutline} onPress={() => pickImage(false)}>
                        <Ionicons name="images" size={20} color="#0ea5e9" />
                        <Text style={styles.btnOutlineText}>Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnSolid} onPress={() => pickImage(true)}>
                        <Ionicons name="camera" size={20} color="#fff" />
                        <Text style={styles.btnSolidText}>Take Photo</Text>
                    </TouchableOpacity>
                </View>

                {/* HỒ SƠ KHÁM BỆNH */}
                {!isAnalyzing && !result && history.length > 0 && (
                    <View style={styles.historySection}>
                        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>Medical History</Text>
                        {history.map((record, index) => {
                            let status = "Expired";
                            let statusColor = "#94a3b8"; 
                            if (index === 0 || index === 1) {
                                status = "Active Medication";
                                statusColor = "#10b981"; 
                            }
                            
                            let diagnosis = record.diagnosis || record.title || "Medical Record";
                            let medicationsList: MedicationInfo[] = [];
                            try {
                                if (record.aiAnalysis) {
                                    const parsed = typeof record.aiAnalysis === 'string' ? JSON.parse(record.aiAnalysis) : record.aiAnalysis;
                                    if (parsed.diagnosis && !record.diagnosis) diagnosis = parsed.diagnosis;
                                    if (parsed.medications) medicationsList = parsed.medications;
                                } else if (record.medications && Array.isArray(record.medications)) {
                                    medicationsList = record.medications;
                                }
                            } catch(e){}

                            return (
                                <View key={record.id || index} style={styles.historyCard}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <View style={{ flex: 1, paddingRight: 10 }}>
                                            <Text style={[styles.historyTitle, { color: colors.text }]}>{diagnosis}</Text>
                                            <View style={styles.statusRow}>
                                                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                                                <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity 
                                            style={[styles.historyIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}
                                            onPress={() => setExpandedRecordId(expandedRecordId === record.id ? null : record.id)}
                                        >
                                            <Ionicons name="time" size={22} color="#10b981" />
                                        </TouchableOpacity>
                                    </View>

                                    {expandedRecordId === record.id && (
                                        <View style={{ marginTop: 15, backgroundColor: 'rgba(16, 185, 129, 0.05)', borderRadius: 12, padding: 12 }}>
                                            <Text style={{fontWeight: '700', color: colors.text, marginBottom: 10}}>Medication Times:</Text>
                                            {medicationsList.length > 0 ? (
                                                medicationsList.map((med: any, idx: number) => {
                                                    const displayDosage = med.schedules?.[0]?.dosage || med.dosage || "";
                                                    const durationText = med.duration_days ? `${med.duration_days} days` : (med.duration || "");
                                                    const times = med.schedules?.map((s: any) => s.time).join(', ') || "";
                                                    
                                                    return (
                                                        <View key={idx} style={{marginBottom: 8, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: '#10b981'}}>
                                                            <Text style={{fontWeight: '600', color: colors.text}}>{med.name}</Text>
                                                            <Text style={{fontSize: 12, color: colors.textSecondary}}>
                                                                {displayDosage} {durationText ? `- ${durationText}` : ""} {times ? `(Times: ${times})` : ""}
                                                            </Text>
                                                        </View>
                                                    );
                                                })
                                            ) : (
                                                <Text style={{fontSize: 12, color: colors.textSecondary}}>No medication info found.</Text>
                                            )}
                                            
                                            <View style={{flexDirection: 'row', gap: 10, marginTop: 10}}>
                                                {(() => {
                                                    const hasActiveSchedules = allSchedules.some(s => s.sourceId === record.id || s.id.includes(record.id));
                                                    const isProcessing = savingRecordId === record.id;
                                                    
                                                    return (
                                                        <TouchableOpacity 
                                                            style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: hasActiveSchedules ? '#f43f5e' : '#10b981', paddingVertical: 10, borderRadius: 10}}
                                                            onPress={() => handleSaveScheduleForRecord(record.id, medicationsList, diagnosis)}
                                                            disabled={isProcessing}
                                                        >
                                                            {isProcessing ? (
                                                                <ActivityIndicator size="small" color="#fff" style={{marginRight: 6}} />
                                                            ) : (
                                                                <Ionicons name={hasActiveSchedules ? "notifications-off" : "notifications"} size={16} color="#fff" style={{marginRight: 6}} />
                                                            )}
                                                            <Text style={{color: '#fff', fontWeight: '700', fontSize: 13}}>
                                                                {isProcessing ? "Wait..." : (hasActiveSchedules ? "Disable" : "Enable")}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    );
                                                })()}
                                                <TouchableOpacity 
                                                    style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 1, borderColor: '#10b981', paddingVertical: 10, borderRadius: 10}}
                                                    onPress={() => router.push({ pathname: '/screen/medication_schedule', params: { recordId: record.id } })}
                                                >
                                                    <Ionicons name="calendar" size={16} color="#10b981" style={{marginRight: 6}} />
                                                    <Text style={{color: '#10b981', fontWeight: '700', fontSize: 13}}>Details</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}
                                    
                                    <View style={styles.historyDivider} />

                                    <TouchableOpacity 
                                        style={styles.addForbiddenFoodBtn}
                                        onPress={() => router.push({ pathname: '/screen/forbidden_foods', params: { recordId: record.id } })}
                                    >
                                        <Ionicons name="restaurant" size={16} color="#f43f5e" />
                                        <Text style={styles.addForbiddenFoodText}>Forbidden Food List</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                )}

                {isAnalyzing && (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color="#0ea5e9" />
                        <Text style={[styles.loadingText, { color: colors.text }]}>AI is analyzing records...</Text>
                    </View>
                )}

                {result && !isAnalyzing && (
                    <View style={styles.resultContainer}>
                        <View style={styles.sectionCard}>
                            <View style={styles.sectionHeaderRow}>
                                <Ionicons name="medical" size={20} color="#10b981" />
                                <Text style={styles.sectionTitle}>Diagnosis</Text>
                            </View>
                            <Text style={[styles.diagnosisText, { color: colors.text }]}>{result.diagnosis || "Unknown."}</Text>
                        </View>

                        <View style={styles.sectionCard}>
                            <View style={styles.sectionHeaderRow}>
                                <Ionicons name="flask" size={20} color="#6366f1" />
                                <Text style={styles.sectionTitle}>Prescribed Medications ({result.medications?.length || 0})</Text>
                            </View>
                            
                            {result.medications && result.medications.length > 0 ? (
                                result.medications.map((med, idx) => (
                                    <View key={idx} style={styles.medItem}>
                                        <Text style={[styles.medName, { color: colors.text }]}>{med.name}</Text>
                                        <Text style={styles.medDetail}>Dosage: <Text style={{color: '#6366f1'}}>{med.dosage}</Text></Text>
                                        <Text style={styles.medDetail}>Duration: {med.duration}</Text>
                                        {!!med.note && <Text style={styles.medNote}>Note: {med.note}</Text>}
                                    </View>
                                ))
                            ) : (
                                <Text style={{color: '#94a3b8', fontSize: 13}}>No medications found.</Text>
                            )}
                        </View>



                        <TouchableOpacity 
                            style={[styles.saveBtn, savingRecordId === ("scan_" + Date.now()) && { opacity: 0.7 }]} 
                            onPress={() => handleSaveScheduleForRecord("scan_" + Date.now(), result.medications || [], result.diagnosis || "Medical Record")}
                            disabled={savingRecordId !== null}
                        >
                            {savingRecordId !== null ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.saveBtnText}>Schedule Reminders</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 15 },
    circleBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(148,163,184,0.1)', justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 20, fontWeight: '800' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 80 },
    desc: { fontSize: 14, lineHeight: 22, marginBottom: 20 },
    imageBox: { height: 260, borderRadius: 20, overflow: 'hidden', marginBottom: 20 },
    imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
    imagePlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', borderRadius: 20 },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    btnOutline: { flex: 1, flexDirection: 'row', height: 50, borderRadius: 14, borderWidth: 1, borderColor: '#0ea5e9', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    btnOutlineText: { color: '#0ea5e9', fontWeight: '700', fontSize: 15, marginLeft: 8 },
    btnSolid: { flex: 1, flexDirection: 'row', height: 50, borderRadius: 14, backgroundColor: '#0ea5e9', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
    btnSolidText: { color: '#fff', fontWeight: '700', fontSize: 15, marginLeft: 8 },
    
    loadingBox: { alignItems: 'center', paddingVertical: 40 },
    loadingText: { marginTop: 16, fontSize: 15, fontWeight: '600' },
    
    resultContainer: { marginTop: 10 },
    sectionCard: { backgroundColor: 'rgba(148,163,184,0.05)', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(148,163,184,0.1)' },
    sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#334155', marginLeft: 8 },
    
    diagnosisText: { fontSize: 15, fontWeight: '600', lineHeight: 22 },
    
    medItem: { borderLeftWidth: 3, borderLeftColor: '#6366f1', paddingLeft: 12, marginBottom: 14 },
    medName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
    medDetail: { fontSize: 13, color: '#64748b', marginBottom: 2 },
    medNote: { fontSize: 13, color: '#f59e0b', fontStyle: 'italic', marginTop: 2 },
    historySection: { marginTop: 10, paddingBottom: 20 },
    historyCard: { backgroundColor: 'rgba(148,163,184,0.05)', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(148,163,184,0.1)' },
    historyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, lineHeight: 22 },
    statusRow: { flexDirection: 'row', alignItems: 'center' },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    statusText: { fontSize: 12, fontWeight: '600' },
    historyIconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    historyDivider: { height: 1, backgroundColor: 'rgba(148,163,184,0.1)', marginVertical: 14 },
    addForbiddenFoodBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(244, 63, 94, 0.1)', alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
    addForbiddenFoodText: { color: '#f43f5e', fontWeight: '700', fontSize: 13, marginLeft: 6 },

    saveBtn: { backgroundColor: '#10b981', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});
