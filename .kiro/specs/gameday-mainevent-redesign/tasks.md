# Implementation Plan: GameDay MainEvent Redesign

## Overview

Redesign of `2-GameDayStreamMainEvent.tsx` covering visual bug fixes, two-phase StreamHostCard, SpeakerBubble greeting, 6 info cards matching the moderation script, SpeakerBubbles system, sidebar compact mode, OrganizerSection, and PhaseTimeline. All new components live in the single composition file. Implementation follows dependency order: constants/data first, then components that consume them, then integration and visual verification.

## Tasks

- [x] 1. Define layout constants, data models, and speaker mapping
  - [x] 1.1 Add LAYOUT constants object, SPEAKER_FACES mapping, PHASE_MILESTONES array, and getCurrentSpeaker helper function to `2-GameDayStreamMainEvent.tsx`
    - Define `LAYOUT` with all margin, width, frame, and font size constants per design
    - Define `SPEAKER_FACES` record mapping speaker names to face image paths
    - Define `PHASE_MILESTONES` array with Game Start, Gameplay ~2h, Ceremony positions
    - Implement `getCurrentSpeaker(frame, chapters)` returning current and next speaker objects
    - _Requirements: 12.5, 15.3, 15.6, 3.1_

  - [x] 1.2 Restructure INTRO_INFO_CARDS array to 6 cards covering frames 240–1799
    - Replace existing INTRO_INFO_CARDS with the 6-card array from the design document
    - Each card has text, startFrame, endFrame, borderColor, label, optional highlight, optional organizers
    - Card order: Welcome (240–539), Countdown (540–779), Audio Check (780–1019), Mute Warning (1020–1349), Community (1350–1559), Meet Organizers (1560–1799)
    - Include organizer data (Jerome/Brussels, Anda/Geneva) with face paths on the last card
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.2, 5.3, 6.1_

  - [ ]* 1.3 Write property test: Info card sequencing and coverage (Property 7)
    - **Property 7: Info card sequencing and coverage**
    - Verify cards sorted by startFrame, all startFrame ≥ 240, no overlapping ranges, gaps ≤ 10 frames, each card ≥ 240 frames, coverage of 240–1799 with no gap > 30 frames
    - **Validates: Requirements 4.7, 6.1, 6.3, 6.4, 6.5, 6.6**

  - [ ]* 1.4 Write property test: Info card highlight styling coherence (Property 8)
    - **Property 8: Info card highlight styling coherence**
    - For all InfoCards with a highlight field, verify highlight.color equals borderColor
    - **Validates: Requirements 8.1, 8.2, 8.3**

  - [ ]* 1.5 Write property test: Linda is current speaker during intro (Property 11)
    - **Property 11: Linda is current speaker during intro**
    - For any frame in 0–1799, getCurrentSpeaker SHALL return Linda Mohamed as current speaker
    - **Validates: Requirements 11.5**

- [x] 2. Fix EuropeMap vignette and oversized container
  - [x] 2.1 Remove borderRadius and overflow:hidden from EuropeMap container, apply oversized container (≥20% larger) with radial-gradient vignette
    - Remove `borderRadius: 24` and `overflow: 'hidden'` from the map container style
    - Increase container dimensions to at least 1.2× the map image dimensions
    - Apply radial-gradient vignette that fades all edges to full transparency before container boundary
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 2.2 Write property test: EuropeMap vignette without borderRadius (Property 1)
    - **Property 1: EuropeMap uses vignette without borderRadius**
    - For any frame 0–12000, verify map container has radial-gradient and no borderRadius
    - **Validates: Requirements 1.1, 1.2**

  - [ ]* 2.3 Write property test: EuropeMap oversized container (Property 2)
    - **Property 2: EuropeMap oversized container**
    - For any frame where EuropeMap is visible, container dimensions ≥ 1.2× image dimensions
    - **Validates: Requirements 1.4**

  - [ ]* 2.4 Visual verification: Render frame 0 and inspect Europe map edges
    - Run `npx remotion still 2-GameDayStreamMainEvent --frame=0 --output=out/verify-frame-0.png`
    - Verify soft vignette edges, no sharp corners against GD_DARK background

