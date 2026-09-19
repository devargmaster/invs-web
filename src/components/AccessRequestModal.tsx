import { useState } from 'react';
import { accessRequestsService } from '../services/accessRequestsService';
import { ApiError } from '../services/apiClient';
import type { AccessRequest } from '../types/accessRequest';
import './AccessRequestModal.css';

interface AccessRequestModalProps {
  eventId: string;
  onClose: () => void;
  onSent: (request: AccessRequest) => void;
}

export function AccessRequestModal({ eventId, onClose, onSent }: AccessRequestModalProps) {
  const [code, setCode] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const request = await accessRequestsService.create({ eventId, code: code.trim() || undefined, note: note.trim() || undefined });
      onSent(request);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al enviar la solicitud.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="access-request-modal__backdrop" onClick={onClose}>
      <div className="access-request-modal__sheet" onClick={(e) => e.stopPropagation()}>
        <div className="access-request-modal__handle" />

        <h2 className="access-request-modal__title">Tengo código de acceso</h2>
        <p className="access-request-modal__desc">
          Contanos tu código o el motivo (ej. acreditación de prensa) y el equipo de INVS lo revisa a la brevedad. Te avisamos por mail apenas quede aprobado.
        </p>

        <label className="access-request-modal__label">Código (opcional)</label>
        <input
          type="text"
          className="access-request-modal__input"
          placeholder="Ej: PRENSA-2026"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <label className="access-request-modal__label">Nota / medio (opcional)</label>
        <textarea
          className="access-request-modal__textarea"
          placeholder="Ej: La Nación — sección Espectáculos"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        {error && <div className="access-request-modal__error">{error}</div>}

        <button className="access-request-modal__submit" disabled={submitting} onClick={handleSubmit}>
          {submitting ? <span className="btn-spinner" /> : 'Enviar solicitud'}
        </button>

        <button className="access-request-modal__cancel" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}
