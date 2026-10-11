import { useState } from 'react';
import api from '../../api/axios';
export default function Reports() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); const [report, setReport] = useState(null);
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  async function load(event) {
    event.preventDefault(); setLoading(true); setError('');
    try { const { data } = await api.get('/reports/monthly', { params: { month } }); setReport(data); }
    catch (err) { setError(err.response?.data?.detail || 'Could not load this report.'); }
    finally { setLoading(false); }
  }
  async function download() {
    try {
      const response = await api.get('/reports/monthly/export', { params: { month }, responseType: 'blob' });
      const href = URL.createObjectURL(response.data); const a = document.createElement('a');
      a.href = href; a.download = 'attendance-' + month + '.xlsx'; a.click(); URL.revokeObjectURL(href);
    } catch { setError('Could not export the Excel report.'); }
  }
  return <main className="page-content"><h1>Reports</h1><form className="filter-bar" onSubmit={load}><label>Month<input type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></label>
    <button className="primary-button" disabled={loading}>{loading ? 'Loading…' : 'View report'}</button><button type="button" className="secondary-button" onClick={download}>Export Excel</button></form>
    {error && <p role="alert" className="error-banner">{error}</p>}{report && <section className="panel"><h2>Monthly summary · {month}</h2><p>{report.records?.length || 0} attendance records</p>
      <div className="table-wrap"><table><thead><tr><th>Date</th><th>Present</th><th>Late</th><th>Absent</th></tr></thead><tbody>{(report.days || []).map((day) => <tr key={day.date}><td>{day.date}</td><td>{day.present}</td><td>{day.late}</td><td>{day.absent}</td></tr>)}</tbody></table></div></section>}</main>;
}
