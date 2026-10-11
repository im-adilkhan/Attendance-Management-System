import { useEffect, useState } from 'react';
import api from '../../api/axios';
export default function Settings() {
  const [form, setForm] = useState({ office_start_time: '09:00', late_after_minutes: '15', half_day_hours: '4' });
  const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { api.get('/admin/settings').then(({ data }) => setForm({ ...form, ...data })).catch(() => {}); }, []);
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try { const { data } = await api.put('/admin/settings', form); setForm(data); setMessage('Settings saved.'); }
    catch (err) { setError(err.response?.data?.detail || 'Could not save settings.'); }
    finally { setBusy(false); }
  }
  return <main className="page-content"><h1>Attendance settings</h1><p className="muted">Set the office start time and attendance thresholds.</p>
    {message && <p className="success-banner">{message}</p>}{error && <p className="error-banner">{error}</p>}
    <form className="panel form-grid" onSubmit={save}><label>Office start time<input type="time" value={form.office_start_time || ''} onChange={(e) => setForm({ ...form, office_start_time: e.target.value })} /></label>
      <label>Late grace period (minutes)<input type="number" min="0" value={form.late_after_minutes || ''} onChange={(e) => setForm({ ...form, late_after_minutes: e.target.value })} /></label>
      <label>Half-day threshold (hours)<input type="number" min="0" step=".5" value={form.half_day_hours || ''} onChange={(e) => setForm({ ...form, half_day_hours: e.target.value })} /></label>
      <button className="primary-button" disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</button></form></main>;
}
