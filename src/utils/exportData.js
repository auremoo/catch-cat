import { localDB } from '../db/localDB';

export async function exportData() {
  const [cats, sightings] = await Promise.all([
    localDB.cats.getAll(),
    localDB.sightings.getAll(),
  ]);

  const url     = localStorage.getItem('datasafe_url')     || '';
  const apiKey  = localStorage.getItem('datasafe_apiKey')  || '';
  const appName = localStorage.getItem('datasafe_appName') || '';

  const payload = {
    _datasafe: { apiKey, url, appName },
    _meta: {
      exportedAt: new Date().toISOString(),
      storage: ['indexedDB'],
    },
    cats,
    sightings,
  };

  if (url && apiKey && appName) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-App-Name': appName,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) return { mode: 'datasafe', slug: data.slug, versions: data.versions };
    } catch { /* réseau KO → fallback local */ }
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `catdex-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  return { mode: 'local' };
}