- [x] 3. Checkpoint - Ensure data models and map fix compile cleanly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement StreamHostCard two-phase layout
  - [x] 4.1 Implement StreamHostCard_FullWidth mode (frames 0–239) with V4 archive card styling
    - Full-width layout (1280 − 72 = 1208px) with GlassCard styling and accent glow line (borderLeft: 4px solid GD_VIOLET)
    - Left side: 80px circular avatar with GD_VIOLET glow, "YOUR STREAM HOST" label (LAYOUT.LABEL_FONT_SIZE), "Linda Mohamed" name, full title, 🇦🇹 "Vienna, Austria" with pin icon
    - Right side: UG Vienna logo as card cover (V4 CardCoverV4 style), "AWS UG Vienna" label
    - Position in lower-middle area with ≥120px clearance above bottom for PhaseTimeline
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.7, 2.8, 5.1_

  - [x] 4.2 Implement StreamHostCard compact mode animation (frame 240+) using springConfig.entry
    - At frame 240, animate width from full to 50% and reposition to left:36 using springConfig.entry
    - Compact layout: 64px avatar, name, title, small UG logo (existing layout pattern)
    - Maintain ≥120px clearance above PhaseTimeline
    - _Requirements: 2.5, 2.6, 2.7, 2.8_

  - [ ]* 4.3 Write property test: StreamHostCard two-phase width (Property 3)
    - **Property 3: StreamHostCard two-phase width**
    - For any frame 0–239, width ≥ 1200px. For any frame ≥ 300, width ≈ 50% of composition width
    - **Validates: Requirements 2.1, 2.5**

  - [ ]* 4.4 Write property test: StreamHostCard clearance above PhaseTimeline (Property 4)
    - **Property 4: StreamHostCard clearance above PhaseTimeline**
    - For any frame 0–1799, StreamHostCard bottom edge leaves ≥ 120px above composition bottom
    - **Validates: Requirements 2.7**

  - [ ]* 4.5 Visual verification: Render frames 0, 120, 240 and inspect StreamHostCard phases
    - Run `npx remotion still` for frames 0, 120, 240
    - Frame 0: full-width card with V4 styling, avatar, UG logo cover
    - Frame 120: still full-width, greeting still visible
    - Frame 240: animating to compact, first info card appearing

- [x] 5. Implement SpeakerBubbleGreeting component
  - [x] 5.1 Create SpeakerBubbleGreeting component (frames 0–239) with chat bubble styling
    - Chat/speech bubble with greeting text: "Hello everyone! I will guide you through the stream today! Make sure you have your audio turned on for the next 30 minutes"
    - Position above StreamHostCard_FullWidth (not beside or overlapping)
    - GlassCard styling with speech bubble tail pointing down toward host card
    - Visible frames 0–239, fade out with spring exit animation
    - Must not overlap InfoCardDisplay, CountdownTimer, or StreamHostCard
    - _Requirements: 11.2, 11.3, 11.4, 11.8_

  - [ ]* 5.2 Write property test: SpeakerBubble greeting visibility window (Property 10)
    - **Property 10: SpeakerBubble greeting visibility window**
    - For any frame 0–219, greeting opacity > 0. For any frame ≥ 260, greeting opacity ≈ 0
    - **Validates: Requirements 11.3, 11.4**

