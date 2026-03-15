# Implementation Plan: Closing Ceremony Redesign

## Overview

Transform the closing ceremony composition from a static countdown-plus-schedule layout into a two-phase cinematic flow: a logo carousel phase (frames 0–8999) with a compact reveal countdown, followed by a podium winner reveal (frames 9000–12599). Remove the Big Timer and Schedule Sidebar, export LOGO_MAP from the archive file, and create two new components (LogoCarousel, RevealCountdown).

## Tasks

- [x] 1. Export LOGO_MAP from archive and remove Big Timer / Schedule Sidebar
  - [x] 1.1 Export LOGO_MAP from `archive/CommunityGamedayEuropeV4.tsx`
    - Change `const LOGO_MAP` to `export const LOGO_MAP` in the archive file so it can be imported by the closing composition
    - _Requirements: 3.2_

  - [x] 1.2 Remove Big Timer from `4-GameDayStreamClosing.tsx`
    - Remove the `eventCountdown` calculation variable
    - Remove the `timerEntry` spring variable
    - Remove the Big Timer JSX block (Layer 4: "Event Ends In" label and large countdown display)
    - Retain all other layers and variables
    - _Requirements: 1.1, 1.2_

  - [x] 1.3 Remove Schedule Sidebar from `4-GameDayStreamClosing.tsx`
    - Remove the `sidebarEntry` spring variable
    - Remove the Schedule Sidebar JSX block (Layer 5: right-side panel with ScheduleCard components)
    - Retain the `CLOSING_SEGMENTS` data array (used by PhaseMarker)
    - The `ScheduleCard` component can remain in the file (unused) or be removed
    - _Requirements: 2.1, 2.2, 2.3_

- [-] 2. Checkpoint - Verify removals
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Create LogoCarousel component
  - [~] 3.1 Import LOGO_MAP and create LogoCarousel in `4-GameDayStreamClosing.tsx`
    - Import `LOGO_MAP as FULL_LOGO_MAP` from `archive/CommunityGamedayEuropeV4.tsx`
    - Define constants: `CAROUSEL_END_FRAME = 9000`, `SLOT_COUNT = 6`, `LOGOS_PER_SLOT = 8`
    - Distribute 48 logos into 6 groups of 8 using modulo assignment (`i % 6 === slotIndex`)
    - Implement `LogoCarousel` component with `LogoCarouselProps` interface (`frame: number`, `fps: number`)
    - Render 6 vertical slot columns (~180px wide, 16px gaps) centered horizontally
    - Each column displays a rank number (1–6) at 48px bold gold, with logos scrolling behind at 0.6 opacity
    - Logos rendered as 64×64 circular images with group name text below
    - Vertical scroll via `translateY` using `interpolate(frame, [0, 9000], [0, -totalHeight])` with `extrapolateRight: 'clamp'`
    - Each column has slightly different scroll speed (±5–10% offset) for visual variety
    - Duplicate logo strips for infinite scroll appearance within the 5-minute window
    - Apply `overflow: hidden` mask on each column
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 3.2 Write property test for logo rendering completeness
    - **Property 4: Logo rendering completeness**
    - Verify all 48 logos from FULL_LOGO_MAP are distributed across the 6 carousel groups with no duplicates and no missing entries
    - **Validates: Requirements 3.2, 3.3, 3.5**

- [ ] 4. Create RevealCountdown component
  - [~] 4.1 Implement RevealCountdown in `4-GameDayStreamClosing.tsx`
    - Implement `RevealCountdown` component with `RevealCountdownProps` interface (`frame: number`, `fps: number`)
    - Display "RESULTS IN" label: 14px, uppercase, letter-spacing 3, `GD_GOLD` color
    - Display MM:SS countdown: 36px, bold, white, monospace using `formatTime((9000 - frame) / fps)`
    - Wrap in `GlassCard` with compact padding
    - Position at `top: 24px`, centered horizontally, `z-index: 10`
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

  - [ ]* 4.2 Write property test for countdown time accuracy
    - **Property 5: Countdown time accuracy**
    - For random frame in [0, 8999], verify displayed time equals `formatTime(Math.floor((9000 - frame) / 30))`
    - **Validates: Requirements 4.2, 4.5**

- [ ] 5. Modify ClosingPodium and integrate into GameDayClosing
  - [~] 5.1 Add `startFrame` prop to ClosingPodium
    - Add optional `startFrame?: number` prop to `ClosingPodium` component signature
    - Add guard: `if (frame < (startFrame ?? 0)) return null;`
    - Adjust `revealFrame` values for each `TeamCard` to be relative to `startFrame` (e.g., rank 6 at `startFrame + 0`, rank 1 at `startFrame + 1500`)
    - _Requirements: 5.1, 5.3, 5.4_

  - [~] 5.2 Integrate new components into GameDayClosing composition
    - Render `LogoCarousel` conditionally when `frame < 9000`
    - Render `RevealCountdown` conditionally when `frame < 9000`
    - Pass `startFrame={9000}` to `ClosingPodium`
    - Ensure z-index layering matches design: Carousel at 5, RevealCountdown at 10, Podium at 10
    - Verify AudioBadge and PhaseMarker remain rendered at all frames
    - _Requirements: 3.1, 3.6, 4.1, 4.4, 5.1, 5.2, 5.4, 5.5, 6.1, 6.2, 7.1, 7.2_

  - [ ]* 5.3 Write property test for phase gating
    - **Property 3: Phase gating — carousel/countdown vs podium**
    - For random frame in [0, 53999]: if frame < 9000, carousel and countdown visible, podium not visible; if 9000 ≤ frame < 12600, podium visible, carousel/countdown not visible; if frame ≥ 12600, none visible
    - **Validates: Requirements 3.1, 3.6, 4.1, 4.4, 5.1, 5.4, 5.5**

- [~] 6. Checkpoint - Verify full integration
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Write remaining property tests
  - [ ]* 7.1 Write property test for Big Timer absence
    - **Property 1: Big Timer is absent**
    - For random frame in [0, 53999], verify no "Event Ends In" text in rendered output
    - **Validates: Requirements 1.1, 1.2**

  - [ ]* 7.2 Write property test for Schedule Sidebar absence
    - **Property 2: Schedule Sidebar is absent**
    - For random frame in [0, 53999], verify no "Closing Ceremony" sidebar heading or ScheduleCard elements in rendered output
    - **Validates: Requirements 2.1, 2.2**

  - [ ]* 7.3 Write property test for persistent overlays
    - **Property 6: Persistent overlays**
    - For random frame in [0, 53999], verify AudioBadge and PhaseMarker are present in rendered output
    - **Validates: Requirements 6.1, 6.2, 7.1**

  - [ ]* 7.4 Write property test for PhaseMarker segment accuracy
    - **Property 7: PhaseMarker segment accuracy**
    - For random frame in [0, 53999], verify PhaseMarker displays the correct segment name from CLOSING_SEGMENTS
    - **Validates: Requirements 7.2**

- [~] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests follow the pattern in `__tests__/gameday-mainevent-bugfix.property.test.ts` using vitest + fast-check
- The test file should be created at `__tests__/closing-ceremony-redesign.property.test.ts`
- All code is TypeScript/React (Remotion) — no language selection needed
