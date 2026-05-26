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

export function renderLeaderboard(players: Player[], scores: Scores): void {
  const body = document.getElementById('leaderboard-body')!;

  const ranked = players
    .map(p => {
      const s = scores[p.name] ?? { atp: null, wta: null };
      const atpPts = s.atp ?? 0;
      const wtaPts = s.wta ?? 0;
      const total  = s.atp === null && s.wta === null ? null : atpPts + wtaPts;
      return { ...p, atp: s.atp, wta: s.wta, total };
    })
    .sort((a, b) => (b.total ?? -1) - (a.total ?? -1));

  body.innerHTML = ranked.map((p, i) => `
    <div class="leaderboard-row">
      <div class="lb-rank ${i === 0 && p.total !== null ? 'first' : ''}">${i + 1}</div>
      <span class="dot" style="background:${p.color}"></span>
      <div class="lb-name">${p.name}</div>
      <div class="lb-breakdown">
        <span>ATP <strong>${pts(p.atp)}</strong></span>
        <span>WTA <strong>${pts(p.wta)}</strong></span>
      </div>
      <div>
        <div class="lb-pts">${p.total !== null ? p.total : '—'}</div>
        <div class="lb-pts-label">pts</div>
      </div>
    </div>`).join('');
}
