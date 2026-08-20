import { StreamPlayer } from '../../../../components/StreamPlayer';
import type { LandingBlock } from '../../../../types/landing';

export function VideoBlock({ block }: { block: LandingBlock }) {
  const { playbackUrl, providerType, title } = block.content;
  if (!playbackUrl) return null;

  return (
    <div className="lb-video">
      <StreamPlayer playbackUrl={playbackUrl} providerType={providerType} type="replay" title={title} />
    </div>
  );
}
