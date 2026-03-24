import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, cancelAnimation, Easing } from 'react-native-reanimated';
import { useStretchStore } from '../../store/stretchStore';
import { activityService } from '../../api/services/activityService';
import { useQueryClient } from '@tanstack/react-query';

const { width, height } = Dimensions.get('window');

export default function StretchActiveScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { activeWorkout, currentPoseIndex, isPaused, setPaused, nextPose, endWorkout, workoutStartTime } = useStretchStore();

    const pose = activeWorkout ? activeWorkout.poses[currentPoseIndex] : { durationSec: 0, id: 'dump', voiceStart: '', voiceHold: '', voiceEnd: '', name: '', warning: '' };
    const [timeLeft, setTimeLeft] = useState(pose.durationSec);
    const [isSaving, setIsSaving] = useState(false);

    // Breathing Animation
    const breatheScale = useSharedValue(1);
    const breatheOpacity = useSharedValue(0.2);

    useEffect(() => {
        setTimeLeft(pose.durationSec);

        // Breathing effect for generic warm-ups
        if (pose.hasBreathingSync && !isPaused) {
            breatheScale.value = withRepeat(withTiming(1.6, { duration: 3000, easing: Easing.inOut(Easing.ease) }), -1, true);
            breatheOpacity.value = withRepeat(withTiming(0.5, { duration: 3000, easing: Easing.inOut(Easing.ease) }), -1, true);
        } else {
            cancelAnimation(breatheScale);
            cancelAnimation(breatheOpacity);
            breatheScale.value = withTiming(1, { duration: 1000 });
            breatheOpacity.value = withTiming(0, { duration: 1000 });
        }
    }, [pose.id, pose.hasBreathingSync, isPaused]);

    // Timer Logic
    useEffect(() => {
        let timerId: ReturnType<typeof setInterval>;
        if (!isPaused && timeLeft > 0) {
            timerId = setInterval(() => setTimeLeft(l => l - 1), 1000);
        } else if (timeLeft <= 0) {
            if (activeWorkout && currentPoseIndex < activeWorkout.poses.length - 1) {
                handleNext();
            } else {
                handleFinish();
            }
        }
        return () => clearInterval(timerId);
    }, [isPaused, timeLeft, currentPoseIndex, activeWorkout]);

    // Precise Voice Sequencing
    useEffect(() => {
        if (isPaused) return;

        // Speak when pose starts
        if (timeLeft === pose.durationSec) {
            Speech.stop();
            Speech.speak(pose.voiceStart, { language: 'vi-VN', rate: 0.9 });
        }
        
        // Speak hold instructions a few seconds after starting
        if (timeLeft === pose.durationSec - 5) {
            Speech.speak(pose.voiceHold, { language: 'vi-VN', rate: 0.9 });
        }

        // Speak end instructions in the last 4 seconds
        if (timeLeft === 4) {
            Speech.speak(pose.voiceEnd, { language: 'vi-VN', rate: 0.9 });
        }

    }, [timeLeft, isPaused, pose]);

    const handleNext = () => {
        if (!activeWorkout) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        Speech.stop();
        if (currentPoseIndex < activeWorkout.poses.length - 1) {
            Speech.speak("Chuẩn bị bài tiếp theo.", { language: 'vi-VN', rate: 0.95 });
            nextPose();
        } else {
            handleFinish();
        }
    };

    const handleFinish = async () => {
        Speech.stop();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Speech.speak("Chúc mừng! Bạn đã hoàn thành.", { language: 'vi-VN', rate: 0.9 });
        
        setIsSaving(true);
        try {
            // Calculate pseudo calories
            const durationSecs = workoutStartTime ? Math.floor((Date.now() - workoutStartTime) / 1000) : 0;
            const kcal = Math.round((durationSecs / 60) * 4); // Stretch ~ 4 kcal/min
            
            const act = await activityService.start({ type: "YOGA", mode: "INDOOR" }); // Stretch uses Yoga
            if (act && act.id) {
                await activityService.finish(act.id, {
                    calories_burned: kcal,
                });
                queryClient.invalidateQueries({ queryKey: ['activities'] });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
            endWorkout();
            router.replace("/(tabs)/activity");
        }
    };

    const animatedBreatheStyle = useAnimatedStyle(() => ({
        transform: [{ scale: breatheScale.value }],
        opacity: breatheOpacity.value,
    }));

    if (!activeWorkout) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>No active flow found. Please restart session.</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.errorBtn}>
                    <Text style={styles.errorBtnText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const s = (timeLeft % 60).toString().padStart(2, '0');

    return (
        <LinearGradient colors={['#ede9fe', '#f5f3ff']} style={styles.container}>
            {/* PROGRESS HEADER */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{activeWorkout.title}</Text>
                <View style={styles.progressPill}>
                    <Text style={styles.progressText}>Bài {currentPoseIndex + 1}/{activeWorkout.poses.length}</Text>
                </View>
            </View>

            {/* MAIN ANIMATION AND TIMER */}
            <View style={styles.visualContainer}>
                {pose.hasBreathingSync && (
                    <Animated.View style={[styles.breathingCircle, animatedBreatheStyle]} />
                )}
                <View style={[styles.avatarCard, styles.shadow]}>
                    {/* Placeholder for real illustration */}
                    <MaterialCommunityIcons name="human-handsup" size={140} color="#7c3aed" />

                    {/* TIMER OVERLAY */}
                    <View style={styles.timerBox}>
                        <Text style={styles.timerValue}>{s}</Text>
                        <Text style={styles.timerLabel}>giây</Text>
                    </View>
                </View>

                {/* WARNING TOOLTIP */}
                {pose.warning && (
                    <View style={styles.warningContainer}>
                        <Ionicons name="warning" size={16} color="#fbbf24" />
                        <Text style={styles.warningText}>{pose.warning}</Text>
                    </View>
                )}
            </View>

            {/* POSE NAME */}
            <View style={styles.poseInfo}>
                <Text style={styles.poseName}>{pose.name}</Text>
                <View style={{ height: 60, marginTop: 10 }}>
                    {/* Fake subtitle based on timing */}
                    <Text style={styles.voiceSubtitle}>
                        {timeLeft > pose.durationSec - 5 ? pose.voiceStart : 
                         timeLeft > 10 ? pose.voiceHold : pose.voiceEnd}
                    </Text>
                </View>
            </View>

            {/* PLAYBACK CONTROLS */}
            <View style={styles.playbackContainer}>
                <TouchableOpacity 
                    style={[styles.playBtn, styles.shadowPlay]} 
                    onPress={() => {
                        setPaused(!isPaused);
                        Haptics.selectionAsync();
                        Speech.stop();
                    }}
                >
                    <Ionicons name={isPaused ? "play" : "pause"} size={36} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.skipBtn} onPress={handleNext}>
                    <Text style={styles.skipText}>Bỏ qua (Skip)</Text>
                    <Ionicons name="play-forward" size={18} color="#8b5cf6" />
                </TouchableOpacity>
            </View>

            {/* SAVING OVERLAY */}
            {isSaving && (
                <View style={styles.savingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={{ color: '#fff', marginTop: 10, fontWeight: 'bold' }}>Đang lưu buổi tập...</Text>
                </View>
            )}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: 16, color: '#ef4444', marginBottom: 20 },
    errorBtn: { padding: 10, backgroundColor: '#e2e8f0', borderRadius: 10 },
    errorBtnText: { color: '#0f172a', fontWeight: 'bold' },

    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20,
    },
    headerTitle: { fontSize: 20, fontWeight: '900', color: '#4c1d95', flex: 1 },
    progressPill: {
        backgroundColor: '#ddd6fe', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    },
    progressText: { color: '#6d28d9', fontWeight: 'bold', fontSize: 12 },

    visualContainer: {
        alignItems: 'center', justifyContent: 'center', height: height * 0.45,
    },
    breathingCircle: {
        position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: '#c4b5fd', zIndex: 0,
    },
    avatarCard: {
        width: 250, height: 250, borderRadius: 40, backgroundColor: '#fff', 
        justifyContent: 'center', alignItems: 'center', zIndex: 1, position: 'relative',
    },
    timerBox: {
        position: 'absolute', bottom: -20, backgroundColor: '#8b5cf6', width: 90, height: 90, borderRadius: 45,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 10,
    },
    timerValue: { fontSize: 32, fontWeight: '900', color: '#fff' },
    timerLabel: { fontSize: 10, color: '#f5f3ff', fontWeight: 'bold', marginTop: -5 },
    
    warningContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fffbeb', paddingHorizontal: 15, paddingVertical: 8,
        borderRadius: 20, marginTop: 40, zIndex: 2, borderWidth: 1, borderColor: '#fde68a',
    },
    warningText: { color: '#d97706', fontSize: 12, fontWeight: '600', marginLeft: 8 },

    poseInfo: { alignItems: 'center', paddingHorizontal: 30, marginTop: 20 },
    poseName: { fontSize: 26, fontWeight: '900', color: '#4c1d95', textAlign: 'center' },
    voiceSubtitle: { fontSize: 16, color: '#6d28d9', fontStyle: 'italic', textAlign: 'center', lineHeight: 24, marginTop: 10 },

    playbackContainer: { marginTop: 'auto', paddingBottom: 50, alignItems: 'center' },
    playBtn: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#7c3aed', 
        justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    },
    skipBtn: { flexDirection: 'row', alignItems: 'center' },
    skipText: { color: '#8b5cf6', fontWeight: 'bold', marginRight: 8 },

    savingOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 100,
    },
    shadow: {
        shadowColor: '#4c1d95', shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.1, shadowRadius: 30, elevation: 15,
    },
    shadowPlay: {
        shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10,
    }
});
