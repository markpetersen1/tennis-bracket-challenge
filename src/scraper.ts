import { SERVED_ROOT, CORS_PROXY, FETCH_ATTEMPTS, RETRY_BACKOFF_MS } from './constants';
import type { Draw } from './types';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Extracts the total points from a served.bracket.tennis page HTML string.
// The page renders: <span>290<!-- --> pts</span> (React SSR with comment nodes).
export function parsePoints(html: string): number | null {
  const m = html.match(/<span>([\d,]+)(?:<!--[^<]*-->)?\s*pts<\/span>/);
  if (!m) return null;
  return parseInt(m[1].replace(/,/g, ''), 10);
}

export function bracketUrl(tournamentId: string, username: string, draw: Draw): string {
  return `${SERVED_ROOT}/${tournamentId}/${draw}/brackets/${username}`;
}

// The proxy fails intermittently, so retry before giving up on a player. A page
// that loads but has no points span is a real answer, not a failure — don't retry it.
export async function fetchPlayerPoints(tournamentId: string, username: string, draw: Draw): Promise<number | null> {
  const url = `${CORS_PROXY}${encodeURIComponent(bracketUrl(tournamentId, username, draw))}`;

  for (let attempt = 1; attempt <= FETCH_ATTEMPTS; attempt++) {
    try {
      const r = await fetch(url);
      if (r.ok) return parsePoints(await r.text());
    } catch { /* network blip — fall through to the retry */ }
    if (attempt < FETCH_ATTEMPTS) await sleep(RETRY_BACKOFF_MS * attempt);
  }
  return null;
}
