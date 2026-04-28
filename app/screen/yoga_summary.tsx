import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useYogaStore } from '../../store/yogaStore';
import { activityService } from '../../api/services/activityService';
import { useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function YogaSummaryScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const queryClient = useQueryClient();
    const { activeFlow, workoutStartTime, endFlow } = useYogaStore();

    const [isSaving, setIsSaving] = useState(false);

    // Xử lý state cho an toàn
    const totalDurationSecs = workoutStartTime ? Math.floor((Date.now() - workoutStartTime) / 1000) : 0;
    // Yoga nhẹ nhàng nên calo tiêu hao ~3.5 kcal mỗi phút
    const caloriesBurned = Math.round((totalDurationSecs / 60) * 3.5);

    const m = Math.floor(totalDurationSecs / 60).toString().padStart(2, '0');
    const s = (totalDurationSecs % 60).toString().padStart(2, '0');

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Lưu dữ liệu vào Backend
            // Yoga chỉ cần truyền Type: YOGA và Mode: INDOOR, truyền calories_burned thông qua finish()
            const act = await activityService.start({ type: "YOGA", mode: "INDOOR" });
            if (act && act.id) {
                await activityService.finish(act.id, {
                    active_calories: caloriesBurned,
                    exercise_minutes: Math.max(1, Math.round(totalDurationSecs / 60))
                });
                queryClient.invalidateQueries({ queryKey: ['daily-health'] });
            }
            endFlow();
            router.replace("/(tabs)/activity");
        } catch (error) {
            console.error("Failed to save yoga session", error);
            alert("Errors saving activity. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDiscard = () => {
        endFlow();
        router.replace("/(tabs)/activity");
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* HER0 BACKGROUND */}
            <LinearGradient
                colors={['#0284c7', '#38bdf8']}
                style={styles.heroBackground}
            >
                <View style={styles.iconContainer}>
                    <View style={styles.iconGlow} />
                    <MaterialCommunityIcons name="flower-tulip" size={80} color="#fef08a" />
                </View>
                <Text style={styles.title}>Namaste</Text>
                <Text style={styles.subtitle}>You completed {activeFlow?.title || 'your flow'}</Text>
            </LinearGradient>

            {/* MAIN STATS CARD */}
            <View style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
                <Text style={styles.cardTitle}>Mindfulness Stats</Text>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <View style={[styles.iconBox, { backgroundColor: '#e0f2fe' }]}>
                            <Ionicons name="time" size={24} color="#0284c7" />
                        </View>
                        <Text style={[styles.statValue, { color: isDark ? '#f8fafc' : '#0f172a' }]}>{m}:{s}</Text>
                        <Text style={styles.statLabel}>Duration</Text>
                    </View>

                    <View style={styles.statItem}>
                        <View style={[styles.iconBox, { backgroundColor: '#fef08a' }]}>
                            <Ionicons name="flame" size={24} color="#ca8a04" />
                        </View>
                        <Text style={[styles.statValue, { color: isDark ? '#f8fafc' : '#0f172a' }]}>{caloriesBurned}</Text>
                        <Text style={styles.statLabel}>Kcal Burned</Text>
                    </View>

                    <View style={styles.statItem}>
                        <View style={[styles.iconBox, { backgroundColor: '#dcfce3' }]}>
                            <MaterialCommunityIcons name="yoga" size={24} color="#16a34a" />
                        </View>
                        <Text style={[styles.statValue, { color: isDark ? '#f8fafc' : '#0f172a' }]}>{activeFlow?.poses.length || 0}</Text>
                        <Text style={styles.statLabel}>Poses</Text>
                    </View>
                </View>
            </View>

            {/* ACTION BUTTONS */}
            <View style={styles.actionContainer}>
                <TouchableOpacity 
                    style={[styles.saveBtn, isSaving && { opacity: 0.7 }]} 
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Mindful Minutes</Text>}
                </TouchableOpacity>

                <TouchableOpacity style={styles.discardBtn} onPress={handleDiscard}>
                    <Text style={styles.discardBtnText}>Discard</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    heroBackground: {
        width: '100%',
        height: 320,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    iconContainer: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        marginTop: 40,
    },
    iconGlow: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#fef08a',
        opacity: 0.2,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 6,
        fontWeight: '500',
    },
    card: {
        marginHorizontal: 20,
        marginTop: -40,
        borderRadius: 20,
        padding: 24,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
    },
    cardTitle: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '900',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
    actionContainer: {
        paddingHorizontal: 20,
        marginTop: 40,
    },
    saveBtn: {
        backgroundColor: '#0284c7', // sky-600
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#0ea5e9',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        marginBottom: 16,
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    discardBtn: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    discardBtnText: {
        color: '#ef4444',
        fontSize: 14,
        fontWeight: '700',
    }
});
