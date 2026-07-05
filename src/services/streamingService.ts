import { apiClient } from './apiClient';
import type { StreamingTokenResponse, RecordingTokenResponse, Recording } from '../types/streaming';

export const streamingService = {
  async getLiveToken(eventId: string): Promise<StreamingTokenResponse> {
    return apiClient.get<StreamingTokenResponse>(`/streaming/${eventId}/token`);
  },

  async getRecordings(): Promise<Recording[]> {
    return apiClient.get<Recording[]>('/recordings');
  },

  async getRecordingsByEvent(eventId: string): Promise<Recording[]> {
    return apiClient.get<Recording[]>(`/recordings/by-event/${eventId}`);
  },

  async getRecordingToken(recordingId: string): Promise<RecordingTokenResponse> {
    return apiClient.get<RecordingTokenResponse>(`/recordings/${recordingId}/token`);
  },
};
