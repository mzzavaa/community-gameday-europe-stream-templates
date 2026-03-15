# Archive

Earlier iterations of the AWS Community GameDay Europe promo video. These are kept as reference for design elements and animation patterns that can be reused.

## Files

| File | Description |
|------|-------------|
| `CommunityGamedayEurope.tsx` | V1 — Original promo video with hero scene, groups scroll, and closing |
| `CommunityGamedayEuropeV2.tsx` | V2 — Added country card covers and refined group scroll |
| `CommunityGamedayEuropeV3.tsx` | V3 — Refined animations and layout adjustments |
| `CommunityGamedayEuropeV4.tsx` | V4 — Final promo iteration before stream overlay work began |
| `GameDayDesignSystem.backup.tsx` | Duplicate of the design system (was in shared/shared/) |
| `GameDayStreamOverlay.tsx` | Pre-stream overlay composition (design reference for glass cards and layout) |

## Usage

These files are not part of the active stream compositions. They contain useful patterns like:
- `CountUp` component for animated number reveals
- `CardCover` component for country/UG cards with flags
- `HeroScene`, `GroupsScrollScene`, `ClosingScene` patterns
- User Group data arrays with country names and flags

To reuse elements, copy the relevant code into the active compositions or shared design system.
