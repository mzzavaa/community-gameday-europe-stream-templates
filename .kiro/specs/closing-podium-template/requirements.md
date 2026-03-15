# Requirements Document

## Introduction

Split the closing ceremony file (`03-GameDayStreamClosing-Audio.tsx`) into two independent compositions and redesign the podium/winners template. Part A contains the fixed/prepared closing content (HeroIntro + FastScroll) that can be rendered ahead of time. Part B contains the winners template (Shuffle → Reveal/Podium → ThankYou) that requires actual winner data on game day. The podium redesign replaces the current floating-card layout with a bottom-aligned bar-chart style podium where bar heights are proportional to team scores.

## Glossary

- **Closing_File**: The current `03-GameDayStreamClosing-Audio.tsx` composition containing all closing ceremony phases
- **Part_A**: The fixed/prepared closing composition containing HeroIntro (Scenes 1-5) and FastScroll — no winner data required
- **Part_B**: The winners template composition containing Shuffle, Reveal/Podium, and ThankYou phases — requires winner data
- **Podium_Component**: The bar-chart style podium component that displays 6 ranked teams as bottom-aligned bars proportional to their scores
- **TeamData**: The data interface for a competing team: name, flag, city, country, score, and logoUrl
- **Podium_Bar**: A vertical bar in the podium whose height is proportional to the team's score relative to the highest score
- **Reveal_Sequence**: The animation sequence where teams are revealed one at a time from 6th place to 1st place
- **GD_Palette**: The project color palette: GD_DARK, GD_PURPLE, GD_VIOLET, GD_PINK, GD_ACCENT, GD_ORANGE, GD_GOLD
- **GlassCard**: The shared glass-morphism card component from GameDayDesignSystem
- **TYPOGRAPHY**: The shared typography scale constants from GameDayDesignSystem
- **Root_File**: The `src/Root.tsx` file that registers all Remotion compositions

## Requirements

### Requirement 1: Split Closing File into Part A (Fixed Closing)

**User Story:** As a stream producer, I want the fixed closing content separated into its own file, so that I can render it ahead of time without needing winner data.

#### Acceptance Criteria

1. WHEN the Closing_File is split, THE Part_A SHALL be a standalone Remotion composition file that contains HeroIntro (Scenes 1-5) and FastScroll components
2. THE Part_A SHALL contain zero references to winner data, PODIUM_TEAMS, or WINNING_CITY_TEAMS
3. THE Part_A SHALL export a main composition component and any standalone sub-compositions needed for Remotion Studio preview
4. WHEN Part_A is rendered, THE Part_A SHALL produce identical visual output to frames 0-1899 of the current Closing_File
5. THE Root_File SHALL register Part_A as a Remotion composition with the correct frame count and resolution (1280×720 at 30fps)

### Requirement 2: Split Closing File into Part B (Winners Template)

**User Story:** As a stream producer, I want the winners template separated into its own file, so that I can fill in actual winner data on game day and render it independently.

#### Acceptance Criteria

1. WHEN the Closing_File is split, THE Part_B SHALL be a standalone Remotion composition file that contains Shuffle, Reveal/Podium, and ThankYou phases
2. THE Part_B SHALL define a TeamData interface with fields: name (string), flag (string), city (string), country (string), score (number), logoUrl (string or null)
3. THE Part_B SHALL use descriptive placeholder data for all 6 podium positions: "Team #1" through "Team #6" with placeholder city, country, and logo fields
4. THE Part_B SHALL contain zero lorem ipsum text in any placeholder data
5. THE Part_B SHALL export a main composition component and standalone sub-compositions for Remotion Studio preview
6. THE Root_File SHALL register Part_B as a Remotion composition with the correct frame count and resolution (1280×720 at 30fps)

### Requirement 3: Podium Bar-Chart Layout

**User Story:** As a viewer, I want the podium to display teams as a bar chart with bottom-aligned bars, so that I can visually compare team scores at a glance.

#### Acceptance Criteria

