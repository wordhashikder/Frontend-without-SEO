import "server-only";

import { BRITISH_ISLES_LAND } from "@/lib/british-isles-land";

/*
 * A local map for a location page, drawn on the server as inline SVG from real
 * geography: the coastline around the town, the town itself, the neighbouring
 * towns we have pages for, and the area local installers typically cover.
 * Every location gets its own map, with no image files or third-party tiles.
 * It is shown until the admin adds a photo for the location.
 */

type Place = {
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
};

type LocationMapProps = {
  location: Place & { region: string };
  /** Other locations; those that fall inside the map are marked and labelled. */
  neighbours: Place[];
  className?: string;
};

// ---- Geometry -------------------------------------------------------------------------

/** The drawing is 2:1; `preserveAspectRatio="xMidYMid slice"` crops it to fit the frame. */
const WIDTH = 1200;
const HEIGHT = 600;
/** Where the town sits: right of centre, clear of the "Powering a greener…" card. */
const PIN = { x: 700, y: 255 } as const;
/** Map scale in drawing units per kilometre (about 170 km across). */
const UNITS_PER_KM = 7;
const KM_PER_DEGREE_LAT = 110.57;
const KM_PER_DEGREE_LON_AT_EQUATOR = 111.32;
const KM_PER_MILE = 1.609344;
/** The ring drawn around the town: a typical installer's travel radius. */
const COVERAGE_MILES = 15;
const SCALE_BAR_MILES = 10;
/** Narrow phones crop the sides: the corner texts stay inside the part every screen shows. */
const SAFE = { left: 250, right: 950 } as const;
/** Town labels may run to the edge of the drawing, as on any map. */
const FRAME = {
  left: 12,
  right: WIDTH - 12,
  top: 12,
  bottom: HEIGHT - 12,
} as const;
/** Bottom-left corner covered by the "Powering a greener…" card. */
const CARD = { right: 560, top: 400 } as const;

type Point = [number, number];
type Ring = {
  points: Point[];
  west: number;
  east: number;
  south: number;
  north: number;
};

/** Expands one encoded-polyline ring (lon, lat, 3 decimals) from british-isles-land.ts. */
function decodeRing(encoded: string): Ring {
  const points: Point[] = [];
  let index = 0;
  let lon = 0;
  let lat = 0;
  while (index < encoded.length) {
    for (let axis = 0; axis < 2; axis++) {
      let result = 0;
      let shift = 0;
      let byte: number;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      const delta = result & 1 ? ~(result >> 1) : result >> 1;
      if (axis === 0) lon += delta;
      else lat += delta;
    }
    points.push([lon / 1000, lat / 1000]);
  }
  const lons = points.map(([x]) => x);
  const lats = points.map(([, y]) => y);
  return {
    points,
    west: Math.min(...lons),
    east: Math.max(...lons),
    south: Math.min(...lats),
    north: Math.max(...lats),
  };
}

let land: Ring[] | undefined;
/** Decoded once per server process, on the first location page rendered. */
const landRings = () => {
  land ??= BRITISH_ISLES_LAND.map(decodeRing);
  return land;
};

/** A local flat projection around the town: accurate to a few metres at this scale. */
function projection(latitude: number, longitude: number) {
  const kmPerDegreeLon =
    KM_PER_DEGREE_LON_AT_EQUATOR * Math.cos((latitude * Math.PI) / 180);
  return {
    toPoint: (lon: number, lat: number): Point => [
      PIN.x + (lon - longitude) * kmPerDegreeLon * UNITS_PER_KM,
      PIN.y - (lat - latitude) * KM_PER_DEGREE_LAT * UNITS_PER_KM,
    ],
    bounds: {
      west: longitude - PIN.x / UNITS_PER_KM / kmPerDegreeLon,
      east: longitude + (WIDTH - PIN.x) / UNITS_PER_KM / kmPerDegreeLon,
      south: latitude - (HEIGHT - PIN.y) / UNITS_PER_KM / KM_PER_DEGREE_LAT,
      north: latitude + PIN.y / UNITS_PER_KM / KM_PER_DEGREE_LAT,
    },
  };
}

/** Sutherland–Hodgman: the part of a closed ring inside the (slightly enlarged) frame. */
function clipToFrame(points: Point[]): Point[] {
  const [x0, y0, x1, y1] = [-10, -10, WIDTH + 10, HEIGHT + 10];
  const edges: [(p: Point) => boolean, (a: Point, b: Point) => Point][] = [
    [
      (p) => p[0] >= x0,
      (a, b) => [x0, a[1] + ((b[1] - a[1]) * (x0 - a[0])) / (b[0] - a[0])],
    ],
    [
      (p) => p[0] <= x1,
      (a, b) => [x1, a[1] + ((b[1] - a[1]) * (x1 - a[0])) / (b[0] - a[0])],
    ],
    [
      (p) => p[1] >= y0,
      (a, b) => [a[0] + ((b[0] - a[0]) * (y0 - a[1])) / (b[1] - a[1]), y0],
    ],
    [
      (p) => p[1] <= y1,
      (a, b) => [a[0] + ((b[0] - a[0]) * (y1 - a[1])) / (b[1] - a[1]), y1],
    ],
  ];
  let output = points;
  for (const [inside, intersect] of edges) {
    const input = output;
    output = [];
    input.forEach((current, i) => {
      const previous = input[(i + input.length - 1) % input.length];
      if (inside(current)) {
        if (!inside(previous)) output.push(intersect(previous, current));
        output.push(current);
      } else if (inside(previous)) {
        output.push(intersect(previous, current));
      }
    });
    if (output.length === 0) break;
  }
  return output;
}

