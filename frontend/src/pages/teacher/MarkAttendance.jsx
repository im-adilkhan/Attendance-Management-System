import { useState } from 'react';
import api from '../../api/axios';
import CameraCapture from '../../components/attendance/CameraCapture';
import LocationFetcher from '../../components/attendance/LocationFetcher';
import useAuth from '../../hooks/useAuth';
import useCamera from '../../hooks/useCamera';
import useGeolocation from '../../hooks/useGeolocation';
export default function MarkAttendance() {
  const { user } = useAuth(); const camera = useCamera(); const geo = useGeolocation();
  const [photo, setPhoto] = useState(''); const [busy, setBusy] = useState('');
  const [message, setMessage] = useState(''); const [error, setError] = useState('');
  async function submit(action) {
    if (!photo || !geo.location) { setError('Capture a live photo and get your location first.'); return; }
    setBusy(action); setError(''); setMessage('');
    try {
      const { data } = await api.post('/attendance/' + action, { photo, latitude: geo.location.latitude, longitude: geo.location.longitude });
      setMessage(data.message); setPhoto('');
    } catch (err) { setError(err.response?.data?.detail || 'Attendance could not be submitted. Please try again.'); }
    finally { setBusy(''); }
  }
  return <main className="page-content"><div className="page-heading"><div><p className="eyebrow">ATTENDANCE</p><h1>Mark attendance</h1><p className="muted">Capture a live photo and confirm your current location.</p></div></div>
    {message && <p className="success-banner">{message}</p>}{error && <p role="alert" className="error-banner">{error}</p>}
    <div className="attendance-grid"><div className="panel"><h2>Live camera</h2><CameraCapture camera={camera} user={user} onCapture={setPhoto} />
      {photo && <div className="photo-review"><h3>Photo preview</h3><img src={photo} alt="Captured attendance preview" /></div>}</div>
      <div className="panel"><h2>Your location</h2><LocationFetcher geo={geo} onFetch={() => geo.fetchLocation().catch(() => {})} />
        <div className="address-preview"><strong>Address preview</strong><p>{geo.address || 'Fetch your location to preview your address.'}</p></div>
        <div className="button-row"><button className="primary-button" onClick={() => submit('check-in')} disabled={!!busy}>{busy === 'check-in' ? 'Checking in…' : 'Check in'}</button>
        <button className="secondary-button" onClick={() => submit('check-out')} disabled={!!busy}>{busy === 'check-out' ? 'Checking out…' : 'Check out'}</button></div>
        <p className="muted small">Your email is read securely from your signed-in account.</p></div></div></main>;
}
