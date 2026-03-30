import { axiosClient } from '../axiosClient';

export interface GpsPoint {
  lat: number;
  lng: number;
  acc?: number;
  speed?: number;
  ts: string;
}

export interface GpsBatchRequest {
  points: GpsPoint[];
}

export interface GpsTrack {
  id: string;
  activity_id: string;
  user_id: string;
  points: GpsPoint[];
  [key: string]: any;
}

export const gpsTrackService = {
  batch_points: async (activityId: string, data: GpsBatchRequest): Promise<void> => {
    return axiosClient.post(`/api/v1/gps-tracks/${activityId}/batch`, data);
  },

  get_track: async (activityId: string): Promise<GpsTrack> => {
    return axiosClient.get(`/api/v1/gps-tracks/${activityId}`);
  }
};
