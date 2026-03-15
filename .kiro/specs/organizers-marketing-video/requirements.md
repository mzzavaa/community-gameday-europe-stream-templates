# Requirements Document

## Introduction

A standalone Remotion composition for marketing and social media purposes that showcases the AWS Community GameDay Europe organizers. The video features a branded intro with logos, the organizer showcase scene (8 organizer faces with names, user groups, countries, and purple glow circles — copied from the closing ceremony), and a visually appealing outro. This composition is independent from the stream overlay pipeline and registered separately in `src/Root.tsx`.

## Glossary

- **Composition**: A Remotion video component registered in `Root.tsx` with defined resolution, fps, and duration
- **Organizer_Card**: A visual element displaying an organizer's circular face photo, name with flag emoji, user group name, and country
- **Intro_Scene**: The opening scene of the video displaying GameDay and AWS Community Europe logos with animated entrance
- **Organizer_Scene**: The main scene displaying all 8 organizer cards in a 4×2 grid layout with purple glow effects
- **Outro_Scene**: The closing scene with logos, tagline, and call-to-action visuals for social media
- **Marketing_Video**: The complete standalone Remotion composition combining Intro_Scene, Organizer_Scene, and Outro_Scene
- **Design_System**: The shared GameDayDesignSystem.tsx module providing colors (GD_DARK, GD_PURPLE, GD_VIOLET, GD_PINK, GD_ACCENT, GD_ORANGE, GD_GOLD), background layers, and glass card components

## Requirements

### Requirement 1: Standalone Composition File

**User Story:** As a marketing team member, I want the organizer video to be a separate composition file, so that it can be rendered and shared independently from the stream overlays.

#### Acceptance Criteria

1. THE Marketing_Video SHALL be defined in a dedicated composition file separate from all stream overlay files (00-, 01-, 02-, 03- prefixed files)
2. THE Marketing_Video SHALL be registered as a Composition in `src/Root.tsx` with a unique composition ID
3. THE Marketing_Video SHALL use 1280×720 resolution at 30 fps, matching the existing project standard
4. THE Marketing_Video SHALL use the Inter font family exclusively, consistent with the Design_System
5. THE Marketing_Video SHALL import and use colors and components from the shared Design_System

### Requirement 2: Branded Intro Scene

**User Story:** As a marketing team member, I want a polished intro with event branding, so that viewers immediately recognize the AWS Community GameDay Europe identity.

#### Acceptance Criteria

1. WHEN the Marketing_Video starts, THE Intro_Scene SHALL display the GameDay logo (from `public/AWSCommunityGameDayEurope/GameDay_Solid_Logo_for_swag/GameDay Logo Solid White.png`)
2. WHEN the Marketing_Video starts, THE Intro_Scene SHALL display the AWS Community Europe logo (from `public/AWSCommunityGameDayEurope/AWSCommunityEurope_last_nobackground.png`)
3. THE Intro_Scene SHALL animate the logos with spring-based entrance animations consistent with the Design_System spring presets
4. THE Intro_Scene SHALL display the event title text "AWS Community GameDay Europe" with animated entrance
5. THE Intro_Scene SHALL use the BackgroundLayer and ambient glow effects from the Design_System for visual consistency
6. THE Intro_Scene SHALL transition smoothly into the Organizer_Scene using opacity-based crossfade

### Requirement 3: Organizer Showcase Scene

**User Story:** As a marketing team member, I want to showcase all 8 community organizers with their photos and details, so that the community leaders receive visible recognition in marketing materials.

#### Acceptance Criteria

1. THE Organizer_Scene SHALL display all 8 organizers in a 4-column by 2-row grid layout
2. WHEN the Organizer_Scene becomes active, each Organizer_Card SHALL animate in with staggered spring-based entrance (each card delayed sequentially)
3. THE Organizer_Scene SHALL display the heading "COMMUNITY GAMEDAY EUROPE ORGANIZERS" above the grid
4. THE Organizer_Scene SHALL display the subheading "From the Community, for the Community" in GD_GOLD color
5. WHEN rendering an Organizer_Card, THE Organizer_Card SHALL display a circular face photo (130×130px) with purple glow box-shadow using GD_VIOLET and GD_PURPLE colors
6. WHEN rendering an Organizer_Card, THE Organizer_Card SHALL display the organizer's flag emoji and name in white bold text
7. WHEN rendering an Organizer_Card, THE Organizer_Card SHALL display the organizer's user group name in subdued white text
8. WHEN rendering an Organizer_Card, THE Organizer_Card SHALL display the organizer's country in lighter subdued text
9. THE Organizer_Scene SHALL contain the same 8 organizers as defined in the closing ceremony: Jerome (Belgium), Anda (Switzerland), Marcel (Germany), Linda (Austria), Manuel (Germany), Andreas (Germany), Lucian (Romania), Mihaly (Hungary)

### Requirement 4: Marketing Outro Scene

**User Story:** As a marketing team member, I want a visually appealing outro with branding and a call-to-action, so that the video ends professionally and drives engagement on social media.

#### Acceptance Criteria

1. WHEN the Organizer_Scene ends, THE Outro_Scene SHALL transition in with animated entrance effects
2. THE Outro_Scene SHALL display the GameDay logo and the AWS Community Europe logo
3. THE Outro_Scene SHALL display a tagline or call-to-action text (e.g., event date, website URL, or community invitation)
4. THE Outro_Scene SHALL use a radial gradient glow effect with Design_System purple/violet colors for visual impact
5. THE Outro_Scene SHALL fade to black at the end of the composition

### Requirement 5: Organizer Data Reuse

**User Story:** As a developer, I want the organizer data to be shared between the closing ceremony and the marketing video, so that updates to organizer information propagate to both compositions.

#### Acceptance Criteria

1. THE Marketing_Video SHALL reference the same organizer data (names, roles, countries, flags, face image paths) used in the closing ceremony composition
2. IF an organizer's data is updated in the source, THEN both the closing ceremony and the Marketing_Video SHALL reflect the updated data without requiring duplicate edits
