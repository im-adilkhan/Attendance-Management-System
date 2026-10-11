import { useCallback, useRef, useState } from 'react';
export default function useCamera() {
  const videoRef = useRef(null); const streamRef = useRef(null); const [error, setError] = useState('');
  const start = useCallback(async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch { setError('Camera permission is required. Allow camera access and try again.'); }
  }, []);
  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return '';
    const canvas = document.createElement('canvas'); canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return '';
    // Front-facing camera frames are mirrored on some devices. Flip the saved
    // canvas so text and the captured photo have their natural orientation.
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.85);
  }, []);
  const stop = useCallback(() => { streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; }, []);
  return { videoRef, start, capture, stop, error };
}
