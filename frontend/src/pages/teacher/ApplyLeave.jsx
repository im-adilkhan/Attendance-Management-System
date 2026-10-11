import { useState } from 'react';
import api from '../../api/axios';
export default function ApplyLeave() {
  const [form, setForm] = useState({ start_date: '', end_date: '', reason: '' });
  const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try { await api.post('/leaves', form); setMessage('Leave request submitted.'); setForm({ start_date: '', end_date: '', reason: '' }); }
    catch (err) { setError(err.response?.data?.detail || 'Could not submit leave request.'); }
    finally { setBusy(false); }
  }
  return <main className="page-content"><h1>Apply for leave</h1>{message && <p className="success-banner">{message}</p>}{error && <p role="alert" className="error-banner">{error}</p>}
    <form className="panel form-grid" onSubmit={submit}><label>Start date<input type="date" required value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></label>
      <label>End date<input type="date" required value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></label>
      <label className="span-two">Reason<textarea required rows="4" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></label>
      <button className="primary-button" disabled={busy}>{busy ? 'Submitting…' : 'Submit request'}</button></form></main>;
}
