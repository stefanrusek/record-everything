import { readMeetSignals } from './meet-signals';
import { initialState, SETTLE_MS, step } from './notice-decision';
import { hideNotice, showNotice } from './notice-ui';

export function start(doc: Document): void {
  let state = initialState;

  const check = (): void => {
    const before = state.phase;
    const result = step(state, { ...readMeetSignals(doc), nowMs: Date.now() });
    state = result.state;
    if (result.decision.show) showNotice(doc);
    if (result.decision.hide) hideNotice(doc);
    if (before === 'outside' && state.phase === 'settling') setTimeout(check, SETTLE_MS);
  };

  check();
  new MutationObserver(check).observe(doc, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true,
  });
}
