import type { LandingBlock } from '../../types/landing';

export function TextBlock({ block }: { block: LandingBlock }) {
  const { heading, body } = block.content;
  const { textAlign, maxWidth } = block.style ?? {};

  return (
    <div className="lb-text" style={{ textAlign, maxWidth, marginLeft: textAlign === 'center' ? 'auto' : undefined, marginRight: textAlign === 'center' ? 'auto' : undefined }}>
      {heading && <h2 className="lb-text__heading">{heading}</h2>}
      {body && <p className="lb-text__body">{body}</p>}
    </div>
  );
}
