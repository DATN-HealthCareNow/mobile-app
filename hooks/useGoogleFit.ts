import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useSession } from "./useAuth";
import { useProfile } from "./useUser";
import { userService } from "../api/services/userService";

// Cấu hình Google Sign-In một lần duy nhất.
// Đối với Android Native, bạn CHỈ CẦN truyền Web Client ID,
// Google Play Services sẽ tự động nhận diện Android Client ID qua Mã SHA-1 của file cài đặt.
GoogleSignin.configure({
  scopes: [
    "https://www.googleapis.com/auth/fitness.activity.read",
    "https://www.googleapis.com/auth/fitness.body.read",
    "https://www.googleapis.com/auth/fitness.heart_rate.read",
    "https://www.googleapis.com/auth/fitness.sleep.read",
    "https://www.googleapis.com/auth/fitness.location.read",
  ],
  webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID || "",
  offlineAccess: true,
});

let globalTokenPromise: Promise<any> | null = null;

const safeGetTokens = () => {
  if (!globalTokenPromise) {
    globalTokenPromise = GoogleSignin.getTokens().finally(() => {
      globalTokenPromise = null;
    });
  }
  return globalTokenPromise;
};

export const useGoogleFit = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(true);
  const { token: sessionToken } = useSession();
  const { data: profile } = useProfile(sessionToken);

  const estimateRestingCalories = (userProfile: any) => {
    if (!userProfile) {
      return 0;
    }

    const rawWeight = userProfile.weight ?? userProfile.weight_kg;
    const rawHeight = userProfile.height ?? userProfile.height_cm;
    const rawDob = userProfile.dateOfBirth ?? userProfile.date_of_birth;
    const rawGender = String(userProfile.gender ?? "").toUpperCase();

    const weightKg = Number(rawWeight);
    const heightCm = Number(rawHeight);

    if (!Number.isFinite(weightKg) || !Number.isFinite(heightCm) || !rawDob) {
      return 0;
    }

    const birthDate = new Date(rawDob);
    if (Number.isNaN(birthDate.getTime())) {
      return 0;
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age -= 1;
    }

    const baseCalories = 10 * weightKg + 6.25 * heightCm - 5 * age;

    if (rawGender === "MALE" || rawGender === "M") {
      return Math.max(0, Math.round(baseCalories + 5));
    }

    if (rawGender === "FEMALE" || rawGender === "F") {
      return Math.max(0, Math.round(baseCalories - 161));
    }

    return Math.max(0, Math.round(baseCalories - 78));
  };

  // Khôi phục token nếu user đã từng đăng nhập
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const hasPlay = await GoogleSignin.hasPlayServices();
        if (!hasPlay) {
          console.warn('[useGoogleFit] ⚠️ Google Play Services not available');
          return;
        }
        
        const hasSignIn = await GoogleSignin.hasPreviousSignIn();
        if (hasSignIn) {
          try {
            const tokens = await safeGetTokens();
            if (tokens?.accessToken) {
              setAccessToken(tokens.accessToken);
              console.log('[useGoogleFit] ✅ Previous session restored');
            }
          } catch (tokenErr) {
            console.warn('[useGoogleFit] ⚠️ Failed to restore token:', tokenErr);
            // Token hết hạn - yêu cầu sign in lại
            Alert.alert(
              'Google Fit Session Expired',
              'Please sign in again to sync health data.',
              [{ text: 'OK', onPress: () => {} }]
            );
          }
        }
      } catch (err: any) {
        console.warn('[useGoogleFit] Check login status failed:', err?.message);
      }
    };
    checkLoginStatus();
  }, []);

  const authorize = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const tokens = await safeGetTokens();
      const signedInEmail =
        (userInfo as any)?.data?.user?.email ??
        (userInfo as any)?.user?.email ??
        "unknown";

      const tokenPreview = tokens?.accessToken ? `${tokens.accessToken.slice(0, 12)}...` : "missing";
      console.log("[useGoogleFit] User signed in:", signedInEmail);
      console.log("[useGoogleFit] Access token received:", tokenPreview);
      console.log("[useGoogleFit] Scopes requested: fitness.activity.read, fitness.body.read, fitness.heart_rate.read, fitness.sleep.read");
      setAccessToken(tokens.accessToken);
    } catch (error: any) {
      console.error("❌ Google Sign-in failed:", error?.message || JSON.stringify(error));
      Alert.alert(
        "Google Sign-in Error", 
        error?.message || "Please try again"
      );
    }
  };

  const handleTokenExpireAndRetry = useCallback(async (
    token: string,
    fetchFn: (token: string) => Promise<Response>,
    retryCount = 0
  ): Promise<{ response: Response; updatedToken: string }> => {
    if (retryCount > 1) {
      throw new Error("Max retry attempts reached. Please sign in again.");
    }

    let currentToken = token;
    if (!currentToken) {
      throw new Error("No access token available");
    }

    const res = await fetchFn(currentToken);
    
    if (res.status === 403) {
      console.warn('[useGoogleFit] ⚠️ 403 Forbidden detected. Attempt #' + (retryCount + 1));
      
      try {
        if (retryCount === 0) {
          // First attempt: try token refresh
          console.log('[useGoogleFit] 🔄 Attempt 1: Attempting token refresh...');
          const newTokens = await safeGetTokens();
          if (newTokens?.accessToken) {
            console.log('[useGoogleFit] ✅ Token auto-refreshed. Retrying...');
            setAccessToken(newTokens.accessToken);
            return handleTokenExpireAndRetry(newTokens.accessToken, fetchFn, retryCount + 1);
          }
        } else if (retryCount === 1) {
          // Second attempt: force sign-out and sign-in again to grant scopes
          console.warn('[useGoogleFit] ⚠️ Attempt 2: Token refresh failed. Forcing re-authentication...');
          try {
            await GoogleSignin.signOut();
          } catch (signOutErr) {
            console.warn('[useGoogleFit] Sign out error (non-critical):', signOutErr);
          }
          
          // Now request fresh sign-in
          const userInfo = await GoogleSignin.signIn();
          const freshTokens = await safeGetTokens();
          
          if (freshTokens?.accessToken) {
            console.log('[useGoogleFit] ✅ Fresh sign-in completed with full scopes. Retrying...');
            setAccessToken(freshTokens.accessToken);
            return handleTokenExpireAndRetry(freshTokens.accessToken, fetchFn, retryCount + 1);
          }
        }
      } catch (err) {
        console.error('[useGoogleFit] ❌ Recovery attempt failed:', err);
        setAccessToken(null); // Clear invalid token
        throw new Error(
          "Unable to access Google Fit. Your session may need to be refreshed. Please sign in again from the app."
        );
      }
    }

    return { response: res, updatedToken: currentToken };
  }, []);

  const fetchGoogleFitData = useCallback(async (token: string) => {
    const now = Date.now();
    const startOfDay = new Date().setHours(0, 0, 0, 0);
    // Tính thời gian bắt đầu lấy giấc ngủ: thường từ 18:00 chiều hôm trước
    const startOfSleepTime = new Date(startOfDay).setHours(-6, 0, 0, 0);

    const [dailyDataRes, sleepDataRes] = await Promise.all([
      fetch(
        "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            aggregateBy: [
              { dataTypeName: "com.google.step_count.delta" },
              { dataTypeName: "com.google.distance.delta" },
              { dataTypeName: "com.google.calories.expended" },
              { dataTypeName: "com.google.active_minutes" },
              { dataTypeName: "com.google.heart_rate.bpm" },
            ],
            bucketByTime: { durationMillis: 86400000 },
            startTimeMillis: startOfDay,
            endTimeMillis: now,
          }),
        },
      ),
      fetch(
        `https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${new Date(startOfSleepTime).toISOString()}&endTime=${new Date(now).toISOString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
    ]);

    if (!dailyDataRes.ok) {
      return dailyDataRes;
    }

    // Lấy dailyData object
    const dailyData = await dailyDataRes.json();
    
    // Đọc Sessions cho giấc ngủ
    let sleepMinutesFromSessions = 0;
    if (sleepDataRes.ok) {
      const sessionsData = await sleepDataRes.json();
      if (sessionsData.session && Array.isArray(sessionsData.session)) {
        let sleepIntervals: { start: number; end: number }[] = [];
        
        sessionsData.session.forEach((s: any) => {
          // Lọc chính xác các session loại 72 (Sleep) 
          if (s.activityType === 72) {
            const start = Number(s.startTimeMillis);
            const end = Number(s.endTimeMillis);
            if (!isNaN(start) && !isNaN(end) && end > start) {
              sleepIntervals.push({ start, end });
            }
          }
        });

        // Hợp nhất (merge) các phiên ngủ bị trùng lặp thời gian
        sleepIntervals.sort((a, b) => a.start - b.start);
        let mergedIntervals: { start: number; end: number }[] = [];
        
        for (const interval of sleepIntervals) {
          if (mergedIntervals.length === 0) {
            mergedIntervals.push(interval);
          } else {
            const last = mergedIntervals[mergedIntervals.length - 1];
            // Nếu phiên này đè hoặc chạm phiên trước, gộp lại
            if (interval.start <= last.end) {
              last.end = Math.max(last.end, interval.end);
            } else {
              mergedIntervals.push(interval);
            }
          }
        }

        // Tính tổng thời gian đã gộp
        sleepMinutesFromSessions = mergedIntervals.reduce((total, interval) => {
          return total + Math.round((interval.end - interval.start) / 60000);
        }, 0);
      }
    }

    // Lưu lượng thời gian ngủ vào một trường trong bucket để dễ trích xuất
    if (dailyData.bucket && dailyData.bucket.length > 0) {
      dailyData.bucket[0]._customSleepMinutes = sleepMinutesFromSessions;
    }
    
    // Create a mock response object resolving to our merged data
    return {
      ok: true,
      status: 200,
      json: async () => dailyData,
      text: async () => JSON.stringify(dailyData)
    } as any;
  }, []);

  const fetchHealthData = useCallback(async () => {
    if (!accessToken) {
      throw new Error("Chưa có Access Token. Vui lòng đăng nhập.");
    }

    console.log('[useGoogleFit] Fetching data from Google Fit API...');
    const now = Date.now();
    const startOfDay = new Date().setHours(0, 0, 0, 0);
    console.log('[useGoogleFit] Time range: ', new Date(startOfDay).toISOString(), ' - ', new Date(now).toISOString());

    // Sử dụng retry logic với auto-refresh
    const { response: res } = await handleTokenExpireAndRetry(accessToken, fetchGoogleFitData);

    if (!res.ok) {
      console.error('[useGoogleFit] API Error:', res.status, res.statusText);
      const errorData = await res.text();
      console.error('[useGoogleFit] Error details:', errorData);
      throw new Error(`Google Fit API Error: ${res.status}`);
    }

    const data = await res.json();
    console.log('[useGoogleFit] Raw API response:', JSON.stringify(data, null, 2));

    let steps = 0;
    let totalCalories = 0;
    let googleExerciseMinutes = 0;
    let distanceMeters = 0;
    let sleepMinutes = 0;
    let heartRateSum = 0;
    let heartRateCount = 0;
    let minHeartRateForResting = 0;

    if (data.bucket && data.bucket.length > 0) {
      const dataset = data.bucket[0].dataset;
      dataset.forEach((ds: any) => {
        if (ds.dataSourceId.includes("step_count")) {
          ds.point.forEach((p: any) => {
            if (p.value && p.value.length > 0) {
              const stepVal = p.value[0].intVal || 0;
              console.log('[useGoogleFit] Found steps:', stepVal);
              steps += stepVal;
            }
          });
        }
        if (ds.dataSourceId.includes("distance")) {
          ds.point.forEach((p: any) => {
            if (p.value && p.value.length > 0) {
              const distanceVal = p.value[0].fpVal ?? p.value[0].intVal ?? 0;
              if (typeof distanceVal === "number" && Number.isFinite(distanceVal)) {
                distanceMeters += distanceVal;
              }
            }
          });
        }
        if (ds.dataSourceId.includes("calories.expended")) {
          ds.point.forEach((p: any) => {
            if (p.value && p.value.length > 0) {
              const calVal = p.value[0].fpVal ?? p.value[0].intVal ?? 0;
              console.log('[useGoogleFit] Found total calories:', calVal);
              totalCalories += calVal;
            }
          });
        }
        if (ds.dataSourceId.includes("active_minutes")) {
          ds.point.forEach((p: any) => {
            if (p.value && p.value.length > 0) {
              const minuteVal = p.value[0].intVal ?? Math.round(p.value[0].fpVal || 0);
              console.log('[useGoogleFit] Found active minutes:', minuteVal);
              googleExerciseMinutes += minuteVal;
            }
          });
        }

        if (ds.dataSourceId.includes("heart_rate")) {
          ds.point.forEach((p: any) => {
            if (p.value && p.value.length > 0) {
              const avgBpm = p.value[0]?.fpVal ?? p.value[0]?.intVal;
              const minBpm = p.value[2]?.fpVal ?? p.value[2]?.intVal; // Index 2 is min in summary
              
              if (typeof avgBpm === "number" && Number.isFinite(avgBpm) && avgBpm > 0) {
                heartRateSum += avgBpm;
                heartRateCount += 1;
              }
              
              if (typeof minBpm === "number" && Number.isFinite(minBpm) && minBpm > 0) {
                 if (minHeartRateForResting === 0 || minBpm < minHeartRateForResting) {
                     minHeartRateForResting = minBpm;
                 }
              } else if (typeof avgBpm === "number") {
                 // Fallback if min is not available
                 if (minHeartRateForResting === 0 || avgBpm < minHeartRateForResting) {
                     minHeartRateForResting = avgBpm;
                 }
              }
            }
          });
        }

        if (ds.dataSourceId.includes("sleep.segment")) {
          ds.point.forEach((p: any) => {
            const stageVal = p.value?.[0]?.intVal;
            const startNs = Number(p.startTimeNanos || 0);
            const endNs = Number(p.endTimeNanos || 0);
            const mins = Math.max(0, Math.round((endNs - startNs) / 60000000000));

            // Exclude clearly-awake/out-of-bed segments when stage metadata is available.
            if (typeof stageVal === "number") {
              if (stageVal === 1 || stageVal === 3) {
                return;
              }
            }

            // Optional: You could add segment-based minutes here if needed, 
            // but we're tracking via _customSleepMinutes now.
            // sleepMinutes += mins;
          });
        }
      });

      // Lấy thời gian ngủ từ custom field vừa thêm
      if (typeof data.bucket[0]._customSleepMinutes === "number") {
        sleepMinutes = data.bucket[0]._customSleepMinutes;
        console.log('[useGoogleFit] Found sleep from Sessions API:', sleepMinutes);
      }
    } else {
      console.warn('[useGoogleFit] ⚠️ No bucket data returned! Empty day or API issue.');
    }

    const heartRate = heartRateCount > 0 ? Math.round(heartRateSum / heartRateCount) : 0;
    const restingHeartRate = Math.round(minHeartRateForResting);

    let restingCaloriesEstimate = estimateRestingCalories(profile);
    if (restingCaloriesEstimate <= 0) {
      try {
        const freshProfile = await userService.get_profile();
        restingCaloriesEstimate = estimateRestingCalories(freshProfile);
      } catch (profileErr) {
        console.warn('[useGoogleFit] Failed to fetch profile for resting calorie estimate:', profileErr);
      }
    }

    if (restingCaloriesEstimate > 0) {
      console.log('[useGoogleFit] Estimated resting calories from profile:', restingCaloriesEstimate);
    } else {
      console.log('[useGoogleFit] Resting calorie estimate unavailable, using 0');
    }

    const restingCalories = 0;
    let activeCalories = Math.max(0, Math.round(totalCalories - restingCaloriesEstimate));

    if (activeCalories === 0 && googleExerciseMinutes > 0) {
      activeCalories = Math.max(1, Math.round(googleExerciseMinutes * 2.8));
      console.log('[useGoogleFit] Active calorie fallback from active minutes:', activeCalories);
    }

    if (activeCalories === 0 && steps > 0) {
      activeCalories = Math.max(1, Math.round(steps * 0.03));
      console.log('[useGoogleFit] Active calorie fallback from steps:', activeCalories);
    }

    const result = {
      steps,
      distanceMeters: Math.round(distanceMeters),
      totalCalories: Math.round(totalCalories),
      restingCalories,
      activeCalories,
      googleExerciseMinutes,
      sleepMinutes,
      heartRate,
      restingHeartRate,
    };
    console.log('[useGoogleFit] ✅ Final parsed result:', result);
    return result;
  }, [accessToken, profile]);

  return {
    isReady,
    accessToken,
    authorize,
    fetchHealthData,
  };
};
