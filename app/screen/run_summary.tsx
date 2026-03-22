import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { activityService } from '../../api/services/activityService';
import { useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

export default function RunSummaryScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { colors, isDark } = useTheme();
    const queryClient = useQueryClient();

    const activityId = (params.activityId as string) || null;
    const distance = parseFloat((params.distance as string) || "0");
    const pace = (params.pace as string) || "0:00";
    const timeSecs = parseInt((params.time as string) || "0", 10);
    const calories = parseInt((params.calories as string) || "0", 10);
    const mapImageUri = (params.mapImageUri as string) || null;

    const [isSaving, setIsSaving] = useState(false);

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
            if (activityId) {
                await activityService.finish(activityId, {
                    distance_meter: distance * 1000,
                    calories_burned: calories,
                });
                queryClient.invalidateQueries({ queryKey: ['activities'] });
            } else {
                // Đề phòng API start lúc đầu failed nên ID null, ta đâm bù
                const act = await activityService.start({ type: "RUN", mode: "OUTDOOR" });
                if (act && act.id) {
                    await activityService.finish(act.id, {
                        distance_meter: distance * 1000,
                        calories_burned: calories,
                    });
                    queryClient.invalidateQueries({ queryKey: ['activities'] });
                }
            }
            router.replace("/(tabs)/activity"); // Quay về màn chính
        } catch (error: any) {
            console.error(error?.response?.data || error.message);
            alert("Errors during saving! Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleShareRoute = async () => {
        if (!mapImageUri) return;
        try {
            // Xin quyền Gallery
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                alert("Permission needed to save your route image.");
                return;
            }
            
            // Lưu vào thư viện
            await MediaLibrary.saveToLibraryAsync(mapImageUri);

            // Gợi ý Share nếu Share Module khả dụng
            const isShareAvailable = await Sharing.isAvailableAsync();
            if (isShareAvailable) {
                await Sharing.shareAsync(mapImageUri, { dialogTitle: "Check out my run on HealthCareNow!" });
            } else {
                alert("Awesome! Route Map has been saved to your Photos/Gallery.");
            }
        } catch (error) {
            console.error("Save/Share Failed", error);
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* HER0 BACKGROUND CÓ THỂ LÀ BẢN ĐỒ HOẶC CÚP VÀNG */}
            {mapImageUri ? (
                <View style={[styles.heroBackground, { overflow: 'hidden', backgroundColor: '#000', paddingBottom: 0, paddingTop: 0 }]}>
                    <Image source={{ uri: mapImageUri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                    
                    {/* Dark gradient overlay cho chữ nổi bật */}
                    <LinearGradient
                        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']}
                        style={[StyleSheet.absoluteFillObject, { top: '50%' }]}
                    />

                    <View style={{ position: 'absolute', bottom: 40, alignItems: 'center', width: '100%' }}>
                        <Text style={styles.title}>Run Completed!</Text>
                        <Text style={styles.subtitle}>Awesome job. Here is your route.</Text>
                    </View>
                </View>
            ) : (
                <LinearGradient
                    colors={isDark ? ['#0284c7', '#0369a1'] : ['#38bdf8', '#0284c7']}
                    style={styles.heroBackground}
                >
                    <View style={styles.trophyContainer}>
                        <View style={styles.trophyGlow} />
                        <Ionicons name="trophy" size={80} color="#fde047" />
                    </View>
                    <Text style={styles.title}>Run Completed!</Text>
                    <Text style={styles.subtitle}>Awesome job. You&apos;re getting stronger everyday.</Text>
                </LinearGradient>
            )}

            {/* MAIN STATS CARD */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {/* Distance Big */}
                <View style={styles.primaryStatBox}>
                    <Text style={styles.primaryLabel}>TOTAL DISTANCE</Text>
                    <View style={styles.primaryRow}>
                        <Text style={[styles.primaryValue, { color: isDark ? colors.text : '#0369a1' }]}>{distance.toFixed(2)}</Text>
                        <Text style={styles.primaryUnit}> KM</Text>
                    </View>
                </View>

                {/* 3 Secondary Stats */}
                <View style={styles.grid}>
                    <View style={styles.gridItem}>
                        <Ionicons name="time-outline" size={24} color="#64748b" style={{marginBottom: 8}} />
                        <Text style={styles.gridLabel}>DURATION</Text>
                        <Text style={[styles.gridValue, { color: colors.text }]}>{formatTime(timeSecs)}</Text>
                    </View>
                    <View style={[styles.gridItem, styles.gridBorder, { borderColor: colors.border }]}>
                        <MaterialCommunityIcons name="speedometer" size={24} color="#64748b" style={{marginBottom: 8}} />
                        <Text style={styles.gridLabel}>AVG PACE</Text>
                        <Text style={[styles.gridValue, { color: colors.text }]}>{pace}</Text>
                    </View>
                    <View style={styles.gridItem}>
                        <Ionicons name="flame-outline" size={24} color="#f97316" style={{marginBottom: 8}} />
                        <Text style={styles.gridLabel}>CALORIES</Text>
                        <Text style={[styles.gridValue, { color: colors.text }]}>{calories}</Text>
                    </View>
                </View>
            </View>

            {/* ACTION BUTTONS */}
            <View style={styles.actionContainer}>
                {mapImageUri && (
                    <TouchableOpacity style={styles.shareBtn} onPress={handleShareRoute}>
                        <Ionicons name="share-social-outline" size={20} color="#0284c7" />
                        <Text style={styles.shareBtnText}>Share / Save Route Map</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity 
                    style={[styles.saveBtn, isSaving && { opacity: 0.7 }]} 
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveBtnText}>Save Activity</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.discardBtn} onPress={() => router.replace("/(tabs)/activity")}>
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
        height: 280,
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
    trophyContainer: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    trophyGlow: {
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
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 6,
        fontWeight: '500',
    },
    card: {
        marginHorizontal: 20,
        marginTop: -30,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
    },
    primaryStatBox: {
        alignItems: 'center',
        marginBottom: 30,
    },
    primaryLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#94a3b8', // slate-400
        letterSpacing: 2,
    },
    primaryRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 4,
    },
    primaryValue: {
        fontSize: 56,
        fontWeight: 'bold',
    },
    primaryUnit: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#64748b',
    },
    grid: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 24,
    },
    gridItem: {
        flex: 1,
        alignItems: 'center',
    },
    gridBorder: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
    },
    gridLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#94a3b8',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    gridValue: {
        fontSize: 20,
        fontWeight: '800',
    },
    actionContainer: {
        paddingHorizontal: 20,
        marginTop: 40,
    },
    shareBtn: {
        flexDirection: 'row',
        backgroundColor: '#e0f2fe', // sky-100
        paddingVertical: 14,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    shareBtnText: {
        color: '#0284c7', // sky-600
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    saveBtn: {
        backgroundColor: '#0284c7', // sky-600
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#0284c7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 16,
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    discardBtn: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    discardBtnText: {
        color: '#ef4444', // red-500
        fontSize: 14,
        fontWeight: 'bold',
    }
});
