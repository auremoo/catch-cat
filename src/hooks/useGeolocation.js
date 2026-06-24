import { useState, useCallback } from 'react';

export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const request = useCallback(() => {
    if (!navigator.geolocation) { setStatus('error'); return; }
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus('success');
      },
      () => setStatus('error'),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 },
    );
  }, []);

  const reset = useCallback(() => { setLocation(null); setStatus('idle'); }, []);

  return { location, status, request, reset };
}
