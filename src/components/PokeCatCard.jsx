import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Zap } from 'lucide-react';
import { getOwnership, formatDate } from '../utils/catUtils';

/* ── Card data tables ────────────────────────────────────────── */

const COLOR_TYPE = {
  black:   { type: 'Ombre',    icon: '🌑', cardBg: 'linear-gradient(160deg,#0a0a1a,#1a1a3e,#0d0d2b)' },
  white:   { type: 'Lumière',  icon: '✨', cardBg: 'linear-gradient(160deg,#8098b0,#a8b8ca,#c0d0e0)' },
  orange:  { type: 'Feu',      icon: '🔥', cardBg: 'linear-gradient(160deg,#3d0e00,#7c2d12,#9a3412)' },
  gray:    { type: 'Air',      icon: '🌫️', cardBg: 'linear-gradient(160deg,#0f172a,#1e293b,#334155)' },
  tabby:   { type: 'Terre',    icon: '🌰', cardBg: 'linear-gradient(160deg,#1c0900,#431407,#6b2400)' },
  bicolor: { type: 'Dualité',  icon: '☯️', cardBg: 'linear-gradient(160deg,#0f172a,#1e293b,#0f1629)' },
  calico:  { type: 'Chaos',    icon: '🎲', cardBg: 'linear-gradient(160deg,#1a0a3e,#2d1b4e,#431407)' },
  tortie:  { type: 'Natura',   icon: '🍂', cardBg: 'linear-gradient(160deg,#052e16,#14532d,#1a3a10)' },
  siamese: { type: 'Mystique', icon: '🔮', cardBg: 'linear-gradient(160deg,#1e0533,#3b0764,#4c1d95)' },
  other:   { type: 'Neutre',   icon: '⭐', cardBg: 'linear-gradient(160deg,#0f172a,#1e293b,#334155)' },
};

const ATTACKS = {
  black:   [{ name: 'Griffe de l\'ombre', cost: '🌑🌑' }, { name: 'Regard hypnotique', cost: '🌑🌑🌑' }],
  white:   [{ name: 'Ronronnement laser', cost: '✨' }, { name: 'Avalanche de poils', cost: '✨✨' }],
  orange:  [{ name: 'Coup de patte ardent', cost: '🔥🔥' }, { name: 'Embrasement solaire', cost: '🔥🔥🔥' }],
  gray:    [{ name: 'Esquive parfaite', cost: '🌫️' }, { name: 'Coup de griffe', cost: '🌫️🌫️' }],
  tabby:   [{ name: 'Camouflage tigré', cost: '🌰🌰' }, { name: 'Bond sauvage', cost: '🌰🌰🌰' }],
  bicolor: [{ name: 'Double personnalité', cost: '☯️☯️' }, { name: 'Pirouette', cost: '☯️☯️☯️' }],
  calico:  [{ name: 'Chaos coloré', cost: '🎲🎲' }, { name: 'Triforce féline', cost: '🎲🎲🎲' }],
  tortie:  [{ name: 'Griffade écaille', cost: '🍂🍂' }, { name: 'Tourbillon fauve', cost: '🍂🍂🍂' }],
  siamese: [{ name: 'Cri mystique', cost: '🔮' }, { name: 'Télépathie féline', cost: '🔮🔮🔮' }],
  other:   [{ name: 'Coup de patte', cost: '⭐' }, { name: 'Morsure', cost: '⭐⭐' }],
};

function getRarity(sightings) {
  if (sightings >= 10) return { label: 'Légendaire ✨', border: 'linear-gradient(145deg,#ff0,#f0f,#0ff,#ff0)', glow: 'rgba(255,255,0,0.5)', stars: '✨✨✨' };
  if (sightings >= 5)  return { label: 'Ultra Rare',   border: 'linear-gradient(145deg,#ffd700,#ffa500,#ffd700)', glow: 'rgba(255,215,0,0.4)', stars: '⭐⭐⭐' };
  if (sightings >= 2)  return { label: 'Rare',         border: 'linear-gradient(145deg,#c0c0c0,#808080,#c0c0c0)', glow: 'rgba(192,192,192,0.3)', stars: '⭐⭐' };
  return                      { label: 'Commun',       border: '#374151', glow: 'rgba(100,116,139,0.2)', stars: '⭐' };
}

function cardNumber(cat) {
  const n = cat.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 999;
  return String(n + 1).padStart(3, '0');
}

/* ── Component ───────────────────────────────────────────────── */

