# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - AWS Supporter Color Mismatch in Scene 4b
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to Scene 4b in `03-GameDayStreamClosing-Audio.tsx` where AWS supporters (`type: "aws"`) are rendered
  - Create test file `__tests__/design-system-bugfix.property.test.ts`
  - Import `GD_ACCENT`, `GD_ORANGE` from `shared/GameDayDesignSystem.tsx` and `AWS_SUPPORTERS` from `shared/organizers.ts`
  - Read `03-GameDayStreamClosing-Audio.tsx` source and verify color references in Scene 4b (frames 1010-1399)
  - Property: For all AWS supporters (`type: "aws"`), Scene 4b title "Thank You, AWS" color, card `boxShadow`/`border`, and supporter country text color SHALL use `GD_ORANGE` (#f97316), not `GD_ACCENT` (#c084fc)
  - Test that the source file contains `GD_ORANGE` (not `GD_ACCENT`) for: (1) "Thank You, AWS" title color, (2) card boxShadow, (3) card border, (4) country text color
  - Also test that `TYPOGRAPHY` is exported from `shared/GameDayDesignSystem.tsx` with all 17 expected keys (h1-h6, body, bodySmall, caption, captionSmall, label, labelSmall, overline, stat, timer, timerSmall, flag)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found: Scene 4b uses `GD_ACCENT` for AWS supporter elements instead of `GD_ORANGE`; no `TYPOGRAPHY` export exists
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Community Organizer Colors and Design System Exports Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe on UNFIXED code: Community organizers (`type: "community"`) in Scene 4 of `03-GameDayStreamClosing-Audio.tsx` use `GD_VIOLET`/`GD_PURPLE` for card glow and `GD_ACCENT` is NOT used for AWS-specific styling in community sections
  - Observe on UNFIXED code: `04-GameDayStreamPreShowInfo-Muted.tsx` already correctly uses `GD_ORANGE` for AWS supporter border and role text
  - Observe on UNFIXED code: All 7 color constants (`GD_DARK`, `GD_PURPLE`, `GD_VIOLET`, `GD_PINK`, `GD_ACCENT`, `GD_ORANGE`, `GD_GOLD`) are exported from `shared/GameDayDesignSystem.tsx` with their expected hex values
  - Observe on UNFIXED code: `BackgroundLayer`, `HexGridOverlay`, `GlassCard`, `AudioBadge` are exported from the design system
  - Write property-based tests in `__tests__/design-system-bugfix.property.test.ts`:
    - Property: For all community organizers, Scene 4 card styling uses `GD_VIOLET`/`GD_PURPLE` (never `GD_ORANGE`)
    - Property: `04-GameDayStreamPreShowInfo-Muted.tsx` uses `GD_ORANGE` for `type: "aws"` border/role differentiation
    - Property: All 7 color constants are exported with unchanged hex values (#0c0820, #6c3fa0, #8b5cf6, #d946ef, #c084fc, #f97316, #fbbf24)
    - Property: All 4 shared components are exported from the design system
  - Verify tests pass on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix for AWS color mismatch and typography scale

  - [x] 3.1 Add TYPOGRAPHY scale to shared/GameDayDesignSystem.tsx
    - Export a `TYPOGRAPHY` constant object with 17 named font sizes:
      - `h1: 104`, `h2: 72`, `h3: 42`, `h4: 36`, `h5: 28`, `h6: 24`
      - `body: 20`, `bodySmall: 18`
      - `caption: 16`, `captionSmall: 14`
      - `label: 13`, `labelSmall: 12`
      - `overline: 11`
      - `stat: 80`, `timer: 64`, `timerSmall: 56`, `flag: 48`
    - Place after existing color/timing constants
    - _Bug_Condition: isBugCondition_Typography — no TYPOGRAPHY export exists_
    - _Expected_Behavior: TYPOGRAPHY object exported with all 17 named sizes_
    - _Preservation: All existing exports (colors, components, timing) remain unchanged_
    - _Requirements: 2.3_

  - [x] 3.2 Fix AWS supporter colors in 03-GameDayStreamClosing-Audio.tsx Scene 4b
    - Change "Thank You, AWS" title `color: GD_ACCENT` → `color: GD_ORANGE`
    - Change card `boxShadow: ...${GD_ACCENT}50...` → `...${GD_ORANGE}50...` and `${GD_PURPLE}30` → `${GD_ORANGE}30`
    - Change card `border: 2px solid ${GD_ACCENT}40` → `2px solid ${GD_ORANGE}40`
    - Change supporter country text `color: GD_ACCENT` → `color: GD_ORANGE`
    - _Bug_Condition: isBugCondition_Color — AWS supporters use GD_ACCENT instead of GD_ORANGE in Scene 4b_
    - _Expected_Behavior: All AWS supporter elements in Scene 4b use GD_ORANGE_
    - _Preservation: Community organizer colors in Scene 4 remain GD_VIOLET/GD_PURPLE/GD_ACCENT_
    - _Requirements: 2.1, 2.2_

  - [x] 3.3 Adopt TYPOGRAPHY scale in 03-GameDayStreamClosing-Audio.tsx
    - Import `TYPOGRAPHY` from `./shared/GameDayDesignSystem`
    - Replace hardcoded `fontSize` values with `TYPOGRAPHY.*` references throughout the file
    - Map: 104→h1, 80→stat, 72→h2, 48→flag, 42→h3, 36→h4, 28→h5, 24→h6, 22→h6 (closest), 20→body, 18→bodySmall, 17→caption (round to 16), 16→caption, 15→label+1 (use captionSmall=14 or label=13 as appropriate), 14→captionSmall, 13→label, 11→overline, 9→overline (smallest)
    - _Bug_Condition: isBugCondition_Typography — ad-hoc fontSize values used_
    - _Expected_Behavior: All fontSize references use TYPOGRAPHY.* constants_
    - _Preservation: Visual output unchanged — same numeric pixel values_
    - _Requirements: 2.4_

  - [x] 3.4 Adopt TYPOGRAPHY scale in OrganizersMarketingVideo.tsx
    - Import `TYPOGRAPHY` from `./shared/GameDayDesignSystem`
    - Replace hardcoded `fontSize` values: 36→h4, 24→h6, 20→body, 18→bodySmall, 16→caption, 15→captionSmall+1 (use captionSmall=14 or label=13)
    - _Requirements: 2.4_

  - [x] 3.5 Adopt TYPOGRAPHY scale in 00-GameDayStreamPreShow-Muted.tsx
    - Import `TYPOGRAPHY` from `./shared/GameDayDesignSystem`
    - Replace hardcoded `fontSize` values: 64→timer, 52→timerSmall (closest), 22→h6, 18→bodySmall, 16→caption, 14→captionSmall
    - _Requirements: 2.4_

  - [x] 3.6 Adopt TYPOGRAPHY scale in 01-GameDayStreamMainEvent-Audio.tsx
    - Import `TYPOGRAPHY` from `./shared/GameDayDesignSystem`
    - Replace hardcoded `fontSize` values throughout the file with TYPOGRAPHY.* references
    - _Requirements: 2.4_

  - [x] 3.7 Adopt TYPOGRAPHY scale in 02-GameDayStreamGameplay-Muted.tsx
    - Import `TYPOGRAPHY` from `./shared/GameDayDesignSystem`
    - Replace hardcoded `fontSize` values: 28→h5, 22→h6, 18→bodySmall, 16→caption, 12→labelSmall, 11→overline
    - _Requirements: 2.4_

  - [x] 3.8 Adopt TYPOGRAPHY scale in 04-GameDayStreamPreShowInfo-Muted.tsx
    - Import `TYPOGRAPHY` from `./shared/GameDayDesignSystem`
    - Replace hardcoded `fontSize` values: 56→timerSmall, 48→flag, 42→h3 (if present), 36→h4, 22→h6, 20→body, 18→bodySmall, 16→caption, 15→captionSmall+1, 14→captionSmall, 13→label, 12→labelSmall, 11→overline, 10→overline (smallest)
    - _Requirements: 2.4_

  - [x] 3.9 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - AWS Supporter Color Uses GD_ORANGE
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed and TYPOGRAPHY exists)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.10 Verify preservation tests still pass
    - **Property 2: Preservation** - Community Organizer Colors and Design System Exports Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
