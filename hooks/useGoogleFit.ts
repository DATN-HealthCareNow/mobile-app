import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

// Cấu hình Google Sign-In một lần duy nhất.
// Đối với Android Native, bạn CHỈ CẦN truyền Web Client ID,
// Google Play Services sẽ tự động nhận diện Android Client ID qua Mã SHA-1 của file cài đặt.
GoogleSignin.configure({
  scopes: [
    "https://www.googleapis.com/auth/fitness.activity.read",
    "https://www.googleapis.com/auth/fitness.body.read",
    "https://www.googleapis.com/auth/fitness.heart_rate.read",
    "https://www.googleapis.com/auth/fitness.sleep.read",
  ],
  webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID || "",
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

  // Khôi phục token nếu user đã từng đăng nhập
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const hasPlay = await GoogleSignin.hasPlayServices();
        if (hasPlay) {
          const hasSignIn = GoogleSignin.hasPreviousSignIn();
          if (hasSignIn) {
            const tokens = await safeGetTokens();
            setAccessToken(tokens.accessToken);
          }
        }
      } catch (err: any) {
        Alert.alert("Lỗi lúc kiểm tra Status", err?.message || JSON.stringify(err));
        console.error("Lỗi kiểm tra Google Signin status:", err);
      }
    };
    checkLoginStatus();
  }, []);

  const authorize = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const tokens = await safeGetTokens();

      const tokenPreview = tokens?.accessToken ? `${tokens.accessToken.slice(0, 12)}...` : "missing";
      console.log("[useGoogleFit] Access token received:", tokenPreview);
      setAccessToken(tokens.accessToken);
    } catch (error: any) {
      Alert.alert(
        "Lỗi Đăng nhập Native \n(Reported for Dev)", 
        error?.message || JSON.stringify(error)
      );
      console.error("Đăng nhập Google Native bị lỗi:", error);
    }
  };

  const fetchHealthData = useCallback(async () => {
    if (!accessToken) {
      throw new Error("Chưa có Access Token Google Fit");
    }

    const now = Date.now();
    const startOfDay = new Date().setHours(0, 0, 0, 0);

    console.log('[useGoogleFit] Fetching data from Google Fit API...');
    console.log('[useGoogleFit] Time range: ', new Date(startOfDay).toISOString(), ' - ', new Date(now).toISOString());

    const res = await fetch(
      "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aggregateBy: [
            { dataTypeName: "com.google.step_count.delta" },
            { dataTypeName: "com.google.calories.expended" },
            { dataTypeName: "com.google.active_minutes" },
            { dataTypeName: "com.google.heart_rate.bpm" },
            { dataTypeName: "com.google.sleep.segment" },
          ],
          bucketByTime: { durationMillis: 86400000 },
          startTimeMillis: startOfDay,
          endTimeMillis: now,
        }),
      },
    );

    if (!res.ok) {
      console.error('[useGoogleFit] API Error:', res.status, res.statusText);
      throw new Error(`Google Fit API Error: ${res.status}`);
    }

    const data = await res.json();
    console.log('[useGoogleFit] Raw API response:', JSON.stringify(data, null, 2));

    let steps = 0;
    let calories = 0;
    let googleExerciseMinutes = 0;
    let sleepMinutes = 0;
    let heartRateSum = 0;
    let heartRateCount = 0;

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
        if (ds.dataSourceId.includes("calories.expended")) {
          ds.point.forEach((p: any) => {
            if (p.value && p.value.length > 0) {
              const calVal = p.value[0].fpVal || 0;
              console.log('[useGoogleFit] Found calories:', calVal);
              calories += calVal;
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
              const bpm = p.value[0].fpVal ?? p.value[0].intVal;
              if (typeof bpm === "number" && Number.isFinite(bpm) && bpm > 0) {
                heartRateSum += bpm;
                heartRateCount += 1;
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

            sleepMinutes += mins;
          });
        }
      });
    } else {
      console.warn('[useGoogleFit] ⚠️ No bucket data returned! Empty day or API issue.');
    }

    const heartRate = heartRateCount > 0 ? Math.round(heartRateSum / heartRateCount) : 0;
    const result = {
      steps,
      calories: Math.round(calories),
      googleExerciseMinutes,
      sleepMinutes,
      heartRate,
    };
    console.log('[useGoogleFit] ✅ Final parsed result:', result);
    return result;
  }, [accessToken]);

  return {
    isReady,
    accessToken,
    authorize,
    fetchHealthData,
  };
};
