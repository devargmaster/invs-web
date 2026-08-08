import type { ComponentType } from 'react';
import type { LandingBlock, LandingBlockType } from '../../types/landing';
import { HeroBlock } from './HeroBlock';
import { TextBlock } from './TextBlock';
import { GalleryBlock } from './GalleryBlock';
import { CtaBlock } from './CtaBlock';
import { CountdownBlock } from './CountdownBlock';
import { VideoBlock } from './VideoBlock';
import './LandingBlocks.css';

// Agregar un tipo de bloque nuevo = un componente acá + sumarlo al mapa.
// Un `type` que llegue sin match (dato viejo, catálogo cambiado) no rompe
// el resto de la landing — ese bloque puntual simplemente no renderiza nada.
const BLOCK_COMPONENTS: Record<LandingBlockType, ComponentType<{ block: LandingBlock }>> = {
  hero: HeroBlock,
  text: TextBlock,
  gallery: GalleryBlock,
  cta: CtaBlock,
  countdown: CountdownBlock,
  video: VideoBlock,
};

export function LandingBlockRenderer({ block }: { block: LandingBlock }) {
  const Component = BLOCK_COMPONENTS[block.type];
  if (!Component) return null;
  return <Component block={block} />;
}
