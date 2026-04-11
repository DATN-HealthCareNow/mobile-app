import { useEffect, useRef } from "react";
import * as SecureStore from "expo-secure-store";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useQueryClient } from "@tanstack/react-query";
import { useUIStore } from "../store/uiStore";
import { axiosClient } from "../api/axiosClient";
import { notificationService } from "../api/services/notificationService";
import { NOTIFICATION_KEYS } from "./useNotifications";

type RealtimeNotificationMessage = {
  eventType?: string;
  deliveredAt?: string;
  notification?: {
    userId?: string;
    notificationId?: string;
    type?: string;
    title?: string;
    content?: string;
    status?: string;
    priority?: string;
    language?: string;
    createdAt?: string;
    sentAt?: string;
  };
  type?: string;
  timestamp?: string;
};

const resolveWebSocketUrl = (userId?: string | null) => {
  const baseUrl = axiosClient.defaults.baseURL;
  if (!baseUrl || !userId) {
    return null;
  }

  return `${baseUrl.replace(/^http/i, "ws")}/api/v1/bff/mobile/ws?userId=${encodeURIComponent(userId)}`;
};

export const useRealtimeNotifications = (token: string | null, userId: string | null) => {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncedPushTokenRef = useRef<string | null>(null);
  const { showAlert } = useUIStore();
  const queryClient = useQueryClient();

  const resolveExpoProjectId = () => {
    const easProjectId = (Constants.expoConfig?.extra as any)?.eas?.projectId;
    const easConfigProjectId = (Constants as any)?.easConfig?.projectId;
    return easProjectId || easConfigProjectId || undefined;
  };

  const registerAndSyncPushToken = async () => {
    try {
      if (!token || !userId) {
        return;
      }

      if (Notifications.setNotificationChannelAsync) {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
        });
      }

      const permission = await Notifications.requestPermissionsAsync();
      if (permission.status !== "granted") {
        return;
      }

      const expoProjectId = resolveExpoProjectId();
      const pushTokenResponse = expoProjectId
        ? await Notifications.getExpoPushTokenAsync({ projectId: expoProjectId })
        : await Notifications.getExpoPushTokenAsync();

      const pushToken = pushTokenResponse?.data;
      if (!pushToken || pushToken === lastSyncedPushTokenRef.current) {
        return;
      }

      await axiosClient.post("/api/v1/users/device-token", {
        device_token: pushToken,
      });
      lastSyncedPushTokenRef.current = pushToken;
      if (__DEV__) {
        console.log("[realtime-notifications] synced expo push token");
      }
    } catch (error) {
      console.warn("[realtime-notifications] failed to register push token", error);
    }
  };

  const bootstrapNotificationPreferences = async () => {
    try {
      if (!token || !userId) {
        return;
      }
      await notificationService.getPreferences();
    } catch (error) {
      console.warn("[realtime-notifications] failed to bootstrap preferences", error);
    }
  };

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    Notifications.requestPermissionsAsync().catch(() => null);
  }, []);

  useEffect(() => {
    registerAndSyncPushToken().catch(() => null);
    bootstrapNotificationPreferences().catch(() => null);
  }, [token, userId]);

  useEffect(() => {
    const wsUrl = resolveWebSocketUrl(userId);

    if (!token || !userId || !wsUrl) {
      return;
    }

    let isCancelled = false;

    const connect = async () => {
      const currentToken = await SecureStore.getItemAsync("accessToken");
      const currentUserId = await SecureStore.getItemAsync("userId");

      if (isCancelled || !currentToken || !currentUserId) {
        return;
      }

      try {
        const socket = new WebSocket(wsUrl);

        socketRef.current = socket;

        socket.onopen = () => {
          if (__DEV__) {
            console.log("[realtime-notifications] websocket connected");
          }
        };

        socket.onmessage = (event: MessageEvent) => {
          try {
            const message = JSON.parse(String(event.data)) as RealtimeNotificationMessage;
            const notification = message.notification;

            if (!notification || notification.userId !== currentUserId) {
              return;
            }

            showAlert(
              notification.title || "Nhắc nhở uống nước",
              notification.content || "Bạn có một thông báo mới.",
            );

            Notifications.scheduleNotificationAsync({
              content: {
                title: notification.title || "Thông báo mới",
                body: notification.content || "Bạn có thông báo mới.",
                data: {
                  type: "realtime_notification",
                  notificationId: notification.notificationId,
                },
              },
              trigger: null,
            }).catch(() => null);

            queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
          } catch (error) {
            console.warn("[realtime-notifications] failed to parse message", error);
          }
        };

        socket.onerror = (error: unknown) => {
          if (__DEV__) {
            console.log("[realtime-notifications] websocket error", error);
          }
        };

        socket.onclose = () => {
          socketRef.current = null;
          if (!isCancelled) {
            reconnectTimerRef.current = setTimeout(connect, 5000);
          }
        };
      } catch (error) {
        if (__DEV__) {
          console.log("[realtime-notifications] websocket init failed", error);
        }
      }
    };

    connect();

    return () => {
      isCancelled = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [queryClient, showAlert, token, userId]);
};