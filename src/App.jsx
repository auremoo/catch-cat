// CatDex — Auteurs : Margot Tournier & Aurélien Moote - Moo - 2026 — Licence MIT
import { useState } from 'react';
import { useLocalData } from './hooks/useLocalData';
import { localDB } from './db/localDB';
import Navigation from './components/Navigation';
import CatModal from './components/CatModal';
import CaptureTab from './pages/CaptureTab';
import CatDexTab from './pages/CatDexTab';
import MapTab from './pages/MapTab';
import StatsTab from './pages/StatsTab';

export default function App() {
  const [tab, setTab] = useState('catdex');
  const [selectedCat, setSelectedCat] = useState(null);
  const { cats, sightings, loading, refresh } = useLocalData();

  // Always reflect latest DB state (e.g. cutoutPhoto added in background)
  const latestSelectedCat = selectedCat
    ? (cats.find(c => c.id === selectedCat.id) ?? selectedCat)
    : null;

  const catSightings = latestSelectedCat
    ? sightings.filter(s => s.catId === latestSelectedCat.id)
    : [];

  const handleDeleteCat = async () => {
    await localDB.sightings.deleteByCat(selectedCat.id);
    await localDB.cats.delete(selectedCat.id);
    setSelectedCat(null);
    refresh();
  };

  const handleUpdateCat = async (updates) => {
    const updated = { ...selectedCat, ...updates };
    await localDB.cats.put(updated);
    setSelectedCat(updated);
    refresh();
  };

  const commonProps = { cats, sightings, loading, refresh, onSelectCat: setSelectedCat };

  return (
    <div id="app-shell" style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: '#07090f', position: 'relative' }}>
      <div className="tab-content">
        {tab === 'catdex'  && <CatDexTab  key="catdex"  {...commonProps} />}
        {tab === 'capture' && <CaptureTab key="capture" cats={cats} refresh={refresh} />}
        {tab === 'map'     && <MapTab     key="map"     {...commonProps} />}
        {tab === 'stats'   && <StatsTab   key="stats"   cats={cats} sightings={sightings} />}
      </div>
      <Navigation active={tab} onChange={setTab} />

      {latestSelectedCat && (
        <CatModal
          cat={latestSelectedCat}
          sightings={catSightings}
          onClose={() => setSelectedCat(null)}
          onDelete={handleDeleteCat}
          onUpdate={handleUpdateCat}
        />
      )}
    </div>
  );
}
