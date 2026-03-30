import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useYogaStore, YOGA_FLOWS } from '../../store/yogaStore';

const { width } = Dimensions.get('window');

const levels = [
  { id: 'Beginner', name: 'Beginner', icon: 'leaf-outline' },
  { id: 'Intermediate', name: 'Intermediate', icon: 'flame-outline' },
  { id: 'Advanced', name: 'Advanced', icon: 'flash-outline' },
  { id: 'All', name: 'All Levels', icon: 'infinite-outline' }
];

export default function YogaSelectionScreen() {
    const router = useRouter();
    const { colors, isDark } = useTheme();
    const { startFlow } = useYogaStore();
    const [selectedLevel, setSelectedLevel] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFlows = YOGA_FLOWS.filter(flow => 
        (selectedLevel === 'All' || flow.level === selectedLevel) &&
        flow.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleStartWorkout = (id: string) => {
        startFlow(id);
        router.push("/screen/yoga_active" as any);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Yoga Library</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.searchContainer, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                    <Ionicons name="search" size={20} color="#64748b" />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search flows..."
                        placeholderTextColor="#94a3b8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>Levels</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.muscleScroll}>
                    {levels.map((lvl) => (
                        <TouchableOpacity
                            key={lvl.id}
                            style={[
                                styles.muscleCard,
                                { backgroundColor: selectedLevel === lvl.id ? '#0ea5e9' : (isDark ? '#1e293b' : '#fff') },
                                selectedLevel !== lvl.id && styles.shadow
                            ]}
                            onPress={() => setSelectedLevel(lvl.id)}
                        >
                            <Ionicons 
                                name={lvl.icon as any} 
                                size={24} 
                                color={selectedLevel === lvl.id ? '#fff' : '#0ea5e9'} 
                            />
                            <Text style={[
                                styles.muscleName, 
                                { color: selectedLevel === lvl.id ? '#fff' : (isDark ? '#cbd5e1' : '#334155') }
                            ]}>
                                {lvl.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Yoga Flows
                </Text>
                <View style={styles.exerciseList}>
                    {filteredFlows.map((flow) => (
                        <View 
                            key={flow.id} 
                            style={[
                                styles.exerciseCard, 
                                { backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: colors.border },
                                styles.shadow
                            ]}
                        >
                            <View style={styles.exerciseInfo}>
                                <View style={styles.exerciseImagePlaceholder}>
                                    <MaterialCommunityIcons name="yoga" size={24} color="#0ea5e9" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.exerciseNameText, { color: colors.text }]}>{flow.title}</Text>
                                    <Text style={styles.exerciseMeta}>{flow.totalDurationMin} min • {flow.poses.length} poses • {flow.level}</Text>
                                </View>
                            </View>
                            <TouchableOpacity 
                                style={styles.startBtn}
                                onPress={() => handleStartWorkout(flow.id)}
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
  muscleCard: { width: width * 0.25, height: 100, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  muscleName: { marginTop: 8, fontSize: 13, fontWeight: '600' },
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
