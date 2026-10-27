// Throwaway probe (constitution 3.1). Observes only; changes nothing on the page.
// Press Alt+Shift+D on the Meet tab to download the timeline as JSON.
const KEYWORDS = /record|transcri|gemini|notes|caption/i;
const timeline = [];
const t0 = Date.now();
let lastSignature = "";

function describe(el) {
  const label = el.getAttribute("aria-label") || "";
  const text = (el.textContent || "").trim().slice(0, 120);
  return `${el.tagName.toLowerCase()}|role=${el.getAttribute("role") || ""}|label=${label}|text=${text}`;
}

function snapshot() {
  const hits = new Set();
  for (const el of document.querySelectorAll("[aria-label], [role=status], [role=alert], [role=dialog]")) {
    const d = describe(el);
    if (KEYWORDS.test(d)) hits.add(d);
  }
  const leave = !!document.querySelector('[aria-label*="Leave call" i]');
  const preJoin = !!document.querySelector('button, [role=button]') &&
    Array.from(document.querySelectorAll("button")).some((b) => /ask to join|join now/i.test(b.textContent || ""));
  return { url: location.pathname, leaveCallButton: leave, preJoinButton: preJoin, hits: Array.from(hits).sort().slice(0, 60) };
}

function check() {
  const snap = snapshot();
  const signature = JSON.stringify(snap);
  if (signature === lastSignature) return;
  lastSignature = signature;
  timeline.push({ msSinceStart: Date.now() - t0, at: new Date().toISOString(), ...snap });
}

new MutationObserver(check).observe(document, { subtree: true, childList: true, attributes: true, characterData: true });
setInterval(check, 500);

document.addEventListener("keydown", (e) => {
  if (e.altKey && e.shiftKey && e.code === "KeyD") {
    const blob = new Blob([JSON.stringify(timeline, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `spike_meet_timeline_${Date.now()}.json`;
    a.click();
  }
});
