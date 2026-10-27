# Implementation Plan: Unrecorded Meeting Notice

**Branch**: `001-unrecorded-meeting-notice` | **Date**: 2026-10-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-unrecorded-meeting-notice/spec.md`

## Summary

A Chrome extension content script runs on Google Meet. Once the user is inside a meeting and Meet's status area has finished drawing (or 5 seconds have passed, whichever is first), it shows a dismissible pop-up when nothing is recording, transcribing or taking notes, and shows nothing otherwise. The decision is made once per admission.

The plan is shaped by probes of real Meet (`research.md`, `spikes/`). The decisive finding is a timing hazard: in a recorded meeting the in-call controls appear about 900 ms before the `Recording` chip, and an unrecorded meeting gives no positive signal at all. The design therefore separates "inside the meeting" from "state has settled", and four operator decisions (D1–D4 in `research.md`) were answered on 2026-10-27 and are recorded in `spec.md` and `research.md`.

## Technical Context

**Language/Version**: TypeScript (strict), version pinned at setup

**Primary Dependencies**: esbuild (bundle); Vitest + jsdom + `@amiceli/vitest-cucumber` (tests); ESLint + typescript-eslint; `@vitest/coverage-v8`. No runtime dependencies. Versions verified and pinned by the setup tasks.

**Storage**: N/A (in-memory only)

**Testing**: Vitest. Acceptance tests in Gherkin (`acc_` prefix), contract tests (`contract_` prefix), unit tests; 100% coverage of `src/`.

**Target Platform**: Chrome, Manifest V3, content script on `https://meet.google.com/*`; no background worker, no extension permissions

**Project Type**: browser extension (single package)

**Performance Goals**: None specified (not inferred, constitution 2.7)

**Constraints**: Notice built without `innerHTML` (research R7); no network, storage or messaging; reads the top document only

**Scale/Scope**: One content script, four source modules, one notice

## Constitution Check

*GATE: Passed before Phase 0; re-checked after Phase 1 design. Result: pass. No clarification markers remain.*

