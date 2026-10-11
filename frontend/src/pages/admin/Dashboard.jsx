import { useEffect, useState } from 'react';
import api from '../../api/axios';
export default function AdminDashboard() {
  const [data, setData] = useState(null); const [error, setError] = useState('');
  useEffect(() => { api.get('/reports/daily').then(({ data: report }) => setData(report)).catch(() => setError('Could not load today’s attendance summary.')); }, []);
  const cards = [['Present', data?.present ?? '—'], ['Absent', data?.absent ?? '—'], ['Late', data?.late ?? '—']];
  return <main className="page-content"><p className="eyebrow">BBDIT ADMIN OVERVIEW</p><h1>Babu Banarsi Das Institute of Technology (BBDIT)</h1><p className="muted">Today’s campus attendance at a glance.</p>
    {error && <p role="alert" className="error-banner">{error}</p>}<div className="stats-grid">{cards.map(([label, value]) => <article className="stat-card" key={label}><span>{label}</span><strong>{value}</strong></article>)}</div>
    <section className="panel"><h2>Quick access</h2><a className="action-link" href="/admin/attendance">Review attendance records →</a><a className="action-link" href="/admin/leaves">Review leave requests →</a></section></main>;
}
