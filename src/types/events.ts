export type EventMode = 'PRESENCIAL' | 'STREAMING' | 'HIBRIDO';
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string | null; // puede tener fecha aunque no esté liberado — ver commerciallyReleased
  commerciallyReleased: boolean; // false = "Próximamente", sin venta de entradas, sin importar si ya tiene fecha
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
