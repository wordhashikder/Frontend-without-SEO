"use client";

import "leaflet/dist/leaflet.css";
import { Browser, type Circle as LeafletCircle, latLng } from "leaflet";
import { useEffect, useRef } from "react";
import {
  AttributionControl,
  Circle,
  CircleMarker,
  MapContainer,
  TileLayer,
  useMap,
  ZoomControl,
} from "react-leaflet";

export type CoverageMapProps = {
  latitude: number;
  longitude: number;
  radiusMiles: number;
  /** Accessible name for the map region. */
  label: string;
};

const METRES_PER_MILE = 1609.344;
const BRAND_GREEN = "#0a9b53";
const FOREST = "#153a2c";

const FIT_PADDING: [number, number] = [14, 14];

/**
 * The coverage circle, kept in view. A map ignores changes to its initial bounds,
 * so the view is refitted to the circle that is actually drawn whenever the
 * centre or radius changes (a 15-mile and a 1,000-mile area both fill the map).
 */
function FittedCircle({
  centre,
  radius,
}: {
  centre: ReturnType<typeof latLng>;
  radius: number;
}) {
  const map = useMap();
  const circle = useRef<LeafletCircle | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: the circle is read from a ref; refit exactly when its centre or radius changes
  useEffect(() => {
    if (circle.current) {
      map.fitBounds(circle.current.getBounds(), { padding: FIT_PADDING });
    }
  }, [map, centre.lat, centre.lng, radius]);

  return (
    <Circle
      ref={circle}
      center={centre}
      radius={radius}
      pathOptions={{
        color: BRAND_GREEN,
        weight: 2,
        fillColor: BRAND_GREEN,
        fillOpacity: 0.2,
      }}
    />
  );
}

/** OpenStreetMap view fitted to the installer's coverage circle. */
export default function CoverageMapLeaflet({
  latitude,
  longitude,
  radiusMiles,
}: CoverageMapProps) {
  const centre = latLng(latitude, longitude);
  const radius = radiusMiles * METRES_PER_MILE;

  return (
    <>
      <MapContainer
        bounds={centre.toBounds(radius * 2)}
        boundsOptions={{ padding: FIT_PADDING }}
        // The page must keep scrolling when the pointer crosses the map.
        scrollWheelZoom={false}
        // One-finger drags scroll the page on touch devices; pinch still zooms.
        dragging={!Browser.mobile}
        zoomControl={false}
        attributionControl={false}
        className="size-full"
        style={{ background: "#e9efec" }}
      >
        <TileLayer
          // OpenStreetMap's current single-host address (the a/b/c subdomains are
          // retired). Keep it in step with `img-src` in next.config.ts.
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          // The tile policy requires a valid Referer on every tile request, so
          // it is set here rather than left to the page's default policy.
          referrerPolicy="strict-origin-when-cross-origin"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        <AttributionControl position="bottomleft" prefix={false} />
        <ZoomControl position="topright" />
        <FittedCircle centre={centre} radius={radius} />
        <CircleMarker
          center={centre}
          radius={5}
          pathOptions={{
            color: "#fff",
            weight: 2,
            fillColor: FOREST,
            fillOpacity: 1,
          }}
        />
      </MapContainer>
      <p className="absolute right-2.5 bottom-2.5 z-[1000] flex items-center gap-2 rounded-md bg-white px-2.5 py-1.5 text-sm font-medium text-ink shadow-soft">
        <span
          aria-hidden
          className="size-3 rounded-full border border-primary bg-primary/25"
        />
        Coverage area
      </p>
    </>
  );
}
