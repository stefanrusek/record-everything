# Quickstart: validating the unrecorded-meeting notice

Run guide only. Behavior is specified in `spec.md`; signal rules are in `contracts/meet-page-signals.md`.

## Automated (no Google account needed)

Prerequisite: Node and npm, then `npm install` (created by the setup tasks).

```sh
npm run gate
```

Expected: typecheck, lint, all acceptance (`acc_`), contract (`contract_`) and unit tests pass with 100% coverage of `src/`, and the extension builds to `dist/`.

## Manual, against real Meet

Prerequisites: Chrome; the built extension loaded from `dist/` via `chrome://extensions` (Developer mode, "Load unpacked"); a second person or window to host and toggle recording, transcript and notes.

| Scenario | Steps | Expected |
|---|---|---|
| Unrecorded | Join a meeting where nothing is recording, transcribing or taking notes | The notice appears; "Dismiss" removes it |
| Recorded | Host starts recording, then you join | No notice appears |
| Transcript only | Host starts a transcript only, then you join | No notice |
| Notes only | Host starts notes only, then you join | No notice |
| Rejoin | Leave an unrecorded meeting and rejoin | The notice appears again |
| Waiting | Be held waiting to be let in | No notice until you are inside |
| Leave while showing | Leave while the notice is on screen | The notice disappears |
| Later change | Join unrecorded, dismiss or not, then host starts recording | The notice neither appears nor changes because of it |

Re-running the probe extension (`spikes/spike_meet_probe_extension`) and comparing its timeline to `spikes/spike_meet_signed_in.findings.md` is the re-verification procedure sanctioned in decision D1; run it before each release.
