import { apiClient } from './apiClient';
import type { StreamingTokenResponse, RecordingTokenResponse } from '../types/streaming';
import type { RecordingWithAccess } from '../types/content';

export const streamingService = {
  async getLiveToken(eventId: string): Promise<StreamingTokenResponse> {
    return apiClient.get<StreamingTokenResponse>(`/streaming/${eventId}/token`);
  },

  /** Catálogo del Hub — cada item ya viene con `granted`/`availableAccess` calculado. */
  async getRecordings(): Promise<RecordingWithAccess[]> {
    return apiClient.get<RecordingWithAccess[]>('/recordings');
  },

  async getRecordingsByEvent(eventId: string): Promise<RecordingWithAccess[]> {
    return apiClient.get<RecordingWithAccess[]>(`/recordings/by-event/${eventId}`);
  },

  async getRecordingToken(recordingId: string): Promise<RecordingTokenResponse> {
    return apiClient.get<RecordingTokenResponse>(`/recordings/${recordingId}/token`);
  },
};
