import { useMemo } from 'react';
import { Flame, Star, Eye, MapPin } from 'lucide-react';
import { calculateStreaks, getColor, CAT_COLORS, formatRelative } from '../utils/catUtils';

function StatCard({ icon, value, label, accent = false }) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-1"
      style={{ background: '#0f1626', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="text-2xl">{icon}</div>
      <p
        className="text-2xl font-bold"
        style={{ color: accent ? '#f59e0b' : '#f1f5f9', fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {value}
      </p>
      <p className="text-xs" style={{ color: '#64748b' }}>{label}</p>
    </div>
  );
}

export default function StatsTab({ cats, sightings }) {
  const { current: streak, longest } = useMemo(() => calculateStreaks(sightings), [sightings]);

  const mostSeen = useMemo(() =>
    cats.reduce((best, c) => (!best || c.totalSightings > best.totalSightings) ? c : best, null),
    [cats]);

  const colorStats = useMemo(() => {
    const counts = {};
    cats.forEach(c => { counts[c.color] = (counts[c.color] || 0) + 1; });
    return CAT_COLORS
      .map(c => ({ ...c, count: counts[c.id] || 0 }))
      .filter(c => c.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [cats]);

  const maxColorCount = Math.max(...colorStats.map(c => c.count), 1);

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      const start = d.getTime();
      const count = sightings.filter(s => s.createdAt >= start && s.createdAt < start + 86_400_000).length;
      return {
        label: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
        count,
        isToday: i === 6,
      };
    });
  }, [sightings]);

  const maxDay = Math.max(...last7Days.map(d => d.count), 1);

  const withLoc = sightings.filter(s => s.lat && s.lng).length;

  if (cats.length === 0) {
    return (
      <div className="tab-content flex flex-col items-center justify-center px-8 page-transition" style={{ minHeight: '100%' }}>
        <div style={{ fontSize: 64 }}>📊</div>
        <h2 className="text-xl font-bold mt-4 mb-2 text-center" style={{ color: '#f1f5f9', fontFamily: "'Space Grotesk', sans-serif" }}>
          Aucune stat encore
        </h2>
        <p className="text-sm text-center" style={{ color: '#64748b' }}>Capturez des chats pour voir vos statistiques !</p>
      </div>
    );
  }

  return (
    <div className="tab-content page-transition">
      <div className="px-4 pt-5 pb-6 space-y-5">
        <h1 className="text-2xl font-bold gradient-text" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Statistiques
        </h1>

        {/* Streak card */}
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: streak > 0
              ? 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(249,115,22,0.1))'
              : '#0f1626',
            border: streak > 0 ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div className="flex items-center gap-4">
            <div style={{ fontSize: 56 }}>{streak > 0 ? '🔥' : '❄️'}</div>
            <div>
              <p className="text-5xl font-bold" style={{ color: streak > 0 ? '#f59e0b' : '#475569', fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>
                {streak}
              </p>
              <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>
                {streak === 1 ? 'jour de streak' : streak > 1 ? 'jours de streak' : 'Revenez demain !'}
              </p>
              {longest > 1 && (
                <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>Record : {longest} jours</p>
              )}
            </div>
          </div>
        </div>

        {/* Main stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon="🐱" value={cats.length} label="chats uniques" accent />
          <StatCard icon="👀" value={sightings.length} label="apparitions totales" />
          <StatCard icon="🏆" value={longest} label="meilleur streak" />
          <StatCard icon="📍" value={withLoc} label={`${sightings.length > 0 ? Math.round(withLoc / sightings.length * 100) : 0}% localisés`} />
        </div>

        {/* Most seen cat */}
        {mostSeen && (
          <div className="rounded-2xl p-4" style={{ background: '#0f1626', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs font-medium mb-3" style={{ color: '#64748b', fontFamily: "'Space Grotesk', sans-serif" }}>
              CHAT LE PLUS VU
            </p>
            <div className="flex items-center gap-3">
              {mostSeen.coverPhoto
                ? <img src={mostSeen.coverPhoto} alt="" className="w-14 h-14 rounded-xl object-cover" />
                : <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl" style={{ background: '#182035' }}>🐱</div>
              }
              <div>
                <p className="font-semibold" style={{ color: '#f1f5f9', fontFamily: "'Space Grotesk', sans-serif" }}>{mostSeen.name}</p>
                <p className="text-sm" style={{ color: '#f59e0b' }}>Vu {mostSeen.totalSightings} fois</p>
                <p className="text-xs" style={{ color: '#64748b' }}>Dernière fois {formatRelative(mostSeen.lastSeen)}</p>
              </div>
            </div>
          </div>
        )}

        {/* 7 days activity */}
        <div className="rounded-2xl p-4" style={{ background: '#0f1626', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-xs font-medium mb-4" style={{ color: '#64748b', fontFamily: "'Space Grotesk', sans-serif" }}>
            7 DERNIERS JOURS
          </p>
          <div className="flex items-end justify-between gap-1">
            {last7Days.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full rounded-sm relative overflow-hidden" style={{ height: 60, background: '#182035' }}>
                  {d.count > 0 && (
                    <div
                      className="absolute bottom-0 w-full rounded-sm"
                      style={{
                        height: `${(d.count / maxDay) * 100}%`,
                        background: d.isToday ? 'linear-gradient(to top, #f59e0b, #f97316)' : 'rgba(245,158,11,0.45)',
                        transition: 'height 0.5s ease',
                      }}
                    />
                  )}
                </div>
                <span className="text-xs" style={{ color: d.isToday ? '#f59e0b' : '#64748b' }}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Color breakdown */}
        {colorStats.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: '#0f1626', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs font-medium mb-3" style={{ color: '#64748b', fontFamily: "'Space Grotesk', sans-serif" }}>
              PALETTE DE VOTRE COLLECTION
            </p>
            <div className="space-y-2.5">
              {colorStats.map(c => (
                <div key={c.id} className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-full flex-shrink-0${c.swatch ? ` swatch-${c.swatch}` : ''}`}
                    style={{
                      background: c.swatch ? undefined : c.bg,
                      border: c.border ? `1.5px solid ${c.border}` : 'none',
                    }}
                  />
                  <div className="flex-1 relative h-5 rounded-full overflow-hidden" style={{ background: '#182035' }}>
                    <div
                      className="absolute left-0 top-0 h-full rounded-full"
                      style={{
                        width: `${(c.count / maxColorCount) * 100}%`,
                        background: c.bg && c.bg !== '#f8fafc' ? c.bg : 'rgba(245,158,11,0.5)',
                        transition: 'width 0.5s ease',
                        minWidth: 24,
                      }}
                    />
                  </div>
                  <span className="text-xs w-6 text-right" style={{ color: '#94a3b8' }}>{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ height: 8 }} />
      </div>
    </div>
  );
}
