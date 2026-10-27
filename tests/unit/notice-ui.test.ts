import { describe, expect, it } from 'vitest';
import { hideNotice, showNotice } from '../../src/notice-ui';

const hostOf = (doc: Document) =>
  Array.from(doc.documentElement.children).find((c) => c.shadowRoot) as Element;

describe('notice ui', () => {
  const fresh = () => document.implementation.createHTMLDocument('x');

  it('renders the text in a polite status container', () => {
    const doc = fresh();
    showNotice(doc);
    const root = hostOf(doc).shadowRoot as ShadowRoot;
    const status = root.querySelector('[role=status]') as Element;
    expect(status.textContent).toBe(
      'This meeting is not being recorded. You can ask the other participants to turn on recording.',
    );
    expect(status.getAttribute('aria-live')).toBe('polite');
  });

  it('has one Dismiss button and fixed positioning', () => {
    const doc = fresh();
    showNotice(doc);
    const root = hostOf(doc).shadowRoot as ShadowRoot;
    const buttons = root.querySelectorAll('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0].textContent).toBe('Dismiss');
    expect(root.querySelector('style')?.textContent).toContain('position: fixed');
  });

  it('Dismiss removes only the notice', () => {
    const doc = fresh();
    doc.body.append(doc.createElement('main'));
    showNotice(doc);
    (hostOf(doc).shadowRoot?.querySelector('button') as HTMLButtonElement).click();
    expect(Array.from(doc.documentElement.children).some((c) => c.shadowRoot)).toBe(false);
    expect(doc.querySelector('main')).not.toBeNull();
  });

  it('hideNotice removes when present and is a no-op when absent', () => {
    const doc = fresh();
    hideNotice(doc);
    showNotice(doc);
    hideNotice(doc);
    expect(Array.from(doc.documentElement.children).some((c) => c.shadowRoot)).toBe(false);
  });
});