1. THE Podium_Component SHALL render 6 Podium_Bars aligned to the bottom edge of the 720px viewport
2. WHEN a Podium_Bar is rendered, THE Podium_Component SHALL set the bar height proportional to the team's score divided by the highest score among all 6 teams
3. THE Podium_Component SHALL position the "PODIUM" title in the top 15% of the viewport
4. THE Podium_Component SHALL render places 1, 2, and 3 as a primary row with full opacity
5. THE Podium_Component SHALL render places 4, 5, and 6 positioned lower than places 1-3 with reduced opacity (between 0.5 and 0.8)
6. THE Podium_Component SHALL display the team name as the largest text element on each Podium_Bar
7. WHEN a Podium_Bar is rendered, THE Podium_Component SHALL display the team's city, country, and logo (or flag fallback) in addition to the team name and score

### Requirement 4: Podium Reveal Animation Sequence

**User Story:** As a viewer, I want teams revealed one at a time from 6th to 1st place with rising bar animations, so that the ceremony builds suspense.

#### Acceptance Criteria

1. WHEN the Reveal_Sequence begins, THE Podium_Component SHALL reveal 6th place first, then 5th, then 4th in sequence
2. WHEN 3rd place is revealed, THE Podium_Component SHALL start a new visual section for the top 3 teams
3. WHEN a top-3 team is revealed, THE Podium_Bar SHALL animate upward from zero height to its proportional height using a spring animation
4. WHEN a top-3 team bar finishes rising, THE Podium_Component SHALL reveal the team's country with a fade-in animation
5. WHEN the country is revealed, THE Podium_Component SHALL reveal the team's user group name and logo with a fade-in animation
6. WHEN 2nd place is revealed, THE Podium_Component SHALL follow the same bar-rise then country then name/logo animation pattern as 3rd place
7. WHEN 1st place is revealed, THE Podium_Component SHALL follow the same bar-rise then country then name/logo animation pattern as 3rd and 2nd place
8. WHEN all 6 teams have been revealed, THE Podium_Component SHALL display all team names sequentially from 6th to 1st as a final roll call

### Requirement 5: Animation Timing and Technical Constraints

**User Story:** As a stream producer, I want the podium ceremony to fit within 5 minutes and follow all project design conventions, so that it integrates seamlessly with the rest of the stream.

#### Acceptance Criteria

1. THE Reveal_Sequence SHALL complete within 9000 frames (5 minutes at 30fps)
2. THE Podium_Component SHALL use colors exclusively from the GD_Palette (GD_DARK, GD_PURPLE, GD_VIOLET, GD_PINK, GD_ACCENT, GD_ORANGE, GD_GOLD)
3. THE Podium_Component SHALL use GlassCard for all card-style elements
4. THE Podium_Component SHALL use the Inter font family exclusively
5. THE Podium_Component SHALL use TYPOGRAPHY scale constants for all font sizes
6. THE Podium_Component SHALL use springConfig presets and staggeredEntry from GameDayDesignSystem for all animations
7. THE Part_B SHALL render at 1280×720 resolution at 30fps

### Requirement 6: Shared Code and Export Integrity

**User Story:** As a developer, I want all shared constants, interfaces, and utility functions preserved and accessible after the split, so that both parts and existing tests continue to work.

#### Acceptance Criteria

1. WHEN the Closing_File is split, THE Part_A and Part_B SHALL share the Phase enum, phase boundary constants, and utility functions (getActivePhase, isTransitionFrame, getFadeOpacity) via a common import or co-located export
2. THE Root_File SHALL remove the old GameDayClosing import and replace it with imports from Part_A and Part_B
3. WHEN the split is complete, THE Root_File SHALL register all standalone sub-compositions (ClosingShowcase, ClosingReveal, ClosingFinalStandings, ClosingTeamPodium, ClosingThankYou) from the correct source file
4. IF an existing property test references exports from the Closing_File, THEN THE Part_A or Part_B SHALL re-export those symbols so that existing tests continue to compile
