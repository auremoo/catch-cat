import { useState } from 'react';
import { Search } from 'lucide-react';
import CatCard from '../components/CatCard';

export default function CatDexTab({ cats, loading, onSelectCat }) {
  const [query, setQuery] = useState('');

  const filtered = cats.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="tab-content page-transition">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-baseline gap-3 mb-4">
          <h1 className="text-2xl font-bold gradient-text" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            CatDex
          </h1>
          <span
            className="text-sm font-semibold px-2.5 py-0.5 rounded-full"
            style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {cats.length} chat{cats.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: '#0f1626', border: '1px solid rgba(255,255,255,0.07)' }}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Chercher un chat…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm"
            style={{ color: '#f1f5f9', outline: 'none' }}
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(245,158,11,0.2)', borderTopColor: '#f59e0b', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Empty state */}
      {!loading && cats.length === 0 && (
        <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
          <div style={{ fontSize: 72 }}>🐾</div>
          <h2 className="text-xl font-bold mt-4 mb-2" style={{ color: '#f1f5f9', fontFamily: "'Space Grotesk', sans-serif" }}>
            Aucun chat capturé
          </h2>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Partez explorer et photographiez votre premier chat !
          </p>
        </div>
      )}

      {/* No results */}
      {!loading && cats.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center px-4">
          <p className="text-sm" style={{ color: '#64748b' }}>Aucun chat trouvé pour « {query} »</p>
        </div>
      )}

      {/* Grid */}
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
