---

description: "Task list for the Unrecorded Meeting Notice feature"
---

# Tasks: Unrecorded Meeting Notice

**Input**: Design documents from `/specs/001-unrecorded-meeting-notice/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md (all present). No clarification markers remain (Principle 1.3 tasks gate: the literal token appears nowhere in the feature directory).

**Execution mode**: Standard (plan.md, Execution mode). Phases: Setup, Foundational, User Story 1, Polish, then an operator-only phase. Each phase ends with a `Gate:` task and a phase-boundary commit task (Principles 5.3, 5.4). **An unattended run ends at the end of Phase 4**; Phase 5 needs the operator.

**Tests**: Required by the constitution (Principle I Test-First, Principles 4.1 and 4.2). A test task comes before the implementation task it covers, and the failing run is observed before implementing (this satisfies both constitution Principle I and amendment 4.1; see plan.md Constitution Check).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: Which user story the task belongs to (only `[US1]` exists)
- Tasks marked *(verification-only)* have effective size zero (Principle 5.1) and make no change.
- **Gate runner**: every gate and evidence run uses this form so the record is the command's real output and a failing command fails the run (Principle 5.4):
  `bash -c 'set -o pipefail; mkdir -p specs/001-unrecorded-meeting-notice/evidence; <command> 2>&1 | tee specs/001-unrecorded-meeting-notice/evidence/<name>.txt'`
- **Owned files**: when a task touches an existing file, fix any bug found in that file in the same task and state in the task's evidence what was fixed or that nothing was found (Principle 5.7). Every file in this feature is new, so none is expected.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Everything plan.md "Test infrastructure" lists as missing. All of it precedes any feature task (Principle 3.4).

- [x] T001 Commit the existing specification artifacts (`specs/001-unrecorded-meeting-notice/`, `.specify/memory/personas.md`, `.gitignore`) with message `docs: add spec, plan and tasks for 001-unrecorded-meeting-notice` (done: commit `b2508b8`, pushed, PR #1)
- [ ] T002 Create `package.json` with `"name": "record-everything"`, `"version": "0.0.0"`, `"private": true`, `"type": "module"`
- [ ] T003 [P] Create `tsconfig.json` with `"strict": true`, `"target": "ES2022"`, `"module": "ESNext"`, `"moduleResolution": "Bundler"`, `"lib": ["ES2022", "DOM"]`, `"noEmit": true`, `"include": ["src", "tests", "vitest.config.ts"]`
- [ ] T004 [P] Append `node_modules/`, `dist/` and `coverage/` to `.gitignore`
- [ ] T005 Install dev dependencies at exact versions in `package.json` using `npm install --save-dev --save-exact`: `typescript`, `esbuild`, `vitest`, `@vitest/coverage-v8`, `jsdom`, `@amiceli/vitest-cucumber`, `eslint`, `typescript-eslint`; first run `npm view <package> version` for each and install what the registry reports, so no version is assumed
- [ ] T006 Create `vitest.config.ts` with test environment `jsdom` and `include: ["tests/**/*.test.ts"]`
- [ ] T007 Add to `vitest.config.ts` coverage provider `v8` over `include: ["src/**"]` with thresholds `lines`, `functions`, `branches` and `statements` all `100` (Principle 4.2)
- [ ] T008 [P] Create `eslint.config.js` using `typescript-eslint` recommended rules, ignoring `specs/**`, `dist/**`, `coverage/**`, `.claude/**`, `.specify/**` and `.playwright-mcp/**`
- [ ] T009 Add to `eslint.config.js` a rule forbidding assignment to `innerHTML` and `outerHTML` (research.md R7, contracts/notice-ui.md Construction)
- [ ] T010 Add npm script `typecheck` = `tsc --noEmit` to `package.json`
- [ ] T011 Add npm script `lint` = `eslint . --max-warnings 0` to `package.json`
- [ ] T012 Add npm script `test` = `vitest run --coverage --passWithNoTests` to `package.json`
- [ ] T013 Add npm script `gate` = `npm run typecheck && npm run lint && npm test` to `package.json`
- [ ] T014 Gate: run `npm run gate` through the gate runner as `phase-1-gate` and confirm it exits 0 *(verification-only)*
- [ ] T015 Commit the Setup phase with message `chore: set up typescript, test, lint and coverage tooling` and push *(verification-only)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The one shared test stand-in every story test uses. This is the sanctioned test double (decision D1, research.md): fixtures built from the real Meet captures in `spikes/`, standing in for live Meet. Real-config debt: a Google account that can host and record, used for the live checks in Phase 5. All tasks edit `tests/fixtures/meet/meet-page.ts`, whose structure comes from `specs/001-unrecorded-meeting-notice/spikes/spike_meet_signed_in.findings.md` and the snapshot files named in `contracts/meet-page-signals.md`.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T016 Create `tests/fixtures/meet/meet-page.ts` exporting `createMeetPage(): { document: Document; set(state: Partial<MeetPageState>): void }` with `MeetPageState = { inCall: boolean; recordedStatus: boolean; recordingChip: boolean; transcribingChip: boolean; notes: 'on' | 'off' | null; overflow: boolean }` (defaults false/null), where `set` updates the document in place so mutation observers fire; implement only `inCall` (a `button` with `aria-label="Leave call"`); add a header comment citing the snapshot files and stating that the fixture encodes only the observed signals
- [ ] T017 In `tests/fixtures/meet/meet-page.ts` implement `recordedStatus` as an element with `role="status"` and text `This video call is being recorded`
- [ ] T018 In `tests/fixtures/meet/meet-page.ts` implement `recordingChip` as an `aria-hidden="true"` container holding a leaf `Recording`, a leaf `radio_button_checked` and a tooltip `This meeting is being recorded`
- [ ] T019 In `tests/fixtures/meet/meet-page.ts` implement `transcribingChip` as an `aria-hidden="true"` container holding a leaf `Transcribing`, a leaf `speech_to_text` and a tooltip `This call is being transcribed`
- [ ] T020 In `tests/fixtures/meet/meet-page.ts` implement `notes` as a leaf, not `aria-hidden`, reading `Gemini isn't taking notes` for `'off'` or `Gemini is taking notes` for `'on'`, absent for `null`
- [ ] T021 In `tests/fixtures/meet/meet-page.ts` implement `overflow` as a `button` with `aria-label="More activities in this meeting."`
- [ ] T022 Gate: run `npm run gate` through the gate runner as `phase-2-gate` and confirm it exits 0 *(verification-only)*
- [ ] T023 Commit the Foundational phase with message `test: add Meet page fixture builder` and push *(verification-only)*

**Checkpoint**: Foundation ready; User Story 1 can begin.

---

## Phase 3: User Story 1 - As a Google Meet user, I want a pop-up notice when I join a meeting that is not being recorded (Priority: P1) 🎯 MVP

**Goal**: Inside a Google Meet meeting that is not being recorded, transcribed or taking notes, the user sees a dismissible pop-up notice; in any other meeting, or while waiting to be let in, they do not.

**Independent Test**: Run `npx vitest run tests/acceptance`; all ten acceptance scenarios pass. Manual equivalent: `quickstart.md`.

### Acceptance tests for User Story 1 (write first; each must fail before implementation)

Each task adds one scenario to `tests/acceptance/acc_unrecorded_meeting_notice.feature` (Gherkin) and its steps to `tests/acceptance/acc_unrecorded_meeting_notice.test.ts`, using `@amiceli/vitest-cucumber` as documented by the version installed in T005, `createMeetPage()` from `tests/fixtures/meet/meet-page.ts`, Vitest fake timers, and `start(page.document)` imported from `src/content.ts`. A shared step helper `noticeText(document)` returns the text of the notice (inside the open shadow root of the notice host under `document.documentElement`) or `null`. After every `page.set(...)` and timer advance the steps `await vi.advanceTimersByTimeAsync(0)` so jsdom's mutation observer callbacks run. Each task ends by running `npx vitest run tests/acceptance` and confirming the new scenario fails because `src/content.ts` does not exist.

- [ ] T024 [US1] Add scenario "Notice appears in an unrecorded meeting" (spec.md scenario 1): given a page, `start` is called, then `set({ inCall: true, notes: 'off' })`; `noticeText` is `This meeting is not being recorded. You can ask the other participants to turn on recording.` with no timer advance
- [ ] T025 [US1] Add scenario "No notice in a recorded meeting" (spec.md scenario 2): `set({ inCall: true, recordingChip: true, notes: 'off' })` gives `noticeText` `null`
- [ ] T026 [US1] Add scenario "Dismissing the notice" (spec.md scenario 3): with the notice showing, clicking the `Dismiss` button makes `noticeText` `null` and leaves the `Leave call` button in the document
- [ ] T027 [US1] Add scenario "Rejoining shows the notice again" (spec.md scenario 4): after the notice has shown and `set({ inCall: false })`, then `set({ inCall: true, notes: 'off' })` makes `noticeText` the notice text again
- [ ] T028 [US1] Add scenario "Rejoining within five seconds restarts the wait" (spec.md scenarios 4 and 6): `set({ inCall: true })` with no notes status, advance 3000 ms, `set({ inCall: false })`, `set({ inCall: true })`; `noticeText` is `null` after advancing 4999 ms and the notice text after 1 more ms
- [ ] T029 [US1] Add scenario "Leaving removes the notice" (spec.md scenario 5): with the notice showing, `set({ inCall: false })` makes `noticeText` `null`
- [ ] T030 [US1] Add scenario "Meeting that shows no notes status" (spec.md scenario 6): `set({ inCall: true })` only; `noticeText` is `null` after advancing 4999 ms and the notice text after 1 more ms (5000 ms in total)
- [ ] T031 [US1] Add scenario "No notice while waiting to be let in" (spec.md edge case): with `inCall` false and 10000 ms of timer advancement, `noticeText` is `null`
- [ ] T032 [US1] Add scenario "Recording starting later changes nothing" (spec.md edge case, FR-001): with the notice showing, `set({ recordingChip: true })` leaves `noticeText` unchanged
- [ ] T033 [US1] Add scenario "Recording stopping later changes nothing" (spec.md edge case, FR-001): in a recorded meeting, `set({ recordingChip: false })` leaves `noticeText` `null`
- [ ] T034 [US1] Run `npx vitest run tests/acceptance` through the gate runner as `us1-acceptance-red` and confirm all ten scenarios fail for the right reason (a failing exit is expected here; the evidence file is the record) *(verification-only)*

### Contract tests and signal reader (`src/meet-signals.ts`)

Contract tests live in `tests/contract/contract_meet_signals.test.ts` and assert the rows of `contracts/meet-page-signals.md` against `createMeetPage()` documents. Each test task is followed by the task that makes it pass; confirm the test fails first.

- [ ] T035 [P] [US1] Add contract test for `inCall`: `readMeetSignals(doc).inCall` is `true` when an element whose `aria-label` contains `Leave call` (case-insensitive) exists in the top document and `false` otherwise
- [ ] T036 [US1] Create `src/meet-signals.ts` exporting `type MeetSignals = { inCall: boolean }` and `readMeetSignals(doc: Document): MeetSignals` implementing `inCall`
- [ ] T037 [US1] Add contract test for `recordingChip`: `true` when a leaf element's trimmed text is exactly `Recording` even when it sits inside an `aria-hidden` ancestor (read DOM text, never accessibility names), `false` otherwise
- [ ] T038 [US1] Add `recordingChip: boolean` to `MeetSignals` and `readMeetSignals` in `src/meet-signals.ts`
- [ ] T039 [US1] Add contract test for `transcribingChip`: `true` when a leaf element's trimmed text is exactly `Transcribing`, `false` otherwise
- [ ] T040 [US1] Add `transcribingChip: boolean` to `MeetSignals` and `readMeetSignals` in `src/meet-signals.ts`
- [ ] T041 [US1] Add contract test for `notes`: a leaf element matching `^Gemini (isn['’]t|is) taking notes$` gives `'off'` for `isn't` (straight and curly apostrophe) and `'on'` for `is`; no match gives `null`; the longer sentence `Gemini is taking notes and may improve them with presentation screenshots` and the text `Gemini stopped taking notes` give `null`
- [ ] T042 [US1] Add `notes: 'on' | 'off' | null` to `MeetSignals` and `readMeetSignals` in `src/meet-signals.ts`
- [ ] T043 [US1] Add contract test for `recordedStatusSeen`: `true` when a `[role=status]` element's text contains `being recorded`, `false` when the only status elements say something else (for example `Stefan Rusek is in this call`)
- [ ] T044 [US1] Add `recordedStatusSeen: boolean` to `MeetSignals` and `readMeetSignals` in `src/meet-signals.ts`

### Decision tests and state machine (`src/notice-decision.ts`)

Tests live in `tests/unit/notice-decision.test.ts`. Types, quoted from `data-model.md`: `DetectionState = { phase: 'outside' | 'settling' | 'decided'; recordedHint: boolean; insideSinceMs: number | null }`, input `MeetSignals & { nowMs: number }`, `Decision = { show: boolean; hide: boolean }`. `step(state, input)` returns `{ state, decision }`; `initialState` is `{ phase: 'outside', recordedHint: false, insideSinceMs: null }`. `step` chains transitions in one call (data-model.md).

- [ ] T045 [P] [US1] Add test: from `outside`, `inCall: true` with `notes: null` moves to `settling`, sets `insideSinceMs` to `nowMs`, and returns `show: false, hide: false`
- [ ] T046 [US1] Create `src/notice-decision.ts` exporting the types above, `initialState` and `step`, implementing the `outside → settling` transition
- [ ] T047 [US1] Add test: from `outside`, one call with `inCall: true` and `notes: 'off'` (no capture signal, no hint) returns `phase: 'decided'` and `show: true`
- [ ] T048 [US1] Implement the chained `outside → settling → decided` transition in `src/notice-decision.ts`, with `show = !recorded` where, quoted from `data-model.md`, `recorded = recordingChip || transcribingChip || notes == 'on' || recordedHint`
- [ ] T049 [US1] Add test: from `settling`, a call where `notes` has become non-null moves to `decided` and returns `show: true` when `notes` is `'off'` and nothing else is recorded
- [ ] T050 [US1] Implement the `settling → decided` transition on `notes != null` in `src/notice-decision.ts`
- [ ] T051 [US1] Add table-driven test: at the decision moment, each of `recordingChip: true`, `transcribingChip: true`, `notes: 'on'` and `recordedHint: true` alone gives `show: false`
- [ ] T052 [US1] Make the `recorded` expression in `src/notice-decision.ts` cover all four terms, passing T051
- [ ] T053 [US1] Add test: from `settling` with `notes: null`, `nowMs - insideSinceMs` of 4999 stays `settling` with `show: false`, and 5000 moves to `decided` with `show = !recorded` (data-model.md: `nowMs - insideSinceMs >= 5000`)
- [ ] T054 [US1] Implement the 5000 ms settle in `src/notice-decision.ts`
- [ ] T055 [US1] Add test: from `settling` or `decided`, `inCall: false` returns `phase: 'outside'`, `hide: true`, `show: false`, `recordedHint: false`, `insideSinceMs: null`
- [ ] T056 [US1] Implement the leave transition in `src/notice-decision.ts`
- [ ] T057 [US1] Add test: once `decided`, while `inCall` stays true, any later change to `recordingChip`, `transcribingChip` or `notes` returns the same `phase`, `show: false` and `hide: false` (FR-001: later recording changes cannot show, withdraw or change the notice)
- [ ] T058 [US1] Implement `decided` as final until leaving, in `src/notice-decision.ts`, so `show` is true at most once per admission
- [ ] T059 [US1] Add test: while `outside`, `recordedStatusSeen: true` sets `recordedHint: true`; the hint persists through `settling` and makes `show` false at the decision; after leaving it is `false` again
- [ ] T060 [US1] Implement `recordedHint` accumulation while `outside` in `src/notice-decision.ts`

### Notice UI tests and implementation (`src/notice-ui.ts`)

Tests live in `tests/unit/notice-ui.test.ts` against `contracts/notice-ui.md`.

- [ ] T061 [P] [US1] Add test: `showNotice(doc)` appends one host element to `doc.documentElement` whose open shadow root contains the exact text `This meeting is not being recorded. You can ask the other participants to turn on recording.`
- [ ] T062 [US1] Create `src/notice-ui.ts` exporting `showNotice(doc: Document)` that appends the host element and renders the text, using only `createElement` and `textContent`
- [ ] T063 [US1] Add test: the notice text sits in a container with `role="status"` and `aria-live="polite"`
- [ ] T064 [US1] Give the notice container `role="status"` and `aria-live="polite"` in `src/notice-ui.ts`
- [ ] T065 [US1] Add test: the shadow root contains exactly one `button` labelled `Dismiss`
- [ ] T066 [US1] Add the `Dismiss` button to `showNotice` in `src/notice-ui.ts`
- [ ] T067 [US1] Add test: the shadow root contains a `style` element whose text includes `position: fixed`
- [ ] T068 [US1] Add the fixed-position `style` element to `showNotice` in `src/notice-ui.ts`
- [ ] T069 [US1] Add test: clicking `Dismiss` removes the host element and changes nothing else in the document
- [ ] T070 [US1] Add the `Dismiss` click handler to `showNotice` in `src/notice-ui.ts`
- [ ] T071 [US1] Add test: `hideNotice(doc)` removes the host element when present and does nothing when absent
- [ ] T072 [US1] Export `hideNotice(doc: Document)` from `src/notice-ui.ts`

### Wiring (`src/content.ts`)

Covered by the acceptance tests written above; no separate test task.

- [ ] T073 [US1] Create `src/content.ts` exporting `start(doc: Document): void`: keep one `DetectionState` starting at `initialState`; define a check that builds `{ ...readMeetSignals(doc), nowMs: Date.now() }` and applies `step`; run the check once immediately and on every `MutationObserver` callback over `doc` with `subtree`, `childList`, `attributes` and `characterData` observed
- [ ] T074 [US1] In `src/content.ts` have the check call `showNotice(doc)` when `decision.show` and `hideNotice(doc)` when `decision.hide`. Makes the acceptance scenarios for T024 to T027, T029, T031, T032 and T033 pass.
- [ ] T075 [US1] In `src/content.ts`, each time the state enters `settling`, schedule one `setTimeout` of 5000 ms that runs the same check, so the settle fires even when Meet stops changing the page; a timer left over from an earlier admission is harmless because `step` uses `insideSinceMs`. Makes the scenarios for T028 and T030 pass.
- [ ] T076 [US1] Run `npx vitest run tests/acceptance` through the gate runner as `us1-acceptance-green` and confirm all ten scenarios pass *(verification-only)*

### Packaging

- [ ] T077 [US1] Add test `tests/unit/manifest.test.ts`: `manifest.json` has `manifest_version` 3, exactly one content script with `matches` equal to `["https://meet.google.com/*"]` and `js` equal to `["content.js"]`, and no `permissions`, `host_permissions` or `background` key
- [ ] T078 [US1] Create `manifest.json` satisfying T077 (declaration-only; excluded from coverage), with `name` `Record Everything`, `version` `0.0.0`
- [ ] T079 [US1] Create `build.mjs` using esbuild to bundle the stdin contents `import { start } from "./src/content.ts"; start(document);` (resolve directory = repository root, `format: "iife"`) to `dist/content.js` and copy `manifest.json` to `dist/manifest.json`
- [ ] T080 [US1] Add npm script `build` = `node build.mjs` to `package.json`
- [ ] T081 [US1] Change the `gate` script in `package.json` to `npm run typecheck && npm run lint && npm test && npm run build`

### Fixture-double signal (decision D1; Principle 4.1)

- [ ] T082 [US1] Add test `tests/unit/fixture-banner.test.ts`: running `node scripts/fixture-banner.mjs <dir>` prints a line containing both `tests/fixtures/meet/` and `still on fixtures` and exits 0 when `<dir>/live-verification.md` or `<dir>/live-reverification.md` is missing, and prints nothing and exits 0 when both exist
- [ ] T083 [US1] Create `scripts/fixture-banner.mjs` satisfying T082
- [ ] T084 [US1] Append `&& node scripts/fixture-banner.mjs specs/001-unrecorded-meeting-notice/evidence` to the `gate` script in `package.json`

### Phase gate

- [ ] T085 [US1] Gate: run `npm run gate` through the gate runner as `phase-3-gate` and confirm it exits 0 with every acceptance, contract and unit test passing, coverage at 100% for `src/`, `dist/content.js` and `dist/manifest.json` present, and the fixture banner line printed *(verification-only)*
- [ ] T086 [US1] Commit the User Story 1 phase with message `feat: notify when joining a meeting that is not being recorded` and push *(verification-only)*

**Checkpoint**: User Story 1 is complete and independently testable.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Remove scaffolding. The unattended run ends here.

- [ ] T087 In `package.json` change the `test` script to `vitest run --coverage`, removing `--passWithNoTests`, so an empty test suite can no longer pass
- [ ] T088 Gate: run `npm run gate` through the gate runner as `phase-4-gate` and confirm it exits 0 and still prints the fixture banner line *(verification-only)*
- [ ] T089 Commit the Polish phase with message `chore: remove empty-suite tolerance` and push *(verification-only)*

---

## Phase 5: Live verification (operator only; not part of an unattended run)

**Purpose**: Complete the real-config debt declared with the test double (decision D1). Needs you and a Google account that can host and record.

- [ ] T090 **Operator.** Load `dist/` unpacked in Chrome and run every scenario in `specs/001-unrecorded-meeting-notice/quickstart.md` against a real Meet meeting you host; write what you saw for each scenario to `specs/001-unrecorded-meeting-notice/evidence/live-verification.md` *(verification-only)*
- [ ] T091 **Operator.** Re-run the probe extension in `specs/001-unrecorded-meeting-notice/spikes/spike_meet_probe_extension` against live Meet (join unrecorded, then with recording, transcript and notes on) and write whether its timeline still matches `spikes/spike_meet_signed_in.findings.md` to `specs/001-unrecorded-meeting-notice/evidence/live-reverification.md` *(verification-only)*
- [ ] T092 Gate: run `npm run gate` through the gate runner as `phase-5-gate` and confirm it exits 0 and does **not** print the `still on fixtures` line *(verification-only)*
- [ ] T093 Commit the evidence files with message `docs: record live Meet verification` and push *(verification-only)*

---

## Dependencies & Execution Order

- **Phase order**: Setup → Foundational → User Story 1 → Polish → Live verification. No phase starts until the previous phase's gate and commit are done.
- **Within User Story 1**: acceptance tests (T024–T034) first, then three module lanes, then wiring, packaging and the fixture signal.
  - Signals lane: T035 → T044 (same two files, strictly sequential).
  - Decision lane: T045 → T060 (same two files, strictly sequential).
  - UI lane: T061 → T072 (same two files, strictly sequential).
  - The three lanes touch different files and may run in parallel after T034; tasks marked `[P]` (T035, T045, T061) are the lane starts.
  - T073 needs all three lanes done; T074 follows T073, T075 follows T074, T076 follows T075; T077–T081 follow T076; T082–T084 follow T081; T085 follows all.
- **Operator tasks** T090 and T091 need you; everything up to T089 can run unattended.

### Parallel example

```text
After T034:
  Lane A: T035 → T036 → … → T044   (src/meet-signals.ts)
  Lane B: T045 → T046 → … → T060   (src/notice-decision.ts)
  Lane C: T061 → T062 → … → T072   (src/notice-ui.ts)
```

## Implementation Strategy

1. Complete Setup and Foundational; run both gates.
2. Complete User Story 1, which is the whole MVP (the spec has one story). Stop and validate with the gate and `quickstart.md`.
3. Complete Polish. Until Phase 5 runs, the gate prints the fixture banner and the notice is verified only against fixtures built from one set of captures, so treat it as unverified against current Meet.

## Notes

- Nothing is deferred by this task list (Principle 1.4); no tracking mechanism is needed.
- No end-to-end tasks exist: the E2E journey inventory is empty (plan.md).
- The spike probes in `specs/001-unrecorded-meeting-notice/spikes/` are excluded from coverage and lint (Principle 3.1).
