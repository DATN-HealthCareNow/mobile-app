import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, cancelAnimation, Easing } from 'react-native-reanimated';
import { useYogaStore } from '../../store/yogaStore';



const { height } = Dimensions.get('window');

export default function YogaActiveScreen() {
    const router = useRouter();
    const { activeFlow, currentPoseIndex, isPaused, setPaused, nextPose, prevPose } = useYogaStore();

    const pose = activeFlow ? activeFlow.poses[currentPoseIndex] : { durationSec: 0, description: '', id: 'dump', hasBreathingSync: false, voiceLines: [], name: '', sanskritName: '', warnings: [] as string[] };
    const [timeLeft, setTimeLeft] = useState(pose.durationSec);
    const [currentSubtitle, setCurrentSubtitle] = useState("");

    // Breathing Animation
    const breatheScale = useSharedValue(1);
    const breatheOpacity = useSharedValue(0.2);

    useEffect(() => {
        setTimeLeft(pose.durationSec);
        setCurrentSubtitle(pose.description);

        if (pose.hasBreathingSync && !isPaused) {
            breatheScale.value = withRepeat(withTiming(1.8, { duration: 4000, easing: Easing.inOut(Easing.ease) }), -1, true);
            breatheOpacity.value = withRepeat(withTiming(0.4, { duration: 4000, easing: Easing.inOut(Easing.ease) }), -1, true);
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
            if (activeFlow && currentPoseIndex < activeFlow.poses.length - 1) {
                handleNext();
            } else {
                handleFinish();
            }
        }
        return () => clearInterval(timerId);
    }, [isPaused, timeLeft, currentPoseIndex, activeFlow]);

    // Speech Sequence
    useEffect(() => {
        const speakSequence = async () => {
            Speech.stop(); // Dừng câu cũ
            if (isPaused) return;
            
            for (let i = 0; i < pose.voiceLines.length; i++) {
                if (isPaused) break;
                const line = pose.voiceLines[i];
                setCurrentSubtitle(`"${line}"`);
                Speech.speak(line, {
                    language: 'en-US',
                    pitch: 1.1,
                    rate: 0.85,
                });
                // Fake delay cho đến hết câu (mỗi câu dài tầm 3-4s)
                await new Promise(resolve => setTimeout(resolve, 4000));
            }
        };

        speakSequence();

        return () => {
            Speech.stop();
        };
    }, [pose.id, isPaused]);

    const handleNext = () => {
        if (!activeFlow) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Speech.stop();
        if (currentPoseIndex < activeFlow.poses.length - 1) {
            Speech.speak("Prepare for the next pose", { rate: 0.9, pitch: 1 });
            nextPose();
        } else {
            handleFinish();
        }
    };

    const handlePrev = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Speech.stop();
        prevPose();
    };

    const handleFinish = () => {
        Speech.stop();
        Speech.speak("Namaste. Your practice is complete.", { rate: 0.8 });
        router.replace("/screen/yoga_summary" as any);
    };

    const animatedBreatheStyle = useAnimatedStyle(() => ({
        transform: [{ scale: breatheScale.value }],
        opacity: breatheOpacity.value,
    }));

    if (!activeFlow) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>No active flow found. Please restart session.</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.errorBtn}>
                    <Text style={styles.errorBtnText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Format Time
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');

    return (
        <LinearGradient
            colors={['#e0f2fe', '#f8fafc']}
            style={styles.container}
        >
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                    <Ionicons name="arrow-back" size={24} color="#0369a1" />
                </TouchableOpacity>
                <View style={styles.headerTitles}>
                    <Text style={styles.flowTitle}>{activeFlow.title.toUpperCase()}</Text>
                    <Text style={styles.flowSubtitle}>DAILY FLOW</Text>
                </View>
                <TouchableOpacity style={styles.iconBtn}>
                    <Ionicons name="ellipsis-horizontal" size={24} color="#0369a1" />
                </TouchableOpacity>
            </View>

            {/* PROGRESS BAR */}
            <View style={styles.progressContainer}>
                <View style={styles.progressTextRow}>
                    <View>
                        <Text style={styles.progressLabel}>CURRENT POSE</Text>
                        <Text style={styles.progressValue}>{currentPoseIndex + 1} / <Text style={{ color: '#94a3b8' }}>{activeFlow.poses.length}</Text></Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.progressLabel}>TIME LEFT</Text>
                        <Text style={styles.progressValue}>{m}:{s}</Text>
                    </View>
                </View>
                {/* Visual Progress Line */}
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${((currentPoseIndex + 1) / activeFlow.poses.length) * 100}%` }]} />
                </View>
            </View>

            {/* MAIN VISUAL CARD */}
            <View style={styles.visualWrapper}>
                {pose.hasBreathingSync && (
                    <Animated.View style={[styles.breathingCircle, animatedBreatheStyle]} />
                )}
                
                <View style={[styles.imageCard, styles.shadow]}>
                    <LinearGradient
                        colors={['#38bdf8', '#0284c7']}
                        style={styles.cardGradient}
                    >
                        <MaterialCommunityIcons name="yoga" size={120} color="rgba(255,255,255,0.8)" />
                        
                        {/* WARNING CHIP */}
                        {pose.warnings && pose.warnings.length > 0 && (
                            <View style={styles.warningChip}>
                                <Ionicons name="warning" size={12} color="#f59e0b" />
                                <Text style={styles.warningText}>{pose.warnings[0]}</Text>
                            </View>
                        )}
                    </LinearGradient>

                    {/* SUBTITLE BOX (Glassmorphism effect) */}
                    <View style={styles.subtitleBox}>
                        <View style={styles.subtitleIconBadge}>
                            <Ionicons name="information" size={16} color="#0ea5e9" />
                        </View>
                        <Text style={styles.subtitleText}>{currentSubtitle}</Text>
                    </View>
                </View>
            </View>

            {/* POSE INFO */}
            <View style={styles.poseInfoContainer}>
                <Text style={styles.poseName}>{pose.name}</Text>
                <Text style={styles.poseSanskrit}>{pose.sanskritName}</Text>
            </View>

            {/* CONTROLS */}
            <View style={styles.controlsContainer}>
                <View style={styles.largeTimer}>
                    <Text style={styles.largeTimerText}>{m}</Text>
                    <Text style={[styles.largeTimerText, { opacity: 0.3, marginHorizontal: -5 }]}> : </Text>
                    <Text style={styles.largeTimerText}>{s}</Text>
                </View>

                <View style={styles.playbackRow}>
                    <TouchableOpacity style={styles.sideBtn} onPress={() => {}}>
                        <Ionicons name="water" size={24} color="#7dd3fc" />
                        <Text style={styles.sideBtnText}>OCEAN</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.skipBtn} onPress={handlePrev} disabled={currentPoseIndex === 0}>
                        <Ionicons name="play-skip-back" size={24} color={currentPoseIndex === 0 ? '#cbd5e1' : '#bae6fd'} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.playPauseBtn, styles.shadow]} 
                        onPress={() => {
                            setPaused(!isPaused);
                            Haptics.selectionAsync();
                        }}
                    >
                        <Ionicons name={isPaused ? "play" : "pause"} size={32} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.skipBtn} onPress={handleNext}>
                        <Ionicons name="play-skip-forward" size={24} color="#bae6fd" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.sideBtn} onPress={() => {}}>
                        <Ionicons name="options-outline" size={24} color="#7dd3fc" />
                        <Text style={styles.sideBtnText}>SETTINGS</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    errorText: { fontSize: 16, color: '#ef4444', marginBottom: 20 },
    errorBtn: { padding: 10, backgroundColor: '#e2e8f0', borderRadius: 10 },
    errorBtnText: { color: '#0f172a', fontWeight: 'bold' },

    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitles: {
        alignItems: 'center',
    },
    flowTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: '#0369a1',
        letterSpacing: 1,
    },
    flowSubtitle: {
        fontSize: 10,
        fontWeight: '700',
        color: '#7dd3fc',
        letterSpacing: 2,
        marginTop: 2,
    },
    progressContainer: {
        paddingHorizontal: 30,
        marginBottom: 30,
    },
    progressTextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 10,
    },
    progressLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#7dd3fc',
        letterSpacing: 1,
        marginBottom: 4,
    },
    progressValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0369a1',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#e0f2fe',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#0284c7',
        borderRadius: 3,
    },
    visualWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        height: height * 0.45,
    },
    breathingCircle: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: '#7dd3fc', // Breathing aura
        zIndex: 0,
    },
    imageCard: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
        backgroundColor: '#fff',
        zIndex: 1,
        overflow: 'visible', // To allow subtitle box to overlap
        position: 'relative',
    },
    cardGradient: {
        flex: 1,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    warningChip: {
        position: 'absolute',
        top: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 251, 235, 0.9)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    warningText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#b45309',
        marginLeft: 4,
    },
    subtitleBox: {
        position: 'absolute',
        bottom: -25,
        alignSelf: 'center',
        width: '85%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    subtitleIconBadge: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#e0f2fe',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    subtitleText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#0369a1',
        lineHeight: 20,
    },
    poseInfoContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    poseName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0284c7',
        letterSpacing: -0.5,
    },
    poseSanskrit: {
        fontSize: 16,
        color: '#38bdf8',
        marginTop: 4,
        fontWeight: '500',
    },
    controlsContainer: {
        marginTop: 'auto',
        paddingBottom: 40,
        alignItems: 'center',
    },
    largeTimer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    largeTimerText: {
        fontSize: 48,
        fontWeight: '300',
        color: '#0284c7',
    },
    playbackRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        width: '100%',
        paddingHorizontal: 10,
    },
    playPauseBtn: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#0ea5e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
    },
    skipBtn: {
        padding: 15,
    },
    sideBtn: {
        alignItems: 'center',
        width: 60,
    },
    sideBtnText: {
        fontSize: 8,
        fontWeight: '800',
        color: '#38bdf8',
        marginTop: 6,
        letterSpacing: 1,
    },
    shadow: {
        shadowColor: '#0c4a6e',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.2,
        shadowRadius: 30,
        elevation: 15,
    }
});
