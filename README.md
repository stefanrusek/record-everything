# record-everything

A Chrome extension that tells you when you've joined a Google Meet meeting that isn't being recorded, so you can ask the other participants to turn recording on.

When you are inside a meeting and nothing is recording, transcribing or taking notes, a large red card appears at the top of the screen:

> **This meeting is not being recorded.**
> You can ask the other participants to turn on recording.

Click **Dismiss** to close it. It does not message anyone else; you do the asking.

## How it behaves

- The notice is decided once each time you are let into a meeting. Leaving and rejoining decides again.
- It never shows while you are waiting to be let in.
- A meeting counts as recorded if any of these is on: video recording, a transcript, or Gemini notes. It also counts as recorded if the screen before you joined said the call is being recorded.
- Once decided, later changes (recording starting or stopping) do not show, remove or change the notice. Leaving the meeting removes it.
- Meet does not say when it has finished drawing its status chips. The extension decides as soon as the "Gemini is/isn't taking notes" chip appears, or 5 seconds after you are inside, whichever comes first. If a recorded meeting is slow to show its chips, you may get a false notice. That trade-off is deliberate: a false notice is better than a missed one.
- English-language Meet only.
- The extension runs only on `https://meet.google.com/*`, asks for no permissions, and stores and sends nothing.

## Install

Requires Node and npm.

```sh
npm install
npm run build
```

Then in Chrome open `chrome://extensions`, turn on **Developer mode**, choose **Load unpacked**, and select the `dist/` folder. After rebuilding, click the extension's reload icon and refresh the Meet tab.

## Develop

```sh
npm run gate
```

runs the typecheck, lint, all tests with a 100% coverage requirement, and the build. It finishes by printing a note while the tests still run against fixtures instead of live Meet (see Status).

Source is in `src/`:

| File | Role |
|---|---|
| `meet-signals.ts` | Reads Meet's page for the in-call, recording, transcript and notes signals; the only file that knows what Meet looks like |
| `notice-decision.ts` | Pure state machine that decides when to show or hide the notice |
| `notice-ui.ts` | Draws the notice (open shadow root, no `innerHTML`) |
| `content.ts` | Wires the page observer to the other three |

Tests are in `tests/`: Gherkin acceptance tests (`acc_`), contract tests for the Meet page (`contract_`), and unit tests. `tests/fixtures/meet/meet-page.ts` builds the fake Meet pages.

## Status

The tests use fixtures built from captures of real Meet taken on 2026-10-27 (one account, one meeting, English). The extension has been tried by hand in live Meet, but the written live checks are still open: run the scenarios in `specs/001-unrecorded-meeting-notice/quickstart.md` and the probe in `specs/001-unrecorded-meeting-notice/spikes/spike_meet_probe_extension`, then record the results as `live-verification.md` and `live-reverification.md` in `specs/001-unrecorded-meeting-notice/evidence/`. The gate's fixture note goes away once both files exist.

Meet can change its page without notice. If the notice stops appearing, or appears in recorded meetings, re-run the probe extension and compare its timeline with `specs/001-unrecorded-meeting-notice/spikes/spike_meet_signed_in.findings.md`.

## How it was built

This project uses spec-driven development with [Spec Kit](https://github.com/github/spec-kit). The constitution is `.specify/memory/constitution.md`; the feature's spec, plan, research, contracts and tasks are in `specs/001-unrecorded-meeting-notice/`.
