export type LandingBlockType = 'hero' | 'text' | 'gallery' | 'cta' | 'countdown' | 'video';

export interface LandingBlock {
  id: string;
  type: LandingBlockType;
  content: Record<string, any>;
  style?: Record<string, any>;
}

export interface Landing {
  id: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoOgImage?: string | null;
  blocks: LandingBlock[];
  customCss?: string | null;
}
