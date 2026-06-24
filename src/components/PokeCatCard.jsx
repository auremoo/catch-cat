import { useState, useEffect, useRef, useCallback } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { getOwnership } from '../utils/catUtils';

/* ── Type data ───────────────────────────────────────────────────── */

const TYPE = {
  black: {
    label: 'Ténèbres', icon: '🌑', energy: '#7c3aed', eLetter: 'T',
    frame: '#6d28d9',
    cardBg: 'linear-gradient(160deg,#060612 0%,#1a1a3e 60%,#0d0d2b 100%)',
    imageBg: [
      'radial-gradient(ellipse 80% 60% at 30% 80%,rgba(109,28,217,0.55) 0%,transparent 60%)',
      'radial-gradient(circle at 75% 20%,rgba(147,51,234,0.3) 0%,transparent 45%)',
      'linear-gradient(180deg,#0a0014 0%,#1a0538 100%)',
    ].join(','),
    weakness: '✨',
    dex: 'Surgit de l\'obscurité sans un bruit. Son ombre est plus sombre que la nuit la plus noire.',
  },
  white: {
    label: 'Lumière', icon: '✨', energy: '#f59e0b', eLetter: 'L',
    frame: '#d97706',
    cardBg: 'linear-gradient(160deg,#4a6a88 0%,#6b8fa8 50%,#8ba8c0 100%)',
    imageBg: [
      'radial-gradient(ellipse 70% 50% at 70% 15%,rgba(255,255,200,0.5) 0%,transparent 55%)',
      'radial-gradient(circle at 20% 80%,rgba(147,210,255,0.4) 0%,transparent 40%)',
      'linear-gradient(180deg,#c8e8ff 0%,#90c8f0 60%,#6aaae0 100%)',
    ].join(','),
    weakness: '🌑',
    dex: 'Sa fourrure rayonne d\'une lumière douce et apaisante. Les apercevoir porte bonheur.',
  },
  orange: {
    label: 'Feu', icon: '🔥', energy: '#ef4444', eLetter: 'F',
    frame: '#b91c1c',
    cardBg: 'linear-gradient(160deg,#3d0e00 0%,#7c2d12 55%,#9a3412 100%)',
    imageBg: [
      'radial-gradient(ellipse 90% 60% at 50% 100%,rgba(220,38,38,0.6) 0%,transparent 55%)',
      'radial-gradient(circle at 20% 30%,rgba(251,146,60,0.35) 0%,transparent 40%)',
      'linear-gradient(180deg,#1c0900 0%,#431407 60%,#7c2d12 100%)',
    ].join(','),
    weakness: '💧',
    dex: 'Sa queue enflammée ne s\'éteint jamais, même sous la pluie. Brûlures garanties.',
  },
  gray: {
    label: 'Air', icon: '🌫️', energy: '#94a3b8', eLetter: 'A',
    frame: '#64748b',
    cardBg: 'linear-gradient(160deg,#0f172a 0%,#1e293b 55%,#334155 100%)',
    imageBg: [
      'radial-gradient(ellipse 100% 80% at 50% 60%,rgba(100,116,139,0.4) 0%,transparent 60%)',
      'radial-gradient(circle at 80% 20%,rgba(148,163,184,0.2) 0%,transparent 50%)',
      'linear-gradient(180deg,#0f172a 0%,#1e293b 100%)',
    ].join(','),
    weakness: '⚡',
    dex: 'Se déplace comme une brume matinale. Aussi insaisissable que le vent qui passe.',
  },
  tabby: {
    label: 'Terre', icon: '🌰', energy: '#b45309', eLetter: 'E',
    frame: '#92400e',
    cardBg: 'linear-gradient(160deg,#1c0900 0%,#431407 55%,#6b2400 100%)',
    imageBg: [
      'radial-gradient(ellipse 80% 70% at 40% 70%,rgba(180,83,9,0.5) 0%,transparent 55%)',
      'radial-gradient(circle at 75% 25%,rgba(120,53,15,0.4) 0%,transparent 45%)',
      'linear-gradient(180deg,#1c0900 0%,#3a1800 100%)',
    ].join(','),
    weakness: '🌿',
    dex: 'Ses rayures imitent les reflets du soleil en forêt. Maître absolu du camouflage.',
  },
  bicolor: {
    label: 'Dualité', icon: '☯️', energy: '#64748b', eLetter: 'D',
    frame: '#475569',
    cardBg: 'linear-gradient(160deg,#0f172a 0%,#1e293b 50%,#0f1629 100%)',
    imageBg: 'linear-gradient(135deg,#1e293b 0%,#1e293b 48%,rgba(255,255,255,0.06) 50%,#0f1020 52%,#0f1020 100%)',
    weakness: '🎲',
    dex: 'Mi-ombre mi-lumière, il incarne l\'équilibre parfait entre les forces contraires.',
  },
  calico: {
    label: 'Chaos', icon: '🎲', energy: '#9333ea', eLetter: 'C',
    frame: '#7c3aed',
    cardBg: 'linear-gradient(160deg,#1a0a3e 0%,#2d1b4e 50%,#431407 100%)',
    imageBg: [
      'radial-gradient(circle at 25% 35%,rgba(147,51,234,0.5) 0%,transparent 40%)',
      'radial-gradient(circle at 70% 65%,rgba(194,65,12,0.45) 0%,transparent 40%)',
      'radial-gradient(circle at 55% 20%,rgba(248,250,252,0.15) 0%,transparent 35%)',
      'linear-gradient(180deg,#0a0520 0%,#1a0a30 100%)',
    ].join(','),
    weakness: '☯️',
    dex: 'Ses trois couleurs lui confèrent trois fois plus de ruse que n\'importe quel autre félin.',
  },
  tortie: {
    label: 'Nature', icon: '🍂', energy: '#16a34a', eLetter: 'N',
    frame: '#15803d',
    cardBg: 'linear-gradient(160deg,#052e16 0%,#14532d 55%,#1a3a10 100%)',
    imageBg: [
      'radial-gradient(ellipse 80% 70% at 50% 80%,rgba(22,163,74,0.45) 0%,transparent 55%)',
      'radial-gradient(circle at 80% 20%,rgba(101,163,13,0.3) 0%,transparent 45%)',
      'linear-gradient(180deg,#021a0b 0%,#0a2e16 100%)',
    ].join(','),
    weakness: '🔥',
    dex: 'Ses couleurs automnales se fondent dans les feuilles mortes. Chasseuse hors pair.',
  },
  siamese: {
    label: 'Mystique', icon: '🔮', energy: '#a855f7', eLetter: 'M',
    frame: '#9333ea',
    cardBg: 'linear-gradient(160deg,#1e0533 0%,#3b0764 55%,#4c1d95 100%)',
    imageBg: [
      'radial-gradient(ellipse 70% 60% at 50% 30%,rgba(168,85,247,0.5) 0%,transparent 55%)',
      'radial-gradient(circle at 20% 80%,rgba(79,70,229,0.35) 0%,transparent 45%)',
      'radial-gradient(circle at 80% 70%,rgba(139,92,246,0.25) 0%,transparent 40%)',
      'linear-gradient(180deg,#0e021f 0%,#1e0533 100%)',
    ].join(','),
    weakness: '🌑',
    dex: 'Ses yeux bleus voient au-delà du monde visible. Sait ce que vous pensez avant vous.',
  },
  other: {
    label: 'Neutre', icon: '⭐', energy: '#94a3b8', eLetter: '★',
    frame: '#475569',
    cardBg: 'linear-gradient(160deg,#0f172a 0%,#1e293b 55%,#334155 100%)',
    imageBg: 'linear-gradient(180deg,#0f172a 0%,#1e293b 100%)',
    weakness: '💫',
    dex: 'Un chat d\'origine mystérieuse dont les talents réels restent encore totalement inconnus.',
  },
};

