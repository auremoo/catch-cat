import { getColor, getOwnership, formatRelative } from '../utils/catUtils';

export default function CatCard({ cat, onClick }) {
  const color = getColor(cat.color);
  const own = getOwnership(cat);

  return (
    <div
      onClick={onClick}
      className="rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: '#0f1626',
        border: '1px solid rgba(255,255,255,0.07)',
        transition: 'transform 0.15s',
      }}
      onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
      onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: '1 / 1', background: '#182035' }}>
        {cat.coverPhoto
          ? <img src={cat.coverPhoto} alt={cat.name} className="w-full h-full object-cover" loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center" style={{ fontSize: 48 }}>🐱</div>
        }
        {/* Ownership badge */}
        <div
          className="absolute top-2 left-2 rounded-full px-1.5 py-0.5 text-xs font-semibold"
          style={{ background: own.bg, color: own.color, backdropFilter: 'blur(4px)' }}
        >
          {own.icon}
        </div>
        {/* Sightings badge */}
        <div
          className="absolute top-2 right-2 rounded-full px-2 py-0.5 text-xs font-semibold"
          style={{ background: 'rgba(7,9,15,0.85)', color: '#f59e0b', backdropFilter: 'blur(4px)' }}
        >
          ×{cat.totalSightings}
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-center gap-2 mb-0.5">
          <div
            className={`w-3 h-3 rounded-full flex-shrink-0${color.swatch ? ` swatch-${color.swatch}` : ''}`}
            style={{
              background: color.swatch ? undefined : color.bg,
              border: color.border ? `1.5px solid ${color.border}` : '1.5px solid rgba(255,255,255,0.15)',
            }}
          />
          <span className="text-sm font-semibold truncate" style={{ color: '#f1f5f9', fontFamily: "'Space Grotesk', sans-serif" }}>
            {cat.name}
          </span>
        </div>
        <p className="text-xs" style={{ color: '#64748b' }}>{formatRelative(cat.lastSeen)}</p>
      </div>
    </div>
  );
}
