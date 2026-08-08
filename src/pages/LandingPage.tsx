import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { landingsService } from '../services/landingsService';
import { ApiError } from '../services/apiClient';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { LandingBlockRenderer } from '../components/landing-blocks';
import type { Landing } from '../types/landing';
import './LandingPage.css';

export function LandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [landing, setLanding] = useState<Landing | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    landingsService
      .getBySlug(slug)
      .then(setLanding)
      .catch((e) => {
        if (e instanceof ApiError && e.statusCode === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (landing?.seoTitle) document.title = landing.seoTitle;
    return () => {
      document.title = 'INVS — Eventos y Entradas';
    };
  }, [landing?.seoTitle]);

  if (loading) {
    return (
      <div className="landing-page landing-page--centered">
        <LoadingSpinner text="Cargando..." />
      </div>
    );
  }

  if (notFound || !landing) {
    return (
      <div className="landing-page landing-page--centered">
        <p className="landing-page__not-found">Esta página no existe o ya no está disponible.</p>
      </div>
    );
  }

  return (
    <div className="landing-page">
      {landing.customCss && <style>{landing.customCss}</style>}
      <div className="landing-page__blocks">
        {landing.blocks.map((block) => (
          <LandingBlockRenderer key={block.id} block={block} />
        ))}
      </div>
    </div>
  );
}
