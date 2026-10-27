# Research: Unrecorded Meeting Notice

All external-behavior claims below come from probes run against the real Google Meet on 2026-10-27, preserved in `specs/001-unrecorded-meeting-notice/spikes/` (constitution 3.1). Evidence file names are in backticks. Everything marked **unverified** is a hypothesis the implementation must not treat as fact.

## External dependency inventory (3.1)

| Dependency | What the plan relies on | Probe | Result |
|---|---|---|---|
| Google Meet web page (`https://meet.google.com/*`) | Recording, transcript and notes state, and the moment the user is inside, are readable from the page | Playwright, user signed in by hand, all combinations of recording / transcript / notes, rejoin timing | Readable; see R1–R6. One timing hazard (R3). |
| Meet for automated guests | n/a (not relied on) | Playwright as anonymous guest | Refused ("You can't join this video call", HTTP 403 on device registration), twice. Not retried by other means. `spike_meet_guest_join.findings.md` |
| Chrome MV3 content scripts | Run on `meet.google.com`, observe DOM, render a notice | None needed: documented platform behavior, no behavior outside the repo is being inferred beyond the Trusted Types note (R7). | Not probed |

## Decisions and findings

### R1. Where the signals live — verified
Decision: one content script on `https://meet.google.com/*`, reading the top document only (no `all_frames`).
Evidence: `[aria-label*="Leave call" i]` is found in the top document; the only iframe is a cross-origin feedback proxy. `spike_meet_signed_in.findings.md`.
Alternatives rejected: background service worker, `all_frames` (nothing needed there).

### R2. What "recorded" looks like — verified (English, one account, one meeting)
- Recording: leaf text `Recording`, tooltip "This meeting is being recorded", icon text `radio_button_checked`.
- Transcript: leaf text `Transcribing`, tooltip "This call is being transcribed", icon text `speech_to_text`.
- Notes: always-present chip, text `Gemini isn't taking notes` (off) or `Gemini is taking notes` (on).
- With all three on, all chips stay in the DOM and visible next to the "More activities" button.
- Recording and transcript chips sit inside `aria-hidden` ancestors: detection reads DOM text, not accessibility names.
Evidence: `spike_meet_recording_on`, `spike_meet_transcript_on`, `spike_meet_notes_on`, `spike_meet_all_on` snapshots.
Decision: recorded = recording chip OR transcribing chip OR notes chip reads "is taking notes" (spec clarification: any of the three counts).

### R3. Timing hazard when joining a recorded meeting — verified, drives the design
Joining a recording meeting: `Leave call` appears at 1736 ms, `Recording` chip at 2634 ms, notes chip at 3471 ms. Joining an unrecorded meeting: `Leave call` at 920 ms, notes chip at 2529 ms, no recording chip ever.
Meet gives no positive "not recorded" signal. Deciding when `Leave call` first appears would show the notice in recorded meetings (violates SC-002).
Decision: the "inside" moment is `Leave call` (R1); the decision moment is later, when the chip area has finished populating. **Settle marker hypothesis (unverified, one observation per case):** the notes chip renders after any recording/transcript chip, so its presence marks the chip area as settled.
Alternatives rejected: fixed delay (the spec forbids inventing timing, 2.7, and any number would be a guess); deciding on `Leave call` (proven to misfire).
When the notes chip never renders, the decision is made 5 seconds after `Leave call` appears (D2, decided). The observed settle times were 0.9–1.8 s after the in-call controls, so 5 s leaves margin; a recorded meeting whose chips take longer would get a false notice, which the operator accepts.

### R4. Early recorded signal on the pre-join page — verified on the "Join now" path only
A `[role=status]` element reading "This video call is being recorded" is present before joining a recording meeting and absent before an unrecorded one. Not observed on the "Ask to join" (waiting-room) path.
Decision: remember it as a hint (`recordedHint`) while outside the meeting. It can only ever suppress a notice, never cause one, so a missing hint is harmless.
Alternatives rejected: relying on it alone (not observed on every path).

### R5. Leaving and rejoining — verified
Leaving shows "You left the meeting" with a `Rejoin` button; Rejoin reloads the page, so in-page state resets. A rejoin is a fresh admission and gets a fresh decision (matches spec acceptance scenario 4).

### R6. Meet's own pop-ups — verified
Meet shows modal dialogs over the call (for example "Gemini is available"). The notice must not depend on being the only overlay and must not block the call controls.

### R7. Rendering the notice — decided, not probed
Meet's page sets `content-security-policy: require-trusted-types-for 'script'` (`spike_meet_reachability.output.txt`). Whether it applies to a content script's isolated world is **unverified**, so the notice is built with `createElement` and `textContent` only, never `innerHTML`. A shadow root (open, so tests can inspect it) keeps Meet's styles off the notice and the notice's off Meet.
Alternatives rejected: `chrome.notifications` (needs a permission and a background worker for no benefit), the toolbar popup (cannot open itself on join), a page-world script (no need).

### R8. Tooling — decided, versions pinned at setup
- TypeScript, strict mode.
- Bundling: esbuild (one dependency, one output file for the content script).
- Tests: Vitest with jsdom; acceptance tests in Gherkin run through `@amiceli/vitest-cucumber` so one runner and one coverage report cover everything.
- Lint: ESLint with typescript-eslint. Coverage: `@vitest/coverage-v8` with 100% thresholds (4.2).
- Exact versions are chosen and verified when the setup tasks run; none are asserted here.
Alternatives rejected: Vite plus an extension plugin (more machinery than one content script needs), Jest (second runner config for TypeScript), `@cucumber/cucumber` (a second runner and a second coverage path).

## Unresolved external-validation risks (3.1: surfaced, not silently passed)

- **Other languages**: every Meet string was observed in English only; other languages are out of scope (D3, decided). Icon text is a candidate language-independent key if that ever changes, unverified.
- **Waiting-room path**: the "Ask to join" path was never observed. The design only needs `Leave call` to appear after admission, which holds on any path, but the pre-join recorded hint (R4) and the timing in R3 are unobserved there.
- **Notes chip absence**: unknown whether every account and meeting renders the notes chip. Handled by the 5-second rule (D2); how often it applies is unknown.
- **Single account and meeting**: all observations come from one account and one meeting; Meet changes its page without notice.
- **Apostrophe**: whether "isn't" uses a straight or curly apostrophe was not checked; matching tolerates both.

## Operator decisions (1.3): all answered 2026-10-27

- **D1** (test double and real-config debt, 4.1): DOM fixtures built from the real captures in `spikes/` are sanctioned as the stand-in for live Meet in acceptance and contract tests. Real-config debt: a Google account that can host and record, used to re-verify the signals against live Meet by hand before each release with the probe extension in `spikes/spike_meet_probe_extension`. An automated live-Meet contract test was declined for now. Because the live check is manual, the aggregated run-level signal for double-backed tests is the fixture directory itself being named in the gate output; the "still on fixtures" state ends only when the live check is run.
- **D2** (spec): a meeting that never shows the notes chip gets its decision 5 seconds after the user is inside; false notices are preferred to missed ones. Recorded in `spec.md` (scenario 6).
- **D3** (spec): English only. Recorded in `spec.md` (assumptions, FR-001).
- **D4** (spec): the notice is removed when the user leaves the meeting. Recorded in `spec.md` (scenario 5).
