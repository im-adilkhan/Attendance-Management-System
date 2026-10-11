import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function ProtectedPhoto({ recordId, side, alt, className }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    let objectUrl = '';
    if (!recordId || !side) return undefined;
    api.get('/attendance/photo/' + recordId + '/' + side, { responseType: 'blob' })
      .then(({ data }) => { objectUrl = URL.createObjectURL(data); setUrl(objectUrl); })
      .catch(() => setUrl(''));
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [recordId, side]);
  if (!url) return <span className="muted small">Photo unavailable</span>;
  return <a href={url} target="_blank" rel="noreferrer"><img className={className} src={url} alt={alt} /></a>;
}