export default function PokeCatCard({ cat, onClose }) {
  const [cutout, setCutout] = useState(null);   // null = loading, false = fallback, string = url
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('model');  // model | processing | done
  const cardRef = useRef(null);
  const animRef = useRef(null);

  const typeInfo  = COLOR_TYPE[cat.color]  || COLOR_TYPE.other;
  const attacks   = ATTACKS[cat.color]     || ATTACKS.other;
  const rarity    = getRarity(cat.totalSightings);
  const own       = getOwnership(cat);
  const hp        = Math.min(cat.totalSightings * 10, 200);
  const atk1dmg   = 10 + cat.totalSightings * 2;
  const atk2dmg   = 20 + cat.totalSightings * 4;
  const num       = cardNumber(cat);

  /* Background removal */
  useEffect(() => {
    let revoked = false;
    (async () => {
      try {
        const { removeBackground } = await import('@imgly/background-removal');
        setPhase('processing');
        const blob = await removeBackground(cat.coverPhoto, {
          model: 'small',
          output: { format: 'image/png' },
          progress: (_key, cur, tot) => {
            if (tot > 0) setProgress(Math.round((cur / tot) * 100));
          },
        });
        if (!revoked) {
          const url = URL.createObjectURL(blob);
          setCutout(url);
          setPhase('done');
        }
      } catch {
        if (!revoked) { setCutout(false); setPhase('done'); }
      }
    })();
    return () => {
      revoked = true;
      if (typeof cutout === 'string') URL.revokeObjectURL(cutout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat.id]);

  /* Holographic tilt effect */
  const applyHolo = useCallback((clientX, clientY) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    const rx = (y - 0.5) * 22;
    const ry = (x - 0.5) * -22;
    el.style.setProperty('--hx', `${x * 100}%`);
    el.style.setProperty('--hy', `${y * 100}%`);
    el.style.setProperty('--ho', '0.85');
    el.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
  }, []);

  const resetHolo = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty('--ho', '0.15');
    el.style.transform = '';
  }, []);

  const onMouseMove = useCallback(e => applyHolo(e.clientX, e.clientY), [applyHolo]);
  const onTouchMove = useCallback(e => { e.preventDefault(); applyHolo(e.touches[0].clientX, e.touches[0].clientY); }, [applyHolo]);

  const photoSrc = cutout || cat.coverPhoto;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)', maxWidth: 430, margin: '0 auto' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Close */}
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full z-10"
        style={{ background: 'rgba(255,255,255,0.1)' }}>
        <X size={20} color="#94a3b8" />
      </button>

      {/* Loading overlay inside card area */}
      {phase !== 'done' && (
        <div className="flex flex-col items-center gap-3 mb-4">
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(245,158,11,0.2)', borderTopColor: '#f59e0b', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p className="text-xs" style={{ color: '#64748b' }}>
            {phase === 'model' ? 'Chargement du modèle IA…' : `Détourage en cours… ${progress}%`}
          </p>
        </div>
      )}

      {/* Card wrapper = gradient border */}
      <div
        ref={cardRef}
        className="relative"
        style={{
          width: 288,
          background: rarity.border,
          borderRadius: 18,
          padding: 2.5,
          boxShadow: `0 0 40px ${rarity.glow}, 0 20px 60px rgba(0,0,0,0.8)`,
          transition: 'transform 0.12s ease-out',
          '--hx': '50%',
          '--hy': '50%',
          '--ho': '0.15',
          cursor: 'grab',
          userSelect: 'none',
          opacity: phase === 'done' ? 1 : 0.4,
        }}
        onMouseMove={onMouseMove}
        onMouseLeave={resetHolo}
        onTouchMove={onTouchMove}
        onTouchEnd={resetHolo}
      >
        {/* Card inner */}
        <div style={{ borderRadius: 16, overflow: 'hidden', background: typeInfo.cardBg, position: 'relative' }}>

          {/* Holo shimmer overlay */}
          <div className="holo-sheen" />

          {/* ── Top bar ── */}
          <div className="flex items-center justify-between px-3 pt-3 pb-2">
            <span className="font-bold text-base truncate" style={{ color: '#f1f5f9', fontFamily: "'Space Grotesk',sans-serif", maxWidth: 140 }}>
              {cat.name}
            </span>
            <span className="font-bold text-sm" style={{ color: '#f59e0b', fontFamily: "'Space Grotesk',sans-serif", whiteSpace: 'nowrap' }}>
              PV {hp} 🐾
            </span>
          </div>

          {/* Type + ownership row */}
          <div className="flex items-center gap-2 px-3 pb-2">
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'rgba(0,0,0,0.4)', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.15)' }}>
              {typeInfo.icon} {typeInfo.type}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: own.bg, color: own.color }}>
              {own.icon} {own.label}
            </span>
          </div>

          {/* ── Image area ── */}
          <div className="relative mx-3 mb-3 rounded-xl overflow-hidden"
            style={{ height: 160, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            {photoSrc && (
              <img
                src={photoSrc}
                alt={cat.name}
                style={{
                  maxHeight: '100%',
                  maxWidth: '100%',
                  objectFit: cutout ? 'contain' : 'cover',
                  width: cutout ? 'auto' : '100%',
                  height: cutout ? 'auto' : '100%',
                }}
              />
            )}
            {/* Card number watermark */}
            <span className="absolute bottom-1.5 right-2 text-xs font-bold"
              style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'Space Grotesk',sans-serif" }}>
              #{num}
            </span>
          </div>

          {/* ── Divider ── */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '0 12px 10px' }} />

          {/* ── Attacks ── */}
          <div className="px-3 space-y-2 pb-3">
            {[
              { ...attacks[0], dmg: atk1dmg },
              { ...attacks[1], dmg: atk2dmg },
            ].map((atk, i) => (
              <div key={i} className="flex items-center gap-2">
                <Zap size={12} color="#f59e0b" className="flex-shrink-0" />
                <span className="text-xs flex-1 truncate" style={{ color: '#e2e8f0' }}>{atk.name}</span>
                <span className="text-xs font-bold" style={{ color: '#f59e0b', fontFamily: "'Space Grotesk',sans-serif" }}>{atk.dmg}</span>
              </div>
            ))}
          </div>

          {/* ── Footer ── */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} className="px-3 py-2 flex items-center justify-between">
            <span className="text-xs" style={{ color: '#94a3b8' }}>
              {rarity.stars} {rarity.label}
            </span>
            <span className="text-xs" style={{ color: '#64748b' }}>
              Apparu le {formatDate(cat.firstSeen)}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs" style={{ color: '#475569' }}>
        {phase === 'done' ? 'Inclinez la carte pour l\'effet holographique ✨' : ''}
      </p>
    </div>
  );
}
