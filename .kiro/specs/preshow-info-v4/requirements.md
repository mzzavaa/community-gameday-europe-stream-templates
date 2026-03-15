# Requirements Document

## Introduction

PreShowInfoV4 is a copy of the existing PreShowInfoV3 Remotion composition (`04v3-GameDayStreamPreShowInfo-V3.tsx`) with targeted visual and content changes. The V4 version improves UG spotlight cards (borderless logos, country/city info instead of redundant stats), adds official program logos to community education slides, and de-emphasizes Linda's Hero status on the Hero explanation slide while keeping her as the stream host.

## Glossary

- **Composition**: A Remotion video composition registered in `src/Root.tsx` and rendered as a standalone video segment.
- **SlideUGSpotlight**: The slide component that showcases individual User Groups during the pre-show loop, displaying their logo/flag, name, and metadata.
- **SlideUGLeader**: The community education slide explaining what an AWS User Group Leader is.
- **SlideCommunityBuilder**: The community education slide explaining what an AWS Community Builder is.
- **SlideCommunityHero**: The community education slide explaining what an AWS Community Hero is.
- **SlideMeetLinda**: The slide introducing Linda Mohamed as the stream host.
- **LOGO_MAP**: A record mapping User Group names to their logo image URLs, imported from `archive/CommunityGamedayEuropeV4.tsx`.
- **USER_GROUPS**: The array of 57 participating User Groups with flag emoji, name, and city (format: "City, Country").
- **StatBox**: A small rectangular UI element in the UG spotlight showing a label and value (e.g., "Group: 3 of 57", "Event: GameDay Europe 2026").
- **TopBar**: The persistent header bar showing logos and countdown timers, present on every slide.
- **TransitionSeries**: Remotion's transition system used to sequence slides with fade/slide animations.

## Requirements

### Requirement 1: Create V4 Composition File

**User Story:** As a developer, I want a new V4 composition file copied from V3, so that I can make changes without affecting the existing V3 composition.

#### Acceptance Criteria

1. THE Composition SHALL be created as a new file at `compositions/04v4-GameDayStreamPreShowInfo-V4.tsx`.
2. THE Composition SHALL export a component named `GameDayPreShowInfoV4`.
3. THE Composition SHALL be registered in `src/Root.tsx` with the id `GameDayPreShowInfoV4`, 54000 durationInFrames, 30 fps, and 1280×720 resolution.
4. THE Composition SHALL preserve all existing V3 functionality (slides, transitions, timing, TopBar, AudioBadge) except where explicitly changed by other requirements.

### Requirement 2: Remove Border from UG Spotlight Logos

**User Story:** As a viewer, I want UG logos displayed without a visible border, so that the logos look cleaner and more professional.

#### Acceptance Criteria

1. WHEN a User Group has a logo in LOGO_MAP, THE SlideUGSpotlight SHALL display the logo container without a border (remove the `1px solid ${GD_VIOLET}33` border).
2. WHEN a User Group has a logo in LOGO_MAP, THE SlideUGSpotlight SHALL display the logo container with rounded corners (borderRadius: 20).
3. THE SlideUGSpotlight SHALL retain the existing background, padding, and sizing of the logo container.

### Requirement 3: Replace Event and Status Stats with Country and City

**User Story:** As a viewer, I want to see the country and city of each User Group instead of redundant event and status information, so that I learn where each group is located.

#### Acceptance Criteria

1. THE SlideUGSpotlight SHALL NOT display the "Event" stat box (previously showing "GameDay Europe 2026").
2. THE SlideUGSpotlight SHALL NOT display the "Status" stat box (previously showing "COMPETING").
3. THE SlideUGSpotlight SHALL display a "Country" stat box showing the country flag emoji and the country name extracted from the `city` field (the part after the comma).
4. THE SlideUGSpotlight SHALL display a "City" stat box showing the city name extracted from the `city` field (the part before the comma).
5. THE SlideUGSpotlight SHALL retain the "Group" stat box (showing "N of 57") and the "Location" stat box.
6. WHEN a User Group has no logo in LOGO_MAP, THE SlideUGSpotlight SHALL display the flag emoji prominently on top (existing behavior preserved).

