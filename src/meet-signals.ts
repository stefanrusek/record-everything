export type MeetSignals = {
  inCall: boolean;
  recordingChip: boolean;
  transcribingChip: boolean;
  notes: 'on' | 'off' | null;
  recordedStatusSeen: boolean;
};

const NOTES = /^Gemini (isn['’]t|is) taking notes$/;

const leafTexts = (doc: Document): string[] =>
  Array.from(doc.querySelectorAll('*'))
    .filter((el) => el.children.length === 0)
    .map((el) => String(el.textContent).trim());

export function readMeetSignals(doc: Document): MeetSignals {
  const leaves = leafTexts(doc);
  const match = leaves.map((t) => NOTES.exec(t)).find((m) => m !== null);
  const notes = match ? (match[1] === 'is' ? 'on' : 'off') : null;
  const inCall = doc.querySelector('[aria-label*="leave call" i]') !== null;
  const recordedStatusSeen = Array.from(doc.querySelectorAll('[role=status]')).some((el) =>
    String(el.textContent).includes('being recorded'),
  );
  return {
    inCall,
    recordingChip: leaves.includes('Recording'),
    transcribingChip: leaves.includes('Transcribing'),
    notes,
    recordedStatusSeen,
  };
}
