import { SERVED_ROOT, CORS_PROXY } from './constants';
import type { Draw } from './types';

// Extracts the total points from a served.bracket.tennis page HTML string.
// The page renders: <span>290<!-- --> pts</span> (React SSR with comment nodes).
export function parsePoints(html: string): number | null {
  const m = html.match(/<span>([\d,]+)(?:<!--[^<]*-->)?\s*pts<\/span>/);
  if (!m) return null;
  return parseInt(m[1].replace(/,/g, ''), 10);
}

export async function fetchPlayerPoints(tournamentId: string, username: string, draw: Draw): Promise<number | null> {
  const targetUrl = `${SERVED_ROOT}/${tournamentId}/${draw}/brackets/${username}`;
  const r = await fetch(`${CORS_PROXY}${encodeURIComponent(targetUrl)}`);
  if (!r.ok) return null;
  return parsePoints(await r.text());
}
