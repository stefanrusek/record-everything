import { afterAll, beforeAll, expect, vi } from 'vitest';
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber';
import { createMeetPage } from '../fixtures/meet/meet-page';
import { start } from '../../src/content';

const NOTICE =
  'This meeting is not being recorded. You can ask the other participants to turn on recording.';

const noticeText = (document: Document): string | null => {
  for (const child of Array.from(document.documentElement.children)) {
    const text = child.shadowRoot?.textContent;
    if (text !== undefined && text.includes('This meeting')) {
      return child.shadowRoot?.querySelector('[role=status]')?.textContent ?? null;
    }
  }
  return null;
};

const flush = () => vi.advanceTimersByTimeAsync(0);

beforeAll(() => {
  vi.useFakeTimers();
});
afterAll(() => {
  vi.useRealTimers();
});

const feature = await loadFeature('tests/acceptance/acc_unrecorded_meeting_notice.feature');

describeFeature(feature, ({ Scenario }) => {
  const setup = () => {
    const page = createMeetPage();
    start(page.document);
    return page;
  };

  type Page = ReturnType<typeof createMeetPage>;
  const joinUnrecorded = async (page: Page) => {
    page.set({ inCall: true, notes: 'off' });
    await flush();
  };

  Scenario('Notice appears in an unrecorded meeting', ({ Given, When, Then }) => {
    let page: Page;
    Given('the extension is running on a Meet page', () => {
      page = setup();
    });
    When('I am admitted to a meeting where Gemini is not taking notes', () => joinUnrecorded(page));
    Then('I see the unrecorded notice immediately', () => {
      expect(noticeText(page.document)).toBe(NOTICE);
    });
  });

  Scenario('No notice in a recorded meeting', ({ Given, When, Then }) => {
    let page: Page;
    Given('the extension is running on a Meet page', () => {
      page = setup();
    });
    When('I am admitted to a meeting that is being recorded', async () => {
      page.set({ inCall: true, recordingChip: true, notes: 'off' });
      await flush();
    });
    Then('I see no notice', () => {
      expect(noticeText(page.document)).toBeNull();
    });
  });

  Scenario('Recorded status shown before admission', ({ Given, When, Then }) => {
    let page: Page;
    Given('the extension is running on a Meet page', () => {
      page = setup();
    });
    When('the recorded status shows before admission and then I am admitted', async () => {
      page.set({ recordedStatus: true });
      await flush();
      page.set({ recordedStatus: false });
      await flush();
      page.set({ inCall: true, notes: 'off' });
      await flush();
    });
    Then('I see no notice', () => {
      expect(noticeText(page.document)).toBeNull();
    });
  });

  Scenario('Dismissing the notice', ({ Given, And, When, Then }) => {
    let page: Page;
    Given('the extension is running on a Meet page', () => {
      page = setup();
    });
    And('the unrecorded notice is showing', () => joinUnrecorded(page));
    When('I dismiss the notice', () => {
      const host = Array.from(page.document.documentElement.children).find((c) => c.shadowRoot);
      host?.shadowRoot?.querySelector('button')?.click();
    });
    Then('I see no notice', () => {
      expect(noticeText(page.document)).toBeNull();
    });
    And('the Leave call button is still present', () => {
      expect(page.document.querySelector('[aria-label="Leave call"]')).not.toBeNull();
    });
  });

  Scenario('Rejoining shows the notice again', ({ Given, And, When, Then }) => {
    let page: Page;
    Given('the extension is running on a Meet page', () => {
      page = setup();
    });
    And('the unrecorded notice is showing', () => joinUnrecorded(page));
    When('I leave and rejoin an unrecorded meeting', async () => {
      page.set({ inCall: false });
      await flush();
      await joinUnrecorded(page);
    });
    Then('I see the unrecorded notice immediately', () => {
      expect(noticeText(page.document)).toBe(NOTICE);
    });
  });

  Scenario('Rejoining within five seconds restarts the wait', ({ Given, When, Then }) => {
    let page: Page;
    Given('the extension is running on a Meet page', () => {
      page = setup();
    });
    When('I join with no notes status, leave after 3 seconds and rejoin', async () => {
      page.set({ inCall: true });
      await flush();
      await vi.advanceTimersByTimeAsync(3000);
      page.set({ inCall: false });
      await flush();
      page.set({ inCall: true });
      await flush();
    });
    Then('the notice is absent until 5 seconds after the rejoin', async () => {
      await vi.advanceTimersByTimeAsync(4999);
      expect(noticeText(page.document)).toBeNull();
      await vi.advanceTimersByTimeAsync(1);
      expect(noticeText(page.document)).toBe(NOTICE);
    });
  });

  Scenario('Leaving removes the notice', ({ Given, And, When, Then }) => {
    let page: Page;
    Given('the extension is running on a Meet page', () => {
      page = setup();
    });
    And('the unrecorded notice is showing', () => joinUnrecorded(page));
    When('I leave the meeting', async () => {
      page.set({ inCall: false });
      await flush();
    });
    Then('I see no notice', () => {
      expect(noticeText(page.document)).toBeNull();
    });
  });

  Scenario('Meeting that shows no notes status', ({ Given, When, Then }) => {
    let page: Page;
    Given('the extension is running on a Meet page', () => {
      page = setup();
    });
    When('I join with no notes status', async () => {
      page.set({ inCall: true });
      await flush();
    });
    Then('the notice is absent until 5 seconds after the rejoin', async () => {
      await vi.advanceTimersByTimeAsync(4999);
      expect(noticeText(page.document)).toBeNull();
      await vi.advanceTimersByTimeAsync(1);
      expect(noticeText(page.document)).toBe(NOTICE);
    });
  });

  Scenario('No notice while waiting to be let in', ({ Given, When, Then }) => {
    let page: Page;
    Given('the extension is running on a Meet page', () => {
      page = setup();
    });
    When('10 seconds pass without admission', async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    Then('I see no notice', () => {
      expect(noticeText(page.document)).toBeNull();
    });
  });

  Scenario('Recording starting later changes nothing', ({ Given, And, When, Then }) => {
    let page: Page;
    Given('the extension is running on a Meet page', () => {
      page = setup();
    });
    And('the unrecorded notice is showing', () => joinUnrecorded(page));
    When('recording starts', async () => {
      page.set({ recordingChip: true });
      await flush();
    });
    Then('the unrecorded notice is still showing', () => {
      expect(noticeText(page.document)).toBe(NOTICE);
    });
  });

  Scenario('Recording stopping later changes nothing', ({ Given, And, When, Then }) => {
    let page: Page;
    Given('the extension is running on a Meet page', () => {
      page = setup();
    });
    And('I am in a recorded meeting', async () => {
      page.set({ inCall: true, recordingChip: true, notes: 'off' });
      await flush();
    });
    When('recording stops', async () => {
      page.set({ recordingChip: false });
      await flush();
    });
    Then('I see no notice', () => {
      expect(noticeText(page.document)).toBeNull();
    });
  });
});
