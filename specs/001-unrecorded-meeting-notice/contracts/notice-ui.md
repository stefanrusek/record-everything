# Contract: Notice UI (exposed)

What the user sees. This is the interface the acceptance tests observe.

| Aspect | Contract |
|---|---|
| Text | "This meeting is not being recorded. You can ask the other participants to turn on recording." |
| Role | `role="status"` with `aria-live="polite"` on the notice container |
| Dismiss control | One `button` labelled "Dismiss"; activating it removes the notice and nothing else |
| Position | Fixed, at a corner of the viewport, so it does not cover the call controls or Meet's own dialogs |
| Isolation | Rendered in an open shadow root (so tests can inspect it) attached to one host element appended to `document.documentElement` |
| Construction | `createElement` and `textContent` only; never `innerHTML` (research R7) |
| Side effects | None: no network, no storage, no messages to other participants |

## Not in the contract

Wording variations, animation, colors, and any automatic timeout (the spec states none, and timing is not inferred, 2.7).