### Requirement 4: Add UG Leader Badge Logo to SlideUGLeader

**User Story:** As a viewer, I want to see the official AWS User Group Leader badge on the UG Leader education slide, so that the slide has a recognizable visual identity.

#### Acceptance Criteria

1. THE SlideUGLeader SHALL display the "Usergroups-badges_leader-dark" image asset from the public folder.
2. THE Asset SHALL be saved to `public/AWSCommunityGameDayEurope/ug-leader-badge-dark.png` (downloaded from the Notion database).
3. THE SlideUGLeader SHALL display the badge image using `staticFile()` with appropriate sizing that fits the slide layout without overwhelming the content.

### Requirement 5: Add AWS Community Hero Logo to SlideCommunityHero

**User Story:** As a viewer, I want to see the official AWS Community Hero logo on the Hero education slide, so that the slide has a recognizable visual identity.

#### Acceptance Criteria

1. THE SlideCommunityHero SHALL display the AWS Community Hero logo image.
2. THE Asset SHALL be saved to `public/AWSCommunityGameDayEurope/aws-community-hero-logo.svg` (downloaded from `https://builder.aws.com/assets/Hero_Default_Light-W1mudtFL.svg`).
3. THE SlideCommunityHero SHALL display the logo using `staticFile()` with appropriate sizing.

### Requirement 6: Add AWS Community Builder Logo to SlideCommunityBuilder

**User Story:** As a viewer, I want to see the official AWS Community Builder logo on the Builder education slide, so that the slide has a recognizable visual identity.

#### Acceptance Criteria

1. THE SlideCommunityBuilder SHALL display the AWS Community Builder logo image.
2. THE Asset SHALL be saved to `public/AWSCommunityGameDayEurope/aws-community-builder-logo.png` (downloaded from `https://d2908q01vomqb2.cloudfront.net/da4b9237bacccdf19c0760cab7aec4a8359010b0/2020/07/23/AWS-CBs-blog-image.png`).
3. THE SlideCommunityBuilder SHALL display the logo using `staticFile()` with appropriate sizing.

### Requirement 7: De-emphasize Linda on SlideCommunityHero

**User Story:** As a viewer, I want the Community Hero slide to generically explain what a Hero is, so that the slide educates about the program rather than spotlighting one individual.

#### Acceptance Criteria

1. THE SlideCommunityHero SHALL NOT display Linda's photo prominently as the main visual element.
2. THE SlideCommunityHero SHALL NOT display the "AWS Hero" badge with Linda's name underneath.
3. THE SlideCommunityHero SHALL present a generic explanation of the AWS Community Hero program, describing what Heroes do and how they are recognized.
4. THE SlideCommunityHero SHALL use the AWS Community Hero logo (from Requirement 5) as the primary visual element instead of Linda's photo.
5. THE SlideCommunityHero SHALL retain the educational bullet points about Hero categories and recognition criteria.

### Requirement 8: Tone Down Hero Emphasis on SlideMeetLinda

**User Story:** As a viewer, I want Linda presented primarily as the stream host rather than as a Hero, so that the focus is on her role in today's event.

#### Acceptance Criteria

1. THE SlideMeetLinda SHALL present Linda primarily as the stream host and co-organizer.
2. THE SlideMeetLinda SHALL NOT list "AWS Community Hero — the highest recognition tier for community advocates" as the first bullet point.
3. THE SlideMeetLinda SHALL mention the Hero title in a secondary or supporting capacity (e.g., in the subtitle or a later bullet point) rather than as the leading credential.
4. THE SlideMeetLinda SHALL retain information about Linda's roles as UG Vienna leader, co-organizer, and Förderverein member.
