export type EventMode = 'PRESENCIAL' | 'STREAMING' | 'HIBRIDO';
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string | null;
  mode: EventMode;
  status: EventStatus;
  coverImageUrl: string;
  maxCapacity: number | null;
  isLive: boolean;
  // Acceso al streaming en vivo — combinable (ver ContentAccessService en el backend)
  liveIsFree: boolean;
  liveIncludedInSubscription: boolean;
  livePriceCents: number | null;
  liveCurrency: string;
  _count?: { tickets: number };
}
