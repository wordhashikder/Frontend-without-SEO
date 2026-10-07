"use client";

import "leaflet/dist/leaflet.css";
import { Browser, latLng } from "leaflet";
import {
  AttributionControl,
  Circle,
  CircleMarker,
  MapContainer,
  TileLayer,
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
        boundsOptions={{ padding: [14, 14] }}
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
          // Subdomain form: the CSP allows https://*.tile.openstreetmap.org
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        <AttributionControl position="bottomleft" prefix={false} />
        <ZoomControl position="topright" />
        <Circle
          center={centre}
          radius={radius}
          pathOptions={{
            color: BRAND_GREEN,
            weight: 2,
            fillColor: BRAND_GREEN,
            fillOpacity: 0.2,
          }}
        />
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
      <p className="absolute right-2.5 bottom-2.5 z-[1000] flex items-center gap-2 rounded-md bg-white px-2.5 py-1.5 text-[11px] font-medium text-ink shadow-soft">
        <span
          aria-hidden
          className="size-3 rounded-full border border-primary bg-primary/25"
        />
        Coverage area
      </p>
    </>
  );
}
