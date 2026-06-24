import { useState } from 'react';
import { Search } from 'lucide-react';
import CatCard from '../components/CatCard';
import { OWNERSHIP, getOwnershipKey } from '../utils/catUtils';

const FILTERS = [
  { key: 'all',   label: 'Tous' },
  { key: 'mine',  label: `${OWNERSHIP.mine.icon} Les miens` },
  { key: 'known', label: `${OWNERSHIP.known.icon} Connus` },
  { key: 'stray', label: `${OWNERSHIP.stray.icon} Errants` },
];

export default function CatDexTab({ cats, loading, onSelectCat }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = cats.filter(c => {
    const matchesQuery = c.name.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'all' || getOwnershipKey(c) === filter;
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="tab-content page-transition">
      <div className="px-4 pt-5 pb-3">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={`${import.meta.env.BASE_URL}icon.jpg`}
            alt="CatDex"
            className="rounded-xl flex-shrink-0"
            style={{ width: 40, height: 40, objectFit: 'cover' }}
          />
          <h1 className="text-2xl font-bold gradient-text" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            CatDex
          </h1>
          <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full ml-auto"
            style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontFamily: "'Space Grotesk', sans-serif" }}>
            {cats.length} chat{cats.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: filter === f.key ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
                color: filter === f.key ? '#f59e0b' : '#64748b',
                border: filter === f.key ? '1px solid rgba(245,158,11,0.4)' : '1px solid transparent',
                fontFamily: "'Space Grotesk', sans-serif",
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: '#0f1626', border: '1px solid rgba(255,255,255,0.07)' }}>
          <Search size={16} color="#64748b" />
          <input type="text" placeholder="Chercher un chat…" value={query} onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm" style={{ color: '#f1f5f9', outline: 'none' }} />
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(245,158,11,0.2)', borderTopColor: '#f59e0b', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {!loading && cats.length === 0 && (
        <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
          <div style={{ fontSize: 72 }}>🐾</div>
          <h2 className="text-xl font-bold mt-4 mb-2" style={{ color: '#f1f5f9', fontFamily: "'Space Grotesk', sans-serif" }}>
            Aucun chat capturé
          </h2>
          <p className="text-sm" style={{ color: '#64748b' }}>Partez explorer et photographiez votre premier chat !</p>
        </div>
      )}

      {!loading && cats.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center px-4">
          <p className="text-sm" style={{ color: '#64748b' }}>
            {query ? `Aucun résultat pour « ${query} »` : 'Aucun chat dans cette catégorie'}
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-3 px-4 pb-6">
          {filtered.map(cat => (
            <CatCard key={cat.id} cat={cat} onClick={() => onSelectCat(cat)} />
          ))}
        </div>
      )}
    </div>
  );
}
