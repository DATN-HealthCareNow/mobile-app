// Sleep session sample (matches sleep_sessions schema)
export const SLEEP_SESSION_SAMPLE = {
  _id: "656c7d8e9f0a1b",
  user_id: "65a1b2c3d4e5f6a7b8c9d001",
  mode: "AUTO",
  bedtime_start: "2026-01-21T23:15:00.000Z",
  wakeup_end: "2026-01-22T06:45:00.000Z",
  duration_hours: 7.5,
  efficiency_percent: 88,
  source: "HEALTH_KIT",
  stages: {
    deep_minutes: 95,
    light_minutes: 260,
    rem_minutes: 90,
    awake_minutes: 5,
  },
  heart_rate: {
    avg: 62,
    min: 54,
    max: 78,
  },
};

// Daily steps sample (matches daily_steps schema)
export const DAILY_STEPS_SAMPLE = {
  _id: "656c7d8e9f0a1c",
  user_id: "65a1b2c3d4e5f6a7b8c9d001",
  date: "2026-01-22T00:00:00.000Z",
  steps: 8540,
  source: "PEDOMETER_SENSOR",
  goal_steps: 10000,
  progress_percent: 85.4,
};
