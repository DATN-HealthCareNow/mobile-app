import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useGymStore } from '../../store/gymStore';

const { width } = Dimensions.get('window');

const muscleGroups = [
  { id: 'chest', name: 'Chest', icon: 'layers-outline' },
  { id: 'back', name: 'Back', icon: 'accessibility-outline' },
  { id: 'arms', name: 'Arms', icon: 'barbell-outline' },
  { id: 'legs', name: 'Legs', icon: 'walk-outline' },
];

const exercisesData: Record<string, string[]> = {
  chest: ["Barbell Bench Press", "Dumbbell Bench Press", "Incline Bench Press", "Decline Bench Press", "Push-Up", "Cable Chest Fly", "Dumbbell Fly", "Machine Chest Press", "Incline Dumbbell Fly", "Chest Dip"],
  back: ["Pull-Up", "Chin-Up", "Lat Pulldown", "Barbell Row", "Dumbbell Row", "Seated Cable Row", "T-Bar Row", "Deadlift", "Straight Arm Pulldown", "Face Pull"],
  arms: ["Barbell Curl", "Dumbbell Curl", "Hammer Curl", "Preacher Curl", "Concentration Curl", "Tricep Dip", "Tricep Pushdown", "Overhead Tricep Extension", "Close Grip Bench Press", "Skull Crusher"],
  legs: ["Squat", "Leg Press", "Leg Extension", "Leg Curl", "Lunges", "Calf Raise", "Romanian Deadlift", "Hack Squat"],
};

const getGymImage = (muscleId: string) => {
  switch (muscleId) {
    case 'chest': return require('../../assets/images/gym/chest.png');
    case 'back': return require('../../assets/images/gym/back.png');
    case 'arms': return require('../../assets/images/gym/arms.png');
    case 'legs': return require('../../assets/images/gym/legs.png');
    default: return require('../../assets/images/gym/chest.png');
  }
};

export default function GymSelectionScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { startWorkout, isActive } = useGymStore();
  const [selectedMuscle, setSelectedMuscle] = useState('chest');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExercises = exercisesData[selectedMuscle].filter(ex => 
    ex.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartExercise = (exerciseName: string) => {
    if (!isActive) {
      startWorkout();
    }
    router.push({
      pathname: "/screen/gym_active" as any,
      params: { exercise: exerciseName }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Gym Workout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* SEARCH BAR */}
        <View style={[styles.searchContainer, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
          <Ionicons name="search" size={20} color="#64748b" />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search exercises..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* MUSCLE GROUPS */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Muscle Groups</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.muscleScroll}>
          {muscleGroups.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={[
                styles.muscleCard,
                { backgroundColor: selectedMuscle === group.id ? '#0ea5e9' : (isDark ? '#1e293b' : '#fff') },
                selectedMuscle !== group.id && styles.shadow
              ]}
              onPress={() => setSelectedMuscle(group.id)}
            >
              <Ionicons 
                name={group.icon as any} 
                size={24} 
                color={selectedMuscle === group.id ? '#fff' : '#0ea5e9'} 
              />
              <Text style={[
                styles.muscleName, 
                { color: selectedMuscle === group.id ? '#fff' : (isDark ? '#cbd5e1' : '#334155') }
              ]}>
                {group.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* EXERCISES LIST */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {selectedMuscle.charAt(0).toUpperCase() + selectedMuscle.slice(1)} Exercises
        </Text>
        <View style={styles.exerciseList}>
          {filteredExercises.map((exercise, index) => (
            <View 
              key={index} 
              style={[
                styles.exerciseCard, 
                { backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: colors.border },
                styles.shadow
              ]}
            >
              <View style={styles.exerciseInfo}>
                <View style={[styles.exerciseImagePlaceholder, isDark && { backgroundColor: '#334155' }]}>
                  <Image source={getGymImage(selectedMuscle)} style={{ width: '100%', height: '100%', borderRadius: 12, resizeMode: 'cover' }} />
                </View>
                <View>
                  <Text style={[styles.exerciseNameText, { color: colors.text }]}>{exercise}</Text>
                  <Text style={styles.exerciseMeta}>Estimated: 4 Sets x 12 Reps</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.startBtn}
                onPress={() => handleStartExercise(exercise)}
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
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 15,
    marginBottom: 25,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  muscleScroll: {
    marginBottom: 25,
  },
  muscleCard: {
    width: width * 0.25,
    height: 100,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  muscleName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  exerciseList: {
    paddingBottom: 30,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  exerciseNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  exerciseMeta: {
    fontSize: 12,
    color: '#64748b',
  },
  startBtn: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  }
});
