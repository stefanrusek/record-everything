# Feature Specification: Unrecorded Meeting Notice

**Feature Branch**: `001-unrecorded-meeting-notice`

**Created**: 2026-10-27

**Status**: Draft

**Input**: User description: "as a google meet user, I want a pop-up notice when I join a meeting that is not being recorded, so that I can ask the participants to enable recording." (typed request, no external identifier)

## Clarifications

### Session 2026-10-27

- Q: At what moment does "I join a meeting" count, for deciding when the notice appears? → A: When the user has been admitted and is inside the meeting; no notice while waiting to be let in.
- Q: Which kinds of capture count as "the meeting is being recorded" for this notice? → A: Any of video recording, transcript or notes counts as recorded.
- Q: If a meeting never shows its notes status, what should the notice do? → A: Decide 5 seconds after the user is inside the meeting, from what the meeting shows then; a false notice is better than a missed one.
- Q: Which Meet display languages must the notice work in? → A: English only.
- Q: If the user leaves the meeting while the notice is showing, should it disappear? → A: Yes, it is removed.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - As a Google Meet user, I want a pop-up notice when I join a meeting that is not being recorded (Priority: P1)

Persona: Google Meet user (defined in `.specify/memory/personas.md`).

The Google Meet user joins a meeting and is told, once the meeting's recording status has settled, whether the meeting is unrecorded, so they can ask the other participants to start recording.

**Why this priority**: A meeting that nobody records is lost, and the user can only act on that while the meeting is still happening. This is the whole feature.

**Independent Test**: Join one unrecorded meeting and one recorded meeting. The notice appears in the first and not in the second.

**Acceptance Scenarios**:

1. **Given** a meeting that is not being recorded, **When** I am admitted and am inside it, **Then** a pop-up notice tells me the meeting is not being recorded.
2. **Given** a meeting that is being recorded, **When** I am admitted and am inside it, **Then** no notice appears.
3. **Given** the notice is showing, **When** I dismiss it, **Then** it disappears and I remain in the meeting.
4. **Given** I left an unrecorded meeting, **When** I am admitted to it again, **Then** the notice appears again.
5. **Given** the notice is showing, **When** I leave the meeting, **Then** the notice disappears.
6. **Given** a meeting that shows no notes status and nothing showing it is being recorded, **When** I have been inside it for 5 seconds, **Then** the notice appears.

### Edge Cases

- I am waiting to be let into the meeting (User Story 1): no notice appears until I am inside.
- Recording starts or stops after I joined (User Story 1): the notice reflects the meeting's state at the moment I joined and is not shown, withdrawn or replaced because of later changes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The notice is decided once per admission into a meeting. It applies to every Google Meet meeting the user joins, displayed in English. Affects User Story 1.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of admissions into a meeting that is not being recorded show the notice.
- **SC-002**: In 100% of admissions where a recording indicator or transcript indicator is showing, or notes are on, when the notice is decided, no notice appears.
- **SC-003**: A user can dismiss the notice with a single action.

## Assumptions

- The notice is informational. It does not itself message the other participants; the user asks them.
- "Being recorded" means the meeting is capturing a video recording, a transcript or notes at the moment the user is admitted, as the meeting itself shows to participants. A meeting with none of these is "not being recorded".
- Only Google Meet is in scope; other meeting services are out of scope.
- Dismissing the notice is not remembered: a later admission shows it again if the meeting is still unrecorded.
- Meetings displayed in a language other than English are out of scope.
