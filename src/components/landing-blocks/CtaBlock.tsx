import type { LandingBlock } from '../../types/landing';

export function CtaBlock({ block }: { block: LandingBlock }) {
  const { label, href } = block.content;
  const { variant = 'primary', align = 'center' } = block.style ?? {};

  if (!label || !href) return null;

  return (
    <div className="lb-cta" style={{ textAlign: align }}>
      <a href={href} className={`lb-cta__btn lb-cta__btn--${variant}`}>{label}</a>
    </div>
  );
}
