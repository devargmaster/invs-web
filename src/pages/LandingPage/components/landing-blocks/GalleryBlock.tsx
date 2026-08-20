import type { LandingBlock } from '../../../../types/landing';

export function GalleryBlock({ block }: { block: LandingBlock }) {
  const images: string[] = block.content.images ?? [];
  const { layout } = block.style ?? {};

  if (images.length === 0) return null;

  return (
    <div className={`lb-gallery ${layout === 'grid' ? 'lb-gallery--grid' : ''}`}>
      {images.map((src, i) => (
        <img key={i} src={src} alt="" className="lb-gallery__img" loading="lazy" />
      ))}
    </div>
  );
}
