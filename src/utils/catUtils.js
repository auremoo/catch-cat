export const CAT_COLORS = [
  { id: 'black',   label: 'Noir',     bg: '#1a1a2e', text: '#94a3b8' },
  { id: 'white',   label: 'Blanc',    bg: '#f8fafc', text: '#1e293b', border: '#cbd5e1' },
  { id: 'orange',  label: 'Roux',     bg: '#ea580c', text: '#fff' },
  { id: 'gray',    label: 'Gris',     bg: '#6b7280', text: '#fff' },
  { id: 'tabby',   label: 'Tigré',    bg: '#a16207', text: '#fff' },
  { id: 'bicolor', label: 'Bicolore', swatch: 'bicolor', text: '#fff' },
  { id: 'calico',  label: 'Calicot',  swatch: 'calico',  text: '#fff' },
  { id: 'tortie',  label: 'Écaille',  swatch: 'tortie',  text: '#fff' },
  { id: 'siamese', label: 'Siamois',  bg: '#c4956a', text: '#fff' },
  { id: 'other',   label: 'Autre',    bg: '#4b5563', text: '#fff' },
];

export function getColor(colorId) {
  return CAT_COLORS.find(c => c.id === colorId) ?? CAT_COLORS[CAT_COLORS.length - 1];
}

export function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatRelative(ts) {
  if (!ts) return '—';
  const diff = Date.now() - ts;
  if (diff < 60_000)   return "À l'instant";
  if (diff < 3_600_000) return `Il y a ${Math.floor(diff / 60_000)} min`;
  if (diff < 86_400_000) return `Il y a ${Math.floor(diff / 3_600_000)}h`;
  if (diff < 172_800_000) return 'Hier';
  if (diff < 604_800_000) return `Il y a ${Math.floor(diff / 86_400_000)} jours`;
  return formatDate(ts);
}

export function calculateStreaks(sightings) {
  if (!sightings?.length) return { current: 0, longest: 0 };
  const DAY = 86_400_000;
  const uniqueDays = [
    ...new Set(sightings.map(s => {
      const d = new Date(s.createdAt);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    })),
  ].sort((a, b) => b - a);

  const today = (() => { const d = new Date(); d.setHours(0,0,0,0); return d.getTime(); })();

  let current = 0;
  if (uniqueDays[0] === today || uniqueDays[0] === today - DAY) {
    let expected = uniqueDays[0];
    for (const d of uniqueDays) {
      if (d === expected) { current++; expected -= DAY; } else break;
    }
  }

  let longest = 1, run = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    if (uniqueDays[i - 1] - uniqueDays[i] === DAY) { run++; longest = Math.max(longest, run); }
    else run = 1;
  }

  return { current, longest: Math.max(longest, current) };
}
