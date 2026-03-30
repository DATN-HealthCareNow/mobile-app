import { useMutation } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import { useCallback } from "react";
import { HealthSyncPayload, iotService } from "../api/services/iotService";
import { useGoogleFit } from "./useGoogleFit";

export const useHealthData = () => {
  const { fetchHealthData, authorize, accessToken } = useGoogleFit();

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

      const now = new Date();
      // Format Ngày về YYYY-MM-DD
      const dateString = now.toISOString().split("T")[0];

      const payload: HealthSyncPayload = {
        userId,
        dateString,
        rawDate: now.toISOString(),
        source: "Google Fit - HTTP REST API", // Source chính thức
        metrics: {
          steps: healthData?.steps || 0,
          activeCalories: healthData?.calories || 0,
          exerciseMinutes: 0, // Hiện tại demo tạm gán cứng
          sleepMinutes: 0, // Mở rộng sau: lấy sleep & water từ Health Connect
          restingCalories: 1500,
          waterConsumedMl: 0,
        },
      };

      return iotService.syncHealthData(payload);
    },
    onSuccess: () => {
      console.log("Real Health Connect data synced successfully.");
    },
    onError: (error) => {
      console.error("Failed to sync health data:", error);
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
