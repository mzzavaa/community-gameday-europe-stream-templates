# Implementation Plan: Organizers Marketing Video

## Overview

Build a standalone 15-second Remotion composition showcasing the 8 AWS Community GameDay Europe organizers. The work starts by extracting shared organizer data, then builds three scenes (intro, organizer grid, outro) in a single composition file, and wires it into Root.tsx.

## Tasks

- [ ] 1. Extract shared organizer data
  - [x] 1.1 Create `shared/organizers.ts` with the `Organizer` interface and `ORGANIZERS` array
    - Export the `Organizer` interface with fields: name, role, country, flag, face, type
    - Export the `ORGANIZERS` array with all 8 organizers (Jerome, Anda, Marcel, Linda, Manuel, Andreas, Lucian, Mihaly) — data copied from `03-GameDayStreamClosing-Audio.tsx`
    - _Requirements: 5.1, 5.2, 3.9_

  - [-] 1.2 Update `03-GameDayStreamClosing-Audio.tsx` to import from `shared/organizers.ts`
    - Remove the inline ORGANIZERS array
    - Replace with `import { ORGANIZERS } from "./shared/organizers"`
    - Verify no other inline references to the old array remain
    - _Requirements: 5.1, 5.2_

- [ ] 2. Checkpoint — Verify shared data extraction
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Create the composition file and scenes
  - [~] 3.1 Create `OrganizersMarketingVideo.tsx` with frame constants and composition shell
    - Define frame constants: INTRO 0–119, ORG 120–299, OUTRO 300–449, CROSSFADE 15 frames
    - Export `OrganizersMarketingVideo` React component
    - Import `useCurrentFrame`, `useVideoConfig`, `spring`, `interpolate`, `Img`, `staticFile` from Remotion
    - Import colors (`GD_DARK`, `GD_PURPLE`, `GD_VIOLET`, `GD_PINK`, `GD_ACCENT`, `GD_GOLD`), `BackgroundLayer`, and spring presets from `shared/GameDayDesignSystem.tsx`
    - Import `ORGANIZERS` from `shared/organizers.ts`
    - Render `BackgroundLayer` as base, conditionally render IntroScene, OrganizerScene, OutroScene based on frame ranges
    - _Requirements: 1.1, 1.3, 1.4, 1.5_

  - [~] 3.2 Implement IntroScene (frames 0–119)
    - Display GameDay logo (`public/AWSCommunityGameDayEurope/GameDay_Solid_Logo_for_swag/GameDay Logo Solid White.png`) with spring entrance from top
    - Display AWS Community Europe logo (`public/AWSCommunityGameDayEurope/AWSCommunityEurope_last_nobackground.png`) with spring entrance from bottom
    - Display "AWS Community GameDay Europe" title text with fade + slide up animation
    - Add ambient radial gradient glow using GD_PURPLE/GD_VIOLET
    - Implement opacity fade-out in last 15 frames (105–119) for crossfade into organizer scene
    - Use `extrapolateLeft: "clamp"` and `extrapolateRight: "clamp"` on all interpolate calls
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [~] 3.3 Implement OrganizerScene (frames 120–299)
    - Copy the organizer grid layout from closing ceremony Scene 4 (HeroIntro) with adjusted frame offsets
    - Render heading "COMMUNITY GAMEDAY EUROPE ORGANIZERS" with spring entrance
    - Render subheading "From the Community, for the Community" in GD_GOLD
    - Render 4×2 grid of organizer cards, each with: 130×130px circular face photo, purple glow box-shadow (`0 0 30px ${GD_VIOLET}70, 0 0 60px ${GD_PURPLE}40`), flag emoji + name (white, bold, 20px), user group role (subdued, 14px), country (lighter, 13px)
    - Implement staggered spring entrance with 12-frame delay per card
    - Opacity fade-in first 15 frames (120–134), fade-out last 15 frames (285–299)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

  - [~] 3.4 Implement OutroScene (frames 300–449)
    - Radial gradient glow burst using GD_PURPLE → GD_VIOLET → transparent
    - Display GameDay logo + AWS Community Europe logo with spring entrance, centered
    - Display tagline "AWS Community GameDay Europe · 17 March 2026" with fade-in
    - Display CTA text (e.g., "communitygameday.eu") with delayed fade-in
    - Fade to black: last 30 frames (420–449) interpolate black overlay opacity to 1
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_


- [ ] 4. Checkpoint — Verify all three scenes render
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Register composition and wire up
  - [~] 5.1 Register `OrganizersMarketingVideo` in `src/Root.tsx`
    - Import `OrganizersMarketingVideo` from `../OrganizersMarketingVideo`
    - Add `<Composition id="OrganizersMarketingVideo" component={OrganizersMarketingVideo} durationInFrames={450} fps={30} width={1280} height={720} />`
    - _Requirements: 1.2, 1.3_

  - [ ]* 5.2 Write property test for organizer card completeness
    - **Property 1: Organizer card completeness**
    - Generate random organizer objects with valid fields, render the card, verify all four data elements (face, flag+name, role, country) appear in output
    - Use `fast-check` with `numRuns: 100`
    - **Validates: Requirements 3.5, 3.6, 3.7, 3.8**

  - [ ]* 5.3 Write property test for organizer count invariant
    - **Property 2: Organizer count invariant**
    - Generate arrays of organizers of varying lengths, render the grid, verify rendered card count matches array length
    - Use `fast-check` with `numRuns: 100`
    - **Validates: Requirements 3.1**

  - [ ]* 5.4 Write property test for staggered animation ordering
    - **Property 3: Staggered animation ordering**
    - Generate random indices i < j within [0, 7], compute animation start frames, verify frame for i < frame for j
    - Use `fast-check` with `numRuns: 100`
    - **Validates: Requirements 3.2**

  - [ ]* 5.5 Write property test for scene crossfade transition
    - **Property 4: Scene crossfade transition**
    - Generate random frames within crossfade overlap regions, compute both scene opacities, verify exiting opacity decreases and entering opacity increases
    - Use `fast-check` with `numRuns: 100`
    - **Validates: Requirements 2.6**

  - [ ]* 5.6 Write unit tests for composition registration and shared data
    - Verify `OrganizersMarketingVideo` is registered in Root.tsx with correct id, resolution (1280×720), fps (30), and duration (450 frames)
    - Verify ORGANIZERS array has exactly 8 entries with all required fields populated
    - Verify all 8 organizers by name: Jerome, Anda, Marcel, Linda, Manuel, Andreas, Lucian, Mihaly
    - _Requirements: 1.2, 1.3, 3.9, 5.1_

- [ ] 6. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The organizer grid in task 3.3 is a direct copy of the closing ceremony's Scene 4 with adjusted timing
- All scenes use clamped interpolation to prevent out-of-range values
- Property tests use `fast-check` as the PBT library