| Principle | Status | How the plan meets it |
|---|---|---|
| I Test-First | Pass | Every implementation task is preceded by its test. Tasks require a failing run observed before implementing. Amendment 4.1 says a failing-run observation is *not required*; the plan satisfies both by observing it, which costs nothing extra. The wording conflict itself stays with the project owner (noted in the constitution's Sync Impact Report). |
| II Simplicity | Pass | Four modules, no background worker, no storage, no permissions, no framework, one bundler dependency. No complexity departs from this; Complexity Tracking is empty. |
| 1.1/1.2 Artifact completeness | Pass | This plan and its artifacts name every input a cold agent needs, including spike evidence by file name. |
| 1.3 Clarification markers | Pass | D1–D4 answered and recorded (`research.md`; spec scenarios 5 and 6). |
| 1.4 Deferred work | Pass | This plan defers nothing, so no tracking mechanism is needed. None exists in the project; if a discovery needs deferring, the phase must halt and ask (not invent one). |
| 2.x Specification | Pass | Spec gaps D2–D4 were decided by the operator and added to `spec.md`, not decided by the plan. |
| 3.1 External validation | Pass with risks | Real-Meet probes run and preserved; unresolved risks listed in `research.md` and surfaced below. |
| 3.2 Gap analysis | n/a | Single package. |
| 3.3 Package boundaries | Pass | One package, no multi-package story; no shared contract between packages. The two contracts in `contracts/` describe the external Meet seam and the notice the user sees. |
| 3.4 Infrastructure | **Gap, planned** | See "Test infrastructure" below. |
| 3.5 Sequence diagrams | Pass | Below. |
| 3.6 Execution mode | Standard | See below. |
| 3.8 Debt survey | Pass | See below. |
| 4.1 Verification ladder | Pass | Implementation tests, contract tests on both sides of the Meet seam, real-provider check per D1. |
| 4.2 Coverage | Pass | 100% threshold enforced by the gate. |
| 4.3 E2E | Pass | Inventory empty, no journey proposed. See below. |
| 5.x Implementation | Pass | Task granularity, gates and phase commits apply at the tasks and implement phases. |

## Execution mode (3.6): Standard

Fast pass is rejected: the project is greenfield and needs more than three executable files (four source modules plus the build script), and the Meet dependency carries unverified assumptions, so uncertainty resolves toward the heavier mode. Package-parallel is not warranted: one package. Task shape: Setup, Foundational, one implementation phase for User Story 1, Polish, with the phase gate `npm run gate`.

## Test infrastructure (3.4)

Present: none (empty repository). Missing and required, to be created by setup tasks that precede all feature tasks:

1. `package.json`, strict `tsconfig.json`
2. Vitest with jsdom and 100% coverage thresholds
3. Gherkin runner for `acc_` tests
4. ESLint
5. esbuild build producing `dist/` (content script + `manifest.json`)
6. One `npm run gate` command running typecheck, lint, all tests with coverage, and the build
7. Fixture directory `tests/fixtures/meet/` populated from the real captures in `spikes/` (sanctioned double, D1)

No CI exists and no remote repository exists; the local gate is the gate. Nothing is deferred by this statement (1.4).

## End-to-end inventory (4.3)

Existing journeys: none. Proposed new journeys: none. Admission test: the one candidate, "join a real Meet meeting and see the notice", proves behavior observable only through the real Meet page, but it cannot run unattended (Meet refused an automated guest, and recording state needs a human host). That coverage belongs one layer down: fixture-based acceptance tests plus the Meet-seam contract tests, with the manual live re-verification chosen in D1. The environment for E2E is never stood up for this feature.

## Technical debt survey (3.8)

No existing code or files exist to survey; nothing to remove.

## Sequence diagram: User Story 1

```mermaid
sequenceDiagram
    participant U as Google Meet user
    participant M as Meet page
    participant C as content.ts
    participant S as meet-signals.ts
    participant D as notice-decision.ts
    participant N as notice-ui.ts

    U->>M: join meeting
    M-->>C: DOM mutations (pre-join)
    C->>S: readMeetSignals(document)
    S-->>C: recordedStatusSeen?
    C->>D: step(state, signals) [outside, records hint]
    M-->>C: Leave call appears
    C->>S: readMeetSignals(document)
    S-->>C: inCall = true
    C->>D: step(state, signals) [outside to settling]
    M-->>C: chips render (recording / transcribing / notes)
    C->>S: readMeetSignals(document)
    S-->>C: notes != null (settled), chip states
    C->>D: step(state, signals) [settling to decided: notes chip seen, or 5 s inside]
    alt not recorded
        D-->>C: show = true
        C->>N: showNotice()
        N-->>U: pop-up notice
        U->>N: Dismiss
        N-->>M: notice removed
    else recorded
        D-->>C: show = false
    end
    U->>M: leave
    M-->>C: Leave call gone
    C->>D: step(state, signals) [reset; hide = true]
    D-->>C: hide
    C->>N: hideNotice()
```

## Plan-phase handoff

The spec carries no Plan-Phase Handoff section; nothing to confirm or refute.

## Project Structure

### Documentation (this feature)

```text
specs/001-unrecorded-meeting-notice/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── meet-page-signals.md
│   └── notice-ui.md
├── spikes/              # spike_ prefix, excluded from coverage (3.1)
├── checklists/
│   └── requirements.md
└── tasks.md             # created by /speckit-tasks
```

### Source Code (repository root)

```text
manifest.json            # MV3, one content script on https://meet.google.com/*
build.mjs                # esbuild: src/content.ts -> dist/, copies manifest.json
src/
├── content.ts           # wiring: MutationObserver + one 5 s re-check -> readMeetSignals -> step -> notice
├── meet-signals.ts      # readMeetSignals(doc): MeetSignals
├── notice-decision.ts   # step(state, signals): { state, show, hide }
└── notice-ui.ts         # showNotice(doc), hideNotice(doc)
tests/
├── acceptance/          # acc_unrecorded_meeting_notice.feature + .test.ts
├── contract/            # contract_meet_signals.test.ts
├── unit/
└── fixtures/meet/       # HTML fixtures derived from spikes/
```

**Structure Decision**: single package, flat `src/`. `meet-signals.ts` is the only module that knows Meet's page; `notice-decision.ts` is pure; `notice-ui.ts` is the only module that touches the page it adds to. This keeps Meet's volatility in one file.

## Complexity Tracking

No deviations from the constitution.
