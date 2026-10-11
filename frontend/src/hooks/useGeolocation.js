import { useCallback, useState } from 'react';
import api from '../api/axios';
export default function useGeolocation() {
  const [location, setLocation] = useState(null); const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const fetchLocation = useCallback(() => new Promise((resolve, reject) => {
    if (!navigator.geolocation) { const msg = 'Geolocation is not supported.'; setError(msg); reject(new Error(msg)); return; }
    setLoading(true); setError('');
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const point = { latitude: coords.latitude, longitude: coords.longitude }; setLocation(point);
      try {
        const { data } = await api.get('/locations/reverse', { params: point });
        const text = data.address || 'Address unavailable';
        setAddress(text); resolve({ ...point, address: text });
      } catch { setAddress('Address unavailable'); resolve({ ...point, address: '' }); }
      finally { setLoading(false); }
    }, () => { const msg = 'Could not read location. Allow location access and retry.'; setError(msg); setLoading(false); reject(new Error(msg)); },
    { enableHighAccuracy: true, timeout: 12000 });
  }), []);
  return { location, address, loading, error, fetchLocation };
}
