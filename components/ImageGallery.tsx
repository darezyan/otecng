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
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-zinc-100 text-sm text-muted-foreground">
        No image available
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-zinc-100">
        <Image
          src={active.url}
          alt={productName}
          fill
          sizes="(min-width: 1024px) 40vw, 90vw"
          className="object-contain p-6"
          priority
        />
      </div>

      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {sorted.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-zinc-100 ${
                index === activeIndex ? "border-primary" : ""
              }`}
              aria-label={`Show image ${index + 1}`}
            >
              <Image src={image.url} alt="" fill sizes="64px" className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
