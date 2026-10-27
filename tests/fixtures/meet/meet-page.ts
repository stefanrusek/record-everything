// Fixture builder standing in for the live Google Meet page (decision D1).
// Structure comes from the real captures in specs/001-unrecorded-meeting-notice/spikes/:
//   spike_meet_signedin_state1.snapshot.yml (Leave call), spike_meet_recording_on.snapshot.yml,
//   spike_meet_transcript_on.snapshot.yml, spike_meet_all_on.snapshot.yml,
//   spike_meet_all_off.snapshot.yml, spike_meet_notes_on.snapshot.yml,
//   spike_meet_prejoin_while_recording.snapshot.yml.
// The fixture encodes only the signals observed there, nothing else about Meet.

export type MeetPageState = {
  inCall: boolean;
  recordedStatus: boolean;
  recordingChip: boolean;
  transcribingChip: boolean;
  notes: 'on' | 'off' | null;
  overflow: boolean;
};

type Key = keyof MeetPageState;

const leaf = (doc: Document, text: string): HTMLElement => {
  const el = doc.createElement('span');
  el.textContent = text;
  return el;
};

const chip = (doc: Document, label: string, icon: string, tooltip: string): HTMLElement => {
  const container = doc.createElement('div');
  container.setAttribute('aria-hidden', 'true');
  container.append(leaf(doc, label), leaf(doc, icon), leaf(doc, tooltip));
  return container;
};

const build: { [K in Key]: (doc: Document, value: MeetPageState[K]) => HTMLElement | null } = {
  inCall: (doc, on) => {
    if (!on) return null;
    const button = doc.createElement('button');
    button.setAttribute('aria-label', 'Leave call');
    return button;
  },
  recordedStatus: (doc, on) => {
    if (!on) return null;
    const status = leaf(doc, 'This video call is being recorded');
    status.setAttribute('role', 'status');
    return status;
  },
  recordingChip: (doc, on) =>
    on ? chip(doc, 'Recording', 'radio_button_checked', 'This meeting is being recorded') : null,
  transcribingChip: (doc, on) =>
    on ? chip(doc, 'Transcribing', 'speech_to_text', 'This call is being transcribed') : null,
  notes: (doc, value) => {
    if (value === null) return null;
    return leaf(doc, value === 'off' ? "Gemini isn't taking notes" : 'Gemini is taking notes');
  },
  overflow: (doc, on) => {
    if (!on) return null;
    const button = doc.createElement('button');
    button.setAttribute('aria-label', 'More activities in this meeting.');
    return button;
  },
};

export function createMeetPage(): { document: Document; set(state: Partial<MeetPageState>): void } {
  const document = globalThis.document.implementation.createHTMLDocument('Meet');
  const state: MeetPageState = {
    inCall: false,
    recordedStatus: false,
    recordingChip: false,
    transcribingChip: false,
    notes: null,
    overflow: false,
  };
  const mounted = new Map<Key, HTMLElement>();

  const apply = <K extends Key>(key: K): void => {
    const next = build[key](document, state[key]);
    const previous = mounted.get(key);
    if (previous) previous.remove();
    if (next) {
      document.body.append(next);
      mounted.set(key, next);
    } else {
      mounted.delete(key);
    }
  };

  return {
    document,
    set(partial) {
      for (const key of Object.keys(partial) as Key[]) {
        const value = partial[key];
        if (value === undefined || value === state[key]) continue;
        (state as Record<Key, MeetPageState[Key]>)[key] = value;
        apply(key);
      }
    },
  };
}
