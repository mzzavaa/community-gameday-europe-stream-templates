# Requirements Document

## Introduction

Redesign of the `2-GameDayStreamMainEvent` Remotion composition covering the first ~5 minutes (frames 0–9000) plus new persistent UI elements spanning the full 30-minute (54000-frame) composition. The stream host Linda Mohamed speaks for the first ~60 seconds (frames 0–1799), after which Jerome and Anda appear on camera and speak until approximately the 25:00 countdown mark (frame 9000).

Many attendees across 53+ cities may have bad audio or no idea who is on screen, so every critical piece of information from the moderation must appear as on-screen text. The speaker bubble system must be visible from frame 0 so attendees immediately know who is talking. The very first thing viewers see is a SpeakerBubble greeting from Linda ("Hello everyone! I will guide you through the stream today! Make sure you have your audio turned on for the next 30 minutes") lasting approximately 8 seconds (frames 0–239), displayed above a full-width StreamHostCard that prominently introduces Linda. At frame 240, the StreamHostCard animates to compact mode and the info cards begin their sequence following the moderation script.

The redesign must:
- Fix visual bugs in the intro (sharp map edges, misaligned host card, inconsistent font sizes)
- Show a SpeakerBubble greeting from Linda at frame 0 before any info cards appear
- Show every key point from the moderation script as on-screen text via InfoCardDisplay cards (starting at frame 240 after the greeting)
- Show the stream host speaker bubble from frame 0 so attendees know who Linda is
- Shrink the sidebar to compact mode when Jerome and Anda appear (frame 1800) and keep it compact
- Show Jerome and Anda info persistently with CurrentlySpeaking context until the 25:00 mark
- Replace the current PhaseMarker with an enhanced PhaseTimeline featuring a snail mascot
- Add a SpeakerBubbles system showing current speaker (large) and next speaker (small) throughout
- Hide redundant speaker names from schedule sidebar cards (the bubble system replaces them)
- Leave the composition core data arrays and post-intro logic intact

### Full Moderation Script (Source of Truth for First 60 Seconds)

> Hello everybody and welcome to the first AWS Community GameDay Europe. Today we will have 53 AWS User Groups all over Europe competing against each other within X different countries and different timezones. From now on you will see a countdown here at the top right corner of the screen where this stream is shared with you. If you cannot hear us, now is the last chance to connect to your audio and if it is not working, for whatever reason, use the provided video as a fallback so that you don't miss the important GameDay instructions. This stream is going to be muted as soon as the game starts but we will see us again as soon as the second timer runs out to celebrate the global winners together, so make sure you stay in the stream so that you don't miss anything that probably happens in between - again, there will be no audio from our side during gameplay. Before we start the game I would like to introduce you to some people and clarify some things that probably some of you are still wondering about. This event consists of two very important parts coming together: the AWS Community and AWS itself. All of the organization behind this event was done by the AWS Community - so people who are not employed by AWS and do all of that voluntary in their free time - just like every User Group leader that is organizing one of the events in the 53 cities that are participating. I want to introduce you to the 2 most important people behind this initiative. Anda and Jerome!

After this point (frame 1800), Jerome and Anda appear on camera. The sidebar shrinks to compact mode and stays compact for the remaining 28+ minutes.

## Glossary

