import { parsePoints } from '../scraper';

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
