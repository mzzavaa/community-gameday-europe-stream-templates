# Requirements Document

## Introduction

This feature adds a podium-style ceremony visualization to the Closing Ceremony composition (`4-GameDayStreamClosing.tsx`). The podium displays example top-6 team results with animated reveals during the "Results Reveal" and "Global Winner Announcement" segments (frames 0–12599). It uses placeholder team data sourced from the existing USER_GROUPS and LOGO_MAP datasets, since actual winners are not known at build time. The podium integrates into the existing layer stack without disrupting the sidebar, countdown, phase marker, or audio badge.

## Glossary

- **Podium_Component**: A React component rendered within the closing composition that displays the top 3 teams in a podium layout (1st center/tallest, 2nd left, 3rd right) and teams 4–6 in a row below
- **Team_Card**: A visual card element displaying a team's rank, "TEAM" label, team name, score, and optional UG logo image
- **Reveal_Sequence**: A staggered spring animation sequence where team cards appear one by one in a defined order
- **Closing_Composition**: The `GameDayClosing` React/Remotion composition in `4-GameDayStreamClosing.tsx` (54,000 frames, 1280×720, 30fps)
- **Results_Reveal_Segment**: The first closing segment (frames 0–5399, 3 minutes) where the podium reveal animation plays
- **Winner_Announcement_Segment**: The second closing segment (frames 5400–12599, 4 minutes) where the completed podium remains visible
- **Example_Team_Data**: Placeholder team entries derived from USER_GROUPS and LOGO_MAP in `archive/CommunityGamedayEuropeV4.tsx`, each with a rank, team name, score, flag, city, and logo URL
- **Design_System**: The shared GameDay design system (`shared/GameDayDesignSystem.tsx`) providing colors (GD_DARK, GD_GOLD, GD_VIOLET, GD_ACCENT), spring presets, and reusable components
- **Podium_Header**: A header element displaying "PODIUM" text flanked by trophy emojis (🏆)

## Requirements

### Requirement 1: Podium Header Display

**User Story:** As a stream viewer, I want to see a clear "PODIUM" header with trophy emojis, so that I immediately understand the ceremony context.

#### Acceptance Criteria

1. WHEN the Results_Reveal_Segment begins (frame 0), THE Podium_Component SHALL display a Podium_Header containing the text "🏆 PODIUM 🏆"
2. THE Podium_Header SHALL use the GD_GOLD color for the text
3. THE Podium_Header SHALL use uppercase lettering with a font weight of 900 and letter spacing of at least 4px
4. THE Podium_Header SHALL be positioned at the top-center of the podium area within the left 58% of the screen (avoiding the sidebar)

### Requirement 2: Top 3 Podium Layout

**User Story:** As a stream viewer, I want to see the top 3 teams arranged in a classic podium formation, so that the ranking hierarchy is visually obvious.

#### Acceptance Criteria

1. THE Podium_Component SHALL display 3 Team_Cards in a horizontal podium arrangement: 2nd place on the left, 1st place in the center, 3rd place on the right
2. THE 1st-place Team_Card SHALL be visually taller than the 2nd-place and 3rd-place Team_Cards to represent the podium height hierarchy
3. WHEN a Team_Card represents 1st place, THE Podium_Component SHALL apply a GD_GOLD border accent to the Team_Card
4. WHEN a Team_Card represents 2nd or 3rd place, THE Podium_Component SHALL apply a lighter gold or silver-toned border accent to the Team_Card
5. THE podium arrangement SHALL be horizontally centered within the left 58% of the screen to avoid overlapping the closing ceremony sidebar

### Requirement 3: Team Card Content

**User Story:** As a stream viewer, I want each team card to show the rank, team name, score, and logo, so that I can identify each team and their performance.

#### Acceptance Criteria

1. THE Team_Card SHALL display the rank number (1–6) in a prominent position
2. THE Team_Card SHALL display a "TEAM" label in uppercase above the team name
3. THE Team_Card SHALL display the team name sourced from Example_Team_Data
4. THE Team_Card SHALL display the team score in GD_GOLD color
5. WHEN a logo URL exists in LOGO_MAP for the team, THE Team_Card SHALL display the UG logo image
6. WHEN no logo URL exists in LOGO_MAP for the team, THE Team_Card SHALL display the team's country flag emoji as a fallback

### Requirement 4: Teams 4–6 Row