- [x] 6. Implement SpeakerBubbles system (full composition)
  - [x] 6.1 Create SpeakerBubbles component showing current speaker (64px, GD_VIOLET glow) and next speaker (40px, GD_PURPLE 50% opacity)
    - Position top-left below CountdownTimer, visible frames 0–53999
    - Current speaker: 64px circle with GD_VIOLET glow border, name text below/beside
    - Next speaker: 40px circle with GD_PURPLE border at 50% opacity
    - Use getCurrentSpeaker helper to derive speaker from TIMELINE_CHAPTERS
    - Spring-animated transitions when speaker changes
    - Handle segments without speakers field gracefully (placeholder)
    - _Requirements: 11.1, 11.5, 11.6, 11.7, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [ ]* 6.2 Write property test: SpeakerBubbles visible throughout composition (Property 13)
    - **Property 13: SpeakerBubbles visible throughout composition**
    - For any frame 0–53999, SpeakerBubbles renders with current (~64px) and next (~40px) bubbles
    - **Validates: Requirements 12.1, 12.2, 12.3, 11.7**

  - [ ]* 6.3 Write property test: SpeakerBubbles always show current speaker name (Property 12)
    - **Property 12: SpeakerBubbles always show current speaker name**
    - For any frame 0–53999, SpeakerBubbles renders text containing current speaker name
    - **Validates: Requirements 11.6, 12.6**

  - [ ]* 6.4 Visual verification: Render frames 0 and 1800 to verify speaker bubbles
    - Frame 0: Linda as current speaker (64px), next speaker visible (40px)
    - Frame 1800: Speaker transition to Jerome/Anda

- [x] 7. Checkpoint - Verify greeting phase and speaker bubbles
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Restructure InfoCardDisplay with highlight styling and organizer faces
  - [x] 8.1 Update InfoCardDisplay to render 6 cards (frames 240–1799) with spring entry, fade exit, and highlight styling
    - Render cards from the restructured INTRO_INFO_CARDS array
    - Spring-animated entry and fade-out exit with ≥ 20 frames of transition
    - No two cards overlap in visible frame ranges, no gaps > 30 frames
    - No cards during frames 0–239 (greeting phase)
    - Label font size: LAYOUT.LABEL_FONT_SIZE (15px), letterSpacing, textTransform uppercase
    - _Requirements: 4.1–4.7, 6.1–6.6, 3.1, 3.4_

  - [x] 8.2 Implement highlight rendering for critical phrases (fontWeight 700, borderColor as highlight color)
    - For cards with highlight field, render the highlighted text in the card's borderColor with fontWeight 700
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 8.3 Implement organizer faces on the "Meet the Organizers" card (card 6)
    - Render Jerome and Anda circular avatars (borderRadius 50%, GD_VIOLET glow shadow) from face image paths
    - Display UG affiliation and location (Brussels, Geneva) with flag emojis and pin icons
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 5.2, 5.3, 5.4_

  - [ ]* 8.4 Write property test: Organizer avatar styling (Property 9)
    - **Property 9: Organizer avatar styling**
    - For all organizer face avatars, verify borderRadius "50%" and boxShadow containing GD_VIOLET
    - **Validates: Requirements 10.5**

  - [ ]* 8.5 Visual verification: Render frames 240, 900, 1350, 1560 to verify info cards
    - Frame 240: Welcome card appearing, no greeting bubble
    - Frame 900: Info card visible with sidebar sliding in
    - Frame 1350: "ORGANIZED BY THE COMMUNITY" card with "not employed by AWS" highlighted
    - Frame 1560: "MEET THE ORGANIZERS" card with Jerome and Anda faces, Brussels/Geneva locations

- [x] 9. Apply consistent label font sizes across all section labels
  - [x] 9.1 Set all section labels to LAYOUT.LABEL_FONT_SIZE (15px) with consistent letterSpacing and textTransform uppercase
    - Update CountdownTimer label, ScheduleSidebar title, StreamHostCard "YOUR STREAM HOST" label, InfoCardDisplay card labels
    - All labels: fontSize 15px, letterSpacing consistent, textTransform "uppercase"
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 9.2 Write property test: Consistent label font sizes (Property 6)
    - **Property 6: Consistent label font sizes**
    - For all section labels in Intro_Section, fontSize is same value between 14–16px, consistent letterSpacing, textTransform "uppercase"
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