function landPath(latitude: number, longitude: number) {
  const { toPoint, bounds } = projection(latitude, longitude);
  let path = "";
  for (const ring of landRings()) {
    const outside =
      ring.east < bounds.west ||
      ring.west > bounds.east ||
      ring.north < bounds.south ||
      ring.south > bounds.north;
    if (outside) continue;
    const clipped = clipToFrame(
      ring.points.map(([lon, lat]) => toPoint(lon, lat)),
    );
    if (clipped.length < 3) continue;
    let last = "";
    let segment = "";
    for (const [x, y] of clipped) {
      const point = `${Math.round(x)} ${Math.round(y)}`;
      if (point === last) continue;
      segment += `${segment ? "L" : "M"}${point}`;
      last = point;
    }
    path += `${segment}Z`;
  }
  return path;
}

// ---- Labels ---------------------------------------------------------------------------

type Box = { x0: number; y0: number; x1: number; y1: number };

const overlaps = (a: Box, b: Box) =>
  a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

/** Poppins averages a little under 0.6em per character. */
const textWidth = (text: string, size: number, weight: "medium" | "bold") =>
  text.length * size * (weight === "bold" ? 0.62 : 0.57);

/** Inside the drawing and clear of the "Powering a greener…" card. */
const fitsOnMap = (box: Box) =>
  box.x0 >= FRAME.left &&
  box.x1 <= FRAME.right &&
  box.y0 >= FRAME.top &&
  box.y1 <= FRAME.bottom &&
  !(box.x0 < CARD.right && box.y1 > CARD.top);

const formatDegrees = (value: number, positive: string, negative: string) =>
  `${Math.abs(value).toFixed(2)}°${value >= 0 ? positive : negative}`;

// ---- Component ------------------------------------------------------------------------

const NEIGHBOUR_TEXT = 24;
const TOWN_TEXT = 30;

