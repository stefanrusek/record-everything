# Spike: signed-in Playwright participant in a real Meet meeting (2026-10-27)

Probe: headed Playwright browser, user signed in by hand (credentials never seen by the agent), joined host-provided meeting
`<meeting-code>`. Evidence files sit beside this note (`spike_meet_*.snapshot.yml`).

Meeting state at the time: video recording on; transcript off; notes off ("Gemini isn't taking notes").

## Observed (real Meet, 2026-10-27)
1. In-call UI is in the top document (not a child frame): `[aria-label*="Leave call" i]` found in top `document`.
2. Baseline, nothing recording (spike_meet_signedin_state1.snapshot.yml): status chips live in
   `region "Call feature notifications and actions"`; present chip text "Gemini isn't taking notes"; no recording chip.
3. Recording on (spike_meet_recording_on.snapshot.yml): a chip with text `Recording`, icon `radio_button_checked`, tooltip
   "This meeting is being recorded"; live-region text "Recording has started. Chat messages are also recorded."
   The chip subtree is `aria-hidden`; other chips collapse into a "More activities in this meeting." overflow button.
4. Leaving shows heading "You left the meeting" with a "Rejoin" button; Rejoin reloads the page (page-side state is lost).
5. Pre-join page while recording (spike_meet_prejoin_while_recording.snapshot.yml): an element with role `status`, text
   "This video call is being recorded", present BEFORE joining.
6. TIMING when joining a meeting that is already recording (page timer, 50 ms poll, from pre-join, ms after the timer started):
   - 1397  live-region "You have joined the call" appears
   - 1736  `Leave call` button (in-call UI) appears   <- first moment "inside the meeting" is detectable
   - 2634  `Recording` chip appears                    <- ~900 ms AFTER the in-call UI
   - 3471  "Gemini isn't taking notes" chip appears
   Consequence: deciding "not recorded" the instant the in-call UI appears would show the notice in a recorded meeting
   (violates SC-002). The in-call UI is NOT a safe moment to read recording state.

## Not yet observed
- Transcript on (alone), notes on (alone), their chips/text.
- A join to an UNRECORDED meeting: whether the pre-join `status` is absent, and the in-call chip sequence.
- Waiting-room (admitted) path; only the "Join now" path was exercised (host-allowed guest/signed-in).
- Whether the pre-join recorded `status` also appears for users who must ask to join.

## Transcript only (spike_meet_transcript_on.snapshot.yml; recording off, notes off)
- Chip text `Transcribing`, icon `speech_to_text`, tooltip "This call is being transcribed", same region/slot as the `Recording` chip (chip subtree `aria-hidden`).
- Live region: "Gemini stopped taking notes (stopped by Stefan Rusek)" (notes had been on earlier; confirms notes produce their own announcements).
- Meet itself shows a modal `dialog "Gemini is available"` over the call: Meet's own pop-ups share the screen with any notice we add.
- Chip texts so far: `Recording` | `Transcribing` | "Gemini isn't taking notes" (the notes chip is shown while notes are OFF).

## Notes only (spike_meet_notes_on.snapshot.yml; recording off, transcript off)
- The notes chip is ALWAYS present and only its text changes: "Gemini isn't taking notes" (off) -> "Gemini is taking notes" (on).
  A match on "taking notes" alone cannot tell the two apart; the distinguishing word is "isn't".
- Live region: "Gemini is taking notes and may improve them with presentation screenshots".
- No `Recording` / `Transcribing` chip in this state; the "External participants joined" chip is shown inline (no overflow button) with only two chips.

## All off — joining an UNRECORDED meeting (spike_meet_all_off.snapshot.yml + page timer, 50 ms poll)
- Pre-join page: `[role=status]` elements read only "Stefan Rusek is in this call" and "Merged audio will be used"; NO recorded/transcribed status.
- In-call timeline (ms from pre-join timer start): 556 pre-join gone; 830 "You have joined the call"; 920 `Leave call` appears;
  2529 chip "Gemini isn't taking notes" appears. `Recording` / `Transcribing` chips never appear.
- Meet gives NO positive "not recorded" signal. Absence of a recording chip at 920 ms is indistinguishable from "not drawn yet".
- Compare recorded join (above): Leave 1736 -> Recording chip 2634 -> notes chip 3471. In both runs the notes chip rendered after the
  recording chip would have. Hypothesis (one observation each, UNCONFIRMED): the notes chip appears only after the chip region has
  finished populating, so it could serve as a "state is settled" marker. Whether the notes chip exists for every account/meeting is unknown.
- Pre-join recorded `status` appears only when recording (observed present while recording, absent when off) — an early positive
  "recorded" signal, but only observed on the "Join now" path.

## Still open
- Recording + transcript + notes all on: does the `Recording` chip stay in the DOM or hide behind the "More activities" overflow?
- Admission via "Ask to join" (waiting room) for a signed-in user or guest: signals before admission and the pre-join recorded status there.
- Whether the notes chip exists for accounts/meetings without Gemini.

## Recording + transcript + notes all on (spike_meet_all_on.snapshot.yml + DOM query)
- `Recording` chip: present and visible; `Transcribing` chip: present and visible; notes chip "Gemini is taking notes": present and visible.
- The "More activities in this meeting." overflow button exists, but both capture chips stay in the DOM and visible alongside it.
- `Recording` and `Transcribing` chips sit inside `aria-hidden` ancestors (invisible to the accessibility tree); the notes chip does not.
  Detection must read DOM text, not accessibility roles/names.
- Tooltips present in DOM: "This meeting is being recorded", "This call is being transcribed".
- Language: every string above was observed in English only; chip icon ligatures (`radio_button_checked`, `speech_to_text`) are text in the DOM and not language-dependent (UNVERIFIED as a detection key).
- Not verified: curly vs straight apostrophe in "isn't".

Note: the meeting code in these files is redacted as `<meeting-code>` because the repository is public and the meeting was open to anyone.
