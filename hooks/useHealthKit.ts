import AppleHealthKit, { HealthValue, HealthKitPermissions } from 'react-native-health';
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

const permissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.StepCount,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned
    ],
    write: [],
  },
} as HealthKitPermissions;

export const useHealthKit = () => {
  const [hasPermissions, setHasPermissions] = useState(false);
  const [steps, setSteps] = useState(0);
  const [calories, setCalories] = useState(0);

  useEffect(() => {
    // HealthKit is only available on iOS
    if (Platform.OS !== 'ios') {
      return;
    }

    AppleHealthKit.initHealthKit(permissions, (error: string) => {
      if (error) {
        console.log('[ERROR] Cannot grant permissions for HealthKit!', error);
        return;
      }
      setHasPermissions(true);
      
      // Get today's start and end date
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      
      const options = {
        date: new Date().toISOString(),
        includeManuallyAdded: true,
      };

      AppleHealthKit.getStepCount(options, (err: string, results: HealthValue) => {
        if (!err && results) {
          setSteps(results.value);
        }
      });

      const calOptions = {
        startDate: startOfDay.toISOString(),
      };

      AppleHealthKit.getActiveEnergyBurned(calOptions, (err: string, results: HealthValue[]) => {
        if (!err && results && results.length > 0) {
          const totalCals = results.reduce((sum, item) => sum + item.value, 0);
          setCalories(Math.round(totalCals));
        }
      });
    });
  }, []);

  return { hasPermissions, steps, calories };
};
