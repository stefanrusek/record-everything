const HOST_ID = 'record-everything-notice';
const TEXT =
  'This meeting is not being recorded. You can ask the other participants to turn on recording.';
const CSS =
  ':host { position: fixed; bottom: 16px; left: 16px; z-index: 2147483647; }' +
  ' .notice { position: fixed; bottom: 16px; left: 16px; max-width: 320px; padding: 12px 16px;' +
  ' background: #202124; color: #fff; font: 14px sans-serif; border-radius: 8px; }' +
  ' button { margin-top: 8px; }';

export function showNotice(doc: Document): void {
  const host = doc.createElement('div');
  host.id = HOST_ID;
  const root = host.attachShadow({ mode: 'open' });
  const style = doc.createElement('style');
  style.textContent = CSS;
  const container = doc.createElement('div');
  container.className = 'notice';
  const message = doc.createElement('div');
  message.setAttribute('role', 'status');
  message.setAttribute('aria-live', 'polite');
  message.textContent = TEXT;
  const dismiss = doc.createElement('button');
  dismiss.textContent = 'Dismiss';
  dismiss.addEventListener('click', () => host.remove());
  container.append(message, dismiss);
  root.append(style, container);
  doc.documentElement.append(host);
}

export function hideNotice(doc: Document): void {
  doc.getElementById(HOST_ID)?.remove();
}
