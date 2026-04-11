import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { useCallback } from "react";
import { HealthSyncPayload, iotService } from "../api/services/iotService";
import { useGoogleFit } from "./useGoogleFit";
import { DAILY_HEALTH_KEYS } from "./useDailyHealthMetric";
import { STEP_KEYS } from "./useDailyStep";
import { HEALTH_SCORE_KEYS } from "./useHealthScore";

export const useHealthData = () => {
  const queryClient = useQueryClient();
  const { fetchHealthData, authorize, accessToken } = useGoogleFit();

  const getDateInVietnam = () => {
    const offset = new Date().getTimezoneOffset() * 60000;
    return new Date(Date.now() - offset).toISOString().split("T")[0];
  };

  // Hook push dữ liệu lên server
  const syncMutation = useMutation({
    mutationFn: async () => {
      if (!accessToken) {
        throw new Error("Vui lòng đăng nhập Google Fit trước!");
      }

      const userId = await SecureStore.getItemAsync("userId");
      if (!userId) {
        throw new Error("No user ID available to sync");
      }

      // Lấy dữ liệu sức khỏe thật và mới nhất từ thiết bị qua REST API
      const healthData = await fetchHealthData();
      console.log('[useHealthData] Google Fit data fetched:', healthData);

      const now = new Date();
      const dateString = getDateInVietnam();

      const payload: HealthSyncPayload = {
        user_id: userId,
        date_string: dateString,
        date_string_local: dateString,
        raw_date: now.toISOString(),
        source: "GOOGLE_FIT", // Source chính thức
        metrics: {
          steps: healthData?.steps,
          distance_meters: healthData?.distanceMeters,
          active_minutes: healthData?.googleExerciseMinutes,
          active_calories: healthData?.activeCalories,
          resting_calories: healthData?.restingCalories,
          google_exercise_minutes: healthData?.googleExerciseMinutes,
          sleep_minutes: healthData?.sleepMinutes,
          heart_rate: healthData?.heartRate,
          resting_heart_rate: healthData?.restingHeartRate,
        },
      };

      console.log('[useHealthData] Prepared sync payload:', JSON.stringify(payload, null, 2));
      console.log('[useHealthData] Sending to /api/v1/tracking/health-sync...');

      const response = await iotService.syncHealthData(payload);
      console.log('[useHealthData] Sync response:', response);

      const persisted = await iotService.getDailyHealth(dateString);
      console.log('[useHealthData] Persisted daily record:', persisted);

      if (!persisted || !persisted.metrics) {
        throw new Error('Sync completed but daily metrics record is missing in API response.');
      }

      return persisted;
    },
    onSuccess: (persisted) => {
      console.log("✅ Real Health Connect data synced successfully.");
      console.log('[useHealthData] Final persisted metrics:', persisted.metrics);
      
      // Invalidate UI queries để refresh activity tab với data mới
      queryClient.invalidateQueries({ queryKey: DAILY_HEALTH_KEYS.all });
      queryClient.invalidateQueries({ queryKey: STEP_KEYS.all });
      queryClient.invalidateQueries({ queryKey: HEALTH_SCORE_KEYS.all });
      
      console.log('[useHealthData] UI queries invalidated, refetching...');
    },
    onError: (error) => {
      console.error("❌ Failed to sync health data:", error);
    },
  });

  const syncData = useCallback(() => {
    syncMutation.mutate();
  }, [syncMutation]);

  return {
    mockData: null, // Bỏ sử dụng mockData
    isSyncing: syncMutation.isPending,
    syncError: syncMutation.error,
    syncData,
    authorize,
    hasToken: !!accessToken,
    recalculateMock: () => {}, // Giữ lại interface cũ cho an toàn
  };
};
