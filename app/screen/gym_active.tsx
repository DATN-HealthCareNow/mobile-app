import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useGymStore } from '../../store/gymStore';



export default function GymActiveScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const exerciseName = (params.exercise as string) || "Unknown Exercise";
  const { colors, isDark } = useTheme();
  const { startTime, addExerciseSets } = useGymStore();

  // STates
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [reps, setReps] = useState('12');
  const [weight, setWeight] = useState('0');
  const [isResting, setIsResting] = useState(false);
  const [restSeconds, setRestSeconds] = useState(60);
  const [sessionSets, setSessionSets] = useState<{reps: number, weight: number}[]>([]);

  // Global Workout Timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (startTime) {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Rest Timer
  useEffect(() => {
    let restInterval: ReturnType<typeof setInterval>;
    if (isResting && restSeconds > 0) {
      restInterval = setInterval(() => {
        setRestSeconds(prev => prev - 1);
      }, 1000);
    } else if (restSeconds === 0) {
      setIsResting(false);
      setRestSeconds(60);
    }
    return () => clearInterval(restInterval);
  }, [isResting, restSeconds]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCompleteSet = () => {
    const r = parseInt(reps);
    const w = parseFloat(weight);
    
    if (isNaN(r) || isNaN(w)) {
      Alert.alert("Invalid Input", "Please enter valid reps and weight.");
      return;
    }

    // Save set locally for this exercise session
    setSessionSets(prev => [...prev, { reps: r, weight: w }]);
    setIsResting(true);
    setCurrentSet(prev => prev + 1);
  };

  const handleFinishExercise = () => {
    if (sessionSets.length === 0) {
        router.push("/screen/gym_selection" as any);
        return;
    }
    // Push all sets of this exercise to global store
    addExerciseSets(exerciseName, sessionSets);
    router.push("/screen/gym_selection" as any);
  };

  const handleFinishWorkout = () => {
    if (sessionSets.length > 0) {
        addExerciseSets(exerciseName, sessionSets);
    }
    router.push("/screen/gym_summary" as any);
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* TOP TIMER BAR */}
        <View style={styles.topBar}>
          <Text style={[styles.totalTimeLabel, { color: colors.text }]}>WORKOUT TIME</Text>
          <Text style={[styles.totalTimeValue, { color: colors.text }]}>{formatTime(elapsedSeconds)}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* EXERCISE CARD */}
          <View style={[styles.exerciseCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <View style={styles.exerciseHeader}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="dumbbell" size={32} color="#fff" />
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={[styles.exerciseTitle, { color: colors.text }]}>{exerciseName}</Text>
                <Text style={styles.setCounter}>SET {currentSet}</Text>
              </View>
            </View>

            {/* RESTING OVERLAY */}
            {isResting ? (
              <View style={styles.restContainer}>
                <Text style={styles.restLabel}>RESTING</Text>
                <Text style={styles.restTime}>{restSeconds}s</Text>
                <TouchableOpacity 
                    style={styles.skipBtn} 
                    onPress={() => setIsResting(false)}
                >
                  <Text style={styles.skipBtnText}>SKIP REST</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.inputsRow}>
                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>REPS</Text>
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    keyboardType="numeric"
                    value={reps}
                    onChangeText={setReps}
                    selectTextOnFocus
                  />
                </View>
                <View style={[styles.inputBox, { borderLeftWidth: 1, borderLeftColor: '#e2e8f0' }]}>
                  <Text style={styles.inputLabel}>WEIGHT (KG)</Text>
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                    selectTextOnFocus
                  />
                </View>
              </View>
            )}
          </View>

          {/* SETS HISTORY PREVIEW */}
          {sessionSets.length > 0 && (
              <View style={styles.historySection}>
                  <Text style={[styles.historyTitle, { color: colors.text }]}>Previous Sets</Text>
                  {sessionSets.map((set, idx) => (
                      <View key={idx} style={styles.historyRow}>
                          <Text style={styles.historySetNum}>Set {idx + 1}</Text>
                          <Text style={[styles.historyValue, { color: colors.text }]}>{set.reps} reps x {set.weight} kg</Text>
                          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                      </View>
                  ))}
              </View>
          )}

        </ScrollView>

        {/* BOTTOM ACTIONS */}
        <View style={styles.actionFooter}>
            <TouchableOpacity 
                style={[styles.completeBtn]} 
                onPress={handleCompleteSet}
                disabled={isResting}
            >
                <Text style={styles.completeBtnText}>COMPLETE SET</Text>
            </TouchableOpacity>

            <View style={styles.secondaryActions}>
                <TouchableOpacity style={styles.finishTargetBtn} onPress={handleFinishExercise}>
                    <Text style={styles.finishTargetText}>Finish Exercise</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.finishWorkoutBtn} onPress={handleFinishWorkout}>
                    <Text style={styles.finishWorkoutText}>End Session</Text>
                </TouchableOpacity>
            </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingTop: 60,
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  totalTimeLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#64748b',
    marginBottom: 4,
  },
  totalTimeValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
  },
  exerciseCard: {
    padding: 24,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 30,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  setCounter: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: 'bold',
    marginTop: 2,
  },
  inputsRow: {
    flexDirection: 'row',
  },
  inputBox: {
    flex: 1,
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 1,
    marginBottom: 8,
  },
  textInput: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '80%',
  },
  restContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  restLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
  restTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#10b981',
    marginVertical: 10,
  },
  skipBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
  },
  skipBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748b',
  },
  historySection: {
      paddingHorizontal: 10,
  },
  historyTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 15,
  },
  historyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
  },
  historySetNum: {
      width: 60,
      fontSize: 14,
      color: '#64748b',
      fontWeight: '600',
  },
  historyValue: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
  },
  actionFooter: {
      padding: 20,
      paddingBottom: 40,
  },
  completeBtn: {
      backgroundColor: '#0ea5e9',
      height: 64,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#0ea5e9',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 15,
      elevation: 10,
      marginBottom: 20,
  },
  completeBtnText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
      letterSpacing: 1,
  },
  secondaryActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
  },
  finishTargetBtn: {
      flex: 1,
      backgroundColor: '#f1f5f9',
      paddingVertical: 15,
      borderRadius: 15,
      alignItems: 'center',
      marginRight: 10,
  },
  finishTargetText: {
      color: '#0ea5e9',
      fontWeight: 'bold',
  },
  finishWorkoutBtn: {
      flex: 1,
      backgroundColor: '#fee2e2',
      paddingVertical: 15,
      borderRadius: 15,
      alignItems: 'center',
      marginLeft: 10,
  },
  finishWorkoutText: {
      color: '#ef4444',
      fontWeight: 'bold',
  }
});
