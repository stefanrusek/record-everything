# Spike: guest join of a real Meet meeting via Playwright (2026-10-27)

Probe: headed Playwright browser, no Google sign-in, guest name entered, "Ask to join" clicked on a host-provided meeting.

Observed (evidence: spike_meet_prejoin*.snapshot.yml, spike_meet_waiting.snapshot.yml):
- Pre-join screen offers a name field and "Ask to join" to an anonymous guest; a "Gemini will take notes" control is shown before admission (notes can be on before anyone is inside).
- A dialog "Sign in with your Google account" appears before the join request.
- After "Ask to join": page shows "You can't join this video call" with a 50-second return-to-home countdown; console shows HTTP 403 on
  `/$rpc/google.rtc.meetings.v1.MeetingDeviceService/CreateMeetingDevice`.

Not observed: waiting-room screen, in-meeting UI, any recording/transcript/notes indicator.
Cause of the refusal is unknown (automated-browser detection vs. meeting not allowing anonymous guests). No evasion attempted.

## Retry (2026-10-27, same approach, no changes to the probe)
- Pre-join button read "Join now" instead of "Ask to join".
- Result identical: "You can't join this video call", HTTP 403 on `CreateMeetingDevice`
  (evidence: spike_meet_retry_prejoin.snapshot.yml, spike_meet_retry_after_join.snapshot.yml).
- Two refusals on both button variants point at the automated browser being rejected rather than the meeting's guest setting. Unconfirmed.
- Conclusion: a Playwright guest cannot reach the in-meeting UI. Probing must run in a real Chrome session (see plan research).
