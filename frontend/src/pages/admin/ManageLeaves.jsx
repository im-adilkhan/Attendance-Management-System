import { useCallback, useEffect, useState } from 'react';
import api from '../../api/axios';
export default function ManageLeaves() {
  const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(() => { setLoading(true); api.get('/admin/leaves').then(({ data }) => setItems(data)).catch(() => setError('Could not load leave requests.')).finally(() => setLoading(false)); }, []);
  useEffect(() => { load(); }, [load]);
  async function decide(id, decision) {
    try { await api.post('/admin/leaves/' + id + '/' + decision); load(); }
    catch (err) { setError(err.response?.data?.detail || 'Could not update request.'); }
  }
  return <main className="page-content"><h1>Leave requests</h1>{error && <p role="alert" className="error-banner">{error}</p>}
    <section className="panel">{loading ? <p className="page-state">Loading requests…</p> : <div className="table-wrap"><table><thead><tr><th>Employee</th><th>Dates</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead><tbody>
      {items.map((item) => <tr key={item.id}><td>{item.user?.full_name || item.user_id}</td><td>{item.start_date} – {item.end_date}</td><td>{item.reason}</td><td><span className="status-pill">{item.status}</span></td>
        <td>{item.status === 'pending' && <div className="button-row"><button className="text-button" onClick={() => decide(item.id, 'approve')}>Approve</button><button className="text-button danger-text" onClick={() => decide(item.id, 'reject')}>Reject</button></div>}</td></tr>)}
      {!items.length && <tr><td colSpan="5">No leave requests found.</td></tr>}</tbody></table></div>}</section></main>;
}
