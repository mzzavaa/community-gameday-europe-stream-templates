# Implementation Plan: Closing Podium Ceremony

## Overview

Add an animated podium ceremony visualization to `4-GameDayStreamClosing.tsx` displaying the top 6 teams with staggered spring reveals during the Results Reveal and Winner Announcement segments (frames 0–12599). Implementation order: data constants first, then TeamCard, then ClosingPodium container, then integration into GameDayClosing. All new code lives in the single composition file.

## Tasks

- [x] 1. Define data models, LOGO_MAP, and PODIUM_TEAMS constant
  - [x] 1.1 Add TeamData interface, copy LOGO_MAP from archive, and define PODIUM_TEAMS array in `4-GameDayStreamClosing.tsx`
    - Define `TeamData` interface with `name`, `flag`, `city`, `score`, `logoUrl` fields
    - Copy `LOGO_MAP` record from `archive/CommunityGamedayEuropeV4.tsx` (only the entries needed for the 6 podium teams)
    - Define `PODIUM_TEAMS` constant array with 6 entries: Vienna (4850), Berlin (4720), Paris (4580), Finland (4410), Roma (4250), Warsaw (4090)
    - Each entry's `logoUrl` sourced from `LOGO_MAP[teamName]`
    - Scores must be distinct and strictly descending from rank 1 to rank 6
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 1.2 Write property test: Team data integrity (Property 3)
    - **Property 3: Team data integrity**
    - Verify all 6 entries have non-empty `name`, `flag`, `city`, and numeric `score`
    - Verify scores are strictly descending (rank 1 highest, rank 6 lowest) with all values distinct
    - Verify if team name exists as key in LOGO_MAP then `logoUrl` equals that value
    - **Validates: Requirements 5.2, 5.3, 5.4**

- [x] 2. Implement TeamCard component
  - [x] 2.1 Create TeamCard component with rank, "TEAM" label, team name, score, and logo/flag display
    - Implement `TeamCard` component accepting `TeamCardProps` (team, rank, frame, fps, revealFrame, size)
    - Display rank number prominently, "TEAM" label in uppercase, team name, score in GD_GOLD
    - For `size: "large"`: ~180×220px (1st) or ~160×190px (2nd/3rd)
    - For `size: "small"`: ~140×120px (ranks 4–6)
    - Glass-card background styling (semi-transparent, consistent with GlassCard from Design_System)
    - Border color by rank: 1st = GD_GOLD, 2nd = `rgba(192,192,192,0.6)`, 3rd = `rgba(205,127,50,0.5)`, 4–6 = `rgba(255,255,255,0.1)`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 8.1, 8.2_

  - [x] 2.2 Implement logo/flag conditional rendering in TeamCard
    - When `team.logoUrl` is non-null, render logo using Remotion `Img` component
    - When `team.logoUrl` is null, render `team.flag` emoji as fallback text
    - _Requirements: 3.5, 3.6_

  - [x] 2.3 Implement spring reveal animation in TeamCard
    - Use Remotion `spring()` with frame offset from `revealFrame` prop
    - Animate from opacity 0 + translateY offset to opacity 1 + final position
    - Before `revealFrame`: card hidden (opacity 0)
    - After `revealFrame` + ~60–90 frames: card fully visible (opacity 1)
    - _Requirements: 6.1, 6.4_

  - [ ]* 2.4 Write property test: TeamCard displays all required content (Property 1)
    - **Property 1: TeamCard displays all required content**
    - For any valid TeamData and rank 1–6, rendered TeamCard contains rank number, "TEAM" text, team name, and score
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

  - [ ]* 2.5 Write property test: Logo/flag conditional display (Property 2)
    - **Property 2: Logo/flag conditional display**
    - For any TeamData with non-null `logoUrl`, TeamCard renders an image element with that URL
    - For any TeamData with null `logoUrl`, TeamCard renders the flag emoji string
    - **Validates: Requirements 3.5, 3.6**

  - [ ]* 2.6 Write property test: Spring animation from hidden to visible (Property 5)
    - **Property 5: Spring animation from hidden to visible**
    - For any TeamCard at frames before its revealFrame, opacity is 0
    - For any TeamCard at frames ≥ revealFrame + 90, opacity is 1
    - **Validates: Requirements 6.1, 6.4**

