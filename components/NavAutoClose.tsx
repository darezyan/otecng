"use client";

import { useEffect, useState } from "react";

// The mega-menu panels open purely via CSS :hover / :focus-within (see
// Header.tsx). Clicking a link inside a panel navigates client-side without
// the mouse ever leaving the trigger, so the browser keeps applying :hover
// (and the clicked link keeps focus, keeping :focus-within true too) — the
// panel stays open post-navigation. Remounting on route change isn't
// enough: browsers can re-hit-test :hover onto a freshly mounted node at
// the same cursor position without any pointer movement. So instead: the
// instant a nav link is clicked, force every panel closed via the
// [data-nav-suppressed] CSS override in globals.css, and only lift the
// override once the pointer genuinely moves again.
export default function NavAutoClose({ children }: { children: React.ReactNode }) {
  const [suppressed, setSuppressed] = useState(false);

  useEffect(() => {
    if (!suppressed) return;
    const clear = () => setSuppressed(false);
    window.addEventListener("pointermove", clear, { once: true });
    return () => window.removeEventListener("pointermove", clear);
  }, [suppressed]);

  return (
    <div
      data-nav-suppressed={suppressed || undefined}
      onClickCapture={(e) => {
        if ((e.target as HTMLElement).closest("a")) setSuppressed(true);
      }}
    >
      {children}
    </div>
  );
}
