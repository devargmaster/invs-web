import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { ticketsService } from '../services/ticketsService';
import { ApiError } from '../services/apiClient';
import { QRScanner } from '../components/QRScanner';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { RedeemableAddon } from '../types/tickets';
import './ScannerPage.css';

export function ScannerPage() {
  const { user } = useAuth();
  const [scannedValue, setScannedValue] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string; detail?: string } | null>(null);
  const [addons, setAddons] = useState<RedeemableAddon[]>([]);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  // Solo staff/admin pueden ver esto
  if (user && user.role === 'USER') {
    return (
      <div className="scanner-page scanner-page--locked">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{ color: 'var(--color-border)' }}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <h2 className="scanner-page__title">Acceso restringido</h2>
        <p className="scanner-page__note">Esta sección es solo para personal de INVS.</p>
      </div>
    );
  }

  const handleScan = useCallback(async (data: string) => {
    if (scannedValue) return;
    setScannedValue(data);
    setValidating(true);
    setResult(null);
    try {
      const res = await ticketsService.validateQr(data);
      setResult({
        ok: true,
        message: '✅ ACCESO PERMITIDO',
        detail: res.ticket ? `${res.ticket.attendee} — ${res.ticket.event}` : undefined,
      });
      setAddons(res.addons ?? []);
    } catch (e) {
      if (e instanceof ApiError) {
        const isUsed = e.statusCode === 409;
        setResult({
          ok: false,
          message: isUsed ? '⛔ QR YA UTILIZADO' : '❌ ACCESO DENEGADO',
          detail: e.message,
        });
      } else {
        setResult({ ok: false, message: '❌ Error de conexión', detail: 'Verificá la red.' });
      }
    } finally {
      setValidating(false);
    }
  }, [scannedValue]);

  const reset = () => {
    setScannedValue(null);
    setResult(null);
    setAddons([]);
  };

  const handleRedeem = async (orderAddonId: string) => {
    setRedeemingId(orderAddonId);
    try {
      const updated = await ticketsService.redeemAddon(orderAddonId);
      setAddons((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch (e) {
      if (e instanceof ApiError) {
        // Otro staff pudo haber entregado en simultáneo: refrescamos ese ítem a "sin pendientes".
        setAddons((prev) => prev.map((a) => (a.id === orderAddonId ? { ...a, pending: 0, redeemedCount: a.quantity } : a)));
      }
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <div className="scanner-page">
      <h1 className="scanner-page__title">Escáner Staff</h1>

      {!scannedValue && (
        <QRScanner onScan={handleScan} active={!scannedValue} />
      )}

      {validating && (
        <div className="scanner-page__result-box">
          <LoadingSpinner text="Validando contra el servidor..." size="md" />
        </div>
      )}

      {result && (
        <div className={`scanner-page__result-box scanner-page__result-box--${result.ok ? 'ok' : 'fail'}`}>
          <h2 className={`scanner-page__result-title ${result.ok ? 'scanner-page__result-title--ok' : 'scanner-page__result-title--fail'}`}>
            {result.message}
          </h2>
          {result.detail && (
            <p className="scanner-page__result-detail">{result.detail}</p>
          )}

          {result.ok && addons.length > 0 && (
            <div className="scanner-page__addons">
              <h3 className="scanner-page__addons-title">🎁 Adicionales de la compra</h3>
              {addons.map((a) => (
                <div className="scanner-page__addon-row" key={a.id}>
                  <span className="scanner-page__addon-name">
                    {a.name}
                    {a.variant ? ` — ${a.variant}` : ''}
                    <span className="scanner-page__addon-count">
                      {a.pending > 0 ? ` · ${a.pending} de ${a.quantity} sin entregar` : ' · todo entregado'}
                    </span>
                  </span>
                  {a.pending > 0 && (
                    <button
                      className="scanner-page__addon-btn"
                      onClick={() => handleRedeem(a.id)}
                      disabled={redeemingId === a.id}
                    >
                      {redeemingId === a.id ? 'Entregando...' : 'Entregar 1'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <button className="scanner-page__btn" onClick={reset}>
            Escanear otro
          </button>
        </div>
      )}
    </div>
  );
}