- [x] 3. Checkpoint - Ensure TeamCard and data models compile cleanly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement ClosingPodium container component
  - [x] 4.1 Create ClosingPodium component with visibility logic and podium header
    - Implement `ClosingPodium` accepting `{ frame: number; fps: number }` props
    - Return `null` for `frame >= 12600` (hidden after Winner Announcement)
    - Render within left 58% of canvas (max-width ~742px), z-index 10
    - Render PodiumHeader: "🏆 PODIUM 🏆" in GD_GOLD, font-weight 900, letter-spacing ≥ 4px, uppercase, top-center of podium area
    - No separate opaque background (renders on top of BackgroundLayer/HexGridOverlay)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.2, 8.3, 9.1_

  - [x] 4.2 Implement top-3 podium row layout (2nd-left, 1st-center, 3rd-right)
    - Render 3 TeamCards in order: rank 2 (left), rank 1 (center), rank 3 (right)
    - Bottom-align cards to create podium height effect (1st tallest at ~220px, 2nd/3rd at ~190px)
    - Horizontally centered within the podium area
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 4.3 Implement ranks 4–6 row below podium
    - Render 3 smaller TeamCards (ranks 4, 5, 6) in a horizontal row below the top-3 podium
    - Cards are smaller (~140×120px) than top-3 cards
    - Row horizontally centered and aligned with podium above
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 4.4 Wire reveal timing: reverse rank order with 300-frame stagger
    - Pass correct `revealFrame` to each TeamCard: rank 6 at frame 0, rank 5 at 300, rank 4 at 600, rank 3 at 900, rank 2 at 1200, rank 1 at 1500
    - All 6 reveals complete well within Results Reveal segment (before frame 5400)
    - _Requirements: 6.2, 6.3, 6.5_

  - [ ]* 4.5 Write property test: Reverse-rank reveal ordering with minimum stagger (Property 4)
    - **Property 4: Reverse-rank reveal ordering with minimum stagger**
    - For any two teams with ranks i < j, team j's reveal start frame is strictly less than team i's
    - Difference between consecutive reveal start frames is ≥ 300 frames
    - **Validates: Requirements 6.2, 6.3**

  - [ ]* 4.6 Write property test: Full visibility during Winner Announcement (Property 6)
    - **Property 6: Full visibility during Winner Announcement**
    - For any frame in [5400, 12599], ClosingPodium renders and all 6 TeamCards are at full opacity
    - **Validates: Requirements 7.1**

  - [ ]* 4.7 Write property test: Podium contained within left 58% (Property 7)
    - **Property 7: Podium contained within left 58%**
    - All ClosingPodium content positioned within x ≤ 742px of the 1280px canvas
    - **Validates: Requirements 9.1, 2.5, 1.4**

- [x] 5. Checkpoint - Verify ClosingPodium renders correctly in isolation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Integration into GameDayClosing composition
  - [x] 6.1 Insert ClosingPodium into GameDayClosing render tree between HexGridOverlay and AudioBadge
    - Add `<ClosingPodium frame={frame} fps={fps} />` in the correct position in the AbsoluteFill layer stack
    - z-index 10 (above background layers, below flash overlay z200 and fade z300)
    - Pass `frame` and `fps` props from the composition
    - Verify no overlap with sidebar (right 42%), countdown timer (top-left), phase marker (bottom-left), AudioBadge (bottom-right)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2_

  - [ ]* 6.2 Write unit tests for integration and composition integrity
    - Verify ClosingPodium renders at frame 0 and frame 5400
    - Verify ClosingPodium returns null at frame 12600
    - Verify z-index 10 < flash overlay z-index 200
    - Verify podium header contains "🏆 PODIUM 🏆" with GD_GOLD color
    - Verify top-3 arrangement order is [rank 2, rank 1, rank 3]
    - Verify 1st place card dimensions larger than 2nd/3rd place
    - Verify ranks 4–6 cards smaller than top-3 cards
    - Verify border colors: 1st = GD_GOLD, 2nd = silver, 3rd = bronze
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 4.1, 4.2, 7.1, 7.2, 8.2, 10.1, 10.2_

- [x] 7. Final checkpoint - Ensure all tests pass and composition compiles
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate the 7 correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All new components are implemented in `4-GameDayStreamClosing.tsx` (single-file approach)
- Tests use vitest + fast-check, following patterns in `__tests__/gameday-mainevent-bugfix.property.test.ts`
- Existing closing composition structure (segments, layers, AudioBadge) must not be modified
