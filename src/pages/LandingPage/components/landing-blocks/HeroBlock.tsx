import type { LandingBlock } from '../../../../types/landing';

export function HeroBlock({ block }: { block: LandingBlock }) {
  const { eyebrow, title, subtitle, ctaLabel, ctaHref } = block.content;
  const { backgroundImage, overlay, fullBleed, textAlign, textColor } = block.style ?? {};

  return (
    <div
      className={`lb-hero ${fullBleed ? 'lb-hero--fullbleed' : ''}`}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        justifyContent: textAlign === 'center' ? 'center' : 'flex-start',
        textAlign: textAlign === 'center' ? 'center' : 'left',
      }}
    >
      {backgroundImage && (
        <div className="lb-hero__overlay" style={{ background: overlay ?? 'rgba(0,0,0,0.4)' }} />
      )}
      <div className="lb-hero__inner" style={{ color: textColor, margin: textAlign === 'center' ? '0 auto' : undefined }}>
        {eyebrow && <p className="lb-hero__eyebrow">{eyebrow}</p>}
        {title && <h1 className="lb-hero__title">{title}</h1>}
        {subtitle && <p className="lb-hero__subtitle">{subtitle}</p>}
        {ctaLabel && ctaHref && (
          <a className="lb-hero__cta" href={ctaHref}>{ctaLabel}</a>
        )}
      </div>
    </div>
  );
}
