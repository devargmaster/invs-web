import { useState, useMemo } from 'react';
import { ticketsService } from '../services/ticketsService';
import { ApiError } from '../services/apiClient';
import './ShareTicketModal.css';

interface ShareTicketModalProps {
  ticketId: string;
  ticketLabel: string;
  onClose: () => void;
  onSent: () => void;
}

export function ShareTicketModal({ ticketId, ticketLabel, onClose, onSent }: ShareTicketModalProps) {
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedA = email.trim().toLowerCase();
  const normalizedB = confirmEmail.trim().toLowerCase();
  const bothFilled = normalizedA.length > 0 && normalizedB.length > 0;
  const emailsMatch = bothFilled && normalizedA === normalizedB;
  const showMismatch = bothFilled && !emailsMatch;

  const canSubmit = useMemo(() => emailsMatch && /\S+@\S+\.\S+/.test(normalizedA), [emailsMatch, normalizedA]);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await ticketsService.createTransfer(ticketId, normalizedA);
      onSent();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al compartir la entrada.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="share-modal__backdrop" onClick={onClose}>
      <div className="share-modal__sheet" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal__handle" />

        <h2 className="share-modal__title">Compartir {ticketLabel}</h2>
        <p className="share-modal__desc">
          Enviamos la entrada al email indicado. La persona la acepta desde su cuenta INVS.
        </p>

        <label className="share-modal__label">Email del destinatario</label>
        <div className="share-modal__input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M4 4h16v16H4z" opacity="0" />
            <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6Z" />
            <path d="m22 6-10 7L2 6" />
          </svg>
          <input
            type="email"
            className="share-modal__input"
            placeholder="lucia.perez@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <label className="share-modal__label">Confirmar email</label>
        <div className={`share-modal__input-wrap ${bothFilled ? (emailsMatch ? 'share-modal__input-wrap--ok' : 'share-modal__input-wrap--error') : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            {bothFilled ? (
              emailsMatch ? <polyline points="20 6 9 17 4 12" /> : (
                <>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </>
              )
            ) : (
              <>
                <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6Z" />
                <path d="m22 6-10 7L2 6" />
              </>
            )}
          </svg>
          <input
            type="email"
            className="share-modal__input"
            placeholder="Repetí el email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
          />
        </div>

        {bothFilled && (
          <div className={`share-modal__match ${emailsMatch ? 'share-modal__match--ok' : 'share-modal__match--error'}`}>
            {emailsMatch ? '✓ Los emails coinciden' : '✗ Los emails no coinciden'}
          </div>
        )}

        {error && <div className="share-modal__error">{error}</div>}
        {showMismatch && !error && null}

        <button
          className="share-modal__submit"
          disabled={!canSubmit || submitting}
          onClick={handleSubmit}
        >
          {submitting ? (
            <span className="share-modal__spinner" />
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Enviar entrada
            </>
          )}
        </button>

        <button className="share-modal__cancel" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}
