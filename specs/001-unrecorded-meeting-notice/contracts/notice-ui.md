# Contract: Notice UI (exposed)

What the user sees. This is the interface the acceptance tests observe.

| Aspect | Contract |
|---|---|
| Text | "This meeting is not being recorded. You can ask the other participants to turn on recording." |
| Role | `role="status"` with `aria-live="polite"` on the notice container |
| Dismiss control | One `button` labelled "Dismiss"; activating it removes the notice and nothing else |
| Position | Fixed, centred horizontally 24px from the top of the viewport, with `z-index: 2147483647` so it sits above Meet's UI. It is never anchored to the bottom, so the call control bar stays usable |
| Size | A wide card: `min(840px, 100vw - 32px)` wide, with 28px padding. Below 600px viewport width the Dismiss button wraps to its own full-width row |
| Structure | Inside the card, left to right: a decorative icon badge (`span.badge`, `aria-hidden="true"`, holding an inline SVG with `focusable="false"`: a record symbol struck through); the status container, which holds a headline span (`.headline`, "This meeting is not being recorded.") and a detail span (`.detail`, the rest of the sentence). The two spans' combined `textContent` is exactly the Text above. Last comes the Dismiss button (`type="button"`) |
| Look | A red gradient card (#c5221f to #a50e0e) with white text (at least 5.8:1 contrast), a 28px bold headline, an 18px detail line, 24px rounded corners and a soft drop shadow. The Dismiss control is a white pill with dark-red text |
| Keyboard | The Dismiss button is reachable with Tab and shows a 3px white `:focus-visible` outline offset by 3px |
| Motion | A 380ms fade-and-slide-down entrance, and a soft pulse on the icon badge that plays three times. Both are switched off under `prefers-reduced-motion: reduce` |
| Isolation | Rendered in an open shadow root (so tests can inspect it) attached to one host element appended to `document.documentElement`. Styles live in one `style` element in that shadow root |
| Construction | `createElement`, `createElementNS` (for the SVG) and `textContent` only; never `innerHTML` (research R7) |
| Side effects | None: no network, no storage, no messages to other participants |

## Not in the contract

Wording variations, exact colour values, sizes and timings (the values above describe the current build and are not acceptance criteria), and any automatic timeout (the spec states none, and timing is not inferred, 2.7).
