# Compositions

All video compositions for the AWS Community GameDay Europe stream.

## Event Sequence

The numbered folders follow the event in order. Each one is a standalone composition rendered from Remotion Studio and screen-shared during the event.

| Folder | Composition ID | Duration | Purpose |
|--------|----------------|----------|---------|
| `00-preshow/` | `00-Countdown`, `00-InfoLoop` | 10 min / 30 min | Pre-event display before the stream starts |
| `01-main-event/` | `01-MainEvent` | 30 min | Opening: host intro, schedule, rules |
| `02-gameplay/` | `02-Gameplay` | 120 min | Background during active gameplay |
| `03-closing/` | `03A-ClosingPreRendered`, `03B-ClosingWinnersTemplate` | ~2.5 min / ~5 min | Closing ceremony and winner reveal |

### Pre-Show
![InfoLoop](../../../screenshots/readme-infoloop.png)
![Countdown](../../../screenshots/readme-countdown.png)

### Main Event
![MainEvent](../../../screenshots/readme-mainevent.png)

### Gameplay
![Gameplay](../../../screenshots/readme-gameplay.png)

### Closing
![ClosingPreRendered](../../../screenshots/readme-closing-prerendered.png)
![ClosingWinnersTemplate](../../../screenshots/readme-closing-winners.png)

---

## Marketing

`marketing/` contains standalone compositions not part of the event sequence. Used for social media and promotion.

![MarketingVideo](../../../screenshots/readme-marketing.png)

---

## Inserts

`inserts/` contains 29 full-screen announcements (30 seconds each) triggered on demand during gameplay. The stream operator switches to them and returns to the gameplay overlay after 30 seconds.

See [inserts/README.md](inserts/README.md) for the full insert reference and usage guide.

---

## Adding a composition

For inserts: copy `inserts/_TEMPLATE.tsx` into the appropriate subfolder.

For new event-sequence compositions: add a numbered folder, create the component, register it in `src/Root.tsx`.