- [x] 10. Modify ScheduleSidebar: delayed entry and compact mode
  - [x] 10.1 Change ScheduleSidebar entry to frame 900 and implement compact mode transition at frame 1800
    - Sidebar slides in at frame 900 (changed from earlier entry point)
    - At frame 1800: animate width from 42% → 28% using springConfig.entry
    - Compact mode: smaller font sizes, tighter padding to fit content in reduced width
    - Stays compact for remaining duration (1800–53999)
    - _Requirements: 2.9, 13.1, 13.2, 13.4, 13.5_

  - [ ]* 10.2 Write property test: Sidebar entry delayed to frame 900 (Property 5)
    - **Property 5: Sidebar entry delayed to frame 900**
    - For any frame < 900, sidebar not visible. For any frame ≥ 960, sidebar visible
    - **Validates: Requirements 2.9**

  - [ ]* 10.3 Write property test: Sidebar compact mode after frame 1800 (Property 14)
    - **Property 14: Sidebar compact mode after frame 1800**
    - For any frame ≥ 1860, sidebar width ≈ 28%. For any frame < 1800 (when visible), width is 42%
    - **Validates: Requirements 13.1, 13.2**

  - [ ]* 10.4 Write property test: Compact sidebar preserves all segments (Property 15)
    - **Property 15: Compact sidebar preserves all segments**
    - For any frame ≥ 1800, sidebar renders all 6 MAIN_EVENT_SEGMENTS labels
    - **Validates: Requirements 13.3**

- [x] 11. Remove speaker names from ScheduleCard
  - [x] 11.1 Modify ScheduleCard to stop rendering the speakers field text, keeping only segment label and state indicators
    - Remove rendering of `segment.speakers` text from ScheduleCard component
    - Keep speakers field in data (consumed by SpeakerBubbles)
    - Display only: segment label + active/completed/upcoming indicators
    - _Requirements: 16.1, 16.2, 16.3_

  - [ ]* 11.2 Write property test: ScheduleCard hides speaker names (Property 20)
    - **Property 20: ScheduleCard hides speaker names**
    - For all segments with a speakers field, rendered ScheduleCard SHALL NOT contain speakers text
    - **Validates: Requirements 16.1, 16.3**

- [x] 12. Checkpoint - Verify sidebar, info cards, and label consistency
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Implement OrganizerSection (Jerome & Anda, frames 1800–9000)
  - [x] 13.1 Create OrganizerSection component with two OrganizerCards side by side
    - Spring entry at frame 1800, spring exit at frame 9000
    - Each OrganizerCard: circular face avatar (borderRadius 50%, GD_VIOLET glow), name, UG affiliation, location
    - Jerome: AWS User Group Belgium, Brussels. Anda: AWS User Group Geneva, Geneva
    - "Currently Speaking" contextual label (e.g. "Currently Speaking — Why this Community GameDay exists")
    - GlassCard styling, positioned in left column space freed by CompactSidebar
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

  - [ ]* 13.2 Write property test: OrganizerSection visibility window (Property 16)
    - **Property 16: OrganizerSection visibility window**
    - For any frame 1860–8940, OrganizerSection visible with both cards. For frame < 1800 or > 9060, not visible
    - **Validates: Requirements 14.1, 14.2, 14.6**

  - [ ]* 13.3 Write property test: OrganizerCard required fields (Property 17)
    - **Property 17: OrganizerCard required fields**
    - For all OrganizerCards, each displays circular face avatar, name, UG affiliation, and location
    - **Validates: Requirements 14.3**

  - [ ]* 13.4 Visual verification: Render frames 1560 and 1800 to verify organizer display
    - Frame 1560: "Meet the Organizers" info card with faces
    - Frame 1800: OrganizerSection appearing, sidebar compacting, info cards gone

- [x] 14. Implement PhaseTimeline (replaces PhaseMarker)
  - [x] 14.1 Create PhaseTimeline component with horizontal progress bar, phase label, milestones, and snail mascot
    - Replace PhaseMarker with PhaseTimeline at bottom of screen
    - Left side: "Current Phase / {active segment label}" from MAIN_EVENT_SEGMENTS
    - Milestone markers along bar: Game Start, Gameplay ~2h, Ceremony
    - Snail mascot icon moves proportionally to frame/totalFrames
    - GlassCard background, DesignSystem colors
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7_

  - [ ]* 14.2 Write property test: PhaseTimeline snail position proportional to frame (Property 18)
    - **Property 18: PhaseTimeline snail position proportional to frame**
    - For any frame 0–53999, snail position ≈ frame/totalFrames (±2% tolerance)
    - **Validates: Requirements 15.4, 15.6**

  - [ ]* 14.3 Write property test: PhaseTimeline displays current phase label (Property 19)
    - **Property 19: PhaseTimeline displays current phase label**
    - For any frame 0–53999, PhaseTimeline renders text containing the active MAIN_EVENT_SEGMENTS label
    - **Validates: Requirements 15.2**

  - [ ]* 14.4 Visual verification: Render frames 0, 900, 1800 to verify PhaseTimeline
    - Frame 0: PhaseTimeline at bottom with snail at start, "Community Intro" label
    - Frame 900: Snail slightly advanced, correct phase label
    - Frame 1800: PhaseTimeline still visible, snail progressed

