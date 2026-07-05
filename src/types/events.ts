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
  coverImageUrl: string | null;
  maxCapacity: number | null;
  isLive: boolean;
  _count?: { tickets: number };
}
