import { useEffect, useState } from 'react';
export default function CameraCapture({ camera, user, photo, onCapture }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => { camera.start(); return camera.stop; }, [camera.start, camera.stop]);
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(timer); }, []);
  return <section className="camera-panel"><div className="camera-frame">
    <video ref={camera.videoRef} autoPlay playsInline muted aria-label="Live camera preview" />
    <span className="camera-live-indicator"><i /> LIVE</span>
    <div className="camera-overlay"><strong>{user?.full_name}</strong><span>{user?.email}</span><span>{now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</span></div>
  </div>{camera.error && <p role="alert" className="error-text">{camera.error}</p>}
    <div className="camera-controls"><span className={photo ? 'capture-state is-ready' : 'capture-state'}><i />{photo ? 'Photo ready' : 'Ready to capture'}</span>
      <button type="button" onClick={() => onCapture(camera.capture())}>{photo ? 'Retake photo' : 'Capture photo'}</button></div></section>;
}