export function LocationMap({
  location,
  neighbours,
  className,
}: LocationMapProps) {
  const { latitude, longitude, name } = location;
  const { toPoint } = projection(latitude, longitude);
  const coastline = landPath(latitude, longitude);
  const id = `location-map-${location.slug}`;
  const coverage = COVERAGE_MILES * KM_PER_MILE * UNITS_PER_KM;
  const scaleBar = SCALE_BAR_MILES * KM_PER_MILE * UNITS_PER_KM;

  // The town's own marker and label, and the corner texts, are placed first.
  const townLabelWidth = textWidth(name, TOWN_TEXT, "bold") + 40;
  const townLabel: Box = {
    x0: PIN.x + 38,
    y0: PIN.y - 84,
    x1: PIN.x + 38 + townLabelWidth,
    y1: PIN.y - 32,
  };
  const taken: Box[] = [
    { x0: PIN.x - 34, y0: PIN.y - 92, x1: PIN.x + 34, y1: PIN.y + 12 },
    townLabel,
    { x0: SAFE.right - 260, y0: 36, x1: SAFE.right, y1: 104 },
    { x0: SAFE.right - scaleBar - 10, y0: 520, x1: SAFE.right, y1: 572 },
  ];

  const nearby = neighbours
    .filter((place) => place.slug !== location.slug)
    .map((place) => {
      const [x, y] = toPoint(place.longitude, place.latitude);
      return { ...place, x, y, distance: Math.hypot(x - PIN.x, y - PIN.y) };
    })
    // Inside the frame, clear of the town's own marker and of the card corner.
    .filter(
      ({ x, y, distance }) =>
        x > 20 &&
        x < WIDTH - 20 &&
        y > 20 &&
        y < HEIGHT - 20 &&
        distance > 44 &&
        !(x < CARD.right && y > CARD.top),
    )
    .sort((a, b) => a.distance - b.distance);

  const labelled = new Set<string>();
  const placements = new Map<string, { x: number; anchor: "start" | "end" }>();
  for (const place of nearby) {
    const width = textWidth(place.name, NEIGHBOUR_TEXT, "medium");
    const right = {
      x: place.x + 14,
      anchor: "start" as const,
      x0: place.x + 10,
      x1: place.x + 18 + width,
    };
    const left = {
      x: place.x - 14,
      anchor: "end" as const,
      x0: place.x - 18 - width,
      x1: place.x - 10,
    };
    // Labels point towards the middle first, where narrow screens still show them.
    const candidates = place.x > WIDTH / 2 ? [left, right] : [right, left];
    for (const candidate of candidates) {
      const box: Box = {
        x0: candidate.x0,
        y0: place.y - 18,
        x1: candidate.x1,
        y1: place.y + 12,
      };
      if (!fitsOnMap(box) || taken.some((other) => overlaps(box, other)))
        continue;
      taken.push(box);
      labelled.add(place.slug);
      placements.set(place.slug, { x: candidate.x, anchor: candidate.anchor });
      break;
    }
    // A dot keeps its own small footprint, so no later label covers it.
    taken.push({
      x0: place.x - 9,
      y0: place.y - 9,
      x1: place.x + 9,
      y1: place.y + 9,
    });
  }

  const namedNearby = nearby.filter((place) => labelled.has(place.slug));
  const label =
    namedNearby.length > 0
      ? `Map of ${name} and the surrounding area, including ${namedNearby
          .slice(0, 4)
          .map((place) => place.name)
          .join(", ")}.`
      : `Map of ${name} and the surrounding area.`;

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
    >
      <defs>
        <pattern
          id={`${id}-dots`}
          width="18"
          height="18"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="9" cy="9" r="1.6" fill="#0a9b53" fillOpacity="0.14" />
        </pattern>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <filter
          id={`${id}-shadow`}
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feDropShadow
            dx="0"
            dy="6"
            stdDeviation="8"
            floodColor="#10263f"
            floodOpacity="0.18"
          />
        </filter>
      </defs>

      {/* Sea, then land with a fine dot texture */}
      <rect width={WIDTH} height={HEIGHT} fill="#d8eeee" />
      <path
        d={coastline}
        fill="#ffffff"
        fillRule="evenodd"
        stroke="#b4d8d1"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d={coastline} fill={`url(#${id}-dots)`} fillRule="evenodd" />

      {/* The area local installers cover */}
      <circle
        cx={PIN.x}
        cy={PIN.y}
        r={coverage * 1.15}
        fill={`url(#${id}-glow)`}
      />
      <circle
        cx={PIN.x}
        cy={PIN.y}
        r={coverage}
        fill="#0a9b53"
        fillOpacity="0.06"
        stroke="#0a9b53"
        strokeOpacity="0.45"
        strokeWidth="2.5"
        strokeDasharray="10 10"
      />

      {/* Neighbouring towns */}
      <g fontSize={NEIGHBOUR_TEXT} fontWeight="500" fill="#10263f">
        {nearby.map((place) => {
          const placement = placements.get(place.slug);
          return (
            <g key={place.slug}>
              <circle
                cx={place.x}
                cy={place.y}
                r="7"
                fill="#ffffff"
                stroke="#10263f"
                strokeOpacity="0.45"
                strokeWidth="3"
              />
              {placement ? (
                <text
                  x={placement.x}
                  y={place.y + 8}
                  textAnchor={placement.anchor}
                  fillOpacity="0.72"
                  stroke="#ffffff"
                  strokeWidth="6"
                  strokeLinejoin="round"
                  paintOrder="stroke"
                >
                  {place.name}
                </text>
              ) : null}
            </g>
          );
        })}
      </g>

      {/* The town */}
      <circle cx={PIN.x} cy={PIN.y} r="16" fill="#0a9b53" fillOpacity="0.22" />
      <ellipse
        cx={PIN.x}
        cy={PIN.y + 2}
        rx="10"
        ry="4"
        fill="#10263f"
        fillOpacity="0.2"
      />
      <g
        transform={`translate(${PIN.x} ${PIN.y})`}
        filter={`url(#${id}-shadow)`}
      >
        <path
          d="M0 0C-7-13-30-31-30-55a30 30 0 1 1 60 0C30-31 7-13 0 0Z"
          fill="#0a9b53"
          stroke="#ffffff"
          strokeWidth="4"
        />
        <path d="M3-74-13-50H-1l-4 18 17-25H1l2-17Z" fill="#ffffff" />
      </g>
      <g filter={`url(#${id}-shadow)`}>
        <rect
          x={townLabel.x0}
          y={townLabel.y0}
          width={townLabelWidth}
          height={townLabel.y1 - townLabel.y0}
          rx="14"
          fill="#ffffff"
        />
      </g>
      <text
        x={townLabel.x0 + 20}
        y={townLabel.y1 - 16}
        fontSize={TOWN_TEXT}
        fontWeight="700"
        fill="#10263f"
      >
        {name}
      </text>

      {/* Region and position */}
      <g textAnchor="end">
        <text
          x={SAFE.right}
          y="62"
          fontSize="20"
          fontWeight="600"
          letterSpacing="3"
          fill="#088246"
        >
          {location.region.toUpperCase()}
        </text>
        <text
          x={SAFE.right}
          y="92"
          fontSize="20"
          fill="#10263f"
          fillOpacity="0.55"
        >
          {formatDegrees(latitude, "N", "S")} ·{" "}
          {formatDegrees(longitude, "E", "W")}
        </text>
      </g>

      {/* Scale */}
      <g fill="#10263f" fillOpacity="0.6">
        <text x={SAFE.right} y="540" fontSize="18" textAnchor="end">
          {SCALE_BAR_MILES} miles
        </text>
        <rect
          x={SAFE.right - scaleBar}
          y="552"
          width={scaleBar}
          height="4"
          rx="2"
        />
      </g>
    </svg>
  );
}