- **Intro_Section**: Frames 0–1799 (first 60 seconds at 30 fps) when Linda speaks and info cards appear
- **InfoCardDisplay**: Timed glass-card overlay showing key moderation points in sequence during the Intro_Section, starting at frame 240 after the greeting bubble
- **SpeakerBubble_Greeting**: Speech/chat bubble style text element displayed near Linda's SpeakerBubble at frame 0 with the greeting "Hello everyone! I will guide you through the stream today! Make sure you have your audio turned on for the next 30 minutes", visible for frames 0–239 (approximately 8 seconds)
- **StreamHostCard**: Card showing the stream host avatar, name, title, and User Group logo; has two phases: full-width during the greeting phase (frames 0–239) and compact during info cards (frames 240+)
- **StreamHostCard_FullWidth**: The prominent full-width version of the StreamHostCard visible during the greeting phase (frames 0–239), styled after the V4 archive UG cards (CardCoverV4 / GroupsScrollSceneV4) with large UG Vienna logo cover on the right, full title, Austrian flag emoji, location, and GlassCard frosted-glass styling with accent glow line
- **StreamHostCard_Compact**: The smaller 50% width version of the StreamHostCard visible from frame 240 onward, showing avatar, name, title, and small UG logo in the left column
- **ScheduleSidebar**: Right-side panel (42% width) listing schedule segments; full-width during intro
- **CompactSidebar**: Narrower version of ScheduleSidebar (~28% width) that activates at frame 1800 and persists for the remaining duration
- **EuropeMap**: Background image of Europe with a radial vignette overlay, visible during the intro and beyond
- **CountdownTimer**: Top-left element showing remaining time until game start in MM:SS format
- **AudioBadge**: Small bottom-right indicator showing current audio state (muted/unmuted)
- **GlassCard**: Shared design-system component with frosted-glass blur, border, and shadow
- **DesignSystem**: Shared module at `shared/GameDayDesignSystem.tsx` providing colors, springs, timing, and components
- **ModerationScript**: The host spoken script whose key points must all appear on screen as text
- **Composition**: The full 54000-frame (30-minute) Remotion video component at 1280×720, 30 fps
- **OrganizerSection**: Persistent display area for Jerome and Anda info visible from frame 1800 until frame 9000 (25:00 countdown mark)
- **OrganizerCards**: Individual cards within OrganizerSection showing each organizer face, name, UG affiliation, and location
- **CurrentlySpeaking**: Contextual label displayed alongside the OrganizerSection (e.g. "Currently Speaking — Why this Community GameDay exists")
- **PhaseTimeline**: Horizontal progress bar replacing the current PhaseMarker; shows current phase label on left, milestone markers along the bar, and a snail mascot moving through it
- **SpeakerBubbles**: Floating avatar bubbles showing the current speaker (larger) and next speaker (smaller), visible from frame 0 throughout the entire composition
- **MAIN_EVENT_SEGMENTS**: Immutable data array of 6 high-level schedule segments totalling 54000 frames (Community Intro, Support Process, Special Guest, AWS Gamemasters Intro, GameDay Instructions, Distribute Codes). Special Guest identity is not revealed in the sidebar.
- **TIMELINE_CHAPTERS**: Immutable data array of 12 detailed chapter markers used for Remotion Studio timeline and speaker data

## Requirements

### Requirement 1: Europe Map Seamless Edge Blending

**User Story:** As a viewer, I want the Europe map background to blend seamlessly into the dark background, so that there are no visible sharp corners or hard edges.

#### Acceptance Criteria

1. WHILE the EuropeMap is visible, THE EuropeMap SHALL use a radial-gradient vignette that fades all edges to full transparency before reaching the container boundary
2. WHILE the EuropeMap is visible, THE EuropeMap SHALL NOT use borderRadius on the container to clip edges
3. WHEN the EuropeMap renders at any frame between 0 and 12000, THE EuropeMap SHALL produce no visible hard edges against the GD_DARK background
4. THE EuropeMap SHALL use an oversized container (at least 20% larger than the visible map area) so the vignette gradient has room to fade completely

### Requirement 2: StreamHostCard Two-Phase Layout

**User Story:** As a viewer, I want to see a prominent full-width host card when the stream starts so I immediately know who Linda is and where she's from, and then see it shrink to a compact version when the informational content begins, so the screen isn't cluttered.

#### Acceptance Criteria

