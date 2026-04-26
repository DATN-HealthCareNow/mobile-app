import "@/app/global.css";
import {
  focusManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
  View,
} from "react-native";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { useSession } from "../hooks/useAuth";
import { GlobalUI } from "../components/GlobalUI";
import { useRealtimeNotifications } from "../hooks/useRealtimeNotifications";
import { useLocationTracker } from "../hooks/useLocationTracker";
import * as Notifications from "expo-notifications";

// Cấu hình React Query refetch khi app từ background quay lại foreground
focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener(
    "change",
    (state: AppStateStatus) => {
      handleFocus(state === "active");
    },
  );
  return () => subscription.remove();
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: true,
      staleTime: 1000 * 60 * 2, // Default stale for 2 minutes
    },
  },
});

function RootLayoutNav() {
  const { token, userId, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();
  const { mode } = useTheme();

  useRealtimeNotifications(token, userId);
  useLocationTracker(token, userId);

  const handleNotificationNavigation = useCallback(
    (rawData: Record<string, unknown> | null | undefined) => {
      if (!rawData) {
        return;
      }

      const data = rawData as {
        type?: string;
        alarmId?: string;
        screen?: string;
        eventType?: string;
        recordId?: string;
      };

      if (data.type === "sleep_alarm" && data.alarmId) {
        router.push(`/screen/sleep_alarm?alarmId=${data.alarmId}` as any);
        return;
      }

      if (data.screen === "hydration" || data.eventType === "WATER_REMINDER") {
        router.push("/screen/hydration" as any);
        return;
      }

      if (data.screen === "activity" || data.eventType === "LOW_EXERCISE_REMINDER" || data.eventType === "ACTIVITY_REMINDER") {
        router.push("/(tabs)/activity" as any);
        return;
      }

      if (data.screen === "notifications") {
        router.push("/screen/notifications" as any);
        return;
      }

      if (data.screen === "articles" || data.eventType === "NEW_ARTICLE_PUBLISHED") {
        router.push("/screen/article_list" as any);
        return;
      }

      if (data.screen === "medication_schedule" && data.recordId) {
        router.push({ pathname: '/screen/medication_schedule', params: { recordId: data.recordId } } as any);
        return;
      }
    },
    [router],
  );

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inScreenGroup = segments[0] === "screen";

    console.log(
      "[RootLayout] Token:",
      token ? "Exists" : "None",
      "Loading:",
      isLoading,
      "Segment:",
      segments[0],
    );

    if (!token && !inAuthGroup && !inScreenGroup) {
      router.replace("/(auth)/login");
    } else if (token && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [token, isLoading, segments, router]);

  useEffect(() => {
    const foregroundSub = Notifications.addNotificationReceivedListener(notification => {
      handleNotificationNavigation(notification.request.content.data as Record<string, unknown>);
    });
    
    const responseSub = Notifications.addNotificationResponseReceivedListener(response => {
      handleNotificationNavigation(response.notification.request.content.data as Record<string, unknown>);
    });

    return () => {
      foregroundSub.remove();
      responseSub.remove();
    };
  }, [handleNotificationNavigation]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: mode === "dark" ? "#0B1120" : "#F8FAFC",
        }}
      >
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
        <Stack.Screen
          name="screen/hydration"
          options={{ presentation: "modal" }}
        />
        <Stack.Screen name="screen/sleep" options={{ presentation: "modal" }} />
        <Stack.Screen
          name="screen/meal_schedule"
          options={{ presentation: "modal" }}
        />
        <Stack.Screen
          name="screen/notifications"
          options={{ presentation: "modal" }}
        />
      </Stack>
      <GlobalUI />
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
