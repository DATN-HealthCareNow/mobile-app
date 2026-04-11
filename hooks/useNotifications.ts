import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  notificationService,
  NotificationItem,
  NotificationPageResponse,
} from "../api/services/notificationService";

export const NOTIFICATION_KEYS = {
  all: ["notifications"] as const,
  list: (page = 0, size = 20) => [...NOTIFICATION_KEYS.all, "list", page, size] as const,
  unreadCount: () => [...NOTIFICATION_KEYS.all, "unread-count"] as const,
};

export const useNotifications = (page = 0, size = 20) => {
  return useQuery<NotificationPageResponse>({
    queryKey: NOTIFICATION_KEYS.list(page, size),
    queryFn: () => notificationService.getNotifications(page, size),
  });
};

export const useUnreadNotificationCount = () => {
  return useQuery<number>({
    queryKey: NOTIFICATION_KEYS.unreadCount(),
    queryFn: notificationService.getUnreadCount,
    refetchInterval: 30000,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation<NotificationItem, unknown, string>({
    mutationFn: (notificationId) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, void>({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    },
  });
};
