import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import {
  getGrantedPermissions,
  getSdkStatus,
  initialize,
  readRecords,
  requestPermission,
} from "react-native-health-connect";

export const useHealthConnect = () => {
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [steps, setSteps] = useState(0);
  const [calories, setCalories] = useState(0);

  const requestHealthPermissions = useCallback(async () => {
    try {
      if (Platform.OS !== "android") return false;

      // Kiểm tra trạng thái SDK trước khi cấp quyền
      const status = await getSdkStatus();
      // Thông thường 3 là SDK_AVAILABLE, tuỳ thuộc vào version thư viện
      // Nhưng nếu khác trạng thái sẵn sàng thì ta chặn lại
      if (status !== 3 && status !== 1 && status !== 0) {
        // Check an toàn tuỳ thuộc vào log của bạn, ở đây status === 3 thường là available
        console.log("Health Connect chưa sẵn sàng (Status:", status, ")");
        // Bạn có thể redirect user đi cài Health Connect tuỳ vào status
      }

      const permissions = [
        { accessType: "read", recordType: "Steps" },
        { accessType: "read", recordType: "TotalCaloriesBurned" },
      ] as const;

      const granted = await getGrantedPermissions();
      // Check if we already have the permissions
      const hasAllPermissions = permissions.every((p) =>
        granted.some(
          (g) => g.recordType === p.recordType && g.accessType === p.accessType,
        ),
      );

      if (!hasAllPermissions) {
        // Request permissions
        await requestPermission(permissions as any);
      }

      setHasPermissions(true);
      return true;
    } catch (error) {
      console.error("[ERROR] Health Connect Permission:", error);
      return false;
    }
  }, []);

  const fetchHealthData = useCallback(async () => {
    try {
      if (Platform.OS !== "android") return;

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      // Fetch Steps
      const stepsData = await readRecords("Steps", {
        timeRangeFilter: {
          operator: "between",
          startTime: startOfDay.toISOString(),
          endTime: endOfDay.toISOString(),
        },
      });

      const stepsArray = Array.isArray(stepsData)
        ? stepsData
        : (stepsData as any).records || [];
      const totalSteps = stepsArray.reduce(
        (sum: number, record: any) => sum + record.count,
        0,
      );
      setSteps(totalSteps);

      // Fetch Calories
      const caloriesData = await readRecords("TotalCaloriesBurned", {
        timeRangeFilter: {
          operator: "between",
          startTime: startOfDay.toISOString(),
          endTime: endOfDay.toISOString(),
        },
      });

      const calsArray = Array.isArray(caloriesData)
        ? caloriesData
        : (caloriesData as any).records || [];
      const totalCalories = calsArray.reduce(
        (sum: number, record: any) => sum + record.energy.inKilocalories,
        0,
      );
      setCalories(Math.round(totalCalories));
    } catch (error) {
      console.error("[ERROR] Health Connect Fetch:", error);
    }
  }, []);

  // Hàm tổng hợp: Cấp quyền xong fetch ngay!
  const syncHealthData = useCallback(async () => {
    try {
      const ok = await requestHealthPermissions();
      if (ok) {
        await fetchHealthData();
      }
    } catch (error) {
      console.error("[ERROR] Syncing config:", error);
    }
  }, [requestHealthPermissions, fetchHealthData]);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    let isMounted = true;

    const initHealthConnect = async () => {
      try {
        const status = await getSdkStatus();
        setIsAvailable(status !== 0); // Đánh dấu state theo status

        // Khởi tạo Health Connect
        const isInitialized = await initialize();
        if (!isInitialized || !isMounted) return;

        // Chỉ im lặng kiểm tra xem ĐÃ TỪNG cấp quyền chưa (không gọi mở popup)
        const granted = await getGrantedPermissions();
        if (granted.length > 0) {
          setHasPermissions(true);
          await fetchHealthData();
        }
      } catch (error) {
        console.error("[ERROR] Health Connect Init:", error);
      }
    };

    // Gọi thẳng, không cần hack setTimeout nữa vì ta không trigger `requestPermissions` ở đây
    initHealthConnect();

    return () => {
      isMounted = false;
    };
  }, [fetchHealthData]);

  return {
    isAvailable,
    hasPermissions,
    steps,
    calories,
    requestHealthPermissions,
    fetchHealthData,
    syncHealthData, // Dùng hàm này khi bấm nút <Button onPress={syncHealthData} />
  };
};
