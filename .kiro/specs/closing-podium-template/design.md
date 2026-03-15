# Design Document: Closing Podium Template

## Overview

This design covers splitting `03-GameDayStreamClosing-Audio.tsx` into two independent composition files and redesigning the podium/winners section as a bottom-aligned bar-chart layout. The split separates pre-rendered content (Part A: HeroIntro + FastScroll) from game-day-dependent content (Part B: Shuffle → Reveal/Podium → ThankYou). The podium redesign replaces the current floating-card layout with proportional vertical bars anchored to the viewport bottom, revealing teams from 6th to 1st with staged animations.

### Key Design Decisions

1. **Two-file split** rather than parameterized single file — Part A has zero winner data dependencies, enabling ahead-of-time rendering. Part B is a self-contained template with placeholder data that gets swapped on game day.
2. **Shared utilities via re-export** — A `shared/closing-utils.ts` module holds the Phase enum, phase boundaries, and all pure utility functions. Both Part A and Part B import from it, and the old import path re-exports everything for backward compatibility.
3. **Bar-chart podium** — Bottom-aligned bars with heights proportional to `score / maxScore` replace the floating card layout. This gives viewers an instant visual comparison of team performance.
4. **5-minute ceremony budget** — The entire Reveal/Podium sequence fits within 9000 frames (5 min at 30fps), with explicit frame allocations per reveal step.

## Architecture

The current monolithic closing file becomes three modules:

```mermaid
graph TD
    subgraph "Shared"
        U[shared/closing-utils.ts<br/>Phase, boundaries, utilities, TeamData]
    end

    subgraph "Part A — Fixed Closing"
        A[03a-ClosingFixed.tsx<br/>HeroIntro + FastScroll<br/>frames 0–1899]
    end

    subgraph "Part B — Winners Template"
        B[03b-ClosingWinners.tsx<br/>Shuffle + Podium + ThankYou<br/>~9000+ frames]
    end

    subgraph "Root"
        R[src/Root.tsx]
    end

    U --> A
    U --> B
    R --> A
    R --> B

    A -.->|zero winner refs| U
    B -->|imports TeamData, PODIUM_TEAMS| U
```

### Part B Phase Timeline (Winners Template)

```mermaid
gantt
    title Part B — Winners Template Timeline
    dateFormat X
    axisFormat %s

    section Shuffle
    Shuffle phase (0–1799)       :0, 1800

    section Reveal 6th–4th
    6th place (1800–2399)        :1800, 2400
    5th place (2400–2999)        :2400, 3000
    4th place (3000–3599)        :3000, 3600

    section Reveal 3rd–1st
    3rd bar-rise + country + UG (3600–4799)  :3600, 4800
    2nd bar-rise + country + UG (4800–5999)  :4800, 6000
    1st bar-rise + country + UG (6000–7199)  :6000, 7200

    section Roll Call + ThankYou
    Team name roll call (7200–7799)  :7200, 7800
    ThankYou + fade (7800–8999)      :7800, 9000
```

### File Mapping

| Current Export | New Source File | Notes |
|---|---|---|
| `GameDayClosing` | Removed (replaced by Part A + Part B) | Root.tsx drops this import |
| `ClosingShowcase` | `03a-ClosingFixed.tsx` | Standalone sub-composition |
| `ClosingReveal` | `03b-ClosingWinners.tsx` | Standalone sub-composition |
| `ClosingFinalStandings` | `03b-ClosingWinners.tsx` | Standalone sub-composition |
| `ClosingTeamPodium` | `03b-ClosingWinners.tsx` | Standalone sub-composition |
| `ClosingThankYou` | `03b-ClosingWinners.tsx` | Standalone sub-composition |
| Phase, utilities, TeamData | `shared/closing-utils.ts` | Shared by both files |

## Components and Interfaces

### shared/closing-utils.ts — Shared Module

Contains all pure functions and data types used by both Part A and Part B:

```typescript
// Phase enum and boundaries
export enum Phase { Showcase, Shuffle, Reveal, ThankYou }
export const PHASE_BOUNDARIES = { ... };

// Pure utility functions (all exported for testing)
export function getActivePhase(frame: number): Phase;
export function isTransitionFrame(frame: number): boolean;
export function getFadeOpacity(frame: number): number;
export function getCountUpValue(target: number, frame: number, revealFrame: number): number;
export function getPodiumBarHeight(score: number, maxScore: number, maxHeight: number): number;
export function getRevealedPlacements(frame: number): number[];
export function getShowcasePage(frame: number, groupCount: number): number;
export function getAllShowcasePages(groupCount: number): number;
export function getShuffleCycleSpeed(frameInPhase: number): number;

// Reveal timing
export const REVEAL_SCHEDULE: Array<{ rank: number; frame: number; duration: number }>;
export const REVEAL_FRAMES: Record<number, number>;

// TeamData interface
export interface TeamData {
  name: string;
  flag: string;
  city: string;
  country: string;
  score: number;
  logoUrl: string | null;
}

// Placeholder team data (no lorem ipsum)
export const PODIUM_TEAMS: TeamData[];
export const WINNING_CITY_TEAMS: TeamData[];
```

### 03a-ClosingFixed.tsx — Part A

Contains HeroIntro (Scenes 1–5) and FastScroll. Zero references to `PODIUM_TEAMS` or `WINNING_CITY_TEAMS`.

Exports:
- `GameDayClosingFixed` — main composition (1900 frames)
- `ClosingShowcase` — standalone sub-composition for Remotion Studio

### 03b-ClosingWinners.tsx — Part B

Contains Shuffle, Reveal/Podium, and ThankYou phases. Uses the redesigned bar-chart podium.

Exports:
- `GameDayClosingWinners` — main composition (~9000 frames)
- `ClosingReveal`, `ClosingFinalStandings`, `ClosingTeamPodium`, `ClosingThankYou` — standalone sub-compositions

### PodiumBar Component (New)

The core visual element of the redesigned podium. Each bar is a vertical rectangle anchored to the bottom of the viewport.

```typescript
interface PodiumBarProps {
  team: TeamData;
  rank: number;
  barHeight: number;       // computed via getPodiumBarHeight
  barWidth: number;        // varies by rank tier
  isTop3: boolean;         // full opacity vs reduced
  revealFrame: number;     // when this bar starts animating
  frame: number;           // current frame
}
```

**Bar layout (6 bars, bottom-aligned):**

```
┌──────────────────────────────────────────────────────┐
│                    PODIUM (title)                      │  top 15%
│                                                        │
│                                                        │
│   ┌───┐                                               │
│   │   │  ┌───┐                              ┌───┐    │
│   │ 2 │  │   │                    ┌───┐     │   │    │
│   │   │  │ 1 │         ┌───┐     │ 5 │     │ 4 │    │
│   │   │  │   │  ┌───┐  │ 6 │     │   │     │   │    │
│   │   │  │   │  │ 3 │  │   │     │   │     │   │    │
├───┴───┴──┴───┴──┴───┴──┴───┴─────┴───┴─────┴───┴────┤  bottom edge
│  Primary row (1-2-3)    │   Secondary row (4-5-6)     │
│  full opacity            │   reduced opacity (0.5-0.8) │
└──────────────────────────────────────────────────────┘
```

The primary row (places 1, 2, 3) is centered in the left ~60% of the viewport. The secondary row (places 4, 5, 6) occupies the right ~40%, positioned slightly lower with reduced opacity.

**Bar height formula:**
```typescript
function getPodiumBarHeight(score: number, maxScore: number, maxHeight: number): number {
  return Math.max(0.4, score / maxScore) * maxHeight;
}
```
- `maxHeight` = ~400px (leaving room for title and team info above bars)
- Minimum bar height is 40% of max to keep all bars visible
- 1st place always gets full `maxHeight`