- [x] 15. Checkpoint - Verify OrganizerSection and PhaseTimeline
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Integration wiring and composition integrity verification
  - [x] 16.1 Wire all new components into the main composition JSX in correct z-order
    - Ensure render order matches architecture: BackgroundLayer → HexGridOverlay → EuropeMap → AudioBadge → CountdownTimer → SpeakerBubbles → SpeakerBubbleGreeting → StreamHostCard → InfoCardDisplay → ScheduleSidebar → OrganizerSection → PhaseTimeline
    - Verify all components receive correct props (frame, fps, segments, chapters, totalFrames)
    - Ensure MAIN_EVENT_SEGMENTS and TIMELINE_CHAPTERS arrays are NOT modified (Req 17.3, 17.4)
    - Verify composition maintains 54000 frames, 1280×720, 30fps (Req 17.1, 17.2)
    - Verify AudioBadge is unaltered (Req 17.7)
    - Ensure DesignSystem compliance: colors from palette, GlassCard for cards, springConfig presets, Inter font
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7_

  - [ ]* 16.2 Write unit tests for composition integrity
    - Verify MAIN_EVENT_SEGMENTS and TIMELINE_CHAPTERS arrays are unchanged (snapshot or deep equality)
    - Verify INTRO_INFO_CARDS contains all 6 required cards with correct text content
    - Verify organizer card data includes Jerome/Brussels and Anda/Geneva
    - Verify StreamHostCard_FullWidth contains all required text fields
    - Verify PhaseTimeline milestones include "Game Start", "Gameplay ~2h", "Ceremony"
    - _Requirements: 17.3, 17.4, 4.1–4.6, 10.1–10.4, 2.2, 15.3_

- [x] 17. Final visual verification across all key frames
  - [ ]* 17.1 Render and inspect all 7 key frames for visual correctness
    - Render frames 0, 120, 240, 900, 1350, 1560, 1800 using `npx remotion still`
    - Frame 0: SpeakerBubble greeting above full-width StreamHostCard, Linda's speaker bubble, countdown timer, Europe map with soft vignette, no info cards
    - Frame 120: Greeting still visible, full-width card, no sidebar
    - Frame 240: Greeting faded, StreamHostCard animating to compact, Welcome info card appearing
    - Frame 900: Sidebar sliding in (42%), info card visible, StreamHostCard compact, PhaseTimeline at bottom
    - Frame 1350: "ORGANIZED BY THE COMMUNITY" card with "not employed by AWS" highlighted in accent color
    - Frame 1560: "MEET THE ORGANIZERS" card with Jerome/Anda faces, Brussels/Geneva locations
    - Frame 1800: Sidebar compacting to 28%, OrganizerSection appearing, SpeakerBubbles transitioning, info cards gone
    - Verify no overlapping elements, correct visibility, proper alignment, font consistency
    - _Requirements: All_

- [x] 18. Final checkpoint - Ensure all tests pass and composition compiles
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (20 properties from design doc)
- Unit tests validate specific examples and edge cases
- Visual verification uses `npx remotion still` + Playwright MCP browser inspection
- All new components are implemented in `2-GameDayStreamMainEvent.tsx` (single-file approach)
- MAIN_EVENT_SEGMENTS and TIMELINE_CHAPTERS arrays must NOT be modified (Req 17.3, 17.4)
- Existing property tests at `__tests__/gameday-mainevent-bugfix.property.test.ts` should continue to pass
