import { describe, expect, it } from 'vitest';
import { initialState, step, type StepInput } from '../../src/notice-decision';

const input = (over: Partial<StepInput> = {}): StepInput => ({
  inCall: true,
  recordingChip: false,
  transcribingChip: false,
  notes: null,
  recordedStatusSeen: false,
  nowMs: 0,
  ...over,
});

describe('step', () => {
  it('outside to settling with no notes', () => {
    const r = step(initialState, input({ nowMs: 100 }));
    expect(r.state).toEqual({ phase: 'settling', recordedHint: false, insideSinceMs: 100 });
    expect(r.decision).toEqual({ show: false, hide: false });
  });

  it('chains to decided when notes already shown', () => {
    const r = step(initialState, input({ notes: 'off' }));
    expect(r.state.phase).toBe('decided');
    expect(r.decision.show).toBe(true);
  });

  it('settling to decided when notes appear', () => {
    const s = step(initialState, input()).state;
    const r = step(s, input({ notes: 'off', nowMs: 10 }));
    expect(r.state.phase).toBe('decided');
    expect(r.decision.show).toBe(true);
  });

  it.each([
    ['recordingChip', { recordingChip: true }],
    ['transcribingChip', { transcribingChip: true }],
    ['notes on', { notes: 'on' as const }],
  ])('%s alone suppresses the notice', (_n, over) => {
    expect(step(initialState, input({ notes: 'off', ...over })).decision.show).toBe(false);
  });

  it('recordedHint alone suppresses the notice', () => {
    const hint = step(initialState, input({ inCall: false, recordedStatusSeen: true })).state;
    expect(hint.recordedHint).toBe(true);
    const joined = step(hint, input({ notes: 'off' }));
    expect(joined.state.recordedHint).toBe(true);
    expect(joined.decision.show).toBe(false);
  });

  it('remembers the pre-join recorded status after it disappears and before the call starts', () => {
    const seen = step(initialState, input({ inCall: false, recordedStatusSeen: true })).state;
    const gone = step(seen, input({ inCall: false, recordedStatusSeen: false })).state;
    expect(gone.recordedHint).toBe(true);
    const joined = step(gone, input({ notes: 'off' }));
    expect(joined.decision.show).toBe(false);
  });

  it('settles at 5000 ms, not 4999', () => {
    const s = step(initialState, input()).state;
    const early = step(s, input({ nowMs: 4999 }));
    expect(early.state.phase).toBe('settling');
    expect(early.decision.show).toBe(false);
    const late = step(s, input({ nowMs: 5000 }));
    expect(late.state.phase).toBe('decided');
    expect(late.decision.show).toBe(true);
  });

  it('leaving resets and hides', () => {
    for (const notes of [null, 'off'] as const) {
      const s = step(initialState, input({ notes })).state;
      const r = step(s, input({ inCall: false }));
      expect(r.state).toEqual(initialState);
      expect(r.decision).toEqual({ show: false, hide: true });
    }
  });

  it('leaving while outside hides nothing', () => {
    expect(step(initialState, input({ inCall: false })).decision.hide).toBe(false);
  });

  it('decided is final until leaving', () => {
    const s = step(initialState, input({ notes: 'off' })).state;
    const r = step(s, input({ notes: 'on', recordingChip: true, transcribingChip: true }));
    expect(r.state.phase).toBe('decided');
    expect(r.decision).toEqual({ show: false, hide: false });
  });
});
