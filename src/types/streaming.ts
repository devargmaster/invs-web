export type ProviderType = 'mux' | 'youtube' | 'vimeo';

export interface StreamingTokenResponse {
  playbackId: string;
  token?: string;
  hlsUrl?: string;
  /** URL de reproducción — HLS para Mux, embed URL para YouTube */
  playbackUrl: string;
  /** El frontend usa esto para elegir el player correcto */
  providerType: ProviderType;
  expiresAt?: string;
}

export interface RecordingTokenResponse {
  playbackId: string;
  token?: string;
  hlsUrl?: string;
  playbackUrl: string;
  providerType: ProviderType;
  thumbnailUrl: string;
}

export interface Recording {
  id: string;
  title: string;
  description: string | null;
  duration: number | null;
  thumbnailUrl: string | null;
  createdAt: string;
  event?: {
    id: string;
    title: string;
    date: string;
  } | null;
}
