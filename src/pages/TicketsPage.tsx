import { useState, useEffect, useCallback, useMemo } from 'react';
import { ticketsService } from '../services/ticketsService';
import { ordersService } from '../services/ordersService';
import { ApiError } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { QRDisplay } from '../components/QRDisplay';
import { ShareTicketModal } from '../components/ShareTicketModal';
import { formatDate, formatMoney } from '../utils/formatters';
import type { Ticket } from '../types/tickets';
import type { Order, OrderStatus } from '../types/checkout';
import './TicketsPage.css';

type TicketTab = 'proximos' | 'anteriores' | 'reservas';
type Tab = TicketTab | 'pedidos';

function classify(ticket: Ticket): TicketTab {
  if (ticket.status === 'PENDING_PAYMENT') return 'reservas';
  if (ticket.status === 'USED' || ticket.status === 'CANCELLED') return 'anteriores';
  if (ticket.event && new Date(ticket.event.date).getTime() < Date.now()) return 'anteriores';
  return 'proximos';
}

const TAB_LABEL: Record<Tab, string> = {
  proximos: 'Próximos',
  anteriores: 'Anteriores',
  reservas: 'Reservas',
  pedidos: 'Pedidos',
};

const ORDER_STATUS_LABEL: Record<OrderStatus, { label: string; tone: 'ok' | 'warning' | 'muted' }> = {
  PAID: { label: 'Pagada', tone: 'ok' },
  PENDING_PAYMENT: { label: 'Pago pendiente', tone: 'warning' },
  FAILED: { label: 'Falló el pago', tone: 'muted' },
  CANCELLED: { label: 'Cancelada', tone: 'muted' },
};

