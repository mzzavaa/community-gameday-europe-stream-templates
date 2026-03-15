# Requirements Document

## Introduction

Redesign the closing ceremony Remotion composition (`4-GameDayStreamClosing.tsx`) to replace the current layout (big countdown timer + schedule sidebar + immediate podium) with a two-phase flow: a logo carousel "waiting for results" phase with a small countdown, followed by a podium winner reveal. The composition remains 1280×720 at 30fps, 54000 frames (30 min). The AudioBadge and PhaseMarker overlays are retained.

## Glossary

- **Composition**: The `4-GameDayStreamClosing.tsx` Remotion component (1280×720, 30fps, 54000 frames)
- **Logo_Carousel**: An animated display that cycles through user group logos from the full LOGO_MAP (48 entries from `archive/CommunityGamedayEuropeV4.tsx`) grouped by rank numbers 1–6
- **Carousel_Phase**: The first 9000 frames (5 minutes at 30fps) of the composition during which the Logo_Carousel plays and hosts talk over the stream
- **Reveal_Countdown**: A small countdown timer displayed during the Carousel_Phase, counting from 5:00 down to 0:00
- **Winner_Reveal**: The moment at frame 9000 when the Reveal_Countdown reaches zero and the podium appears
- **Podium**: The existing `ClosingPodium` component showing top-6 example team results with `TeamCard` sub-components
- **Big_Timer**: The current "EVENT ENDS IN" large countdown timer positioned at top-left (to be removed)
- **Schedule_Sidebar**: The current right-side panel listing closing ceremony segments with `ScheduleCard` components (to be removed)
- **AudioBadge**: The bottom-right "AUDIO ON" indicator from the design system
- **PhaseMarker**: The bottom-left current-phase label with progress bar
- **LOGO_MAP**: A Record<string, string> mapping 48 user group names to logo image URLs, sourced from `archive/CommunityGamedayEuropeV4.tsx`
- **USER_GROUPS**: An array of 53 user group entries (name, flag, city) from `archive/CommunityGamedayEuropeV4.tsx`

## Requirements

### Requirement 1: Remove Big Countdown Timer

**User Story:** As a stream viewer, I want the large "EVENT ENDS IN" timer removed, so that the closing ceremony feels less like a countdown and more like a celebration.

#### Acceptance Criteria

1. THE Composition SHALL render without the Big_Timer element (the "Event Ends In" label and large-format time display at top-left)
2. WHEN the Composition renders at any frame, THE Composition SHALL not display any event-end countdown text or timer in the top-left region

### Requirement 2: Remove Schedule Sidebar

**User Story:** As a stream viewer, I want the schedule sidebar removed, so that the full viewport is available for the logo carousel and podium content.

#### Acceptance Criteria

1. THE Composition SHALL render without the Schedule_Sidebar element (the right-side panel containing `ScheduleCard` components)
2. WHEN the Composition renders at any frame, THE Composition SHALL not display the "Closing Ceremony" heading or segment list on the right side
3. THE Composition SHALL retain the `CLOSING_SEGMENTS` data array for use by the PhaseMarker component

### Requirement 3: Logo Carousel Animation

**User Story:** As a stream viewer, I want to see a slow animated carousel of all participating user group logos during the waiting period, so that the community groups are celebrated while hosts discuss results.

#### Acceptance Criteria

1. WHILE the current frame is within the Carousel_Phase (frame 0 to 8999), THE Composition SHALL display the Logo_Carousel animation
2. THE Logo_Carousel SHALL import and use the full LOGO_MAP from `archive/CommunityGamedayEuropeV4.tsx` containing 48 user group logo URLs
3. THE Logo_Carousel SHALL cycle through display numbers 1, 2, 3, 4, 5, 6 to visually group logos into six sets
4. THE Logo_Carousel SHALL animate with a slow, continuous pace suitable for a 5-minute viewing duration (9000 frames at 30fps)
5. THE Logo_Carousel SHALL display each user group logo as a circular image with the group name visible
6. WHEN the Carousel_Phase ends (frame 9000), THE Logo_Carousel SHALL stop displaying and transition to the Winner_Reveal

### Requirement 4: Reveal Countdown Timer

**User Story:** As a stream viewer, I want a small countdown timer showing time until the winner reveal, so that I know when results will be announced.

#### Acceptance Criteria

1. WHILE the current frame is within the Carousel_Phase (frame 0 to 8999), THE Composition SHALL display the Reveal_Countdown
2. THE Reveal_Countdown SHALL display time remaining from 5:00 down to 0:00, calculated as `(9000 - currentFrame) / 30` seconds
3. THE Reveal_Countdown SHALL use a compact visual style (smaller than the removed Big_Timer) positioned so it does not overlap the Logo_Carousel content
4. WHEN the Reveal_Countdown reaches 0:00 (frame 9000), THE Reveal_Countdown SHALL stop displaying
5. THE Reveal_Countdown SHALL use the `formatTime` utility from the design system for consistent time formatting

### Requirement 5: Winner Reveal After Countdown

**User Story:** As a stream viewer, I want the podium with example team results to appear after the 5-minute countdown, so that the winner announcement has a dramatic reveal moment.

#### Acceptance Criteria

1. WHEN the current frame reaches 9000 (Carousel_Phase ends), THE Composition SHALL display the Podium with example team results
2. THE Podium SHALL reuse the existing `ClosingPodium` component (with `TeamCard` sub-components and `PODIUM_TEAMS` data)
3. THE Podium SHALL animate into view using spring animations from the design system at the Winner_Reveal moment (frame 9000)
4. WHILE the current frame is less than 9000, THE Composition SHALL not display the Podium
5. THE Podium SHALL remain visible from frame 9000 until the end of the Global Winner Announcement segment (frame 12599), consistent with the existing hide logic

### Requirement 6: Retain AudioBadge

**User Story:** As a stream viewer, I want the "AUDIO ON" badge to remain visible, so that I know the stream has audio.

#### Acceptance Criteria

1. THE Composition SHALL display the AudioBadge component at the bottom-right position throughout the entire composition duration
2. THE AudioBadge SHALL use `muted={false}` to show the "AUDIO ON" state

### Requirement 7: Retain PhaseMarker

**User Story:** As a stream viewer, I want the phase marker to remain visible, so that I can see which segment of the closing ceremony is currently active.

#### Acceptance Criteria

1. THE Composition SHALL display the PhaseMarker component at the bottom-left position throughout the entire composition duration
2. THE PhaseMarker SHALL continue to use the `CLOSING_SEGMENTS` array to determine the current phase name and progress
