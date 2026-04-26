import { axiosClient } from "../axiosClient";

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  eventId?: string;
  title: string;
  content: string;
  status: string;
  priority?: string;
  isRead: boolean;
  createdAt?: string;
  sentAt?: string;
  readAt?: string;
}

export interface NotificationPageResponse {
  content: NotificationItem[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface UnreadCountResponse {
  userId: string;
  unreadCount: number;
}

export interface NotificationPreferences {
  userId: string;
  allNotificationsEnabled: boolean;
  preferredLanguage?: string;
  timezone?: string;
  pushEnabled?: boolean;
  emailEnabled?: boolean;
  inAppEnabled?: boolean;
  enabledEventTypes?: Record<string, boolean>;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  quietHoursEnabled?: boolean;
  maxNotificationsPerHour?: number;
}

const normalizeItem = (raw: any): NotificationItem => ({
  id: String(raw?.id ?? ""),
  userId: String(raw?.userId ?? raw?.user_id ?? ""),
  type: String(raw?.type ?? "IN_APP"),
  eventId: raw?.eventId ?? raw?.event_id,
  title: String(raw?.title ?? "Thông báo"),
  content: String(raw?.content ?? ""),
  status: String(raw?.status ?? "SENT"),
  priority: raw?.priority ? String(raw.priority) : undefined,
  isRead: Boolean(raw?.isRead ?? raw?.is_read ?? false),
  createdAt: raw?.createdAt ?? raw?.created_at,
  sentAt: raw?.sentAt ?? raw?.sent_at,
  readAt: raw?.readAt ?? raw?.read_at,
});

export const notificationService = {
  getNotifications: async (page = 0, size = 20): Promise<NotificationPageResponse> => {
    const response = await axiosClient.get(`/api/v1/bff/mobile/notifications?page=${page}&size=${size}`);
    const payload = response?.data ?? response;

    return {
      content: Array.isArray(payload?.content) ? payload.content.map(normalizeItem) : [],
      totalElements: Number(payload?.totalElements ?? 0),
      totalPages: Number(payload?.totalPages ?? 0),
      size: Number(payload?.size ?? size),
      number: Number(payload?.number ?? page),
    };
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await axiosClient.get("/api/v1/bff/mobile/notifications/unread-count");
    const payload: UnreadCountResponse = response?.data ?? response;
    return Number(payload?.unreadCount ?? 0);
  },

  markAsRead: async (notificationId: string): Promise<NotificationItem> => {
    const response = await axiosClient.patch(`/api/v1/bff/mobile/notifications/${notificationId}/read`);
    const payload = response?.data ?? response;
    return normalizeItem(payload);
  },

  markAllAsRead: async (): Promise<void> => {
    await axiosClient.patch("/api/v1/bff/mobile/notifications/read-all");
  },

  getPreferences: async (): Promise<NotificationPreferences> => {
    const response = await axiosClient.get("/api/v1/bff/mobile/notifications/preferences");
    const payload = response?.data ?? response;
    return payload as NotificationPreferences;
  },

  updatePreferences: async (
    data: Partial<NotificationPreferences>,
  ): Promise<NotificationPreferences> => {
    const response = await axiosClient.patch("/api/v1/bff/mobile/notifications/preferences", data);
    const payload = response?.data ?? response;
    return payload as NotificationPreferences;
  },

  testExercise: async (): Promise<void> => {
    await axiosClient.post("/api/v1/bff/mobile/notifications/test-exercise");
  },
};