1. DURING frames 0–239 (SpeakerBubble greeting phase), THE StreamHostCard SHALL be displayed at full composition width (minus left/right margins of 36px) as a prominent introduction card
2. THE StreamHostCard_FullWidth SHALL display: Linda's circular face avatar (with GD_VIOLET glow), "YOUR STREAM HOST" label, "Linda Mohamed" name, full title "AWS Community Hero · AWS & Women's User Group Vienna · Förderverein AWS Community DACH", Austrian flag emoji (🇦🇹) with "Vienna, Austria" location text with pin icon
3. THE StreamHostCard_FullWidth SHALL display the UG Vienna logo prominently on the right side as a card cover image (V4 archive style from CardCoverV4), with "AWS UG Vienna" label below it
4. THE StreamHostCard_FullWidth SHALL use GlassCard styling consistent with the DesignSystem
5. WHEN frame reaches 240 (info cards begin), THE StreamHostCard SHALL animate from full-width to compact mode (50% width, left-aligned at left: 36) using springConfig.entry
6. THE StreamHostCard_Compact SHALL match the current compact layout: avatar, name, title, and small UG logo
7. THE StreamHostCard_Compact SHALL be positioned in the lower-middle area of the left column, leaving at least 120px of clear space below it for the PhaseTimeline
8. THE StreamHostCard SHALL NOT overlap with or crowd the PhaseTimeline area at the bottom of the screen
9. THE ScheduleSidebar SHALL slide in at frame 900 (30 seconds into the composition) to allow the greeting bubble and first info cards to establish context before the sidebar appears

### Requirement 3: Consistent Label Font Sizes

**User Story:** As a viewer, I want all section labels in the intro to use a consistent font size, so that the visual hierarchy is clear and uniform.

#### Acceptance Criteria

1. THE Intro_Section SHALL use a single font size for all section labels (GameDay Countdown, Schedule Until Game Start, Your Stream Host, InfoCardDisplay labels)
2. THE Intro_Section SHALL use a single font size for all section labels, with that size being between 14px and 16px
3. THE Intro_Section SHALL use consistent letterSpacing and textTransform uppercase for all section labels
4. WHEN a new InfoCardDisplay card appears, THE InfoCardDisplay label SHALL use the same font size as the CountdownTimer label and the ScheduleSidebar title

### Requirement 4: Complete Moderation Script Coverage

**User Story:** As a viewer (especially one with bad audio), I want every key point from the host moderation script to appear as on-screen text, so that I can follow along even without audio.

#### Acceptance Criteria

1. THE InfoCardDisplay SHALL include a card for the welcome message: First AWS Community GameDay Europe with the stat "53+ User Groups across 20+ countries"
2. THE InfoCardDisplay SHALL include a card for the countdown explanation: 30 minutes until game start, the timer is visible at the top of the screen
3. THE InfoCardDisplay SHALL include a card for the audio check: connect audio now, use fallback video if needed
4. THE InfoCardDisplay SHALL include a card for the mute warning: stream will be muted during gameplay, we will be back when the timer runs out
5. THE InfoCardDisplay SHALL include a card stating the event is organized by community volunteers, not AWS employees
6. THE InfoCardDisplay SHALL include a card introducing Jerome and Anda as the two most important people behind this initiative who will walk through GameDay details
7. WHEN each InfoCardDisplay card is active, THE InfoCardDisplay SHALL display the card for a minimum of 8 seconds (240 frames) to ensure readability

### Requirement 5: Location Information Visibility

**User Story:** As a viewer, I want to see the locations mentioned in the moderation (Vienna, Brussels, Geneva) on screen, so that I know where the organizers and host are based.

#### Acceptance Criteria

