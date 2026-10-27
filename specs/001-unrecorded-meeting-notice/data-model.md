# Data Model: Unrecorded Meeting Notice

No persistence: no storage, no messaging, no background worker. All state is in memory in the content script and is lost when the page reloads, which matches spec Assumption "dismissing is not remembered".

## Entities

### MeetSignals (read from the page each time it changes; see `contracts/meet-page-signals.md`)

| Field | Type | Meaning |
|---|---|---|
| `inCall` | boolean | The `Leave call` control is present: the user is admitted and inside |
| `recordedStatusSeen` | boolean | The pre-join "being recorded" status is present |
| `recordingChip` | boolean | `Recording` chip present |
| `transcribingChip` | boolean | `Transcribing` chip present |
| `notes` | `'on' \| 'off' \| null` | Notes chip state; `null` when the chip is absent |
| `nowMs` | number | Current time, passed in so the decision stays pure and testable |

### DetectionState (one per page load)

| Field | Type | Meaning |
|---|---|---|
| `phase` | `'outside' \| 'settling' \| 'decided'` | Where the user is relative to the current admission |
| `recordedHint` | boolean | `recordedStatusSeen` was true at any time while `outside` during this admission |
| `insideSinceMs` | number \| null | `nowMs` when `inCall` first became true for this admission |

### Decision (output of one step)

`show: boolean`, `hide: boolean`. `show` is true at most once per admission.

## State transitions

```
outside  --inCall-->                       settling
settling --notes != null, or nowMs - insideSinceMs >= 5000--> decided (show = !recorded)
settling --inCall false-->                 outside      (hide)
decided  --inCall false-->                 outside      (hide, reset recordedHint and insideSinceMs)
outside  --recordedStatusSeen-->           outside      (recordedHint = true)
```

`recorded = recordingChip || transcribingChip || notes == 'on' || recordedHint`.

- Entering `decided` is the only place a notice can be requested, so later recording changes cannot show, withdraw or change it (spec FR-001, edge case).
- Leaving from `decided` or `settling` returns to `outside` and hides any showing notice (spec scenario 5) and resets the admission, so a rejoin is decided afresh (scenario 4).
- `settling` ends at the settle marker or at 5 seconds inside, whichever is first (spec scenario 6). Nothing else triggers a re-check, so `content.ts` must schedule one re-check at 5 seconds after `inCall` becomes true, because Meet may stop changing the page before then.

## Validation rules

- `show` requires `phase` to move from `settling` to `decided` in this step.
- No field is persisted, sent or logged.
