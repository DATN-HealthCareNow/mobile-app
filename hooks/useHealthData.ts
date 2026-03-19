import { useEffect, useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { iotService, HealthSyncPayload } from '../api/services/iotService';
import * as SecureStore from 'expo-secure-store';

const WAKING_HOUR = 7; // 7h sáng
const BASE_STEPS_PER_HOUR = 500;
const BASE_CALORIES_PER_HOUR = 30;
const BASE_WATER_PER_HOUR = 200;
const BASE_SLEEP_MINUTES = 360; // 6h ngủ core

export const useHealthData = () => {
  const [mockData, setMockData] = useState<HealthSyncPayload['metrics'] | null>(null);

  const calculateDynamicMockData = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Tính số giờ đã thức dậy từ 7h sáng
    const passedHours = Math.max(0, currentHour - WAKING_HOUR);

    // Randomize một chút để số liệu cho chân thực
    const steps = passedHours > 0 ? passedHours * BASE_STEPS_PER_HOUR + Math.floor(Math.random() * 200) : 0; 
    const activeCalories = passedHours > 0 ? passedHours * BASE_CALORIES_PER_HOUR + Math.floor(Math.random() * 10) : 0;
    const exerciseMinutes = passedHours > 0 ? passedHours * 5 : 0;
    const waterConsumedMl = passedHours > 0 ? passedHours * BASE_WATER_PER_HOUR : 0;
    
    // Giấc ngủ chốt từ đầu ngày, random từ 6 đến 7.5 tiếng
    const sleepMinutes = BASE_SLEEP_MINUTES + Math.floor(Math.random() * 90);

    setMockData({
      steps,
      activeCalories,
      exerciseMinutes,
      sleepMinutes,
      restingCalories: 1500, // Cố định 1500 kcal nghỉ ngơi
      waterConsumedMl,
    });
  }, []);

  useEffect(() => {
    // Khởi tạo mock data lần đầu
    calculateDynamicMockData();

    // Cập nhật mock data mỗi phút trong ứng dụng test
    const interval = setInterval(() => {
      calculateDynamicMockData();
    }, 60 * 1000); 

    return () => clearInterval(interval);
  }, [calculateDynamicMockData]);

  // Hook push dữ liệu lên server
  const syncMutation = useMutation({
    mutationFn: async () => {
      const userId = await SecureStore.getItemAsync('userId');
      if (!userId || !mockData) {
        throw new Error("No user ID or mock data available to sync");
      }

      const now = new Date();
      // Format Ngày về YYYY-MM-DD
      const dateString = now.toISOString().split('T')[0];
      
      const payload: HealthSyncPayload = {
        userId,
        dateString,
        rawDate: now.toISOString(),
        source: 'DanhK',
        metrics: mockData,
      };

      return iotService.syncHealthData(payload);
    },
    onSuccess: () => {
      console.log("Mock data synced successfully.");
    },
    onError: (error) => {
      console.error("Failed to sync mock data:", error);
    }
  });

  const syncData = useCallback(() => {
    if (mockData) {
      syncMutation.mutate();
    }
  }, [mockData, syncMutation]);

  return {
    mockData,
    isSyncing: syncMutation.isPending,
    syncError: syncMutation.error,
    syncData,
    recalculateMock: calculateDynamicMockData, // Export ra để có thể kích hoạt bằng nút UI
  };
};
