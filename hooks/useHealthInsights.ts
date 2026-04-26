import { useQuery, useMutation } from '@tanstack/react-query';
import { axiosClient } from '../api/axiosClient';

// ── Types ────────────────────────────────────────────────────────────────────

export interface TrendData {
  steps: string;
  calories: string;
  sleep: string;
  heart_rate: string;
}

export interface StatsData {
  steps_avg_7d: number | null;
  steps_std: number | null;
  activity_consistency: number | null;
  sedentary_days: number | null;
  calories_avg: number | null;
}

export interface AdvancedStats {
  heart_rate_avg: number | null;
  resting_hr_avg: number | null;
  karvonen_ratio: number | null;
  sleep_avg_hours: number | null;
  recovery_score: number | null;
  hr_zones: { primary_zone: string; hr_pct_of_max: number } | null;
}

export interface AnalyticsBlock {
  bmi: number | null;
  bmi_category: string | null;
  bmr: number | null;
  tdee: number | null;
  activity_level: string;
  trends: TrendData;
  stats: StatsData;
  advanced: AdvancedStats | null;
}

export interface PredictionBlock {
  horizon_days: number;
  expected_activity_level: string;
  weight_change_risk: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  notes?: string;
}

export interface InsightBlock {
  summary: string;
  insights: string[];
  risks: string[];
  prediction: PredictionBlock | null;
  recommendations: string[];
}

export interface HealthInsightResponse {
  mode: 'BASIC' | 'ADVANCED';
  data_quality: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
  analytics: AnalyticsBlock;
  insight: InsightBlock | null;
  error?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface HealthChatRequest {
  user_profile: {
    age: number;
    gender: number;
    height_cm: number;
    weight_kg: number;
    language: string;
  };
  analytics_context: Record<string, unknown>;
  conversation_history: ChatMessage[];
  message: string;
}

export interface HealthChatResponse {
  reply: string;
  suggested_questions: string[];
}

// ── Query Keys ───────────────────────────────────────────────────────────────

export const HEALTH_INSIGHT_KEYS = {
  all: ['health-insights'] as const,
  insights: () => [...HEALTH_INSIGHT_KEYS.all, 'weekly'] as const,
};

// ── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Fetches the full 7-day AI health insight analysis.
 * Stale time is 60 minutes to avoid hitting Gemini too frequently.
 */
export const useHealthInsights = () => {
  return useQuery<HealthInsightResponse>({
    queryKey: HEALTH_INSIGHT_KEYS.insights(),
    queryFn: async () => {
      const res = await axiosClient.get('/api/v1/bff/mobile/health-insights');
      return res as unknown as HealthInsightResponse;
    },
    staleTime: 60 * 60 * 1000,   // 1 hour
    gcTime: 2 * 60 * 60 * 1000,  // 2 hours cache
    retry: 1,
  });
};

/**
 * Sends a chat message to the health AI coach.
 * Returns the reply and suggested follow-up questions.
 */
export const useHealthChat = () => {
  return useMutation<HealthChatResponse, Error, HealthChatRequest>({
    mutationFn: async (payload: HealthChatRequest) => {
      const res = await axiosClient.post('/api/v1/bff/mobile/health-chat', payload);
      return res as unknown as HealthChatResponse;
    },
  });
};
