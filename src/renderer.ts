import { bracketUrl } from './scraper';
import type { Draw, Player, Scores, Tournament } from './types';

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

export function applyTheme(tournament: Tournament): void {
  const root = document.documentElement.style;
  root.setProperty('--clay', tournament.colors.accent);
  root.setProperty('--clay-light', tournament.colors.accent);
  root.setProperty('--clay-dark', tournament.colors.accentDark);
  root.setProperty('--sand', tournament.colors.sand);
  root.setProperty('--sand-dark', tournament.colors.sandDark);

  document.title = `${tournament.name} — Bracket Standings`;
  const title = document.getElementById('tournament-title');
  if (title) title.textContent = tournament.name;
  const meta = document.getElementById('tournament-meta');
  if (meta) meta.innerHTML = `${tournament.dates}<br>${tournament.location}`;
}

export function renderTabs(tournaments: Tournament[], activeId: string, onSelect: (id: string) => void): void {
  const nav = document.getElementById('tournament-tabs')!;
  nav.innerHTML = tournaments.map(t => `
    <button class="tab${t.id === activeId ? ' tab-active' : ''}" data-id="${t.id}">${t.short}</button>
  `).join('');
  nav.querySelectorAll<HTMLButtonElement>('.tab').forEach(btn => {
    btn.addEventListener('click', () => onSelect(btn.dataset.id!));
  });
}

export function renderLeaderboard(players: Player[], scores: Scores, tournamentId: string): void {
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

  // Reserved seats sit below everyone with no rank and no bracket to link to.
  const drawCell = (p: typeof ranked[number], draw: Draw) => p.pending
    ? '<div class="lb-score lb-pending"><strong>—</strong></div>'
    : `<div class="lb-score"><strong>${pts(draw === 'atp' ? p.atp : p.wta)}</strong> <a class="bracket-link" href="${bracketUrl(tournamentId, p.name, draw)}" target="_blank">↗</a></div>`;

  body.innerHTML = ranked.map(p => `
    <div class="leaderboard-row${p.pending ? ' row-pending' : ''}">
      <div class="lb-rank">${p.pending ? '·' : rankBadge(p.rank)}</div>
      <span class="dot" style="background:${p.color}"></span>
      <div class="lb-name">${p.displayName}</div>
      ${drawCell(p, 'atp')}
      ${drawCell(p, 'wta')}
      <div class="lb-total">
        <div class="lb-pts">${p.total !== null ? p.total : '—'}</div>
        <div class="lb-pts-label">pts</div>
      </div>
    </div>`).join('');
}
