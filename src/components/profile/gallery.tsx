"use client";

import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import type { InstallerPhoto } from "@/lib/types";
import { cn } from "@/lib/utils";

const control =
  "inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20";

/**
 * Up to three photo tiles (one large, two small) that open a lightbox built on
 * the native <dialog>: focus trapping and Escape come from the browser. Without
 * JavaScript each tile is a plain link to its image.
 */
export function Gallery({
  photos,
  name,
}: {
  photos: InstallerPhoto[];
  name: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<number | null>(null);

  if (photos.length === 0) return null;

  const count = photos.length;
  const tiles = photos.slice(0, 3);
  const altFor = (index: number) =>
    photos[index].alt || `${name}: photo ${index + 1} of ${count}`;

  const open = (index: number) => {
    setActive(index);
    dialogRef.current?.showModal();
    document.documentElement.style.overflow = "hidden";
  };
  const step = (delta: number) =>
    setActive((current) =>
      current === null ? current : (current + delta + count) % count,
    );

  return (
    <div className="relative">
      <ul
        className={cn(
          "grid gap-3",
          tiles.length === 1 && "aspect-[752/456]",
          tiles.length === 2 && "aspect-[752/370] grid-cols-2",
          tiles.length === 3 && "aspect-[752/456] grid-cols-3 grid-rows-2",
        )}
      >
        {tiles.map((photo, index) => (
          <li
            key={photo.id}
            className={cn(
              "relative overflow-hidden rounded-lg bg-mint-soft",
              tiles.length === 3 && index === 0 && "col-span-2 row-span-2",
            )}
          >
            <a
              href={photo.url}
              aria-haspopup="dialog"
              onClick={(event) => {
                event.preventDefault();
                open(index);
              }}
              className="block size-full"
            >
              <Image
                src={photo.url}
                alt={altFor(index)}
                fill
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                sizes={
                  index === 0 && tiles.length !== 2
                    ? "(min-width: 1024px) 500px, 66vw"
                    : "(min-width: 1024px) 250px, 50vw"
                }
                className="object-cover transition-transform duration-300 hover:scale-[1.02]"
              />
            </a>
          </li>
        ))}
      </ul>

      {count > tiles.length ? (
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => open(0)}
          className="absolute right-2 bottom-2 inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-xs font-medium text-ink shadow-soft transition-colors hover:bg-surface sm:right-3 sm:bottom-3 sm:h-8"
        >
          <Images aria-hidden className="size-3.5" strokeWidth={1.75} />
          View all photos ({count})
        </button>
      ) : null}

      <dialog
        ref={dialogRef}
        aria-label={`Photos from ${name}`}
        onClose={() => {
          setActive(null);
          document.documentElement.style.overflow = "";
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") step(-1);
          if (event.key === "ArrowRight") step(1);
        }}
        className="fixed inset-0 size-full max-h-none max-w-none bg-ink/[0.97] p-0 backdrop:bg-transparent"
      >
        {active !== null ? (
          <div className="flex size-full flex-col gap-3 p-3 sm:p-5">
            <div className="flex items-center justify-between gap-4 text-white">
              <p aria-live="polite" className="pl-1 text-sm font-medium">
                Photo {active + 1} of {count}
              </p>
              <form method="dialog">
                <button
                  type="submit"
                  aria-label="Close photos"
                  className={control}
                >
                  <X aria-hidden className="size-5" />
                </button>
              </form>
            </div>
            <div className="relative min-h-0 flex-1">
              <Image
                key={photos[active].id}
                src={photos[active].url}
                alt={altFor(active)}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            {count > 1 ? (
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={() => step(-1)}
                  className={control}
                >
                  <ChevronLeft aria-hidden className="size-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={() => step(1)}
                  className={control}
                >
                  <ChevronRight aria-hidden className="size-5" />
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