1. THE StreamHostCard SHALL display "Vienna" as part of the host User Group affiliation (AWS and Women's UG Vienna)
2. THE InfoCardDisplay card for the organizers SHALL display "Brussels" associated with Jerome (AWS User Group Belgium)
3. THE InfoCardDisplay card for the organizers SHALL display "Geneva" associated with Anda (AWS User Group Geneva)
4. WHEN location information is displayed, THE Intro_Section SHALL use a location pin icon or text prefix to visually distinguish location data

### Requirement 6: Info Card Sequencing and Timing

**User Story:** As a viewer, I want the info cards to appear in the same order as the host spoken script, so that the visual and audio content are synchronized.

#### Acceptance Criteria

1. THE InfoCardDisplay SHALL sequence cards in this order: (1) Welcome/stats (frames 240–539), (2) Countdown explanation (frames 540–779), (3) Audio check (frames 780–1019), (4) Mute warning (frames 1020–1349), (5) Community organized (frames 1350–1559), (6) Meet the organizers (frames 1560–1799)
2. THE InfoCardDisplay SHALL ensure each card has a spring-animated entry and a fade-out exit with at least 20 frames of transition
3. THE InfoCardDisplay SHALL ensure no two cards overlap in their visible frame ranges
4. WHEN a card exits, THE InfoCardDisplay SHALL begin the next card within 10 frames to maintain visual continuity
5. THE InfoCardDisplay SHALL cover frames 240–1799 of the Intro_Section (not frames 0–239, which are reserved for the SpeakerBubble greeting) with no gaps longer than 30 frames where no card is visible
6. THE InfoCardDisplay SHALL NOT display any cards during frames 0–239, as this window is reserved for the SpeakerBubble greeting bubble

### Requirement 7: Design System Compliance

**User Story:** As a developer, I want the redesign to use only shared DesignSystem components and constants, so that the visual language is consistent with the rest of the GameDay compositions.

#### Acceptance Criteria

1. THE Composition SHALL use colors exclusively from the DesignSystem palette (GD_DARK, GD_PURPLE, GD_VIOLET, GD_PINK, GD_ACCENT, GD_ORANGE, GD_GOLD)
2. THE Composition SHALL use GlassCard for all card-style UI elements
3. THE Composition SHALL use springConfig presets (entry, exit, emphasis) for all spring animations
4. THE Composition SHALL use staggeredEntry for sequencing multiple animated elements
5. THE Composition SHALL use BackgroundLayer and HexGridOverlay as the base layers
6. THE Composition SHALL use the Inter font family for all text elements

### Requirement 8: Info Card Highlight Styling

**User Story:** As a viewer, I want key phrases in info cards to be visually highlighted, so that the most important information stands out at a glance.

#### Acceptance Criteria

1. WHEN an InfoCardDisplay card contains a critical phrase (e.g. "Connect your audio now", "muted during gameplay", "not employed by AWS"), THE InfoCardDisplay SHALL render that phrase in a distinct highlight color matching the card border color
2. THE InfoCardDisplay SHALL render highlighted phrases with fontWeight 700 to distinguish them from surrounding text
3. THE InfoCardDisplay SHALL use the card borderColor as the highlight color to maintain visual coherence

### Requirement 9: Countdown Explanation Card

**User Story:** As a viewer, I want to see an on-screen explanation of what the countdown means, so that I understand the 30-minute timer context even without audio.

#### Acceptance Criteria

1. THE InfoCardDisplay SHALL include a card that explains the countdown: the timer shows 30 minutes until game start
2. WHEN the countdown explanation card is visible, THE CountdownTimer SHALL already be visible on screen so the viewer can see what the card refers to
3. THE countdown explanation card SHALL appear at approximately frames 540–779 of the Intro_Section (after the greeting bubble and welcome card)

### Requirement 10: Organizer Card with Faces and Locations

**User Story:** As a viewer, I want to see the organizers' faces and their User Group locations when they are introduced, so that I can recognize them when they appear on camera moments later.

#### Acceptance Criteria

1. WHEN the "Meet the Organizers" InfoCardDisplay card is active, THE Intro_Section SHALL display Jerome's face image from `AWSCommunityGameDayEurope/faces/jerome.jpg`
2. WHEN the "Meet the Organizers" InfoCardDisplay card is active, THE Intro_Section SHALL display Anda's face image from `AWSCommunityGameDayEurope/faces/anda.jpg`
3. THE organizer card SHALL display Jerome's affiliation as "AWS User Group Belgium" with location "Brussels"
4. THE organizer card SHALL display Anda's affiliation as "AWS User Group Geneva" with location "Geneva"
5. THE organizer faces SHALL be rendered as circular avatars (borderRadius 50%) with a GD_VIOLET glow shadow, matching the reference design in GameDayStreamOverlay IntroScene

### Requirement 11: Speaker Bubble from Frame 0

**User Story:** As a viewer who has no idea who Linda Mohamed is, I want to see a speaker bubble with her face and name from the very first frame of the stream, so that I immediately know who is talking to me and why.

#### Acceptance Criteria

1. THE SpeakerBubbles SHALL appear at frame 0 with Linda Mohamed as the current speaker (larger bubble, ~64px) visible from the very first frame
2. WHEN the composition starts at frame 0, THE SpeakerBubbles SHALL display a greeting text bubble with the text "Hello everyone! I will guide you through the stream today! Make sure you have your audio turned on for the next 30 minutes" as a speech/chat bubble style element near Linda's speaker bubble
3. THE SpeakerBubble greeting text bubble SHALL be visible for approximately 8 seconds (frames 0–239) before fading out
4. THE SpeakerBubble greeting text bubble SHALL appear BEFORE any InfoCardDisplay cards are shown, establishing Linda as the host before informational content begins
5. DURING the first 60 seconds (frames 0–1799), THE SpeakerBubbles SHALL display Linda's avatar as the current speaker alongside the InfoCardDisplay cards and other intro elements
6. THE SpeakerBubbles current speaker bubble SHALL include the speaker name below or beside the avatar so viewers know who is talking
7. THE SpeakerBubbles SHALL also show the next speaker(s) as a smaller bubble (~40px) — during the intro this would be Jerome and Anda
8. DURING frames 0–239, THE SpeakerBubble greeting SHALL appear ABOVE the StreamHostCard_FullWidth (not beside it or overlapping it), and at all times THE SpeakerBubbles SHALL be positioned so they do not overlap with the InfoCardDisplay cards, CountdownTimer, or StreamHostCard

### Requirement 12: Speaker Bubble System (Full Composition)

**User Story:** As a viewer, I want to always see who is currently speaking and who speaks next via floating avatar bubbles, so that I can follow along even with bad audio.

#### Acceptance Criteria

1. THE SpeakerBubbles SHALL display the current speaker avatar as a larger circular bubble (~64px diameter) with a glowing GD_VIOLET border
2. THE SpeakerBubbles SHALL display the next speaker avatar as a smaller circular bubble (~40px diameter) with a subtle GD_PURPLE border at 50% opacity
3. THE SpeakerBubbles SHALL be visible throughout the entire composition (frames 0–53999)
4. WHEN the active speaker changes (based on MAIN_EVENT_SEGMENTS and TIMELINE_CHAPTERS speaker data), THE SpeakerBubbles SHALL animate the transition with a spring animation
5. THE SpeakerBubbles SHALL derive speaker information from the speakers field in MAIN_EVENT_SEGMENTS and TIMELINE_CHAPTERS
6. THE SpeakerBubbles current speaker bubble SHALL display the speaker name text

### Requirement 13: Sidebar Compact Mode

**User Story:** As a viewer, I want the schedule sidebar to shrink when Jerome and Anda appear on camera, so that there is room for both organizers to be displayed side by side.

#### Acceptance Criteria

1. WHEN the frame reaches 1800 (Jerome and Anda appear), THE ScheduleSidebar SHALL animate to CompactSidebar mode with reduced width (from 42% to ~28%)
2. THE CompactSidebar SHALL remain in compact mode for the entire remaining duration of the composition (frames 1800–53999)
3. THE CompactSidebar SHALL preserve all schedule segment information (labels, active states, progress indicators) in the narrower layout
4. THE CompactSidebar transition SHALL use a spring animation from the DesignSystem (springConfig.entry) for a smooth width reduction
5. THE CompactSidebar SHALL use smaller font sizes and tighter padding to fit content in the reduced width

### Requirement 14: Organizer Persistent Display

**User Story:** As a viewer, I want to see Jerome and Anda information (faces, names, User Group affiliations) persistently on screen while they are speaking, so that I know who is presenting.

#### Acceptance Criteria

1. WHEN the frame reaches 1800, THE OrganizerSection SHALL appear with Jerome and Anda OrganizerCards displayed side by side in the space freed by the CompactSidebar
2. THE OrganizerSection SHALL remain visible until the 25:00 countdown mark (frame 9000)
3. EACH OrganizerCard SHALL display: circular face avatar, name, User Group affiliation, and location (Brussels for Jerome, Geneva for Anda)
4. THE OrganizerSection SHALL include a CurrentlySpeaking label (e.g. "Currently Speaking — Why this Community GameDay exists") to provide context about what the organizers are discussing
5. THE OrganizerSection SHALL use GlassCard styling consistent with the DesignSystem
6. WHEN the frame reaches 9000, THE OrganizerSection SHALL fade out with a spring-animated exit

### Requirement 15: Enhanced Phase Timeline

**User Story:** As a viewer, I want to see a detailed phase timeline showing where we are in the event, so that I understand the overall flow and how long each phase lasts.

#### Acceptance Criteria

1. THE PhaseTimeline SHALL replace the current PhaseMarker component with a horizontal progress bar at the bottom of the screen
2. THE PhaseTimeline SHALL display the current phase label on the left side (e.g. "Current Phase / Community Intro")
3. THE PhaseTimeline SHALL display milestone markers along the bar: Game Start, Gameplay ~2h, Ceremony
4. THE PhaseTimeline SHALL include a snail mascot icon that moves along the progress bar as the composition progresses through phases
5. THE PhaseTimeline SHALL show the full event structure from the start, so viewers always know what is coming next
6. THE PhaseTimeline snail position SHALL be calculated based on the current frame relative to the total composition duration
7. THE PhaseTimeline SHALL use DesignSystem colors and GlassCard styling for the bar background

### Requirement 16: Schedule Cards Hide Redundant Speaker Names

**User Story:** As a viewer, I want the schedule sidebar cards to not display speaker names inline, since the speaker bubble system already shows who is talking.

#### Acceptance Criteria

1. THE ScheduleCard component SHALL NOT render the speakers field text within individual schedule cards
2. THE MAIN_EVENT_SEGMENTS and TIMELINE_CHAPTERS data arrays SHALL retain the speakers field in the data (it is consumed by SpeakerBubbles), but the sidebar card UI SHALL NOT render it
3. THE ScheduleCard SHALL display only the segment label and active/completed/upcoming state indicators

### Requirement 17: Preserve Core Composition Integrity

**User Story:** As a developer, I want all new features (compact sidebar, organizer section, phase timeline, speaker bubbles) to integrate without breaking the existing composition structure.

#### Acceptance Criteria

1. THE Composition SHALL maintain its total duration of 54000 frames (30 minutes at 30 fps)
2. THE Composition SHALL maintain its resolution of 1280×720 at 30 fps
3. THE MAIN_EVENT_SEGMENTS data array SHALL NOT be modified (values, order, or structure)
4. THE TIMELINE_CHAPTERS data array SHALL NOT be modified (values, order, or structure)
5. ALL new components (CompactSidebar, OrganizerSection, PhaseTimeline, SpeakerBubbles) SHALL be additive and must not remove or replace existing components used after frame 1800, except for PhaseMarker which is fully replaced by PhaseTimeline
6. THE Composition SHALL continue to compile without errors against the project tsconfig.json
7. THE AudioBadge component SHALL NOT be altered
