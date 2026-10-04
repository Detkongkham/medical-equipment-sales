"use client";

import Image from "next/image";
import { useState } from "react";

export function Gallery({ images, alt, emptyLabel }: { images: string[]; alt: string; emptyLabel: string }) {
  const [active, setActive] = useState(0);
  if (images.length === 0) {
    return <div className="flex aspect-square items-center justify-center rounded-xl bg-slate-50 text-slate-400">{emptyLabel}</div>;
  }
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white">
        <Image src={images[active]} alt={alt} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-2" />
      </div>
      {images.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`${alt} ${i + 1}`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white ${i === active ? "border-brand" : "border-slate-200"}`}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-contain" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
