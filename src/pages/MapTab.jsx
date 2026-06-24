import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatRelative } from '../utils/catUtils';

const DEFAULT_CENTER = [48.8566, 2.3522]; // Paris

function makeCatIcon(photo) {
  if (photo) {
    return L.divIcon({
      className: '',
      html: `<div style="width:40px;height:40px;border-radius:50%;overflow:hidden;border:2.5px solid #f59e0b;box-shadow:0 2px 12px rgba(0,0,0,0.6)"><img src="${photo}" style="width:100%;height:100%;object-fit:cover"/></div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -22],
    });
  }
  return L.divIcon({
    className: 'cat-marker',
    html: '🐱',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  });
}

export default function MapTab({ cats, sightings, onSelectCat }) {
  const sightingsWithLoc = sightings.filter(s => s.lat && s.lng);

  const center = useMemo(() => {
    if (!sightingsWithLoc.length) return DEFAULT_CENTER;
    const lat = sightingsWithLoc.reduce((s, x) => s + x.lat, 0) / sightingsWithLoc.length;
    const lng = sightingsWithLoc.reduce((s, x) => s + x.lng, 0) / sightingsWithLoc.length;
    return [lat, lng];
  }, [sightingsWithLoc]);

  const getCat = (catId) => cats.find(c => c.id === catId);

  if (sightingsWithLoc.length === 0) {
    return (
      <div className="tab-content flex flex-col items-center justify-center px-8 page-transition" style={{ minHeight: '100%' }}>
        <div style={{ fontSize: 64 }}>🗺️</div>
        <h2 className="text-xl font-bold mt-4 mb-2 text-center" style={{ color: '#f1f5f9', fontFamily: "'Space Grotesk', sans-serif" }}>
          Aucune localisation
        </h2>
        <p className="text-sm text-center" style={{ color: '#64748b' }}>
          Activez la localisation lors de vos captures pour voir les chats sur la carte.
        </p>
      </div>
    );
  }

  return (
    <div className="tab-content page-transition" style={{ height: '100%' }}>
      {/* Header overlay */}
      <div
        className="absolute top-0 left-0 right-0 z-[1000] flex items-center justify-between px-4 pt-4 pb-3 pointer-events-none"
        style={{ maxWidth: 430, background: 'linear-gradient(to bottom, rgba(7,9,15,0.9) 60%, transparent)' }}
      >
        <h1 className="text-xl font-bold gradient-text" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Carte des chats
        </h1>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}
        >
          {sightingsWithLoc.length} loc.
        </span>
      </div>

      <div style={{ height: '100%' }}>
        <MapContainer
          center={center}
          zoom={sightingsWithLoc.length === 1 ? 15 : 13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='© <a href="https://openstreetmap.org">OSM</a> © <a href="https://carto.com">CARTO</a>'
          />
          {sightingsWithLoc.map(s => {
            const cat = getCat(s.catId);
            if (!cat) return null;
            return (
              <Marker
                key={s.id}
                position={[s.lat, s.lng]}
                icon={makeCatIcon(s.photo)}
              >
                <Popup>
                  <div
                    onClick={() => onSelectCat(cat)}
                    className="flex gap-2.5 items-center cursor-pointer"
                    style={{ minWidth: 160 }}
                  >
                    {s.photo && (
                      <img src={s.photo} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                    )}
                    <div>
                      <p style={{ fontWeight: 600, color: '#f1f5f9', marginBottom: 2, fontFamily: "'Space Grotesk', sans-serif" }}>{cat.name}</p>
                      <p style={{ fontSize: 11, color: '#94a3b8' }}>{formatRelative(s.createdAt)}</p>
                      <p style={{ fontSize: 11, color: '#f59e0b', marginTop: 2 }}>Voir le profil →</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