const ATTACKS = {
  black:   [{ n: 'Griffe de l\'ombre',   f: 'Surgit des ténèbres à une vitesse terrifiante.' },        { n: 'Regard hypnotique',   f: 'La cible ne peut plus distinguer le réel du rêve.' }],
  white:   [{ n: 'Ronronnement laser',   f: 'Un son apaisant qui désintègre tout sur son passage.' },  { n: 'Tempête de poils',    f: 'Aveugle l\'adversaire sous une avalanche immaculée.' }],
  orange:  [{ n: 'Patte ardente',        f: 'Laisse une brûlure indélébile après chaque coup.' },      { n: 'Embrasement solaire', f: 'Absorbe l\'énergie du soleil et la libère d\'un seul coup.' }],
  gray:    [{ n: 'Esquive parfaite',     f: 'Se dérobe à chaque attaque avec une grâce infinie.' },    { n: 'Rafale de griffes',   f: 'Frappe si vite qu\'on ne voit que l\'éclair gris.' }],
  tabby:   [{ n: 'Camouflage tigré',    f: 'Disparaît dans n\'importe quel décor en un instant.' },   { n: 'Bond sauvage',        f: 'Peut bondir jusqu\'à 10 fois sa propre taille.' }],
  bicolor: [{ n: 'Double personnalité', f: 'Personne ne sait jamais lequel des deux va attaquer.' },  { n: 'Pirouette mortelle',  f: 'Tourne si vite qu\'il crée un vortex de confusion pure.' }],
  calico:  [{ n: 'Chaos coloré',        f: 'Lance des éclats de toutes les couleurs en même temps.' }, { n: 'Triforce féline',    f: 'La puissance de trois couleurs déchaînée d\'un coup.' }],
  tortie:  [{ n: 'Griffade écaille',    f: 'Ses griffes portent la puissance de la nature entière.' }, { n: 'Tourbillon fauve',   f: 'Danse comme des feuilles emportées par le vent automnal.' }],
  siamese: [{ n: 'Cri mystique',        f: 'Un son qui traverse les dimensions et affecte l\'âme.' }, { n: 'Télépathie féline',  f: 'Lit les pensées et anticipe chaque mouvement adverse.' }],
  other:   [{ n: 'Coup de patte',       f: 'Simple mais efficace. Parfois c\'est tout ce qu\'il faut.' }, { n: 'Morsure surprise', f: 'Attaque lorsque l\'adversaire pense avoir gagné.' }],
};

