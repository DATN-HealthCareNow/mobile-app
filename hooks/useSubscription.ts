import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../api/axiosClient';

export interface SubscriptionStatus {
  plan: string;
  is_premium: boolean;
  subscription_start_date: string | null;
  ai_chat_daily_tokens_used: number;
  ai_chat_daily_token_limit: number;
  ai_meals_generated_today: number;
  ai_meals_daily_limit: number;
  ai_predict_used_today: number;
  ai_predict_daily_limit: number;
  medical_scans_total: number;
  medical_scans_limit: number;
}

export interface CreateOrderResponse {
  order_code: number;
  checkout_url: string;
  qr_code: string;
  status: string;
}

export const SUBSCRIPTION_KEYS = {
  all: ['subscription'] as const,
  status: () => [...SUBSCRIPTION_KEYS.all, 'status'] as const,
};

export const useSubscriptionStatus = () => {
  return useQuery<SubscriptionStatus>({
    queryKey: SUBSCRIPTION_KEYS.status(),
    queryFn: async () => {
      return await axiosClient.get('/api/v1/subscription/status');
    },
  });
};

export const useCreateSubscriptionOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { plan: string; amount: number; return_url?: string; cancel_url?: string }) => {
      return await axiosClient.post<CreateOrderResponse>('/api/v1/subscription/create-order', data);
    },
  });
};

export const useVerifyOrder = () => {
  return useMutation({
    mutationFn: async (orderCode: number) => {
      return await axiosClient.get<CreateOrderResponse>(`/api/v1/subscription/verify/${orderCode}`);
    },
  });
};

export const useManualUpgrade = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return await axiosClient.post('/api/v1/subscription/manual-upgrade');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_KEYS.status() });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
