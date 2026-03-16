---
inclusion: auto
description: "Remotion coding conventions, animation patterns, layer ordering, testing, and naming standards for this project"
---

# Remotion Conventions for This Project

## Component Structure

Each composition follows this pattern:
1. Imports from remotion + shared DesignSystem
2. Data arrays (segments, chapters, phases) defined as module-level constants
3. Exported helper functions for property-based testing
4. Sub-components (cards, markers, indicators) as React.FC
5. Main composition component as exported React.FC

## Animation Patterns

- Use `spring()` from remotion with `springConfig.entry`, `.exit`, or `.emphasis`
- Use `staggeredEntry(baseFrame, index, stagger?)` for sequential reveals
- Use `interpolate()` for opacity fades, position transitions, and pulse effects
- Pulse pattern: `interpolate(frame % N, [0, N/2, N], [1, peak, 1])`

## Layer Ordering

Compositions use absolute positioning with z-index layering:
1. Background (BackgroundLayer + HexGridOverlay)
2. AudioBadge (always bottom-right, z-index 50)
3. Content layers (countdowns, sidebars, cards)
4. Overlay layers (banners, flashes, fade-to-dark)

## Testing

- Export pure functions that determine visibility/state based on frame number
- Property tests verify these functions against frame ranges
- Test files: `__tests__/*.property.test.ts`

## Icons

- NEVER use emojis in compositions. Always use inline SVG icons colored with the design system palette (e.g., `GD_ORANGE`, `GD_VIOLET`).
- Define small React.FC icon components (e.g., `ServerIcon`, `HeartIcon`, `UsersIcon`, `StarIcon`) that accept `size` and `color` props and render an SVG `<svg>` element.
- Match icon color to the scene context (orange for AWS-related, violet for community, gold for results, etc.).

## Naming

- Compositions: `GameDay{Part}` (e.g., GameDayMainEvent)
- Segments: `{PART}_SEGMENTS` or `{PART}_PHASES`
- Colors: `GD_{NAME}` (e.g., GD_VIOLET)
- Sub-components: PascalCase descriptive names (InfoCardDisplay, StreamHostCard)

---

# Official Remotion Best Practices

