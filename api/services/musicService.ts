import { axiosClient } from '../axiosClient';
import * as FileSystem from 'expo-file-system';

export interface MusicUploadRequest {
  fileName: string;
  fileData: string; // Base64 encoded
  contentType: string;
}

export interface MusicUploadResponse {
  id: string;
  fileUrl: string;
  fileName: string;
  uploadedAt: string;
  size: number;
}

export interface MusicFile {
  id: string;
  fileName: string;
  fileUrl: string;
  size: number;
  uploadedAt: string;
}

export const musicService = {
  // Upload music file to backend (which then uploads to S3)
  uploadMusic: async (fileUri: string, fileName: string): Promise<MusicUploadResponse> => {
    try {
      // Read file as base64
      const fileData = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'base64',
      });

      // Get file size from URI info
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      const fileSize = (fileInfo as any)?.size || 0;

      const uploadRequest: MusicUploadRequest = {
        fileName,
        fileData,
        contentType: 'audio/mpeg',
      };

      // Upload to backend API endpoint
      const response = await axiosClient.post<MusicUploadResponse>(
        '/api/v1/music/upload',
        uploadRequest,
        {
          timeout: 30000, // 30 seconds timeout for large files
        }
      );

      // Extract data from response
      return response?.data || response;
    } catch (error) {
      console.error('Error uploading music:', error);
      throw new Error('Failed to upload music file');
    }
  },

  // Get list of uploaded music files
  getMyMusic: async (): Promise<MusicFile[]> => {
    try {
      const response = await axiosClient.get<MusicFile[]>('/api/v1/music/my-music');
      return response?.data || response;
    } catch (error) {
      console.error('Error fetching music files:', error);
      throw new Error('Failed to fetch music files');
    }
  },

  // Delete music file
  deleteMusic: async (musicId: string): Promise<void> => {
    try {
      await axiosClient.delete(`/api/v1/music/${musicId}`);
    } catch (error) {
      console.error('Error deleting music:', error);
      throw new Error('Failed to delete music file');
    }
  },

  // Get signed URL for streaming (if needed)
  getMusicStreamUrl: async (musicId: string): Promise<string> => {
    try {
      const response = await axiosClient.get<{ streamUrl: string }>(
        `/api/v1/music/${musicId}/stream-url`
      );
      return response?.data?.streamUrl || '';
    } catch (error) {
      console.error('Error getting stream URL:', error);
      throw new Error('Failed to get stream URL');
    }
  },
};
