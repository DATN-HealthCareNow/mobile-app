// Outdoor GPS activity
export const sampleActivity = {
  _id: "65f6a7b8c9d006",
  user_id: "65a1b2c3d4e5f6a7b8c9d001",
  activity_type: "RUNNING",
  source: "IPHONE_SENSORS",
  status: "COMPLETED",
  start_time: "2026-01-22T06:00:00.000Z",
  end_time: "2026-01-22T06:30:00.000Z",
  duration_sec: 1800,
  gps_track_id: "650a1b2c3d4e5f",
  metrics: {
    distance_km: 5.2,
    avg_speed_kmh: 10.4,
    calories_burned: 420,
    elevation_gain_m: 15,
    avg_heart_rate: 145,
  },
};

// Manual (non-GPS) activity with strength details
export const manualActivity = {
  _id: "65f6a7b8c9d007",
  user_id: "65a1b2c3d4e5f6a7b8c9d001",
  activity_type: "GYM",
  source: "MANUAL_ENTRY",
  status: "COMPLETED",
  start_time: "2026-01-21T17:00:00.000Z",
  end_time: "2026-01-21T17:45:00.000Z",
  duration_sec: 2700,
  metrics: {
    calories_burned: 320,
    avg_heart_rate: 130,
  },
  manual_data: {
    intensity: "MEDIUM",
    sets: 4,
    reps: 12,
    weight_kg: 50,
  },
};

// gps_tracks (coordinates)
export const updatedActivity = {
  _id: "650a1b2c3d4e5f",
  activity_id: "65f6a7b8c9d006",
  created_at: "2026-01-22T06:00:01.000Z",
  expires_at: "2026-02-21T06:00:01.000Z",
  coordinates: [
    {
      lat: 10.762622,
      lng: 106.660172,
      timestamp: "2026-01-22T06:00:01Z",
      accuracy_m: 5.0,
      altitude_m: 2.0,
    },
    {
      lat: 10.76295,
      lng: 106.661,
      timestamp: "2026-01-22T06:00:10Z",
      accuracy_m: 4.5,
      altitude_m: 2.1,
    },
  ],
};
