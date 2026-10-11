import { useCallback, useEffect, useState } from 'react';
import api from '../../api/axios';
export default function ResourcePage({ title, endpoint, fields }) {
  const blank = () => Object.fromEntries(fields.map((f) => [f.name, '']));
  const [rows, setRows] = useState([]); const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false);
  const [error, setError] = useState(''); const [message, setMessage] = useState('');
  const refresh = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get(endpoint); setRows(Array.isArray(data) ? data : data.items || []); setError(''); }
    catch (err) { setError(err.response?.data?.detail || 'Could not load ' + title.toLowerCase() + '.'); }
    finally { setLoading(false); }
  }, [endpoint, title]);
  useEffect(() => { refresh(); }, [refresh]);
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try { await api.post(endpoint, form); setForm(blank()); setMessage('Saved successfully.'); await refresh(); }
    catch (err) { setError(err.response?.data?.detail || 'Could not save this record.'); }
    finally { setBusy(false); }
  }
  async function remove(id) {
    if (!window.confirm('Delete this record?')) return;
    try { await api.delete(endpoint + '/' + id); await refresh(); }
    catch (err) { setError(err.response?.data?.detail || 'Could not delete this record.'); }
  }
  return <main className="page-content"><p className="eyebrow">ADMINISTRATION</p><h1>Manage {title}</h1>
    {message && <p className="success-banner">{message}</p>}{error && <p role="alert" className="error-banner">{error}</p>}
    <form className="panel form-grid" onSubmit={save}><h2 className="span-two">Add {title.slice(0, -1)}</h2>
      {fields.map((field) => <label key={field.name}>{field.label}<input required={field.required !== false} type={field.type || 'text'} value={form[field.name]} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} /></label>)}
      <button className="primary-button" disabled={busy}>{busy ? 'Saving…' : 'Save record'}</button></form>
    <section className="panel"><h2>{title} list</h2>{loading ? <p className="page-state">Loading…</p> : <div className="table-wrap"><table>
      <thead><tr>{fields.map((field) => <th key={field.name}>{field.label}</th>)}<th>Actions</th></tr></thead>
      <tbody>{rows.map((row) => <tr key={row.id}>{fields.map((field) => <td key={field.name}>{row[field.name] ?? row.user?.[field.name] ?? '—'}</td>)}<td><button className="text-button danger-text" onClick={() => remove(row.id)}>Delete</button></td></tr>)}
        {!rows.length && <tr><td colSpan={fields.length + 1}>No records yet.</td></tr>}</tbody></table></div>}</section></main>;
}
