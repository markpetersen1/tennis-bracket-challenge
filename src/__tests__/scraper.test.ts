import { parsePoints, bracketUrl, fetchPlayerPoints } from '../scraper';
import { FETCH_ATTEMPTS } from '../constants';

describe('parsePoints', () => {
  it('parses the React SSR format with HTML comment node', () => {
    expect(parsePoints('<span>290<!-- --> pts</span>')).toBe(290);
  });

  it('parses without an HTML comment', () => {
    expect(parsePoints('<span>280 pts</span>')).toBe(280);
  });

  it('parses from realistic surrounding page HTML', () => {
    const html = `
      <p class="inline"><a href="/users/meelz">meelz</a>'s Bracket</p>
      <span>290<!-- --> pts</span>
      <div class="space-x-2">
    `;
    expect(parsePoints(html)).toBe(290);
  });

  it('strips commas from large numbers', () => {
    expect(parsePoints('<span>1,290<!-- --> pts</span>')).toBe(1290);
  });

  it('returns null when no pts span is present', () => {
    expect(parsePoints('<div>no points here</div>')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(parsePoints('')).toBeNull();
  });

  it('does not match bare numbers that are not inside a span', () => {
    // Scores like "6-4 7-5" or random numbers should not match
    expect(parsePoints('<td>6-4</td><p>Round 1</p>')).toBeNull();
  });
});

describe('bracketUrl', () => {
  it('builds the served.bracket.tennis bracket path', () => {
    expect(bracketUrl('us-open-2026', 'andy', 'atp'))
      .toBe('https://served.bracket.tennis/tournaments/us-open-2026/atp/brackets/andy');
  });
});

describe('fetchPlayerPoints', () => {
  const ok = (html: string) => ({ ok: true, text: async () => html });
  const fail = { ok: false, text: async () => '' };

  afterEach(() => { jest.restoreAllMocks(); });

  function mockFetch(...responses: unknown[]) {
    const spy = jest.fn();
    responses.forEach(r => spy.mockResolvedValueOnce(r));
    global.fetch = spy as unknown as typeof fetch;
    return spy;
  }

  it('proxies the bracket URL and returns the parsed points', async () => {
    const spy = mockFetch(ok('<span>290<!-- --> pts</span>'));
    await expect(fetchPlayerPoints('us-open-2026', 'andy', 'wta')).resolves.toBe(290);

    const [requested] = spy.mock.calls[0] as [string];
    expect(requested).toContain(
      encodeURIComponent('https://served.bracket.tennis/tournaments/us-open-2026/wta/brackets/andy')
    );
  });

  it('retries past a flaky proxy error', async () => {
    const spy = mockFetch(fail, ok('<span>140 pts</span>'));
    await expect(fetchPlayerPoints('us-open-2026', 'andy', 'atp')).resolves.toBe(140);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('retries when fetch itself rejects', async () => {
    const spy = jest.fn()
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(ok('<span>75 pts</span>'));
    global.fetch = spy as unknown as typeof fetch;
    await expect(fetchPlayerPoints('us-open-2026', 'andy', 'atp')).resolves.toBe(75);
  });

  it('gives up and returns null after the attempt limit', async () => {
    const spy = mockFetch(...Array(FETCH_ATTEMPTS).fill(fail));
    await expect(fetchPlayerPoints('us-open-2026', 'andy', 'atp')).resolves.toBeNull();
    expect(spy).toHaveBeenCalledTimes(FETCH_ATTEMPTS);
  });

  it('does not retry a page that loaded without a points span', async () => {
    const spy = mockFetch(ok('<div>bracket not submitted</div>'));
    await expect(fetchPlayerPoints('us-open-2026', 'andy', 'atp')).resolves.toBeNull();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