Source: [remotion-dev/skills](https://github.com/remotion-dev/remotion/tree/main/packages/skills/skills/remotion)

## Core Animation Rules

- All animations MUST be driven by `useCurrentFrame()` hook
- Write durations in seconds and multiply by `fps` from `useVideoConfig()`
- CSS transitions or animations are FORBIDDEN — they will not render correctly during export
- Tailwind animation class names are FORBIDDEN — they will not render correctly

## Interpolation & Timing

Simple linear interpolation:
```ts
const opacity = interpolate(frame, [0, 100], [0, 1], {
  extrapolateRight: "clamp",
  extrapolateLeft: "clamp",
});
```

Spring animations (0 to 1 with natural motion):
```ts
const scale = spring({ frame, fps });
```

Common spring configs:
```ts
const smooth = { damping: 200 };                    // No bounce (subtle reveals)
const snappy = { damping: 20, stiffness: 200 };     // Minimal bounce (UI elements)
const bouncy = { damping: 8 };                       // Bouncy entrance (playful)
const heavy  = { damping: 15, stiffness: 80, mass: 2 }; // Heavy, slow, small bounce
```

Delay a spring:
```ts
const entrance = spring({ frame: frame - ENTRANCE_DELAY, fps, delay: 20 });
```

Stretch to specific duration:
```ts
const s = spring({ frame, fps, durationInFrames: 40 });
```

Combine spring with interpolate for custom ranges:
```ts
const springProgress = spring({ frame, fps });
const rotation = interpolate(springProgress, [0, 1], [0, 360]);
```

Easing options:
```ts
interpolate(frame, [0, 100], [0, 1], {
  easing: Easing.inOut(Easing.quad),
  extrapolateLeft: "clamp", extrapolateRight: "clamp",
});
```

Curves (most linear → most curved): `quad`, `sin`, `exp`, `circle`
Convexities: `Easing.in`, `Easing.out`, `Easing.inOut`

## Compositions

Defined in `src/Root.tsx`:
```tsx
<Composition id="MyComp" component={MyComp} durationInFrames={100} fps={30} width={1280} height={720} />
```

- Use `type` declarations for props (not `interface`) for `defaultProps` type safety
- Use `<Folder>` to organize compositions in the sidebar
- Use `<Still>` for single-frame images (no `durationInFrames` or `fps` needed)
- Use `calculateMetadata` for dynamic dimensions/duration based on data

Nest compositions using `<Sequence>` with `width` and `height`:
```tsx
<Sequence width={WIDTH} height={HEIGHT}><NestedComp /></Sequence>
```

## Sequencing

Use `<Sequence>` to delay elements:
```tsx
<Sequence from={1 * fps} durationInFrames={2 * fps} premountFor={1 * fps}>
  <Title />
</Sequence>
```

- Always premount Sequences: `premountFor={1 * fps}`
- Use `layout="none"` when items should not be wrapped in AbsoluteFill
- Inside a Sequence, `useCurrentFrame()` returns local frame (starting from 0)

Use `<Series>` for sequential playback without overlap:
```tsx
<Series>
  <Series.Sequence durationInFrames={45}><Intro /></Series.Sequence>
  <Series.Sequence durationInFrames={60}><Main /></Series.Sequence>
</Series>
```

Negative offset for overlapping: `<Series.Sequence offset={-15}>`

## Assets

- Place assets in `public/` folder
- MUST use `staticFile()` to reference them
- Use `<Img>` from remotion (NOT native `<img>`, NOT CSS `background-image`)
- `<Img>` ensures images are fully loaded before rendering (prevents flickering)
- Remote URLs can be used directly without `staticFile()`

## Audio

- Use `<Audio>` from `@remotion/media`
- Trim with `trimBefore` / `trimAfter` (values in frames)
- Delay by wrapping in `<Sequence>`
- Dynamic volume: `volume={(f) => interpolate(f, [0, fps], [0, 1], { extrapolateRight: "clamp" })}`
- Loop: `<Audio loop />`
- Speed: `playbackRate={2}` (reverse not supported)
- Pitch: `toneFrequency={1.5}` (only works during server-side rendering)

## Video

- Use `<Video>` from `@remotion/media`
- Same trimming, volume, speed, loop, and pitch APIs as Audio
- Size/position via `style` prop with `objectFit: "cover"`

## Fonts

Google Fonts (recommended):
```tsx
import { loadFont } from "@remotion/google-fonts/Roboto";
const { fontFamily } = loadFont("normal", { weights: ["400", "700"], subsets: ["latin"] });
```

Local fonts:
```tsx
import { loadFont } from "@remotion/fonts";
await loadFont({ family: "MyFont", url: staticFile("MyFont.woff2") });
```

## Transitions (via @remotion/transitions)

```tsx
<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}><SceneA /></TransitionSeries.Sequence>
  <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
  <TransitionSeries.Sequence durationInFrames={60}><SceneB /></TransitionSeries.Sequence>
</TransitionSeries>
```

Available: `fade`, `slide`, `wipe`, `flip`, `clockWipe`
Slide directions: `"from-left"`, `"from-right"`, `"from-top"`, `"from-bottom"`
Transitions shorten timeline (both scenes play simultaneously during transition)
Overlays (`TransitionSeries.Overlay`) do NOT shorten timeline

## Text Animations

- Use string slicing for typewriter effects (never per-character opacity)
- All text animation must be frame-driven via `useCurrentFrame()`

## Lottie Animations

Use `@remotion/lottie`:
```tsx
import { Lottie, LottieAnimationData } from "@remotion/lottie";
const [data, setData] = useState<LottieAnimationData | null>(null);
useEffect(() => {
  import("./animation.json").then((d) => setData(d.default));
}, []);
if (!data) return null;
return <Lottie animationData={data} />;
```

- NEVER use `require()` for JSON — use dynamic `import()` with `useEffect`
- Control playback via `playbackRate` prop
- Loop: `loop` prop
- Direction: `direction` prop (`1` forward, `-1` backward)

## Trimming Media

Trim audio/video with `startFrom` and `endAt` (frame values):
```tsx
<Audio src={audio} startFrom={30} endAt={120} />
<Video src={video} startFrom={0} endAt={90} />
```

- `startFrom`: first frame of the source to play
- `endAt`: last frame of the source to play
- These affect the source media timeline, not the composition timeline
- To delay playback, wrap in `<Sequence from={delay}>`

## calculateMetadata

For dynamic composition props based on data:
```tsx
export const calculateMetadata: CalculateMetadataFunction<Props> = async ({ props }) => {
  const data = await fetch(props.dataUrl).then(r => r.json());
  return {
    durationInFrames: data.items.length * 30,
    props: { ...props, data },
  };
};
```

- Return `durationInFrames`, `fps`, `width`, `height`, or modified `props`
- Can be async (fetch data, compute dimensions)
- Registered on `<Composition calculateMetadata={calculateMetadata} />`

## Measuring Text

Use `@remotion/layout-utils` to measure text dimensions:
```tsx
import { measureText } from "@remotion/layout-utils";
const { width, height } = measureText({ text: "Hello", fontFamily: "Arial", fontSize: 48 });
```

- Font MUST be loaded before measuring (use `loadFont()` + `waitUntilDone()`)
- Useful for dynamic layouts, word wrapping, and text fitting
- `fillTextBox()` fills a box with as many words as fit

## GIFs

Use `@remotion/gif`:
```tsx
import { Gif } from "@remotion/gif";
<Gif src={staticFile("animation.gif")} width={300} height={300} fit="cover" />
```

- `fit`: `"cover"`, `"contain"`, `"fill"`
- GIF playback syncs with Remotion's frame timeline
- Use `playbackRate` to control speed

## Measuring DOM Nodes

Use `@remotion/measure` to get element dimensions:
```tsx
import { measure } from "@remotion/measure";
const ref = useRef<HTMLDivElement>(null);
const { width, height } = measure(ref.current!);
```

- Useful for dynamic layouts where element size is unknown
- Measure after render (in `useEffect` or after ref is set)

## Transparent Videos

Render videos with alpha channel:
- Use `--codec vp8` or `--codec vp9` with `--pixel-format yuva420p`
- Or use ProRes 4444: `--codec prores --prores-profile 4444`
- In composition, use transparent background (no background color)
- `<Video>` supports transparent source videos in WebM format

## Charts

Use `@remotion/charts` for animated data visualizations:
- `<Pie>`, `<Bar>`, `<Line>` components
- Animate by interpolating data values based on frame
- Each chart accepts `data` prop with animated values

## Light Leaks

Use `@remotion/light-leaks` for cinematic overlay effects:
```tsx
import { LightLeak } from "@remotion/light-leaks";
<LightLeak type="bokeh" speed={1} />
```

- Types: `"bokeh"`, `"flare"`, `"prism"`
- Overlay on top of content with `mix-blend-mode: "screen"`
- Control speed and intensity

## Parametrizable Videos (Zod Schemas)

Define input props with Zod for the Remotion Studio UI:
```tsx
import { z } from "zod";
export const schema = z.object({
  title: z.string().default("Hello"),
  color: z.string().default("#ff0000"),
  duration: z.number().min(1).max(30).default(5),
});
```

- Register on Composition: `schema={schema}`
- Studio auto-generates input UI from schema
- Use `defaultProps` matching the schema defaults
- Supports: `z.string()`, `z.number()`, `z.boolean()`, `z.enum()`, `z.array()`, `z.object()`

## Maps (Mapbox)

Use `@remotion/mapbox` for animated maps:
```tsx
import { Map } from "@remotion/mapbox";
<Map
  accessToken={process.env.MAPBOX_TOKEN!}
  center={[lng, lat]}
  zoom={interpolate(frame, [0, 100], [3, 12])}
  style="mapbox://styles/mapbox/dark-v11"
/>
```

- Animate `center`, `zoom`, `bearing`, `pitch` with `interpolate()`
- Requires Mapbox access token
- Use `staticMap` for non-animated snapshots

## 3D with Three.js

Use `@remotion/three`:
```tsx
import { ThreeCanvas } from "@remotion/three";
<ThreeCanvas width={1280} height={720}>
  <ambientLight />
  <mesh rotation={[0, frame * 0.02, 0]}>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="orange" />
  </mesh>
</ThreeCanvas>
```

- Use `useCurrentFrame()` inside Three components for animation
- `ThreeCanvas` replaces R3F's `Canvas` (ensures frame-perfect rendering)
- All Three.js/R3F patterns work inside `ThreeCanvas`

## Audio Visualization

Use `@remotion/media-utils` for audio-reactive visuals:
```tsx
import { getAudioData, useAudioData, visualizeAudio } from "@remotion/media-utils";
const audioData = useAudioData(staticFile("audio.mp3"));
if (!audioData) return null;
const visualization = visualizeAudio({
  fps, frame, audioData, numberOfSamples: 256,
});
// visualization is an array of frequency amplitudes (0-1)
```

- `visualizeAudio` returns frequency data for the current frame
- Use values to drive bar heights, circle radii, colors, etc.
- `numberOfSamples` controls frequency resolution (power of 2)
- `smoothing: true` for smoother transitions between frames

## FFmpeg Operations

Use `@remotion/renderer` for programmatic rendering:
```ts
import { renderMedia } from "@remotion/renderer";
await renderMedia({
  composition, serveUrl, codec: "h264",
  outputLocation: "out/video.mp4",
});
```

- Codecs: `"h264"` (MP4), `"vp8"`/`"vp9"` (WebM), `"prores"` (MOV), `"gif"`
- Use `onProgress` callback for progress tracking
- `renderStill()` for single frames
- `renderFrames()` for frame sequences
- `stitchFramesToVideo()` to combine frames

## Subtitles / Captions

Use `@remotion/captions` for subtitle rendering:
```tsx
import { parseSrt } from "@remotion/captions";
const subtitles = parseSrt(srtContent);
// Filter to current time window and render
```

- Parse SRT, VTT, or JSON caption formats
- Use `useCurrentFrame()` + `fps` to calculate current time
- Filter captions to show only current segment
- Style with standard CSS (position, font, background)

## Tailwind CSS

Use `@remotion/tailwind` for Tailwind support:
- Configure in `remotion.config.ts` with `enableTailwind()`
- Standard Tailwind classes work in components
- FORBIDDEN: Tailwind animation classes (`animate-*`) — use frame-driven animation instead
- FORBIDDEN: Tailwind transition classes (`transition-*`) — use `interpolate()` instead

## AI Voiceover (ElevenLabs)

Use `@remotion/elevenlabs` for text-to-speech:
```tsx
import { generateVoice } from "@remotion/elevenlabs";
const audio = await generateVoice({
  text: "Hello world",
  voiceId: "...",
  apiKey: process.env.ELEVENLABS_API_KEY!,
});
```

- Generate in `calculateMetadata` or build script (not at render time)
- Save generated audio to `public/` and reference with `staticFile()`
- Use `getAudioDurationInSeconds()` to set composition duration

## Utility Functions

### getVideoMetadata / getAudioDuration
```ts
import { getVideoMetadata } from "@remotion/media-utils";
const { durationInSeconds, width, height } = await getVideoMetadata(src);
```

```ts
import { getAudioDurationInSeconds } from "@remotion/media-utils";
const duration = await getAudioDurationInSeconds(staticFile("audio.mp3"));
```

- Use in `calculateMetadata` to set composition duration from media length
- Works with remote URLs and `staticFile()` paths

### canDecode
```ts
import { canDecode } from "@remotion/media-utils";
const canPlay = await canDecode({ type: "video", codec: "h264" });
```

- Check browser/runtime codec support before rendering
- Useful for conditional codec selection

### extractFrames
```ts
import { extractFrame } from "@remotion/renderer";
await extractFrame({ serveUrl, composition, frame: 50, output: "frame.png" });
```

- Extract specific frames as images from a composition
- Useful for thumbnails, previews, social media cards
