import { describe, expect, it } from 'vitest';
import { createMeetPage } from '../fixtures/meet/meet-page';
import { readMeetSignals } from '../../src/meet-signals';

const only = (doc: Document, tag: string, attrs: Record<string, string>, text = ''): void => {
  const el = doc.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.textContent = text;
  doc.body.replaceChildren(el);
};

describe('Meet page signals contract', () => {
  it('inCall follows the Leave call control, case-insensitively', () => {
    const page = createMeetPage();
    expect(readMeetSignals(page.document).inCall).toBe(false);
    page.set({ inCall: true });
    expect(readMeetSignals(page.document).inCall).toBe(true);
    only(page.document, 'button', { 'aria-label': 'LEAVE CALL' });
    expect(readMeetSignals(page.document).inCall).toBe(true);
    only(page.document, 'button', { 'aria-label': 'Mute' });
    expect(readMeetSignals(page.document).inCall).toBe(false);
  });

  it('recordingChip is read from DOM text inside aria-hidden', () => {
    const page = createMeetPage();
    expect(readMeetSignals(page.document).recordingChip).toBe(false);
    page.set({ recordingChip: true });
    expect(page.document.querySelector('[aria-hidden=true]')).not.toBeNull();
    expect(readMeetSignals(page.document).recordingChip).toBe(true);
  });

  it('transcribingChip follows the Transcribing leaf', () => {
    const page = createMeetPage();
    expect(readMeetSignals(page.document).transcribingChip).toBe(false);
    page.set({ transcribingChip: true });
    expect(readMeetSignals(page.document).transcribingChip).toBe(true);
  });

  it('notes maps the Gemini chip text', () => {
    const page = createMeetPage();
    expect(readMeetSignals(page.document).notes).toBeNull();
    page.set({ notes: 'off' });
    expect(readMeetSignals(page.document).notes).toBe('off');
    page.set({ notes: 'on' });
    expect(readMeetSignals(page.document).notes).toBe('on');
    for (const [text, expected] of [
      ["Gemini isn't taking notes", 'off'],
      ['Gemini isn’t taking notes', 'off'],
      ['Gemini is taking notes and may improve them with presentation screenshots', null],
      ['Gemini stopped taking notes', null],
    ] as const) {
      only(page.document, 'span', {}, text);
      expect(readMeetSignals(page.document).notes).toBe(expected);
    }
  });

  it('recordedStatusSeen needs a status mentioning being recorded', () => {
    const page = createMeetPage();
    expect(readMeetSignals(page.document).recordedStatusSeen).toBe(false);
    only(page.document, 'span', { role: 'status' }, 'Stefan Rusek is in this call');
    expect(readMeetSignals(page.document).recordedStatusSeen).toBe(false);
    page.set({ recordedStatus: true });
    expect(readMeetSignals(page.document).recordedStatusSeen).toBe(true);
  });
});
