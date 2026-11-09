"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/lib/supabase/types";

export default function ImageGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const sorted = [...images].sort((a, b) => a.position - b.position);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = sorted[activeIndex];

  if (sorted.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl border bg-surface text-sm text-muted-foreground">
        No image available
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {sorted.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto sm:max-h-[36rem] sm:flex-col sm:overflow-y-auto">
          {sorted.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative size-16 shrink-0 overflow-hidden rounded-lg border-2 bg-surface transition-colors sm:size-20 ${
                index === activeIndex ? "border-primary" : "border-transparent hover:border-border"
              }`}
              aria-label={`Show image ${index + 1}`}
              aria-current={index === activeIndex}
            >
              <Image src={image.url} alt="" fill sizes="80px" className="object-contain p-1.5 mix-blend-multiply" />
            </button>
          ))}
        </div>
      )}

      <div className="relative aspect-square w-full flex-1 overflow-hidden rounded-2xl border bg-surface">
        <Image
          src={active.url}
          alt={productName}
          fill
          sizes="(min-width: 1024px) 50vw, 95vw"
          className="object-contain p-8 mix-blend-multiply sm:p-12"
          priority
        />
      </div>
    </div>
  );
}
