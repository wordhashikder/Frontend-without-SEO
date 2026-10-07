"use client";

import dynamic from "next/dynamic";
import type { CoverageMapProps } from "./coverage-map-leaflet";

// Leaflet touches `window` on import, so the map only loads in the browser.
const LeafletMap = dynamic(() => import("./coverage-map-leaflet"), {
  ssr: false,
  loading: () => <p className="sr-only">Loading map…</p>,
});

/**
 * Fixed-aspect frame for the coverage map, so nothing shifts while Leaflet
 * loads. `isolate` keeps Leaflet's z-indexes below the sticky site header.
 */
export function CoverageMap(props: CoverageMapProps) {
  return (
    <section
      aria-label={props.label}
      className="relative isolate aspect-[543/346] w-full overflow-hidden rounded-lg border border-line bg-[#e9efec]"
    >
      <LeafletMap {...props} />
    </section>
  );
}
