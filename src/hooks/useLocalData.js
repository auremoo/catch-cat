import { useState, useEffect, useCallback } from 'react';
import { localDB } from '../db/localDB';

export function useLocalData() {
  const [cats, setCats] = useState([]);
  const [sightings, setSightings] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [allCats, allSightings] = await Promise.all([
      localDB.cats.getAll(),
      localDB.sightings.getAll(),
    ]);
    setCats(allCats.sort((a, b) => b.lastSeen - a.lastSeen));
    setSightings(allSightings.sort((a, b) => b.createdAt - a.createdAt));
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { cats, sightings, loading, refresh };
}
