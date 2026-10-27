const HOST_ID = 'record-everything-notice';
const HEADLINE = 'This meeting is not being recorded.';
const DETAIL = ' You can ask the other participants to turn on recording.';
const SVG_NS = 'http://www.w3.org/2000/svg';

const CSS = [
  ':host { all: initial; position: fixed; top: 24px; left: 50%; transform: translateX(-50%);',
  ' z-index: 2147483647; width: min(840px, calc(100vw - 32px)); }',
  '.notice { box-sizing: border-box; display: flex; align-items: center; gap: 22px;',
  ' padding: 28px 28px 28px 26px; border-radius: 24px;',
  ' background: linear-gradient(135deg, #c5221f 0%, #a50e0e 100%); color: #fff;',
  ' box-shadow: 0 24px 56px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3),',
  ' inset 0 0 0 1px rgba(255, 255, 255, 0.14);',
  ' font-family: "Google Sans", Roboto, system-ui, -apple-system, "Segoe UI", sans-serif;',
  ' animation: re-enter 380ms cubic-bezier(0.2, 0.8, 0.2, 1) both; }',
  '.badge { position: relative; flex: none; display: grid; place-items: center;',
  ' width: 68px; height: 68px; border-radius: 50%; background: rgba(255, 255, 255, 0.16); }',
  '.badge::after { content: ""; position: absolute; inset: 0; border-radius: 50%;',
  ' animation: re-pulse 2s ease-out 400ms 3; }',
  '.badge svg { width: 40px; height: 40px; display: block; }',
  '.body { flex: 1; min-width: 0; }',
  '.headline { display: block; font-size: 28px; font-weight: 700; line-height: 1.25;',
  ' letter-spacing: -0.01em; }',
  '.detail { display: block; margin-top: 6px; font-size: 18px; line-height: 1.45;',
  ' color: rgba(255, 255, 255, 0.94); }',
  'button { flex: none; appearance: none; border: 0; margin: 0; border-radius: 999px;',
  ' padding: 14px 26px; background: #fff; color: #a50e0e; font: inherit; font-size: 17px;',
  ' font-weight: 600; cursor: pointer; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);',
  ' transition: background-color 150ms ease, transform 150ms ease, box-shadow 150ms ease; }',
  'button:hover { background: #fce8e6; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); }',
  'button:active { transform: scale(0.97); }',
  'button:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }',
  '@keyframes re-enter { from { opacity: 0; transform: translateY(-16px) scale(0.98); }',
  ' to { opacity: 1; transform: none; } }',
  '@keyframes re-pulse { from { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.55); }',
  ' to { box-shadow: 0 0 0 16px rgba(255, 255, 255, 0); } }',
  '@media (max-width: 600px) { .notice { flex-wrap: wrap; padding: 20px; }',
  ' .headline { font-size: 20px; } .detail { font-size: 16px; } button { width: 100%; } }',
  '@media (prefers-reduced-motion: reduce) { .notice, .badge::after { animation: none; }',
  ' button { transition: none; } button:active { transform: none; } }',
].join('\n');

function svgEl(doc: Document, tag: string, attrs: Record<string, string>): SVGElement {
  const el = doc.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value);
  return el;
}

function buildIcon(doc: Document): HTMLElement {
  const badge = doc.createElement('span');
  badge.className = 'badge';
  badge.setAttribute('aria-hidden', 'true');
  const stroke = { stroke: '#fff', 'stroke-width': '2', fill: 'none', 'stroke-linecap': 'round' };
  const svg = svgEl(doc, 'svg', { viewBox: '0 0 24 24', focusable: 'false' });
  const slash = { x1: '4', y1: '4', x2: '20', y2: '20', ...stroke };
  // A record symbol (ring and dot) struck through; the wide line in the badge colour cuts a gap.
  svg.append(
    svgEl(doc, 'circle', { cx: '12', cy: '12', r: '8.5', ...stroke }),
    svgEl(doc, 'circle', { cx: '12', cy: '12', r: '3.5', fill: '#fff' }),
    svgEl(doc, 'line', { ...slash, stroke: '#c13d3f', 'stroke-width': '5' }),
    svgEl(doc, 'line', { ...slash, 'stroke-width': '2.25' }),
  );
  badge.append(svg);
  return badge;
}

export function showNotice(doc: Document): void {
  const host = doc.createElement('div');
  host.id = HOST_ID;
  const root = host.attachShadow({ mode: 'open' });
  const style = doc.createElement('style');
  style.textContent = CSS;
  const container = doc.createElement('div');
  container.className = 'notice';
  const message = doc.createElement('div');
  message.className = 'body';
  message.setAttribute('role', 'status');
  message.setAttribute('aria-live', 'polite');
  const headline = doc.createElement('span');
  headline.className = 'headline';
  headline.textContent = HEADLINE;
  const detail = doc.createElement('span');
  detail.className = 'detail';
  detail.textContent = DETAIL;
  message.append(headline, detail);
  const dismiss = doc.createElement('button');
  dismiss.type = 'button';
  dismiss.textContent = 'Dismiss';
  dismiss.addEventListener('click', () => host.remove());
  container.append(buildIcon(doc), message, dismiss);
  root.append(style, container);
  doc.documentElement.append(host);
}

export function hideNotice(doc: Document): void {
  doc.getElementById(HOST_ID)?.remove();
}