**Bar content (bottom to top):**
1. Score value at the base of the bar
2. Team name (largest text, using TYPOGRAPHY.h5 for top 3, TYPOGRAPHY.h6 for 4-6)
3. City + Country
4. Logo (or flag emoji fallback)
5. Rank badge (#1 🥇, #2 🥈, #3 🥉, #4, #5, #6)

### Reveal Animation Sequence

The reveal follows a strict order with three animation stages per top-3 team:

**Phase 1: Places 6→4 (quick reveals)**
- Each place gets ~600 frames (20 seconds)
- Bar appears at reduced opacity (0.5–0.8) with a spring rise from 0 to proportional height
- Team name and score visible immediately

**Phase 2: Places 3→1 (dramatic reveals)**
- Each place gets ~1200 frames (40 seconds)
- Stage A (~400 frames): Bar rises from 0 to proportional height using `springConfig.emphasis`
- Stage B (~400 frames): Country name fades in below the bar
- Stage C (~400 frames): User group name + logo fade in

**Phase 3: Roll Call**
- All 6 team names displayed sequentially from 6th to 1st
- Each name shown for ~100 frames with staggered entry

### Animation Timing Budget (Part B)

| Segment | Start Frame | End Frame | Duration | Seconds |
|---|---|---|---|---|
| Shuffle | 0 | 1799 | 1800 | 60s |
| 6th place reveal | 1800 | 2399 | 600 | 20s |
| 5th place reveal | 2400 | 2999 | 600 | 20s |
| 4th place reveal | 3000 | 3599 | 600 | 20s |
| 3rd place (bar + country + UG) | 3600 | 4799 | 1200 | 40s |
| 2nd place (bar + country + UG) | 4800 | 5999 | 1200 | 40s |
| 1st place (bar + country + UG) | 6000 | 7199 | 1200 | 40s |
| Roll call (6th→1st) | 7200 | 7799 | 600 | 20s |
| ThankYou + fade to black | 7800 | 8999 | 1200 | 40s |
| **Total** | 0 | 8999 | 9000 | **300s (5 min)** |

### Root.tsx Registration

```typescript
// Old import removed:
// import { GameDayClosing, ... } from "../03-GameDayStreamClosing-Audio";

// New imports:
import { GameDayClosingFixed, ClosingShowcase } from "../03a-ClosingFixed";
import {
  GameDayClosingWinners,
  ClosingReveal,
  ClosingFinalStandings,
  ClosingTeamPodium,
  ClosingThankYou,
} from "../03b-ClosingWinners";

// Compositions:
// "GameDayClosingFixed" — 1900 frames, 1280×720, 30fps
// "GameDayClosingWinners" — 9000 frames, 1280×720, 30fps
// Sub-compositions remain registered with same IDs
```

## Data Models

### TeamData Interface (Enhanced)

The existing `TeamData` interface gains a `country` field to support the reveal animation's country-reveal step:

```typescript
export interface TeamData {
  name: string;      // Team/user group display name
  flag: string;      // Country flag emoji (e.g., "🇦🇹")
  city: string;      // City name (e.g., "Vienna")
  country: string;   // Country name (e.g., "Austria")
  score: number;     // Final score (positive integer)
  logoUrl: string | null;  // User group logo URL, null for flag fallback
}
```

### Placeholder Data (No Lorem Ipsum)

```typescript
export const PODIUM_TEAMS: TeamData[] = [
  { name: "Team #1", flag: "🏳️", city: "City A", country: "Country A", score: 4850, logoUrl: null },
  { name: "Team #2", flag: "🏳️", city: "City B", country: "Country B", score: 4720, logoUrl: null },
  { name: "Team #3", flag: "🏳️", city: "City C", country: "Country C", score: 4580, logoUrl: null },
  { name: "Team #4", flag: "🏳️", city: "City D", country: "Country D", score: 4410, logoUrl: null },
  { name: "Team #5", flag: "🏳️", city: "City E", country: "Country E", score: 4250, logoUrl: null },
  { name: "Team #6", flag: "🏳️", city: "City F", country: "Country F", score: 4090, logoUrl: null },
];
```

Scores are distinct and strictly descending. Index 0 = 1st place. All `logoUrl` fields are `null` (flag fallback) since actual logos are filled on game day.
