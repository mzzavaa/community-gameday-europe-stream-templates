/**
 * generate-map.ts
 *
 * Generates public/assets/europe-map.png from UG locations in participants.ts.
 * Each city gets a flag emoji marker (Twemoji PNG) composited onto a white circle
 * so flags are clearly visible on the dark CartoDB map tiles.
 *
 * Also writes config/geo-extremes.ts with the westernmost/easternmost/
 * northernmost/southernmost cities so compositions can use dynamic descriptions.
 *
 * Usage (from stream root):
 *   npx tsx scripts/generate-map.ts
 *
 * Dependencies (devDependencies): staticmaps, sharp, tsx
 */

import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { fileURLToPath } from "node:url";
import StaticMaps from "staticmaps";
import sharp from "sharp";
import { USER_GROUPS } from "../config/participants.js";

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const OUT_MAP    = path.join(__dirname, "../public/assets/europe-map.png");
const OUT_GEOEXT = path.join(__dirname, "../config/geo-extremes.ts");

// ── Map config ────────────────────────────────────────────────────────────────
const MAP_WIDTH  = 1920;
const MAP_HEIGHT = 1080;
// CartoDB Voyager — light tiles matching the original Leaflet map look
const TILE_URL   = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

// Marker: flag PNG composited onto an orange circle (matching original style)
const MARKER_SIZE   = 42; // outer circle diameter (px on the 1920×1080 map)
const FLAG_SIZE     = 28; // flag PNG inside the circle

// ── Twemoji flag download ──────────────────────────────────────────────────────
const FLAG_CACHE_DIR = path.join(os.tmpdir(), "gd-flag-cache");
fs.mkdirSync(FLAG_CACHE_DIR, { recursive: true });

function flagToTwemojiName(flag: string): string {
  return [...flag].map((ch) => ch.codePointAt(0)!.toString(16)).join("-") + ".png";
}

async function downloadFlag(flag: string): Promise<Buffer | null> {
  const name  = flagToTwemojiName(flag);
  const cache = path.join(FLAG_CACHE_DIR, name);
  if (fs.existsSync(cache)) return fs.readFileSync(cache);
  const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${name}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "community-gameday-stream-map/1.0" } });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(cache, buf);
    return buf;
  } catch { return null; }
}

/** Flag composited onto an orange circle with a thick white border. */
async function buildMarker(flag: string): Promise<string | null> {
  const flagBuf = await downloadFlag(flag);
  if (!flagBuf) return null;

  const markerPath = path.join(FLAG_CACHE_DIR, `marker-${flagToTwemojiName(flag)}`);
  if (fs.existsSync(markerPath)) return markerPath;

  // Resize flag to fit inside the circle
  const resizedFlag = await sharp(flagBuf).resize(FLAG_SIZE, FLAG_SIZE).toBuffer();

  // Orange circle with thick white border
  const circleSvg = Buffer.from(
    `<svg width="${MARKER_SIZE}" height="${MARKER_SIZE}" xmlns="http://www.w3.org/2000/svg">` +
    `<circle cx="${MARKER_SIZE / 2}" cy="${MARKER_SIZE / 2}" r="${MARKER_SIZE / 2 - 1}" ` +
    `fill="#F5A623" stroke="white" stroke-width="4"/>` +
    `</svg>`,
  );

  const offset = Math.round((MARKER_SIZE - FLAG_SIZE) / 2);
  await sharp(circleSvg)
    .composite([{ input: resizedFlag, left: offset, top: offset }])
    .png()
    .toFile(markerPath);

  return markerPath;
}

// ── Nominatim geocoding ────────────────────────────────────────────────────────
async function geocode(location: string): Promise<{ lon: number; lat: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
  try {
    const res  = await fetch(url, { headers: { "User-Agent": "community-gameday-stream-map/1.0" } });
    const data = (await res.json()) as { lat: string; lon: string }[];
    if (!data.length) return null;
    return { lon: parseFloat(data[0].lon), lat: parseFloat(data[0].lat) };
  } catch { return null; }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  type Entry = { location: string; flag: string; lon: number; lat: number };
  const entries: Entry[] = [];

  console.log(`Geocoding ${USER_GROUPS.length} UG locations...`);
  for (const g of USER_GROUPS) {
    await new Promise((r) => setTimeout(r, 1100));
    const coord = await geocode(g.location);
    if (coord) {
      entries.push({ location: g.location, flag: g.flag, ...coord });
      console.log(`  ✓ ${g.flag}  ${g.location}`);
    } else {
      console.warn(`  ✗ ${g.location} — geocode failed`);
    }
  }
  if (!entries.length) { console.error("No entries — aborting."); process.exit(1); }

  // ── Compute geographic extremes ──────────────────────────────────────────
  const west  = entries.reduce((a, b) => b.lon < a.lon ? b : a);
  const east  = entries.reduce((a, b) => b.lon > a.lon ? b : a);
  const north = entries.reduce((a, b) => b.lat > a.lat ? b : a);
  const south = entries.reduce((a, b) => b.lat < a.lat ? b : a);

  // Extract just the country name (second part after ", ")
  const country = (loc: string) => loc.split(", ").slice(1).join(", ") || loc.split(", ")[0];

  console.log(`\nGeographic extremes:`);
  console.log(`  West:  ${west.location}  (lon ${west.lon.toFixed(2)})`);
  console.log(`  East:  ${east.location}  (lon ${east.lon.toFixed(2)})`);
  console.log(`  North: ${north.location} (lat ${north.lat.toFixed(2)})`);
  console.log(`  South: ${south.location} (lat ${south.lat.toFixed(2)})`);

  // Write geo-extremes.ts for use by stats.ts in Remotion compositions
  const geoContent =
    `// AUTO-GENERATED by scripts/generate-map.ts — do not edit manually\n` +
    `export const GEO_EXTREMES = {\n` +
    `  west:  "${west.location}",\n` +
    `  east:  "${east.location}",\n` +
    `  north: "${north.location}",\n` +
    `  south: "${south.location}",\n` +
    `  westCountry:  "${country(west.location)}",\n` +
    `  eastCountry:  "${country(east.location)}",\n` +
    `  northCountry: "${country(north.location)}",\n` +
    `  southCountry: "${country(south.location)}",\n` +
    `} as const;\n`;
  fs.writeFileSync(OUT_GEOEXT, geoContent);
  console.log(`\n✅ Wrote ${OUT_GEOEXT}`);

  // ── Build map ────────────────────────────────────────────────────────────
  console.log("\nBuilding markers...");
  const markerCache = new Map<string, string | null>();
  for (const flag of new Set(entries.map((e) => e.flag))) {
    markerCache.set(flag, await buildMarker(flag));
  }

  const map = new StaticMaps({
    width: MAP_WIDTH, height: MAP_HEIGHT,
    tileUrl: TILE_URL,
    tileSubdomains: ["a", "b", "c"],
    tileSize: 256,
  });

  for (const e of entries) {
    const img = markerCache.get(e.flag);
    if (!img) continue;
    map.addMarker({
      coord:   [e.lon, e.lat],
      img,
      width:   MARKER_SIZE,
      height:  MARKER_SIZE,
      offsetX: Math.round(MARKER_SIZE / 2),
      offsetY: Math.round(MARKER_SIZE / 2),
    });
  }

  await map.render();
  await map.image.save(OUT_MAP);
  console.log(`✅ Map saved → ${OUT_MAP}  (${entries.length} markers)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
