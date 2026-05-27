import { SERVED_BASE } from './constants';
import type { Player, Scores } from './types';

export function showToast(msg: string): void {
  const t = document.getElementById('toast')!;
  t.textContent = msg;
  t.style.opacity = '1';
  setTimeout(() => { t.style.opacity = '0'; }, 2500);
}

export function setStatus(msg: string): void {
  const el = document.getElementById('status-text');
  if (el) el.textContent = msg;
}

function pts(n: number | null): string {
  return n === null ? '—' : `${n}`;
}

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

function rankBadge(rank: number): string {
  return MEDALS[rank] ?? String(rank);
}

export function renderLeaderboard(players: Player[], scores: Scores): void {
  const body = document.getElementById('leaderboard-body')!;

  const sorted = players
    .map(p => {
      const s = scores[p.name] ?? { atp: null, wta: null };
      const atpPts = s.atp ?? 0;
      const wtaPts = s.wta ?? 0;
      const total  = s.atp === null && s.wta === null ? null : atpPts + wtaPts;
      return { ...p, atp: s.atp, wta: s.wta, total };
    })
    .sort((a, b) => (b.total ?? -1) - (a.total ?? -1));

  // Standard competition ranking: ties share a rank, next rank skips accordingly
  const ranked = sorted.map((p, i) => ({ ...p, rank: i + 1 }));
  for (let i = 1; i < ranked.length; i++) {
    if (ranked[i].total !== null && ranked[i].total === ranked[i - 1].total) {
      ranked[i].rank = ranked[i - 1].rank;
    }
  }

  body.innerHTML = ranked.map(p => `
    <div class="leaderboard-row">
      <div class="lb-rank">${rankBadge(p.rank)}</div>
      <span class="dot" style="background:${p.color}"></span>
      <div class="lb-name">${p.displayName}</div>
      <div class="lb-score"><strong>${pts(p.atp)}</strong> <a class="bracket-link" href="${SERVED_BASE}/atp/brackets/${p.name}" target="_blank">↗</a></div>
      <div class="lb-score"><strong>${pts(p.wta)}</strong> <a class="bracket-link" href="${SERVED_BASE}/wta/brackets/${p.name}" target="_blank">↗</a></div>
      <div class="lb-total">
        <div class="lb-pts">${p.total !== null ? p.total : '—'}</div>
        <div class="lb-pts-label">pts</div>
      </div>
    </div>`).join('');
}