function getRarity(n) {
  if (n >= 10) return { label: 'Légendaire', border: 'linear-gradient(145deg,#ff0 0%,#f0f 33%,#0ff 66%,#ff0 100%)', glow: 'rgba(255,255,0,0.55)', stars: '✦✦✦', sym: '★' };
  if (n >= 5)  return { label: 'Ultra Rare', border: 'linear-gradient(145deg,#ffe566,#ffa500,#ffd700,#ff8c00,#ffd700)', glow: 'rgba(255,200,0,0.45)', stars: '✦✦', sym: '◆◆◆' };
  if (n >= 2)  return { label: 'Rare',       border: 'linear-gradient(145deg,#d0d0d0,#888,#c8c8c8,#aaa,#d0d0d0)', glow: 'rgba(192,192,192,0.35)', stars: '✦', sym: '◆◆' };
  return               { label: 'Commun',    border: 'linear-gradient(145deg,#c8a400,#f0c800,#daa520,#e8c000,#c8a400)', glow: 'rgba(100,116,139,0.25)', stars: '', sym: '◆' };
}

function cardNum(cat) {
  const n = cat.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 150;
  return String(n + 1).padStart(3, '0');
}

function blobToDataURL(blob) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(blob);
  });
}

function EnergyDot({ color }) {
  return (
    <div style={{
      width: 15, height: 15, borderRadius: '50%', flexShrink: 0,
      background: `radial-gradient(circle at 35% 35%,${color}ee,${color}88)`,
      border: '1.5px solid rgba(255,255,255,0.4)',
      boxShadow: `0 0 5px ${color}88`,
    }} />
  );
}

/* ── Component ────────────────────────────────────────────────────── */

