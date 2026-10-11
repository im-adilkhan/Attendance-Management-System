import { useEffect, useState } from 'react';
export default function CameraCapture({ camera, user, onCapture }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => { camera.start(); return camera.stop; }, [camera.start, camera.stop]);
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(timer); }, []);
  return <section className="camera-panel"><div className="camera-frame">
    <video ref={camera.videoRef} autoPlay playsInline muted />
    <div className="camera-overlay"><strong>{user?.full_name}</strong><span>{user?.email}</span><span>{now.toLocaleString()}</span></div>
  </div>{camera.error && <p role="alert" className="error-text">{camera.error}</p>}
    <button type="button" onClick={() => onCapture(camera.capture())}>Capture photo</button></section>;
}
