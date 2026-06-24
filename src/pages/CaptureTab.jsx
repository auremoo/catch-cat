import { useState, useRef } from 'react';
import { Camera, MapPin, X, Check } from 'lucide-react';
import { compressImage } from '../utils/imageUtils';
import { CAT_COLORS, genId } from '../utils/catUtils';
import { localDB } from '../db/localDB';
import { useGeolocation } from '../hooks/useGeolocation';

const S = {
  surface: { background: '#0f1626', border: '1px solid rgba(255,255,255,0.07)' },
  input: {
    background: '#182035', border: '1px solid rgba(255,255,255,0.1)',
    color: '#f1f5f9', borderRadius: 12, padding: '10px 14px', width: '100%',
    fontSize: 15, outline: 'none',
  },
};

export default function CaptureTab({ cats, refresh }) {
  const [photo, setPhoto] = useState(null);
  const [step, setStep] = useState('idle'); // idle | form | saving | success
  const [catName, setCatName] = useState('');
  const [catColor, setCatColor] = useState(null);
  const [notes, setNotes] = useState('');
  const [isNewCat, setIsNewCat] = useState(true);
  const [existingCatId, setExistingCatId] = useState('');
  const fileRef = useRef(null);
  const { location, status: geoStatus, request: requestGeo, reset: resetGeo } = useGeolocation();

  const reset = () => {
    setPhoto(null); setStep('idle'); setCatName(''); setCatColor(null);
    setNotes(''); setIsNewCat(true); setExistingCatId(''); resetGeo();
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setPhoto(compressed);
      setStep('form');
      requestGeo();
    } catch { /* ignore */ }
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!photo || !catColor) return;
    if (!isNewCat && !existingCatId) return;
    setStep('saving');
    const now = Date.now();
    try {
      if (isNewCat) {
        const newCat = {
          id: genId(),
          name: catName.trim() || `Chat #${cats.length + 1}`,
          color: catColor,
          coverPhoto: photo,
          totalSightings: 1,
          firstSeen: now,
          lastSeen: now,
        };
        await localDB.cats.put(newCat);
        await localDB.sightings.put({
          id: genId(), catId: newCat.id, photo,
          lat: location?.lat ?? null, lng: location?.lng ?? null,
          notes: notes.trim(), createdAt: now,
        });
      } else {
        const existing = cats.find(c => c.id === existingCatId);
        await localDB.cats.put({ ...existing, totalSightings: existing.totalSightings + 1, lastSeen: now });
        await localDB.sightings.put({
          id: genId(), catId: existingCatId, photo,
          lat: location?.lat ?? null, lng: location?.lng ?? null,
          notes: notes.trim(), createdAt: now,
        });
      }
      await refresh();
      setStep('success');
      setTimeout(reset, 1600);
    } catch (err) {
      console.error(err);
      setStep('form');
    }
  };

  // Idle screen
  if (step === 'idle') {
    return (
      <div className="tab-content flex flex-col items-center justify-center page-transition" style={{ minHeight: '100%' }}>
        <div className="text-center px-8">
          <div style={{ fontSize: 72, marginBottom: 24 }}>🐾</div>
          <h1 className="text-2xl font-bold mb-2 gradient-text" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Capturer un chat
          </h1>
          <p className="text-sm mb-10" style={{ color: '#64748b' }}>
            Vous croisez un chat ? Immortalisez la rencontre !
          </p>
          <button
            onClick={() => fileRef.current?.click()}
            className="relative flex flex-col items-center justify-center rounded-full cursor-pointer"
            style={{
              width: 140, height: 140, margin: '0 auto',
              background: 'linear-gradient(135deg, #f59e0b, #f97316)',
              boxShadow: '0 0 60px rgba(245,158,11,0.35), 0 0 120px rgba(245,158,11,0.15)',
            }}
          >
            <Camera size={44} color="white" strokeWidth={1.5} />
            <span className="text-xs text-white mt-1 font-medium">Ouvrir la caméra</span>
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
      </div>
    );
  }

  // Success
  if (step === 'success') {
    return (
      <div className="tab-content flex flex-col items-center justify-center page-transition" style={{ minHeight: '100%' }}>
        <div className="text-center">
          <div
            className="flex items-center justify-center rounded-full mx-auto mb-6"
            style={{ width: 96, height: 96, background: 'linear-gradient(135deg, #f59e0b, #f97316)', boxShadow: '0 0 40px rgba(245,158,11,0.4)' }}
          >
            <Check size={44} color="white" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#f1f5f9', fontFamily: "'Space Grotesk', sans-serif" }}>Chat capturé !</h2>
          <p style={{ color: '#64748b' }}>Ajouté à votre CatDex 🐱</p>
        </div>
      </div>
    );
  }

  // Saving
  if (step === 'saving') {
    return (
      <div className="tab-content flex flex-col items-center justify-center" style={{ minHeight: '100%' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(245,158,11,0.2)', borderTopColor: '#f59e0b', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p className="mt-4 text-sm" style={{ color: '#64748b' }}>Enregistrement…</p>
      </div>
    );
  }

  // Form
  const canSave = catColor && (isNewCat || existingCatId);

  return (
    <div className="tab-content page-transition">
      {/* Photo preview */}
      <div className="relative" style={{ background: '#000', aspectRatio: '4/3' }}>
        <img src={photo} alt="preview" className="w-full h-full object-cover" />
        <button
          onClick={reset}
          className="absolute top-3 right-3 rounded-full p-1.5"
          style={{ background: 'rgba(0,0,0,0.6)' }}
        >
          <X size={18} color="white" />
        </button>
        {/* Geo indicator */}
        <div
          className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', color: geoStatus === 'success' ? '#34d399' : '#94a3b8' }}
        >
          <MapPin size={11} />
          {geoStatus === 'loading' && 'Localisation…'}
          {geoStatus === 'success' && 'Localisé'}
          {geoStatus === 'error'   && 'Sans localisation'}
          {geoStatus === 'idle'    && 'Sans localisation'}
        </div>
      </div>

      {/* Form */}
      <div className="p-4 space-y-4">

        {/* New / Existing toggle */}
        <div className="flex rounded-xl p-1" style={{ background: '#0f1626', border: '1px solid rgba(255,255,255,0.07)' }}>
          {[
            { v: true,  label: '✨ Nouveau chat' },
            { v: false, label: '🔍 Chat connu' },
          ].map(({ v, label }) => (
            <button
              key={String(v)}
              onClick={() => setIsNewCat(v)}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: isNewCat === v ? 'linear-gradient(135deg,#f59e0b,#f97316)' : 'transparent',
                color: isNewCat === v ? '#fff' : '#64748b',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Cat name (new) */}
        {isNewCat && (
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: '#94a3b8' }}>Petit nom (optionnel)</label>
            <input
              style={S.input}
              placeholder={`Chat #${cats.length + 1}`}
              value={catName}
              onChange={e => setCatName(e.target.value)}
            />
          </div>
        )}

        {/* Existing cat selector */}
        {!isNewCat && (
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: '#94a3b8' }}>Lequel avez-vous revu ?</label>
            {cats.length === 0 ? (
              <p className="text-sm rounded-xl p-3" style={{ ...S.surface, color: '#64748b' }}>
                Aucun chat dans votre CatDex pour l'instant.
              </p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto rounded-xl" style={S.surface}>
                {cats.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setExistingCatId(c.id); setCatColor(c.color); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors"
                    style={{ background: existingCatId === c.id ? 'rgba(245,158,11,0.12)' : 'transparent' }}
                  >
                    {c.coverPhoto
                      ? <img src={c.coverPhoto} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      : <div className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl flex-shrink-0" style={{ background: '#182035' }}>🐱</div>
                    }
                    <span className="text-sm font-medium" style={{ color: '#f1f5f9' }}>{c.name}</span>
                    {existingCatId === c.id && <Check size={16} color="#f59e0b" className="ml-auto" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Color picker */}
        <div>
          <label className="text-xs mb-2 block" style={{ color: '#94a3b8' }}>Couleur du chat *</label>
          <div className="flex flex-wrap gap-2.5">
            {CAT_COLORS.map(c => (
              <button
                key={c.id}
                onClick={() => setCatColor(c.id)}
                title={c.label}
                className={`rounded-full transition-all${c.swatch ? ` swatch-${c.swatch}` : ''}`}
                style={{
                  width: 36, height: 36,
                  background: c.swatch ? undefined : c.bg,
                  border: c.border ? `2px solid ${c.border}` : catColor === c.id ? '2px solid #f59e0b' : '2px solid transparent',
                  outline: catColor === c.id ? '2px solid rgba(245,158,11,0.5)' : 'none',
                  outlineOffset: 2,
                  transform: catColor === c.id ? 'scale(1.2)' : 'scale(1)',
                  transition: 'transform 0.15s, outline 0.1s',
                }}
              />
            ))}
          </div>
          {catColor && (
            <p className="text-xs mt-1.5" style={{ color: '#64748b' }}>
              {CAT_COLORS.find(c => c.id === catColor)?.label}
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs mb-1.5 block" style={{ color: '#94a3b8' }}>Notes (optionnel)</label>
          <textarea
            style={{ ...S.input, resize: 'none', minHeight: 72 }}
            placeholder="Quartier, comportement, particularités…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full py-4 rounded-2xl font-bold text-base transition-all"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            background: canSave ? 'linear-gradient(135deg, #f59e0b, #f97316)' : 'rgba(255,255,255,0.06)',
            color: canSave ? '#fff' : '#475569',
            boxShadow: canSave ? '0 4px 24px rgba(245,158,11,0.35)' : 'none',
          }}
        >
          {canSave ? '🐾 Ajouter au CatDex' : 'Choisissez une couleur'}
        </button>

        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
