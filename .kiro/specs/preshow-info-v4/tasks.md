# Implementation Plan: PreShowInfo V4

## Overview

Copy V3 composition (`04v3-GameDayStreamPreShowInfo-V3.tsx`) to a new V4 file, apply targeted changes: borderless UG logos, country/city stat boxes, program badge images on education slides, generic Hero slide, toned-down Linda slide. Register in Root.tsx. All code is TypeScript/React (Remotion) in a single composition file plus three new image assets.

## Tasks

- [x] 1. Download image assets and scaffold V4 file
  - [x] 1.1 Download three image assets to `public/AWSCommunityGameDayEurope/`
    - Save UG Leader badge as `ug-leader-badge-dark.png`
    - Save AWS Community Hero logo as `aws-community-hero-logo.svg` from `https://builder.aws.com/assets/Hero_Default_Light-W1mudtFL.svg`
    - Save AWS Community Builder logo as `aws-community-builder-logo.png` from `https://d2908q01vomqb2.cloudfront.net/da4b9237bacccdf19c0760cab7aec4a8359010b0/2020/07/23/AWS-CBs-blog-image.png`
    - _Requirements: 4.2, 5.2, 6.2_

  - [x] 1.2 Copy V3 to V4 composition file
    - Copy `compositions/04v3-GameDayStreamPreShowInfo-V3.tsx` to `compositions/04v4-GameDayStreamPreShowInfo-V4.tsx`
    - Rename the exported component from `GameDayPreShowInfoV3` to `GameDayPreShowInfoV4`
    - Update the file header comment to say V4
    - _Requirements: 1.1, 1.2, 1.4_

  - [x] 1.3 Register V4 composition in `src/Root.tsx`
    - Import `GameDayPreShowInfoV4` from the new file
    - Add a `<Composition>` entry with id `GameDayPreShowInfoV4`, 54000 durationInFrames, 30 fps, 1280×720
    - _Requirements: 1.3_

- [x] 2. Checkpoint - Verify V4 scaffold renders
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Modify SlideUGSpotlight: borderless logos and country/city stats
  - [x] 3.1 Remove border from UG spotlight logo container
    - In `SlideUGSpotlight`, remove the `border: 1px solid ${GD_VIOLET}33` from the logo container
    - Keep `borderRadius: 20`, `background`, `padding`, and sizing unchanged
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.2 Replace Event/Status stat boxes with Country/City
    - Replace the "Event" stat box with a "Country" stat box showing `g.flag + " " + g.city.split(", ")[1]?.trim()` with `GD_GOLD` accent
    - Replace the "Status" stat box with a "City" stat box showing `g.city.split(",")[0]?.trim()` with `#4ade80` accent
    - Keep the "Group" stat box (`"N of 57"`) and "Location" stat box unchanged
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 3.3 Write property tests for city/country parsing (Properties 1, 2)
    - Create `__tests__/preshow-info-v4.property.test.ts`
    - **Property 1: City/Country field parsing round-trip** — for any `"CityName, CountryName"` string, splitting on `", "` produces non-empty city and country, and joining back reproduces the original
    - **Validates: Requirements 3.3, 3.4**
    - **Property 2: Country extraction matches flag for all user groups** — for every entry in USER_GROUPS, the country name is non-empty and the flag is a valid Unicode flag sequence
    - **Validates: Requirements 3.3**

- [x] 4. Add program logos to community education slides
  - [x] 4.1 Add UG Leader badge to SlideUGLeader
    - Add `staticFile("AWSCommunityGameDayEurope/ug-leader-badge-dark.png")` image to the slide
    - Size appropriately to fit the layout without overwhelming content
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 4.2 Add Community Builder logo to SlideCommunityBuilder
    - Add `staticFile("AWSCommunityGameDayEurope/aws-community-builder-logo.png")` image to the slide
    - Size appropriately to fit the layout
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 4.3 Add Community Hero logo to SlideCommunityHero
    - Add `staticFile("AWSCommunityGameDayEurope/aws-community-hero-logo.svg")` image to the slide
    - This logo becomes the primary visual element (replaces Linda's photo)
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 5. Redesign SlideCommunityHero as generic program slide
  - [x] 5.1 Remove Linda-specific content from SlideCommunityHero
    - Remove Linda's photo (`<Img src={staticFile(linda.face)} ...>`)
    - Remove the "AWS Hero" badge with Linda's name underneath
    - Use the Hero logo (from task 4.3) as the primary visual element
    - Reword heading to describe the program generically rather than spotlighting Linda
    - Keep the educational bullet points about Hero categories and recognition criteria
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 6. Tone down Hero emphasis on SlideMeetLinda
  - [x] 6.1 Reorder Linda's bullet points and subtitle
    - Move "AWS Community Hero" out of the first bullet position
    - Lead with stream host and co-organizer roles
    - Mention Hero title in a secondary capacity (subtitle or later bullet)
    - Retain UG Vienna leader, co-organizer, and Förderverein member info
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - Verify no regressions in existing test suite
  - _Requirements: 1.4_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests use fast-check with vitest, file: `__tests__/preshow-info-v4.property.test.ts`
- All code is TypeScript/React (Remotion) in a single file: `compositions/04v4-GameDayStreamPreShowInfo-V4.tsx`
- The V3 file remains untouched — V4 is a full copy with targeted modifications
