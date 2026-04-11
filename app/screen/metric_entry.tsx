import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../context/ThemeContext';
import { useProfile, useUpdateProfile } from '../../hooks/useUser';
import { useSession } from '../../hooks/useAuth';
import { useSleepStore } from '../../store/sleepStore';
import { useGoalStore } from '../../store/goalStore';

export default function MetricEntryScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { token } = useSession();
  const { data: profile } = useProfile(token);
  const updateProfileMutation = useUpdateProfile();
  
  const { sleepGoal: storeSleepGoal, setSleepGoal: updateStoreSleepGoal } = useSleepStore();
  const { stepsGoal: storeStepsGoal, caloriesGoal: storeCaloriesGoal, setStepsGoal: updateStoreStepsGoal, setCaloriesGoal: updateStoreCaloriesGoal } = useGoalStore();

  const [fullName, setFullName] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [sleepGoal, setSleepGoal] = useState(storeSleepGoal.toString());
  const [stepsGoal, setStepsGoal] = useState(storeStepsGoal.toString());
  const [caloriesGoal, setCaloriesGoal] = useState(storeCaloriesGoal.toString());
  
  const [dob, setDob] = useState(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [activityLevel, setActivityLevel] = useState('Moderately Active');

  // Initialize state with existing profile data
  useEffect(() => {
    if (profile) {
      const pFullName = profile.fullName || profile.full_name;
      if (pFullName) setFullName(pFullName);
      
      if (profile.weight) setWeight(profile.weight.toString());
      if (profile.height) setHeight(profile.height.toString());
      
      const pDob = profile.dateOfBirth || profile.date_of_birth;
      if (pDob) setDob(new Date(pDob));
      
      if (profile.gender) setGender(profile.gender as any);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!weight || !height) {
      Alert.alert('Error', 'Please fill in weight and height');
      return;
    }

    try {
      updateStoreSleepGoal(parseInt(sleepGoal) || 8);
      updateStoreStepsGoal(parseInt(stepsGoal) || 10000);
      updateStoreCaloriesGoal(parseInt(caloriesGoal) || 500);
      
      const dobString = dob.toISOString().split('T')[0];
      const nameToSend = fullName.trim() || profile?.fullName || profile?.full_name;
      const payload = {
        weight: parseInt(weight),
        height: parseInt(height),
        date_of_birth: dobString,
        dateOfBirth: dobString, // Send both to be safe
        gender: gender,
        full_name: nameToSend,
        fullName: nameToSend,
      };
      
      console.log('--- PROFILE UPDATE DEBUG ---');
      console.log('URL: /api/v1/users/profile (PUT)');
      console.log('Payload:', JSON.stringify(payload, null, 2));

      updateProfileMutation.mutate(payload, {
        onSuccess: (data) => {
          console.log('Update Success Response:', data);
          Alert.alert('Success', 'Profile metrics saved! Welcome to Healthcare Now.', [
            { text: "Get Started", onPress: () => router.replace('/(tabs)') }
          ]);
        },
        onError: (err: any) => {
          console.error('Update Error:', err?.response?.data || err.message);
          Alert.alert('Error', err?.response?.data?.message || 'Failed to save metrics.');
        }
      });
    } catch (e) {
      console.error('Payload Construction Error:', e);
      Alert.alert('Error', 'Invalid input. Please check your data.');
    }
  };

  const styles = createStyles(colors, isDark);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Metrics</Text>
          <Text style={styles.subtitle}>Help us personalize your health journey</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor={colors.textSecondary}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
          </View>

          <View style={styles.row}>
            <MetricInput
              label="Weight"
              unit="kg"
              value={weight}
              onChangeText={setWeight}
              icon="weight-kilogram"
              colors={colors}
              styles={styles}
            />
            <MetricInput
              label="Height"
              unit="cm"
              value={height}
              onChangeText={setHeight}
              icon="ruler"
              colors={colors}
              styles={styles}
            />
          </View>

          <View style={styles.row}>
            <MetricInput
              label="Sleep Goal"
              unit="hrs"
              value={sleepGoal}
              onChangeText={setSleepGoal}
              icon="moon-waning-crescent"
              colors={colors}
              styles={styles}
            />
            <MetricInput
              label="Steps Goal"
              unit="steps"
              value={stepsGoal}
              onChangeText={setStepsGoal}
              icon="shoe-print"
              colors={colors}
              styles={styles}
            />
          </View>

          <View style={[styles.row, { justifyContent: 'flex-start' }]}>
            <MetricInput
              label="Calories Goal"
              unit="kcal"
              value={caloriesGoal}
              onChangeText={setCaloriesGoal}
              icon="fire"
              colors={colors}
              styles={styles}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity 
                style={styles.inputWrapper} 
                onPress={() => setShowDatePicker(true)}
            >
              <MaterialCommunityIcons name="calendar-account" size={20} color={colors.primary} />
              <Text style={styles.input}>
                {dob.toLocaleDateString()}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker
                    value={dob}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) setDob(selectedDate);
                    }}
                    maximumDate={new Date()}
                />
            )}
          </View>

          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderRow}>
            {['Male', 'Female', 'Other'].map((g) => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.genderBtn,
                  gender === g && styles.genderBtnActive
                ]}
                onPress={() => setGender(g as any)}
              >
                <Text style={[
                  styles.genderText,
                  gender === g && styles.genderTextActive
                ]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Activity Level</Text>
          <View style={styles.activityList}>
            {['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.activityItem,
                  activityLevel === level && styles.activityItemActive
                ]}
                onPress={() => setActivityLevel(level)}
              >
                <Text style={[
                  styles.activityText,
                  activityLevel === level && styles.activityTextActive
                ]}>{level}</Text>
                {activityLevel === level && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, updateProfileMutation.isPending && { opacity: 0.7 }]} 
            onPress={handleSave}
            disabled={updateProfileMutation.isPending}
          >
            <Text style={styles.saveButtonText}>
              {updateProfileMutation.isPending ? 'Saving...' : 'Complete Profile'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.skipBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.skipText}>I&apos;ll do this later (Go to Home)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function MetricInput({ label, unit, value, onChangeText, icon, colors, styles }: any) {
  return (
    <View style={styles.halfInput}>
      <Text style={styles.label}>{label} ({unit})</Text>
      <View style={styles.inputWrapper}>
        <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
        <TextInput
          style={styles.input}
          placeholder="0"
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
        />
      </View>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 80,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  halfInput: {
    width: '48%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  genderBtn: {
    flex: 1,
    height: 48,
    backgroundColor: colors.card,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  genderBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  genderTextActive: {
    color: '#FFF',
  },
  activityList: {
    marginBottom: 32,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityItemActive: {
    borderColor: colors.primary,
    backgroundColor: isDark ? 'rgba(96, 165, 250, 0.05)' : 'rgba(59, 130, 246, 0.05)',
  },
  activityText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  activityTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: colors.primary,
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  skipBtn: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  skipText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});
