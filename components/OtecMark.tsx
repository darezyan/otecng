// The OTEC Electronics mark (arched "H" under a split crescent), redrawn as
// a vector from the company logo so it stays crisp at favicon sizes.
// Inherits colour from `currentColor`.
export const OTEC_MARK_VIEWBOX = "0 0 227 304";

export function OtecMarkPaths() {
  return (
    <>
      {/* Top crescent, split in two by the centre gap */}
      <path d="M0 0H75V57.5Q37 43 0 2Z" />
      <path d="M152 0H227V2Q190 43 152 57.5Z" />
      {/* Body: concave top, arched doorway cut from the bottom */}
      <path d="M0 74Q113.5 148 227 74V304H152V194Q113.5 180 75 194V304H0Z" />
    </>
  );
}

export default function OtecMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox={OTEC_MARK_VIEWBOX}
      fill="currentColor"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <OtecMarkPaths />
    </svg>
  );
}