export default function PokeCatCard({ cat, onClose, onSaveCutout }) {
  const saved = cat.cutoutPhoto ?? null;
  const [cutout, setCutout]     = useState(saved);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase]       = useState(saved || !cat.coverPhoto ? 'done' : 'idle');
  const cardRef = useRef(null);

  const t       = TYPE[cat.color]    ?? TYPE.other;
  const attacks = ATTACKS[cat.color] ?? ATTACKS.other;
  const rarity  = getRarity(cat.totalSightings);
  const own     = getOwnership(cat);
  const hp      = Math.min(10 + cat.totalSightings * 15, 280);
  const dmg1    = 10 + cat.totalSightings * 3;
  const dmg2    = 30 + cat.totalSightings * 6;
  const retreat = Math.min(1 + Math.floor(cat.totalSightings / 3), 4);
  const num     = cardNum(cat);

  const runRemoval = useCallback(async () => {
    if (!cat.coverPhoto) return;
    setPhase('model');
    setProgress(0);
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      setPhase('processing');
      const blob = await removeBackground(cat.coverPhoto, {
        model: 'small',
        output: { format: 'image/png' },
        progress: (_k, cur, tot) => { if (tot > 0) setProgress(Math.round(cur / tot * 100)); },
      });
      const url = await blobToDataURL(blob);
      setCutout(url);
      if (onSaveCutout) onSaveCutout(url);
    } catch { /* keep original */ }
    setPhase('done');
  }, [cat.coverPhoto, onSaveCutout]);

  useEffect(() => {
    if (!saved && cat.coverPhoto) runRemoval();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat.id]);

  /* Holographic tilt */
  const applyHolo = useCallback((cx, cy) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (cx - r.left) / r.width;
    const y = (cy - r.top)  / r.height;
    el.style.setProperty('--hx', `${x * 100}%`);
    el.style.setProperty('--hy', `${y * 100}%`);
    el.style.setProperty('--ho', '0.9');
    el.style.transform = `perspective(700px) rotateX(${(y - 0.5) * 20}deg) rotateY(${(x - 0.5) * -20}deg) scale(1.02)`;
  }, []);

  const resetHolo = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty('--ho', '0.15');
    el.style.transform = '';
  }, []);

  const photoSrc = cutout || cat.coverPhoto;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-y-auto py-8"
      style={{ background: 'rgba(0,0,0,0.93)', backdropFilter: 'blur(10px)', maxWidth: 430, margin: '0 auto' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full z-10"
        style={{ background: 'rgba(255,255,255,0.1)' }}>
        <X size={20} color="#94a3b8" />
      </button>

      {/* Processing indicator */}
      {phase !== 'done' && (
        <div className="flex flex-col items-center gap-3 mb-5">
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(245,158,11,0.2)', borderTopColor: '#f59e0b', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ fontSize: 12, color: '#64748b' }}>
            {phase === 'model' ? 'Chargement IA…' : `Détourage… ${progress}%`}
          </p>
        </div>
      )}

      {/* ══ CARD ══════════════════════════════════════════════════ */}
      <div
        ref={cardRef}
        style={{
          width: 292,
          background: rarity.border,
          borderRadius: 24,
          padding: 6,
          boxShadow: `0 0 60px ${rarity.glow}, 0 24px 70px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.25)`,
          transition: 'transform 0.12s ease-out',
          '--hx': '50%', '--hy': '50%', '--ho': '0.15',
          cursor: 'grab', userSelect: 'none',
          opacity: phase === 'done' ? 1 : 0.3,
        }}
        onMouseMove={e => applyHolo(e.clientX, e.clientY)}
        onMouseLeave={resetHolo}
        onTouchMove={e => { e.preventDefault(); applyHolo(e.touches[0].clientX, e.touches[0].clientY); }}
        onTouchEnd={resetHolo}
      >
        <div style={{ borderRadius: 19, overflow: 'hidden', background: t.cardBg, border: `2.5px solid ${t.frame}`, position: 'relative' }}>

          {/* Holo shimmer */}
          <div className="holo-sheen" />

          {/* ── TOP BAR ── */}
          <div style={{ padding: '9px 11px 4px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 7, fontWeight: 800, padding: '2px 5px', borderRadius: 4, background: 'rgba(0,0,0,0.45)', color: '#94a3b8', letterSpacing: 1, flexShrink: 0, textTransform: 'uppercase' }}>
              Basic
            </span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 900, color: '#f1f5f9', fontFamily: "'Space Grotesk',sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {cat.name}
            </span>
            <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, flexShrink: 0 }}>PV</span>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#f59e0b', fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1, flexShrink: 0 }}>
              {hp}
            </span>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{t.icon}</span>
          </div>

          {/* Type + ownership strip */}
          <div style={{ padding: '0 11px 7px', display: 'flex', gap: 4 }}>
            <span style={{ fontSize: 8, padding: '2px 7px', borderRadius: 12, background: 'rgba(0,0,0,0.45)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.18)' }}>
              {t.icon} {t.label}
            </span>
            <span style={{ fontSize: 8, padding: '2px 7px', borderRadius: 12, background: own.bg, color: own.color }}>
              {own.icon} {own.label}
            </span>
          </div>

          {/* ── IMAGE AREA ── */}
          <div style={{
            margin: '0 8px', borderRadius: 10, overflow: 'hidden', height: 172,
            position: 'relative', background: t.imageBg,
            border: '2.5px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}>
            {photoSrc && (
              <img src={photoSrc} alt={cat.name} style={{
                maxHeight: '100%', maxWidth: '100%',
                objectFit: cutout ? 'contain' : 'cover',
                width:  cutout ? 'auto'  : '100%',
                height: cutout ? 'auto'  : '100%',
                position: 'relative', zIndex: 1,
                filter: cutout ? 'drop-shadow(0 6px 20px rgba(0,0,0,0.75))' : 'none',
              }} />
            )}
            <span style={{ position: 'absolute', bottom: 5, right: 7, fontSize: 8, color: 'rgba(255,255,255,0.32)', fontStyle: 'italic', zIndex: 2 }}>
              Illus. IA 🎨
            </span>
            <span style={{ position: 'absolute', bottom: 5, left: 7, fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.28)', fontFamily: "'Space Grotesk',sans-serif", zIndex: 2 }}>
              No.{num}
            </span>
          </div>

          {/* ── POKÉDEX ENTRY ── */}
          <div style={{ padding: '5px 12px 7px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ fontSize: 8.5, color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.5, textAlign: 'center', margin: 0 }}>
              {t.dex}
            </p>
          </div>

          {/* ── ATTACKS ── */}
          <div style={{ padding: '8px 11px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            {[{ ...attacks[0], dmg: dmg1, cost: 2 }, { ...attacks[1], dmg: dmg2, cost: 3 }].map((atk, i) => (
              <div key={i} style={{ marginBottom: i === 0 ? 9 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                    {Array.from({ length: atk.cost }).map((_, j) => (
                      <EnergyDot key={j} color={t.energy} />
                    ))}
                  </div>
                  <span style={{ flex: 1, fontSize: 11.5, fontWeight: 800, color: '#f1f5f9', fontFamily: "'Space Grotesk',sans-serif" }}>
                    {atk.n}
                  </span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: '#f1f5f9', fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1, flexShrink: 0, textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>
                    {atk.dmg}
                  </span>
                </div>
                <p style={{ fontSize: 8.5, color: '#94a3b8', fontStyle: 'italic', margin: '2px 0 0', paddingLeft: atk.cost * 17 + 5 }}>
                  {atk.f}
                </p>
              </div>
            ))}
          </div>

          {/* ── WEAKNESS / RESISTANCE / RETREAT ── */}
          <div style={{ padding: '6px 11px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 7, color: '#64748b', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Faiblesse</p>
              <p style={{ fontSize: 11, color: '#f1f5f9', fontWeight: 700, margin: 0 }}>{t.weakness} ×2</p>
            </div>
            <div style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: 9 }}>
              <p style={{ fontSize: 7, color: '#64748b', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Résistance</p>
              <p style={{ fontSize: 11, color: '#f1f5f9', fontWeight: 700, margin: 0 }}>–</p>
            </div>
            <div style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: 9 }}>
              <p style={{ fontSize: 7, color: '#64748b', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Retraite</p>
              <div style={{ display: 'flex', gap: 2 }}>
                {Array.from({ length: retreat }).map((_, i) => (
                  <div key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%,#94a3b8,#475569)', border: '1px solid rgba(255,255,255,0.25)' }} />
                ))}
              </div>
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div style={{ padding: '5px 11px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 8, color: '#475569' }}>CatDex 2026</span>
            <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700, letterSpacing: 2 }}>{rarity.stars}</span>
            <span style={{ fontSize: 8, color: '#475569' }}>{num}/151 {rarity.sym}</span>
          </div>

        </div>
      </div>
      {/* ══ END CARD ══════════════════════════════════════════════ */}

      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 20 }}>
        {phase === 'done' && (
          <p style={{ fontSize: 11, color: '#475569' }}>Inclinez la carte pour l'effet holographique ✨</p>
        )}
        <button
          onClick={runRemoval}
          disabled={phase !== 'done'}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 18px', borderRadius: 14,
            background: phase === 'done' ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.04)',
            color: phase === 'done' ? '#f59e0b' : '#475569',
            border: `1px solid ${phase === 'done' ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)'}`,
            fontSize: 12, fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif",
            cursor: phase === 'done' ? 'pointer' : 'default',
          }}
        >
          <RefreshCw size={13} />
          Régénérer le détourage
        </button>
      </div>
    </div>
  );
}
