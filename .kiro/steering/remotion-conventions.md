---
inclusion: auto
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

## Naming

- Compositions: `GameDay{Part}` (e.g., GameDayMainEvent)
- Segments: `{PART}_SEGMENTS` or `{PART}_PHASES`
- Colors: `GD_{NAME}` (e.g., GD_VIOLET)
- Sub-components: PascalCase descriptive names (InfoCardDisplay, StreamHostCard)
