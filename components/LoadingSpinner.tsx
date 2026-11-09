// Mounts the instant a route segment suspends (i.e. the moment a click
// registers) and unmounts the instant real content replaces it — gives
// immediate feedback that a click was registered, before the skeleton
// content below it even matters.
export default function LoadingSpinner() {
  return (
    <div className="fixed top-4 right-4 z-[100]" aria-hidden>
      <div className="size-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
    </div>
  );
}
