"use client";

import { useEffect, useState } from "react";

// Mounts the instant a route segment suspends (i.e. the moment a click
// registers), unmounts the instant real content replaces it — so it never
// has to know when navigation "finishes." Eases toward 90% and holds there
// rather than claiming to reach 100%, since we can't actually know that.
export default function TopProgressBar() {
  const [width, setWidth] = useState(12);

  useEffect(() => {
    const id = setInterval(() => {
      setWidth((w) => (w < 90 ? w + (90 - w) * 0.15 : w));
    }, 120);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[100] h-1 bg-transparent" aria-hidden>
      <div
        className="h-full bg-primary shadow-[0_0_8px_var(--color-primary)] transition-[width] duration-300 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
