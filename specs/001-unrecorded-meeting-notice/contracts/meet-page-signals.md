# Contract: Meet page signals (consumed)

The interface Google Meet's page provides to this extension. We do not control it and cannot freeze it; it is the seam both the contract tests (4.1) and the live re-verification (decision D1) check. Status is relative to the probes in `specs/001-unrecorded-meeting-notice/spikes/` (2026-10-27, English, one account).

| Signal | Rule the extension applies | Status | Evidence |
|---|---|---|---|
| `inCall` | An element with `aria-label` containing `Leave call` (case-insensitive) exists in the top document | Verified | `spike_meet_signedin_state1.snapshot.yml` |
| `recordingChip` | A leaf element whose trimmed text is exactly `Recording` | Verified | `spike_meet_recording_on.snapshot.yml`, `spike_meet_all_on.snapshot.yml` |
| `transcribingChip` | A leaf element whose trimmed text is exactly `Transcribing` | Verified | `spike_meet_transcript_on.snapshot.yml`, `spike_meet_all_on.snapshot.yml` |
| `notes` | A leaf element whose text matches `^Gemini (isn['’]t|is) taking notes$`: `isn't` → `'off'`, `is` → `'on'`; no match → `null` | Verified text; apostrophe style unchecked | `spike_meet_all_off.snapshot.yml`, `spike_meet_notes_on.snapshot.yml` |
| `recordedStatusSeen` | A `[role=status]` element whose text contains `being recorded` | Verified on "Join now" path only | `spike_meet_prejoin_while_recording.snapshot.yml`, `spike_meet_signed_in.findings.md` |
| Settle marker | `notes !== null` means the chip area has finished populating; if absent, the decision is made 5 s after `inCall` | **Unverified hypothesis** (the 5 s fallback is a spec requirement) | `spike_meet_signed_in.findings.md` (timing runs) |

## Behaviors the extension depends on

1. Recording and transcript chips are inside `aria-hidden` containers; they are read from DOM text, never from accessibility names.
2. Joining a recorded meeting shows `Leave call` before the `Recording` chip (about 900 ms in the one run). Reading chips at the `Leave call` moment is therefore unsafe.
3. Unrecorded meetings have no positive signal; absence of chips is not evidence until the settle marker is present.
4. Leaving and rejoining reloads the page.

## Out of contract (not relied on)

- Chip order, icon names, tooltip text, class names, element nesting, CSS selectors.
- Any language other than English (out of scope, D3).
- The "Ask to join" waiting-room path beyond what `inCall` already covers.

## Tests

- Our side: `tests/contract/contract_meet_signals.test.ts` runs `readMeetSignals` over the fixtures in `tests/fixtures/meet/` and asserts each row above (fixtures sanctioned, D1).
- Meet's side: manual re-verification before each release with the probe extension (D1); see `quickstart.md`.
