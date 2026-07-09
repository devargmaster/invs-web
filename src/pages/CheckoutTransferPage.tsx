import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersService } from '../services/ordersService';
import type { BankTransferInfo } from '../services/ordersService';
import { ApiError } from '../services/apiClient';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';
import './Checkout.css';

export function CheckoutTransferPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bankInfo, setBankInfo] = useState<BankTransferInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ordersService.getBankTransferInfo()
      .then(setBankInfo)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Error cargando datos bancarios.'))
      .finally(() => setLoading(false));
  }, []);

  if (!orderId) return null;

  const handleSubmit = async () => {
    if (!file) return;
    setSubmitting(true);
    setError(null);
    try {
      await ordersService.uploadTransferProof(orderId, file, reference || undefined);
      navigate(`/checkout/confirmacion/${orderId}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al subir el comprobante.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Cargando datos bancarios..." />;

  return (
    <div className="checkout-page">
      <div className="checkout-page__header">
        <span className="checkout-page__step">Pago por transferencia</span>
        <h1 className="checkout-page__title">Datos para transferir</h1>
        <p className="checkout-page__subtitle">
          Tus entradas quedan pendientes hasta que validemos el pago — te avisamos por mail.
        </p>
      </div>

      {bankInfo && (
        <div className="checkout-bank-info">
          <div className="checkout-bank-row">
            <span className="checkout-bank-row__label">Banco</span>
            <span className="checkout-bank-row__value">{bankInfo.bankName}</span>
          </div>
          <div className="checkout-bank-row">
            <span className="checkout-bank-row__label">Titular</span>
            <span className="checkout-bank-row__value">{bankInfo.accountHolder}</span>
          </div>
          <div className="checkout-bank-row">
            <span className="checkout-bank-row__label">CBU</span>
            <span className="checkout-bank-row__value">{bankInfo.cbu}</span>
          </div>
          <div className="checkout-bank-row">
            <span className="checkout-bank-row__label">Alias</span>
            <span className="checkout-bank-row__value">{bankInfo.alias}</span>
          </div>
          <div className="checkout-bank-row">
            <span className="checkout-bank-row__label">CUIT</span>
            <span className="checkout-bank-row__value">{bankInfo.cuit}</span>
          </div>
        </div>
      )}

      <label className="checkout-field-label">Comprobante de transferencia</label>
      <div
        className={`checkout-file-input ${file ? 'checkout-file-input--filled' : ''}`}
        onClick={() => fileInputRef.current?.click()}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        {file ? file.name : 'Tocá para subir una imagen o PDF'}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,application/pdf"
        style={{ display: 'none' }}
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <label className="checkout-field-label">Número de operación (opcional)</label>
      <input
        className="checkout-input"
        placeholder="Ej: 000123456789"
        value={reference}
        onChange={(e) => setReference(e.target.value)}
      />

      {error && <ErrorBanner message={error} />}

      <button
        className="checkout-btn checkout-btn--primary checkout-btn--block"
        onClick={handleSubmit}
        disabled={submitting || !file}
      >
        {submitting ? <span className="checkout-btn-spinner" /> : 'Enviar comprobante'}
      </button>
    </div>
  );
}
