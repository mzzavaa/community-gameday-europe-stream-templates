# community-gameday-europe-stream-templates

Remotion-powered stream visual template for **AWS Community GameDay Europe** — a competitive cloud event spanning 53+ AWS User Groups across 20+ countries and multiple timezones.

This is the **template repository**. It contains all compositions, components, design system, and web player code. It does **not** change between editions. Event-specific config (participants, schedule, logos) is injected at build time from the companion event repository.

> **Two-repo architecture:**
> [`community-gameday-europe-stream-templates`](https://github.com/linda-mhmd/community-gameday-europe-stream-templates) — this repo, all code
> [`community-gameday-europe-event`](https://github.com/linda-mhmd/community-gameday-europe-event) — event config, triggers deploys, hosts the live page

---

## Live page

The deployed web player for the 2026 edition:
https://linda-mhmd.github.io/community-gameday-europe-event/

---

## Remotion Studio

Open Remotion Studio to preview and develop all compositions locally:

```bash
git clone https://github.com/linda-mhmd/community-gameday-europe-stream-templates.git
cd community-gameday-europe-stream-templates
npm install
npm run studio
```

Then open **http://localhost:3000** — all 35 compositions appear in the left sidebar. Scrub through every frame, edit props live, and render individual compositions to video.

[![Remotion Studio — Composition browser and timeline](screenshots/studio/readme-remotion-studio.png)](screenshots/studio/readme-remotion-studio.png)

**Remotion Studio:** http://localhost:3000 (after `npm run studio`)
**Remotion docs:** https://www.remotion.dev/docs/studio

Full developer guide with all composition screenshots and rendering commands: [docs/remotion.md](docs/remotion.md)

---

## Composition previews

### Pre-Show Info Loop
![Pre-Show Info Loop](screenshots/compositions/readme-infoloop.png)

### Main Event — Speaker & Schedule
![Main Event](screenshots/compositions/readme-mainevent.png)

### Gameplay Overlay
![Gameplay](screenshots/compositions/readme-gameplay.png)

### Closing — Shuffle Phase (Part A)
![Closing Pre-Rendered](screenshots/compositions/readme-closing-prerendered.png)

### Closing — Bar Chart Reveal (Part B)
![Closing Winners](screenshots/compositions/readme-closing-winners.png)

### Live Inserts
![Close Race Insert](screenshots/inserts/readme-insert-close-race.png)
![Gamemasters Update Insert](screenshots/inserts/readme-insert-gamemasters-update.png)

---

## Architecture

### Two-repo design

```
community-gameday-europe-stream-templates   ← this repo
│  All composition code, design system, web player
│  Does not change between editions
│  Not deployed directly — used as a build input
│
└──► community-gameday-europe-event         ← event repo
     │  config/participants.ts  ← organizers, UGs, logos
     │  config/schedule.ts      ← segment timing
     │  public/faces/           ← organizer face photos
     │
     └──► GitHub Actions (on push to main)
          1. Checks out this template repo
          2. Overwrites stream/config/participants.ts
          3. Overwrites stream/web-player/src/schedule.ts
          4. Merges public/faces/ into stream/public/assets/faces/
          5. Builds web player (Vite + Remotion)
          6. Deploys to GitHub Pages
```

To run an edition: fork [`community-gameday-europe-event`](https://github.com/linda-mhmd/community-gameday-europe-event), update the config files, push — no changes needed in this repo.

### Config files

All event-specific values live in `config/`. Every composition imports from here — nothing is hardcoded in the components.

| File | What it controls | Source of truth |
|---|---|---|
| [`config/event.ts`](config/event.ts) | Event name, date, edition, host, timezone, timing offsets | This repo |
| [`config/participants.ts`](config/participants.ts) | Organizers, AWS supporters, all user groups + logos | Event repo (overwritten at build) |
| [`config/schedule.ts`](config/schedule.ts) | Web player segment boundaries | Event repo (overwritten at build) |

> `config/event.ts` is the only config file edited in this repo. All other config comes from the event repo.

---

## Compositions

### Main stream (in order)

| Composition ID | File | Duration | Purpose |
|---|---|---|---|
| `00-Countdown` | `00-preshow/Countdown.tsx` | 10 min (loop) | Simple countdown timer |
| `00-InfoLoop` | `00-preshow/InfoLoop.tsx` | 30 min | Rotating slides: UGs, organizers, schedule |
| `01-MainEvent` | `01-main-event/MainEvent.tsx` | 30 min | Live intro sequence, speaker cards, code distribution |
| `02-Gameplay` | `02-gameplay/Gameplay.tsx` | 120 min | Muted overlay during the 2-hour game |
| `03A-ClosingPreRendered` | `03-closing/ClosingPreRendered.tsx` | ~2.5 min | Hero intro, UG scroll, shuffle — pre-render before event |
| `03B-ClosingWinnersTemplate` | `03-closing/ClosingWinnersTemplate.tsx` | ~5 min | Bar chart reveal, podium — fill in live scores |
| `Marketing-OrganizersVideo` | `marketing/MarketingVideo.tsx` | 15 sec | Social media clip |

### Live inserts (29 total)

30-second full-screen announcements triggered on demand during gameplay.

| Category | Inserts |
|---|---|
| **Event Flow** | `Insert-QuestsLive`, `Insert-HalfTime`, `Insert-FinalCountdown`, `Insert-GameExtended`, `Insert-LeaderboardHidden`, `Insert-ScoresCalculating`, `Insert-BreakAnnouncement`, `Insert-WelcomeBack` |
| **Commentary** | `Insert-FirstCompletion`, `Insert-CloseRace`, `Insert-ComebackAlert`, `Insert-TopTeams`, `Insert-CollectiveMilestone`, `Insert-TeamSpotlight` |
| **Quest** | `Insert-QuestFixed`, `Insert-QuestBroken`, `Insert-QuestUpdate`, `Insert-QuestHint`, `Insert-NewQuestAvailable`, `Insert-SurveyReminder` |
| **Ops** | `Insert-StreamInterruption`, `Insert-TechnicalIssue`, `Insert-Leaderboard`, `Insert-ScoreCorrection`, `Insert-GamemastersUpdate` |
| **People** | `Insert-StreamHostUpdate`, `Insert-LocationShoutout`, `Insert-ImportantReminder` |

---

## Project structure

```
community-gameday-europe-stream-templates/
│
├── config/
│   ├── event.ts              # Event name, date, host, timezone — edit here for new edition
│   ├── participants.ts       # Organizers, UGs + logos — overwritten from event repo at build
│   └── schedule.ts           # Web player segment timing — overwritten from event repo at build
│
├── src/
│   ├── Root.tsx              # All 35 compositions registered here
│   ├── index.ts              # Remotion entry point
│   ├── design/               # Colors, typography, animation presets
│   ├── components/           # Shared UI: BackgroundLayer, GlassCard, AudioBadge, etc.
│   ├── utils/                # Timing helpers, phase detection, closing logic
│   └── compositions/
│       ├── 00-preshow/       # Countdown + InfoLoop
│       ├── 01-main-event/    # MainEvent
│       ├── 02-gameplay/      # Gameplay overlay
│       ├── 03-closing/       # ClosingPreRendered + ClosingWinnersTemplate
│       ├── marketing/        # MarketingVideo
│       └── inserts/
│           ├── _TEMPLATE.tsx # Copy this to create a new insert
│           ├── event-flow/
│           ├── commentary/
│           ├── quest/
│           ├── ops/
│           └── people/
│
├── web-player/               # Vite app — serves compositions as a web page
│   ├── index.html
│   ├── public/logo.ico
│   └── src/
│       ├── main.tsx
│       ├── WebPlayer.tsx     # Auto-switching player driven by schedule.ts
│       └── schedule.ts       # ← overwritten from event repo at build time
│
├── public/assets/
│   ├── faces/                # Organizer face photos (firstname.jpg)
│   ├── logos/                # GameDay logo variants
│   ├── background-landscape.png
│   ├── europe-map.png
│   └── gameday-unicorn.png
│
├── docs/
│   ├── remotion.md           # Full Remotion developer guide + all composition screenshots
│   ├── playbook.md           # Stream operator guide
│   ├── inserts.md            # Insert design rules and how to create a new one
│   ├── 00-preshow-muted.md
│   ├── 01-mainevent-audio.md
│   ├── 02-gameplay-muted.md
│   └── 03-closing-audio.md
│
└── screenshots/
    ├── studio/               # Remotion Studio UI screenshots
    ├── compositions/         # Composition preview screenshots
    ├── inserts/              # Insert preview screenshots
    └── misc/
```

---

## Documentation

| Document | Contents |
|---|---|
| [docs/remotion.md](docs/remotion.md) | Remotion developer guide — studio setup, all composition screenshots, rendering |
| [docs/playbook.md](docs/playbook.md) | Stream operator guide — what to play when, insert timing |
| [docs/inserts.md](docs/inserts.md) | Insert design rules, how to create a new insert |
| [docs/00-preshow-muted.md](docs/00-preshow-muted.md) | Pre-show phase details |
| [docs/01-mainevent-audio.md](docs/01-mainevent-audio.md) | Main event phase details |
| [docs/02-gameplay-muted.md](docs/02-gameplay-muted.md) | Gameplay phase details |
| [docs/03-closing-audio.md](docs/03-closing-audio.md) | Closing phase details |
| [TEMPLATE.md](TEMPLATE.md) | How to fill in real winner data before the closing ceremony |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to adapt this template for your own event |
| [AGENTS.md](AGENTS.md) | Architecture overview for AI-assisted development |
| [config/README.md](config/README.md) | Config file reference |
| [src/design/README.md](src/design/README.md) | Design system — colors, typography, animation presets |
| [src/components/README.md](src/components/README.md) | Shared component reference |
| [src/compositions/README.md](src/compositions/README.md) | Composition catalogue |

---

## Design system

Full reference: [src/design/README.md](src/design/README.md)

**Color tokens** (`src/design/colors.ts`):

| Token | Hex | Usage |
|---|---|---|
| `GD_DARK` | `#0c0820` | Background |
| `GD_VIOLET` | `#8b5cf6` | Community, people |
| `GD_ACCENT` | `#c084fc` | Labels, commentary |
| `GD_ORANGE` | `#ff9900` | AWS / Gamemaster |
| `GD_GOLD` | `#fbbf24` | Event milestones |
| `GD_GREEN` | `#22c55e` | Quest fixed / success |
| `GD_RED` | `#ef4444` | Quest broken / errors |

---

## Render a composition

```bash
# Open Remotion Studio (http://localhost:3000)
npm run studio

# Render to video
npx remotion render src/index.ts 01-MainEvent out/main-event.mp4

# Render a single frame
npx remotion still src/index.ts Insert-CloseRace out/preview.png --frame=90
```

Video files are gitignored. Render locally, never commit.

---

## Closing ceremony

Split into two compositions for live flexibility:

- **`03A-ClosingPreRendered`** — Pre-render before the event. Hero intro, UG scroll, shuffle.
- **`03B-ClosingWinnersTemplate`** — Fill in real scores on the day. Bar chart reveal, podium, thank you. See [TEMPLATE.md](TEMPLATE.md).

---

## Event timeline (CET)

```
17:30  Pre-show begins
18:00  Live stream — Main Event
       ├─ Host welcome + community intro
       ├─ Support process video
       ├─ Special guest
       └─ Gamemasters intro + instructions
18:30  GameDay starts — Gameplay overlay (muted)
20:30  Closing ceremony (audio returns)
21:00  Stream ends
```

---

## License

[CC BY-NC-SA 4.0](LICENSE) — non-commercial community use. Built by volunteers for AWS Community GameDay Europe 2026.
