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
  const ready = Boolean(photo && geo.location);
  return <main className="page-content attendance-page"><div className="page-heading"><div><p className="eyebrow">BBDIT · DAILY CHECK-IN</p><h1>Mark attendance</h1><p className="muted">Take a live photo and confirm you’re on campus to record your attendance.</p></div></div>
    <div className="attendance-steps" aria-label="Attendance steps">
      <div className={photo ? 'attendance-step is-complete' : 'attendance-step is-current'}><span>1</span><div><strong>Capture photo</strong><small>{photo ? 'Photo captured' : 'Use the live camera'}</small></div></div>
      <div className={geo.location ? 'attendance-step is-complete' : photo ? 'attendance-step is-current' : 'attendance-step'}><span>2</span><div><strong>Confirm location</strong><small>{geo.location ? 'Location confirmed' : 'Verify you are on campus'}</small></div></div>
      <div className={ready ? 'attendance-step is-current' : 'attendance-step'}><span>3</span><div><strong>Submit attendance</strong><small>{ready ? 'Ready to check in or out' : 'Complete the first two steps'}</small></div></div>
    </div>
    {message && <p className="success-banner attendance-message">{message}</p>}{error && <p role="alert" className="error-banner">{error}</p>}
    <div className="attendance-grid"><section className="panel attendance-panel camera-attendance-panel"><div className="attendance-panel-heading"><span className="attendance-panel-icon camera-icon" aria-hidden="true">01</span><div><h2>Photo verification</h2><p>Keep your face visible in the live camera.</p></div></div><CameraCapture camera={camera} user={user} photo={photo} onCapture={(capture) => { setPhoto(capture); setError(capture ? '' : 'Camera is still starting. Wait for the preview and try again.'); }} />
      {photo && <div className="photo-review"><div><h3>Captured photo</h3><p>Preview before submitting.</p></div><img src={photo} alt="Captured attendance preview" /></div>}</section>
      <section className="panel attendance-panel location-attendance-panel"><div className="attendance-panel-heading"><span className="attendance-panel-icon location-icon" aria-hidden="true">02</span><div><h2>Campus location</h2><p>Confirm your current position is in range.</p></div></div>
        <div className={geo.location ? 'location-status is-confirmed' : 'location-status'}><span className="location-status-mark" aria-hidden="true">{geo.location ? '✓' : '⌖'}</span><div><strong>{geo.location ? 'Location confirmed' : 'Location not checked'}</strong><small>{geo.location ? `${geo.location.latitude.toFixed(5)}, ${geo.location.longitude.toFixed(5)}` : 'Allow location access to continue'}</small></div></div>
        <LocationFetcher geo={geo} onFetch={() => geo.fetchLocation().catch(() => {})} />
        {geo.address && <div className="address-preview"><strong>Address preview</strong><p>{geo.address}</p></div>}
        <div className="attendance-actions"><p className="attendance-ready-note">{ready ? 'Everything is ready. Choose an action below.' : 'Capture a photo and confirm your location to enable attendance.'}</p>
          <div className="button-row"><button className="checkin-button" onClick={() => submit('check-in')} disabled={!ready || !!busy}>{busy === 'check-in' ? 'Checking in…' : 'Check in'}</button>
          <button className="checkout-button" onClick={() => submit('check-out')} disabled={!ready || !!busy}>{busy === 'check-out' ? 'Checking out…' : 'Check out'}</button></div></div>
        <p className="muted small attendance-privacy-note">Your email is securely linked from your signed-in account.</p></section></div></main>;
}