**User Story:** As a stream viewer, I want to see teams ranked 4th through 6th displayed below the podium, so that more teams are recognized.

#### Acceptance Criteria

1. THE Podium_Component SHALL display Team_Cards for ranks 4, 5, and 6 in a horizontal row below the top-3 podium
2. THE rank 4–6 Team_Cards SHALL be smaller in size than the top-3 Team_Cards
3. THE rank 4–6 row SHALL be horizontally centered and aligned with the podium above

### Requirement 5: Example Team Data

**User Story:** As a developer, I want the podium to use realistic placeholder data from existing user groups, so that the ceremony looks authentic during preview and testing.

#### Acceptance Criteria

1. THE Podium_Component SHALL source Example_Team_Data from 6 entries selected from the USER_GROUPS array in `archive/CommunityGamedayEuropeV4.tsx`
2. THE Example_Team_Data SHALL include a team name, flag, city, and score for each of the 6 entries
3. THE Example_Team_Data SHALL include logo URLs from LOGO_MAP for teams that have a matching entry
4. THE Example_Team_Data scores SHALL be distinct numeric values ordered from highest (rank 1) to lowest (rank 6)

### Requirement 6: Animated Reveal Sequence

**User Story:** As a stream viewer, I want the teams to appear one by one with smooth animations, so that the reveal feels dramatic and engaging.

#### Acceptance Criteria

1. WHEN the Results_Reveal_Segment begins, THE Reveal_Sequence SHALL animate Team_Cards into view one at a time using spring animations from the Design_System
2. THE Reveal_Sequence SHALL reveal teams in reverse rank order: 6th place first, then 5th, 4th, 3rd, 2nd, and 1st place last
3. THE Reveal_Sequence SHALL use a stagger delay of at least 300 frames (10 seconds) between each team reveal
4. WHEN a Team_Card is revealed, THE Reveal_Sequence SHALL animate the card from opacity 0 to opacity 1 and from a scaled-down or translated-off state to its final position using a spring animation
5. THE Reveal_Sequence SHALL complete all 6 reveals within the Results_Reveal_Segment (before frame 5400)

### Requirement 7: Podium Visibility During Winner Announcement

**User Story:** As a stream viewer, I want the completed podium to remain visible during the Global Winner Announcement, so that results stay on screen while winners are discussed.

#### Acceptance Criteria

1. WHILE the Winner_Announcement_Segment is active (frames 5400–12599), THE Podium_Component SHALL remain fully visible with all 6 Team_Cards displayed
2. WHEN the Winner_Announcement_Segment ends (frame 12600), THE Podium_Component SHALL no longer be visible

### Requirement 8: Dark Background and Color Scheme

**User Story:** As a stream viewer, I want the podium to match the GameDay celebration color scheme, so that the visual style is consistent with the rest of the closing ceremony.

#### Acceptance Criteria

1. THE Team_Card backgrounds SHALL use a semi-transparent glass-card style consistent with the GlassCard component from the Design_System
2. THE Podium_Component SHALL use GD_GOLD as the primary accent color for borders, scores, and highlights
3. THE Podium_Component SHALL render on top of the existing BackgroundLayer and HexGridOverlay without adding a separate opaque background

### Requirement 9: Non-Interference with Existing Layers

**User Story:** As a developer, I want the podium to integrate cleanly into the existing closing composition layer stack, so that the countdown, sidebar, phase marker, and audio badge continue to function correctly.

#### Acceptance Criteria

1. THE Podium_Component SHALL not overlap or obscure the closing ceremony sidebar (right 42% of the screen)
2. THE Podium_Component SHALL not overlap or obscure the countdown timer (top-left corner)
3. THE Podium_Component SHALL not overlap or obscure the phase marker (bottom-left corner)
4. THE Podium_Component SHALL not overlap or obscure the AudioBadge (bottom-right corner)
5. THE Podium_Component SHALL be rendered as a layer within the existing Closing_Composition AbsoluteFill structure

### Requirement 10: Responsive to Segment Transitions

**User Story:** As a stream viewer, I want the podium to respect the segment transition flash effect, so that the ceremony feels cohesive with other segment changes.

#### Acceptance Criteria

1. WHEN a segment transition flash occurs during the Results_Reveal_Segment or Winner_Announcement_Segment, THE Podium_Component SHALL remain visible beneath the flash overlay
2. THE Podium_Component SHALL have a z-index lower than the segment transition flash overlay
