import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useStretchStore, STRETCH_WORKOUTS } from '../../store/stretchStore';

const { width } = Dimensions.get('window');

export default function StretchSelectionScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { startWorkout } = useStretchStore();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredWorkouts = STRETCH_WORKOUTS.filter(workout => 
        workout.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleStartWorkout = (id: string) => {
        startWorkout(id);
        router.push("/screen/stretch_active" as any);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Stretch Library</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.searchContainer, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                    <Ionicons name="search" size={20} color="#64748b" />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search stretches..."
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Stretch Routines
                </Text>
                <View style={styles.exerciseList}>
                    {filteredWorkouts.map((workout) => (
                        <View 
                            key={workout.id} 
                            style={[
                                styles.exerciseCard, 
                                { backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: colors.border },
                                styles.shadow
                            ]}
                        >
                            <View style={styles.exerciseInfo}>
                                <View style={styles.exerciseImagePlaceholder}>
                                    <MaterialCommunityIcons name="human-handsup" size={24} color="#0ea5e9" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.exerciseNameText, { color: colors.text }]}>{workout.title}</Text>
                                    <Text style={styles.exerciseMeta}>{workout.totalDurationMin} min • {workout.poses.length} poses</Text>
                                </View>
                            </View>
                            <TouchableOpacity 
                                style={styles.startBtn}
                                onPress={() => handleStartWorkout(workout.id)}
                            >
                                <Text style={styles.startBtnText}>START</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 15, marginBottom: 25 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  muscleScroll: { marginBottom: 25 },
  muscleCard: { width: width * 0.25, height: 100, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15, paddingHorizontal: 4 },
  muscleName: { marginTop: 8, fontSize: 12, fontWeight: '600' },
  exerciseList: { paddingBottom: 30 },
  exerciseCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderRadius: 20, marginBottom: 15, borderWidth: 1 },
  exerciseInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  exerciseImagePlaceholder: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#e0f2fe', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  exerciseNameText: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  exerciseMeta: { fontSize: 12, color: '#64748b' },
  startBtn: { backgroundColor: '#0ea5e9', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
  startBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  shadow: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 }
});