export function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('proximos');
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [sharingTicket, setSharingTicket] = useState<Ticket | null>(null);
  const [justSentTo, setJustSentTo] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [ticketsData, ordersData] = await Promise.all([
        ticketsService.getMyTickets(),
        ordersService.getMyOrders(),
      ]);
      setTickets(ticketsData);
      setOrders(ordersData);
      setSelected((prev) => (prev ? ticketsData.find((t) => t.id === prev.id) ?? null : null));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error cargando tickets.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const grouped = useMemo(() => {
    const g: Record<TicketTab, Ticket[]> = { proximos: [], anteriores: [], reservas: [] };
    for (const t of tickets) g[classify(t)].push(t);
    return g;
  }, [tickets]);

  const tabCount = (tab: Tab) => (tab === 'pedidos' ? orders.length : grouped[tab].length);

  const handleCancelTransfer = async (transferId: string) => {
    setCancellingId(transferId);
    try {
      await ticketsService.cancelTransfer(transferId);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al cancelar el envío.');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Cargando entradas..." />;
  }

  if (error) {
    return (
      <div className="tickets-page">
        <ErrorBanner message={error} onRetry={load} />
      </div>
    );
  }

  if (tickets.length === 0 && orders.length === 0) {
    return (
      <div className="tickets-page tickets-page--empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="64" height="64" style={{ color: 'var(--color-border)' }}>
          <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
          <path d="M13 5v2" />
          <path d="M13 17v2" />
          <path d="M13 11v2" />
        </svg>
        <p className="tickets-page__empty-text">No tenés entradas todavía.</p>
        <p className="tickets-page__empty-note">Comprá tus entradas desde el detalle de un evento presencial.</p>
      </div>
    );
  }

  const list = activeTab === 'pedidos' ? [] : grouped[activeTab];
  const pendingTransfer = selected?.transfers?.find((t) => t.status === 'PENDING') ?? null;
  const isMine = selected?.holderUserId === user?.id;
  const isUnassignedOfMine = !selected?.holderUserId && selected?.purchaserUserId === user?.id;
  // Se puede compartir una entrada comprada por mí, activa, que no tenga
  // otro dueño (sin asignar o asignada a mí mismo).
  const canShare =
    selected?.purchaserUserId === user?.id &&
    selected?.status === 'ACTIVE' &&
    (!selected?.holderUserId || selected?.holderUserId === user?.id);

  return (
    <div className="tickets-page">
      <h1 className="tickets-page__title">Mis compras</h1>
      <p className="tickets-page__subtitle">
        Tus entradas con código QR están disponibles apenas se confirma el pago — mostralas desde tu celular en la entrada del evento.
      </p>

      <div className="tickets-page__tabbar">
        {(['proximos', 'anteriores', 'reservas', 'pedidos'] as Tab[]).map((tab) => (
          <button
            key={tab}
            className={`tickets-page__tabbtn ${activeTab === tab ? 'tickets-page__tabbtn--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {TAB_LABEL[tab].toUpperCase()}
            {tabCount(tab) > 0 && <span className="tickets-page__tabbtn-count">{tabCount(tab)}</span>}
          </button>
        ))}
      </div>

      {activeTab === 'pedidos' ? (
        orders.length === 0 ? (
          <div className="tickets-page__tab-empty">Todavía no hiciste ninguna compra.</div>
        ) : (
          <div className="tickets-page__orders">
            {orders.map((o) => {
              const status = ORDER_STATUS_LABEL[o.status];
              const ticketCount = o.tickets?.length ?? 0;
              return (
                <article className="order-card" key={o.id}>
                  <header className="order-card__head">
                    <div>
                      <h3 className="order-card__title">{o.event?.title ?? 'Evento'}</h3>
                      <p className="order-card__meta">Compra del {formatDate(o.createdAt)}</p>
                    </div>
                    <span className={`ticket-card__badge ticket-card__badge--${status.tone} order-card__badge`}>
                      {status.label}
                    </span>
                  </header>
                  <ul className="order-card__items">
                    {ticketCount > 0 && (
                      <li className="order-card__item">
                        <span>{ticketCount}× {ticketCount === 1 ? 'Entrada' : 'Entradas'}</span>
                      </li>
                    )}
                    {o.addons?.map((a) => (
                      <li className="order-card__item" key={a.id}>
                        <span>
                          {a.quantity}× {a.addon?.name ?? 'Adicional'}
                          {a.variant ? ` — ${a.variant.label}` : ''}
                        </span>
                        <span className="order-card__price">
                          {formatMoney(a.unitPriceCents * a.quantity, o.currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <footer className="order-card__total">
                    <span>Total</span>
                    <strong>{formatMoney(o.totalCents, o.currency)}</strong>
                  </footer>
                </article>
              );
            })}
          </div>
        )
      ) : list.length === 0 ? (
        <div className="tickets-page__tab-empty">No tenés entradas en "{TAB_LABEL[activeTab]}".</div>
      ) : (
        <div className="tickets-page__grid">
          {list.map((t) => {
            const tPending = t.transfers?.find((tr) => tr.status === 'PENDING');
            const badgeLabel = t.status === 'USED' ? 'Usada'
              : t.status === 'CANCELLED' ? 'Cancelada'
              : t.status === 'PENDING_PAYMENT' ? 'Pago pendiente'
              : tPending ? 'Enviada'
              : !t.holderUserId ? 'Sin asignar'
              : t.category?.name ?? 'Entrada';
            const badgeTone = t.status === 'USED' || t.status === 'CANCELLED' ? 'muted'
              : t.status === 'PENDING_PAYMENT' ? 'warning'
              : 'ok';

            return (
              <article className="ticket-card" key={t.id}>
                <div className="ticket-card__media">
                  {t.event && (
                    <img
                      src={`https://picsum.photos/seed/${t.event.id}/400/240`}
                      alt={t.event.title}
                      className="ticket-card__img"
                      loading="lazy"
                    />
                  )}
                  <span className={`ticket-card__badge ticket-card__badge--${badgeTone}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                    </svg>
                    {badgeLabel}
                  </span>
                </div>
                <div className="ticket-card__body">
                  <h3 className="ticket-card__title">{t.event?.title ?? 'Evento'}</h3>
                  {t.event && <p className="ticket-card__meta">{formatDate(t.event.date)}</p>}
                  {t.event?.location && <p className="ticket-card__meta">📍 {t.event.location}</p>}
                  <button className="ticket-card__cta" onClick={() => setSelected(t)}>
                    Ver entrada
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal de detalle — QR, entrada sin asignar, o estado pendiente/usada */}
      {selected && (
        <div className="ticket-detail__backdrop" onClick={() => setSelected(null)}>
          <div className="ticket-detail__sheet" onClick={(e) => e.stopPropagation()}>
            <div className="ticket-detail__handle" />
            <button className="ticket-detail__close" onClick={() => setSelected(null)} aria-label="Cerrar">×</button>

            {selected.event && (
              <div className="tickets-page__event-card">
                <img
                  src={`https://picsum.photos/seed/${selected.event.id}/400/200`}
                  alt={selected.event.title}
                  className="tickets-page__event-img"
                  loading="lazy"
                />
                <div className="tickets-page__event-info">
                  <h3 className="tickets-page__event-title">{selected.event.title}</h3>
                  <p className="tickets-page__event-meta">{formatDate(selected.event.date)}</p>
                  {selected.event.location && (
                    <p className="tickets-page__event-meta">📍 {selected.event.location}</p>
                  )}
                </div>
              </div>
            )}

            {selected.category && (
              <div className="tickets-page__event-meta" style={{ marginBottom: 10 }}>
                Categoría: {selected.category.name}
              </div>
            )}

            {canShare && pendingTransfer ? (
              <div className="tickets-page__unassigned">
                <div className="tickets-page__pending-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" />
                  </svg>
                  Enviada a {pendingTransfer.toEmail} · pendiente de aceptar
                </div>
                <button
                  className="tickets-page__cancel-btn"
                  onClick={() => handleCancelTransfer(pendingTransfer.id)}
                  disabled={cancellingId === pendingTransfer.id}
                >
                  {cancellingId === pendingTransfer.id ? 'Cancelando...' : 'Cancelar envío'}
                </button>
              </div>
            ) : isUnassignedOfMine && selected.status === 'ACTIVE' ? (
              <div className="tickets-page__unassigned">
                <p className="tickets-page__unassigned-text">Esta entrada todavía no está asignada.</p>
                <button className="tickets-page__share-btn" onClick={() => setSharingTicket(selected)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  Compartir por email
                </button>
              </div>
            ) : (
              <>
                <QRDisplay
                  qrPayload={selected.qrPayload}
                  status={selected.status}
                  usedAt={selected.usedAt}
                  expiresAt={selected.expiresAt}
                />
                {canShare && (
                  <button
                    className="tickets-page__share-btn"
                    style={{ marginTop: 14 }}
                    onClick={() => setSharingTicket(selected)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    ¿No vas vos? Compartila por email
                  </button>
                )}
              </>
            )}

            {!isMine && !isUnassignedOfMine && (
              <div className="tickets-page__event-meta" style={{ marginTop: 10, textAlign: 'center' }}>
                Esta entrada te la compartieron.
              </div>
            )}
          </div>
        </div>
      )}

      {sharingTicket && (
        <ShareTicketModal
          ticketId={sharingTicket.id}
          ticketLabel={sharingTicket.category?.name ?? 'entrada'}
          onClose={() => setSharingTicket(null)}
          onSent={() => {
            setJustSentTo(sharingTicket.id);
            setSharingTicket(null);
            load();
            setTimeout(() => setJustSentTo(null), 4000);
          }}
        />
      )}

      {justSentTo && (
        <div className="tickets-page__toast">
          <svg viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5" width="18" height="18">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          ¡Entrada enviada!
        </div>
      )}
    </div>
  );
}
