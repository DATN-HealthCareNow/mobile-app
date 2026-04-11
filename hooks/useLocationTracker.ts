 import { useEffect } from "react";
import * as Location from "expo-location";
import { userService } from "../api/services/userService";
import { AppState, AppStateStatus } from "react-native";

let globalLastLocationUpdate = { timestamp: 0, status: "" };

export const useLocationTracker = (token: string | null, userId: string | null) => {

  useEffect(() => {
    if (!token || !userId) return;

    let isMounted = true;

    const reportLocationAndStatus = async (status: string) => {
      const now = Date.now();
      const lastUpdate = globalLastLocationUpdate;

      // Tránh spam mạng: Nếu cùng một status (như ONLINE), chỉ bắn 1 lần mỗi 15 phút (900000ms)
      // Nếu đổi status sang OFFLINE thì bắn luôn.
      if (status === lastUpdate.status && (now - lastUpdate.timestamp) < 900000) {
        return; 
      }

      // Cập nhật ngay bộ đếm để ngăn các lần gọi đồng thời khác lọt qua
      globalLastLocationUpdate = { timestamp: now, status };

      try {
        let lat;
        let lng;

        if (status === "ONLINE") {
          const { status: permStatus } = await Location.getForegroundPermissionsAsync();
          if (permStatus !== 'granted') {
            const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
            if (newStatus !== 'granted') {
              console.log("[useLocationTracker] Permission to access location was denied");
              if (isMounted) {
                  await userService.update_tracking({ status }).catch(() => {});
              }
              return;
            }
          }

          const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
          });
          lat = location.coords.latitude;
          lng = location.coords.longitude;
        }
        
        if (isMounted) {
            await userService.update_tracking({
                lat,
                lng,
                status: status,
            });
            if (__DEV__) {
              console.log("[useLocationTracker] Throttled GPS tracking updated", lat, lng);
            }
        }
      } catch (error) {
        if (__DEV__) {
           console.warn("[useLocationTracker] tracking error", error);
        }
        // Fallback update status only if GPS fails
        if (isMounted) {
            await userService.update_tracking({ status }).catch(() => {});
        }
      }
    };

    // Lần đầu mount
    reportLocationAndStatus("ONLINE");

    // Sự kiện AppState
    const subscription = AppState.addEventListener("change", (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        reportLocationAndStatus("ONLINE");
      } else if (nextAppState === "background" || nextAppState === "inactive") {
        reportLocationAndStatus("OFFLINE");
      }
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [token, userId]);
};

