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

  it('splits the message into a headline and a detail line without changing its text', () => {
    const doc = fresh();
    showNotice(doc);
    const status = hostOf(doc).shadowRoot?.querySelector('[role=status]');
    expect(status?.querySelector('.headline')?.textContent).toBe('This meeting is not being recorded.');
    expect(status?.querySelector('.detail')?.textContent?.trim()).toBe(
      'You can ask the other participants to turn on recording.',
    );
  });

  it('shows a decorative SVG icon hidden from assistive technology', () => {
    const doc = fresh();
    showNotice(doc);
    const root = hostOf(doc).shadowRoot as ShadowRoot;
    const badge = root.querySelector('.badge');
    expect(badge?.getAttribute('aria-hidden')).toBe('true');
    const svg = badge?.querySelector('svg');
    expect(svg?.namespaceURI).toBe('http://www.w3.org/2000/svg');
    expect(svg?.getAttribute('focusable')).toBe('false');
    expect(svg?.children.length).toBeGreaterThan(0);
    expect(root.querySelector('[role=status]')?.contains(badge ?? null)).toBe(false);
  });

  it('is a plain button with a visible focus ring', () => {
    const doc = fresh();
    showNotice(doc);
    const root = hostOf(doc).shadowRoot as ShadowRoot;
    expect(root.querySelector('button')?.getAttribute('type')).toBe('button');
    expect(root.querySelector('style')?.textContent).toContain(':focus-visible');
  });

  it('sits top-centre above Meet and turns off its animation for reduced motion', () => {
    const doc = fresh();
    showNotice(doc);
    const css = hostOf(doc).shadowRoot?.querySelector('style')?.textContent ?? '';
    expect(css).toContain('z-index: 2147483647');
    expect(css).toMatch(/top: \d+px/);
    expect(css).toContain('left: 50%');
    expect(css).not.toMatch(/bottom:/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*animation: none/);
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
