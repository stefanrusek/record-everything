import type { MeetSignals } from './meet-signals';

export type DetectionState = {
  phase: 'outside' | 'settling' | 'decided';
  recordedHint: boolean;
  insideSinceMs: number | null;
};

export type StepInput = MeetSignals & { nowMs: number };
export type Decision = { show: boolean; hide: boolean };

export const SETTLE_MS = 5000;

export const initialState: DetectionState = {
  phase: 'outside',
  recordedHint: false,
  insideSinceMs: null,
};

export function step(
  state: DetectionState,
  input: StepInput,
): { state: DetectionState; decision: Decision } {
  if (!input.inCall) {
    const left = state.phase !== 'outside';
    const recordedHint = (left ? false : state.recordedHint) || input.recordedStatusSeen;
    return {
      state: { phase: 'outside', recordedHint, insideSinceMs: null },
      decision: { show: false, hide: left },
    };
  }
  let next = state;
  if (next.phase === 'outside') {
    next = { ...next, phase: 'settling', insideSinceMs: input.nowMs };
  }
  if (next.phase === 'settling') {
    const settled =
      input.notes !== null || input.nowMs - Number(next.insideSinceMs) >= SETTLE_MS;
    if (settled) {
      const recorded =
        input.recordingChip || input.transcribingChip || input.notes === 'on' || next.recordedHint;
      return { state: { ...next, phase: 'decided' }, decision: { show: !recorded, hide: false } };
    }
  }
  return { state: next, decision: { show: false, hide: false } };
}
