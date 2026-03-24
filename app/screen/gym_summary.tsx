import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useGymStore } from '../../store/gymStore';
import { activityService } from '../../api/services/activityService';
import { useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function GymSummaryScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const queryClient = useQueryClient();
    const { exercises, startTime, resetWorkout } = useGymStore();

    const [isSaving, setIsSaving] = useState(false);

    // Calculate Stats
    const stats = useMemo(() => {
        let totalSets = 0;
        let totalReps = 0;
        let totalExercises = exercises.length;
        let durationSecs = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
        
        exercises.forEach(ex => {
            totalSets += ex.sets.length;
            ex.sets.forEach(s => totalReps += s.reps);
        });

        // Estimate Calories: ~5kcal per minute of weightlifting
        const calories = Math.round((durationSecs / 60) * 5.5);

        return { totalSets, totalReps, totalExercises, durationSecs, calories };
    }, [exercises, startTime]);

    const formatTime = (secs: number) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Flatten logs for ActivityFinishRequest
            const flattenedLogs = exercises.flatMap(ex => 
                ex.sets.map(s => ({
                    exercise: ex.name,
                    reps: s.reps,
                    weight: s.weight
                }))
            );

            const act = await activityService.start({ type: "GYM", mode: "INDOOR" });
            if (act && act.id) {
                await activityService.finish(act.id, {
                    calories_burned: stats.calories,
                    workoutLogs: flattenedLogs
                });
                queryClient.invalidateQueries({ queryKey: ['activities'] });
            }
            resetWorkout();
            router.replace("/(tabs)/activity");
        } catch (error) {
            console.error(error);
            alert("Failed to save workout. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDiscard = () => {
        resetWorkout();
        router.replace("/(tabs)/activity");
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* HERO */}
            <LinearGradient
                colors={isDark ? ['#0284c7', '#0369a1'] : ['#38bdf8', '#0284c7']}
                style={styles.heroBackground}
            >
                <View style={styles.iconContainer}>
                    <View style={styles.iconGlow} />
                    <MaterialCommunityIcons name="medal" size={80} color="#fde047" />
                </View>
                <Text style={styles.title}>Workout Completed!</Text>
                <Text style={styles.subtitle}>Amazing effort today!</Text>

                <View style={styles.timeBadge}>
                    <Text style={styles.timeLabel}>TOTAL WORKOUT TIME</Text>
                    <Text style={styles.timeValue}>{formatTime(stats.durationSecs)}</Text>
                </View>
            </LinearGradient>

            {/* QUICK STATS GRID */}
            <View style={styles.statsGrid}>
                <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <MaterialCommunityIcons name="dumbbell" size={24} color="#0ea5e9" />
                    <Text style={styles.statValue}>{stats.totalExercises}</Text>
                    <Text style={styles.statLabel}>Exercises</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="layers-outline" size={24} color="#0ea5e9" />
                    <Text style={styles.statValue}>{stats.totalSets}</Text>
                    <Text style={styles.statLabel}>Total Sets</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="repeat" size={24} color="#0ea5e9" />
                    <Text style={styles.statValue}>{stats.totalReps}</Text>
                    <Text style={styles.statLabel}>Total Reps</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="flame-outline" size={24} color="#f97316" />
                    <Text style={styles.statValue}>{stats.calories}</Text>
                    <Text style={styles.statLabel}>Kcal Burned</Text>
                </View>
            </View>

            {/* EXERCISE BREAKDOWN */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Exercise Breakdown</Text>
            <View style={styles.breakdownList}>
                {exercises.map((item, index) => (
                    <View key={index} style={[styles.exerciseItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.exerciseImagePlaceholder}>
                            <MaterialCommunityIcons name="dumbbell" size={24} color="#0ea5e9" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.exerciseName, { color: colors.text }]}>{item.name}</Text>
                            <Text style={styles.exerciseSummary}>
                                {item.sets.length} Sets • {item.sets.reduce((s, c) => s + c.reps, 0)} Reps Total
                            </Text>
                        </View>
                        <View style={styles.maxWeightBadge}>
                            <Text style={styles.maxWeightText}>
                                {Math.max(...item.sets.map(s => s.weight))} kg Max
                            </Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* ACTIONS */}
            <View style={styles.actionContainer}>
                <TouchableOpacity 
                    style={[styles.saveBtn, isSaving && { opacity: 0.7 }]} 
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveBtnText}>Back to Dashboard</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.discardBtn} onPress={handleDiscard}>
                    <Text style={styles.discardBtnText}>Discard Activity</Text>
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
        paddingTop: 80,
        paddingBottom: 40,
        alignItems: 'center',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        elevation: 5,
    },
    iconContainer: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    iconGlow: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fef08a',
        opacity: 0.3,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: '#fff',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
        fontWeight: '600',
    },
    timeBadge: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 24,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    timeLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94a3b8',
        letterSpacing: 1,
    },
    timeValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#0369a1',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 15,
        marginTop: 30,
    },
    statBox: {
        width: (width - 60) / 2,
        margin: 7.5,
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 22,
        marginTop: 30,
        marginBottom: 15,
    },
    breakdownList: {
        paddingHorizontal: 20,
    },
    exerciseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
    },
    exerciseImagePlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    exerciseSummary: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 2,
    },
    maxWeightBadge: {
        backgroundColor: '#e0f2fe',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    maxWeightText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#0369a1',
    },
    actionContainer: {
        paddingHorizontal: 20,
        marginTop: 30,
    },
    saveBtn: {
        backgroundColor: '#0ea5e9',
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#0ea5e9',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
        marginBottom: 16,
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
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
