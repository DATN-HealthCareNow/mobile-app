import "@/app/global.css";
import {
  focusManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
  View,
} from "react-native";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { useSession } from "../hooks/useAuth";
import { GlobalUI } from "../components/GlobalUI";

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
      refetchOnMount: "always", // Luôn refetch khi component mount
      refetchOnReconnect: true,
      staleTime: 0, // Data luôn được coi là stale, cần refetch
      gcTime: 0, // Không cache data khi query inactive
    },
  },
});

function RootLayoutNav() {
  const { token, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();
  const { mode } = useTheme();

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
