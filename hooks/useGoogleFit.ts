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

      console.log("GOOGLE FIT ACCESS TOKEN:", tokens.accessToken);
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
          ],
          bucketByTime: { durationMillis: 86400000 },
          startTimeMillis: startOfDay,
          endTimeMillis: now,
        }),
      },
    );

    if (!res.ok) {
      throw new Error(`Google Fit API Error: ${res.status}`);
    }

    const data = await res.json();

    let steps = 0;
    let calories = 0;

    if (data.bucket && data.bucket.length > 0) {
      const dataset = data.bucket[0].dataset;
      dataset.forEach((ds: any) => {
        if (ds.dataSourceId.includes("step_count")) {
          ds.point.forEach((p: any) => {
            if (p.value && p.value.length > 0) {
              steps += p.value[0].intVal || 0;
            }
          });
        }
        if (ds.dataSourceId.includes("calories.expended")) {
          ds.point.forEach((p: any) => {
            if (p.value && p.value.length > 0) {
              calories += p.value[0].fpVal || 0;
            }
          });
        }
      });
    }

    return { steps, calories: Math.round(calories) };
  }, [accessToken]);

  return {
    isReady,
    accessToken,
    authorize,
    fetchHealthData,
  };
};
