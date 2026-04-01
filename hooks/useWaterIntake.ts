import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  waterIntakeService,
  WaterLogRequest,
  HydrationAggregateDTO,
  WaterLogDTO,
} from '../api/services/waterIntakeService';

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeProgress = (raw: any) => {
  const current = toNumber(raw?.total_today_ml ?? raw?.totalTodayMl ?? raw?.current_amount ?? raw?.currentAmount, 0);
  const goal = toNumber(raw?.goal_ml ?? raw?.goalMl ?? raw?.goal_amount ?? raw?.goalAmount, 0);

  let percent = toNumber(
    raw?.progress_percent ?? raw?.progressPercent ?? raw?.percentage,
    NaN,
  );

  if (!Number.isFinite(percent) && goal > 0) {
    percent = (current / goal) * 100;
  }

  const normalizedPercent = Math.max(0, Math.min(100, Math.round((toNumber(percent, 0)) * 10) / 10));

  return {
    ...raw,
    total_today_ml: current,
    goal_ml: goal,
    progress_percent: normalizedPercent,
    current_amount: current,
    goal_amount: goal,
    percentage: normalizedPercent,
    totalTodayMl: current,
    goalMl: goal,
    progressPercent: normalizedPercent,
  };
};

const normalizeLog = (raw: any): WaterLogDTO => {
  const amount = toNumber(raw?.amount_ml ?? raw?.amountMl, 0);
  const reason = String(raw?.adjustment_reason ?? raw?.adjustmentReason ?? 'Water');
  const timestamp = String(raw?.created_at ?? raw?.createdAt ?? raw?.time ?? new Date().toISOString());

  return {
    ...raw,
    amount_ml: amount,
    amountMl: amount,
    adjustment_reason: reason,
    adjustmentReason: reason,
    created_at: timestamp,
    createdAt: timestamp,
    time: timestamp,
  };
};

const normalizeHydration = (raw: any): HydrationAggregateDTO => {
  const payload = raw?.data ?? raw;
  const progressSource = payload?.progress?.data ?? payload?.progress ?? payload;
  const logsSource = payload?.logs?.data ?? payload?.logs;
  const logs = Array.isArray(logsSource) ? logsSource.map(normalizeLog) : [];

  const normalizedProgress = normalizeProgress(progressSource);
  const currentFromProgress = toNumber(
    normalizedProgress?.total_today_ml ?? normalizedProgress?.totalTodayMl,
    0,
  );
  const currentFromLogs = logs.reduce(
    (sum, item) => sum + toNumber(item?.amount_ml ?? (item as any)?.amountMl, 0),
    0,
  );
  const mergedCurrent = Math.max(currentFromProgress, currentFromLogs);
  const mergedGoal = Math.max(
    toNumber(normalizedProgress?.goal_ml ?? normalizedProgress?.goalMl, 0),
    2500,
  );
  const mergedPercent = mergedGoal > 0 ? (mergedCurrent / mergedGoal) * 100 : 0;

  const progress = normalizeProgress({
    ...normalizedProgress,
    total_today_ml: mergedCurrent,
    goal_ml: mergedGoal,
    progress_percent: mergedPercent,
  });

  return {
    ...payload,
    progress,
    logs,
  };
};

export const WATER_KEYS = {
  all: ['water'] as const,
  hydration: () => [...WATER_KEYS.all, 'hydration'] as const,
  progress: () => [...WATER_KEYS.all, 'progress'] as const,
  logs: () => [...WATER_KEYS.all, 'logs'] as const,
};

export const useWaterProgress = () => {
  return useQuery({
    queryKey: WATER_KEYS.hydration(),
    queryFn: waterIntakeService.get_hydration,
    select: (data) => normalizeHydration(data).progress,
  });
};

export const useWaterLogs = () => {
  return useQuery({
    queryKey: WATER_KEYS.hydration(),
    queryFn: waterIntakeService.get_hydration,
    select: (data) => normalizeHydration(data).logs,
  });
};

export const useLogWater = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WaterLogRequest) => waterIntakeService.log_water(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: WATER_KEYS.hydration() });

      const previousHydration = queryClient.getQueryData(WATER_KEYS.hydration());
      const normalizedPrev = normalizeHydration(previousHydration);

      const prevProgress = normalizedPrev.progress;
      const current = toNumber(prevProgress?.total_today_ml, 0);
      const goal = toNumber(prevProgress?.goal_ml, 2500);
      const nextCurrent = Math.max(0, current + toNumber(data?.amount_ml, 0));
      const nextPercent = goal > 0 ? Math.min(100, (nextCurrent / goal) * 100) : 0;

      const optimisticLog = normalizeLog({
        amount_ml: data?.amount_ml,
        adjustment_reason: data?.adjustment_reason ?? 'Quick Add',
        created_at: new Date().toISOString(),
      });

      queryClient.setQueryData(WATER_KEYS.hydration(), {
        ...normalizedPrev,
        progress: normalizeProgress({
          ...prevProgress,
          total_today_ml: nextCurrent,
          goal_ml: goal,
          progress_percent: nextPercent,
        }),
        logs: [optimisticLog, ...(normalizedPrev.logs ?? [])],
      });

      return { previousHydration };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousHydration) {
        queryClient.setQueryData(WATER_KEYS.hydration(), context.previousHydration);
      }
    },
    onSettled: () => {
      // Đồng bộ lại từ backend để nhất quán nếu core cập nhật trễ.
      queryClient.invalidateQueries({ queryKey: WATER_KEYS.hydration() });
    },
  });
};

export const useUpdateWaterGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WaterLogRequest) => waterIntakeService.update_goal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WATER_KEYS.hydration() });
      queryClient.invalidateQueries({ queryKey: WATER_KEYS.progress() });
    },
  });
};
