import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, Edit2, Check, Trash2, MapPin, Eye } from 'lucide-react';
import { getColor, formatDate, formatRelative, CAT_COLORS } from '../utils/catUtils';

const catDivIcon = L.divIcon({
  className: 'cat-marker',
  html: '🐱',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function ColorDot({ colorId, size = 12 }) {
  const color = getColor(colorId);
  return (
    <div
      className={`rounded-full flex-shrink-0${color.swatch ? ` swatch-${color.swatch}` : ''}`}
      style={{
        width: size, height: size,
        background: color.swatch ? undefined : color.bg,
        border: color.border ? `1.5px solid ${color.border}` : '1px solid rgba(255,255,255,0.2)',
      }}
    />
  );
}

export default function CatModal({ cat, sightings, onClose, onDelete, onUpdate }) {
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(cat.name);
  const [editingColor, setEditingColor] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  const photos = sightings.filter(s => s.photo).map(s => ({ photo: s.photo, id: s.id, createdAt: s.createdAt }));
  const withLocation = sightings.filter(s => s.lat && s.lng);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const saveName = () => {
    if (name.trim() && name.trim() !== cat.name) onUpdate({ name: name.trim() });
    setEditingName(false);
  };

  const saveColor = (colorId) => {
    onUpdate({ color: colorId });
    setEditingColor(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    await onDelete();
  };

  const color = getColor(cat.color);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col modal-enter"
      style={{ background: '#07090f', maxWidth: 430, margin: '0 auto' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={onClose} className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <X size={20} color="#94a3b8" />
        </button>

        <div className="flex-1 min-w-0">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                className="flex-1 text-lg font-semibold bg-transparent border-b"
                style={{ color: '#f1f5f9', borderColor: '#f59e0b', fontFamily: "'Space Grotesk', sans-serif", outline: 'none' }}
              />
              <button onClick={saveName}><Check size={18} color="#f59e0b" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold truncate" style={{ color: '#f1f5f9', fontFamily: "'Space Grotesk', sans-serif" }}>
                {cat.name}
              </h2>
              <button onClick={() => setEditingName(true)}><Edit2 size={14} color="#64748b" /></button>
            </div>
          )}
        </div>

        <button
          onClick={handleDelete}
          className="p-2 rounded-xl transition-colors"
          style={{ background: confirmDelete ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)' }}
        >
          <Trash2 size={18} color={confirmDelete ? '#f87171' : '#64748b'} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Photo gallery */}
        {photos.length > 0 && (
          <div className="relative" style={{ background: '#000' }}>
            <img
              src={photos[activePhoto]?.photo || cat.coverPhoto}
              alt={cat.name}
              className="w-full object-cover"
              style={{ maxHeight: '55vw', objectFit: 'cover' }}
            />
            {photos.length > 1 && (
              <div className="flex gap-1.5 absolute bottom-3 left-1/2" style={{ transform: 'translateX(-50%)' }}>
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhoto(i)}
                    className="rounded-full transition-all"
                    style={{
                      width: i === activePhoto ? 20 : 6,
                      height: 6,
                      background: i === activePhoto ? '#f59e0b' : 'rgba(255,255,255,0.4)',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="p-4 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Vu', value: `${cat.totalSightings}×` },
              { label: 'D\'abord', value: formatDate(cat.firstSeen) },
              { label: 'Dernière fois', value: formatDate(cat.lastSeen) },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl p-3 text-center" style={{ background: '#0f1626', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-xs mb-1" style={{ color: '#64748b' }}>{label}</p>
                <p className="text-sm font-semibold" style={{ color: '#f1f5f9', fontFamily: "'Space Grotesk', sans-serif" }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Color */}
          <div className="rounded-xl p-3" style={{ background: '#0f1626', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ColorDot colorId={cat.color} size={16} />
                <span className="text-sm" style={{ color: '#f1f5f9' }}>{color.label}</span>
              </div>
              <button
                onClick={() => setEditingColor(v => !v)}
                className="text-xs px-2 py-1 rounded-lg"
                style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}
              >
                Changer
              </button>
            </div>
            {editingColor && (
              <div className="flex flex-wrap gap-2 mt-3">
                {CAT_COLORS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => saveColor(c.id)}
                    title={c.label}
                    className={`rounded-full transition-transform ${cat.color === c.id ? 'ring-2 ring-amber-400 scale-110' : 'hover:scale-105'}`}
                    style={{
                      width: 32, height: 32,
                      background: c.swatch ? undefined : c.bg,
                      border: c.border ? `2px solid ${c.border}` : '2px solid transparent',
                    }}
                  >
                    {c.swatch && <div className={`w-full h-full rounded-full swatch-${c.swatch}`} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mini map */}
          {withLocation.length > 0 && (
            <div className="rounded-xl overflow-hidden" style={{ height: 160 }}>
              <MapContainer
                center={[withLocation[0].lat, withLocation[0].lng]}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                dragging={false}
                scrollWheelZoom={false}
                attributionControl={false}
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                {withLocation.map(s => (
                  <Marker key={s.id} position={[s.lat, s.lng]} icon={catDivIcon} />
                ))}
              </MapContainer>
            </div>
          )}

          {/* Sightings list */}
          <div>
            <h3 className="text-sm font-semibold mb-2" style={{ color: '#94a3b8', fontFamily: "'Space Grotesk', sans-serif" }}>
              Apparitions
            </h3>
            <div className="space-y-2">
              {sightings.map(s => (
                <div
                  key={s.id}
                  className="flex gap-3 items-start rounded-xl p-3"
                  style={{ background: '#0f1626', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  {s.photo && (
                    <img src={s.photo} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: '#f1f5f9' }}>{formatRelative(s.createdAt)}</p>
                    {s.lat && (
                      <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: '#64748b' }}>
                        <MapPin size={10} />
                        {s.lat.toFixed(4)}, {s.lng.toFixed(4)}
                      </p>
                    )}
                    {s.notes && <p className="text-xs mt-1 italic" style={{ color: '#94a3b8' }}>{s.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: 24 }} />
        </div>
      </div>
    </div>
  );
}
