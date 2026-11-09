"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Horizontal product rail: native swipe/scroll on touch, round prev/next
// buttons on desktop (hidden when there's nothing further in that direction).
export default function RailScroller({ children, label }: { children: React.ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  const arrow =
    "absolute top-[38%] z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-md transition-opacity hover:bg-zinc-50 md:flex";

  return (
    <div className="relative">
      <div
        ref={ref}
        role="region"
        aria-label={label}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 sm:mx-0 sm:gap-4 sm:px-0"
      >
        {children}
      </div>
      <button
        type="button"
        aria-label="Previous"
        onClick={() => scrollBy(-1)}
        className={`${arrow} -left-5 ${canPrev ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={() => scrollBy(1)}
        className={`${arrow} -right-5 ${canNext ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
