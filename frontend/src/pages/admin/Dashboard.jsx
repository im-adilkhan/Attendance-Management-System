import { useEffect, useState } from 'react';
import api from '../../api/axios';
import LiveClock from '../../components/common/LiveClock';
import AttendanceTrendChart from '../../components/common/AttendanceTrendChart';
import { indiaDateKey } from '../../utils/date';

export default function AdminDashboard() {
  const [data, setData] = useState(null); const [trend, setTrend] = useState([]); const [error, setError] = useState('');
  useEffect(() => {
    const month = indiaDateKey().slice(0, 7);
    Promise.all([api.get('/reports/daily'), api.get('/reports/monthly', { params: { month } })])
      .then(([today, monthly]) => { setData(today.data); setTrend(monthly.data.days || []); })
      .catch(() => setError('Could not load the attendance summary.'));
  }, []);
  const cards = [['Present today', data?.present ?? '—'], ['Absent today', data?.absent ?? '—'], ['Late today', data?.late ?? '—']];
  return <main className="page-content dashboard-page"><p className="eyebrow">BBDIT · ADMIN DASHBOARD</p><h1>Babu Banarsi Das Institute of Technology</h1><p className="muted">Today’s campus attendance at a glance.</p>
    <LiveClock />{error && <p role="alert" className="error-banner">{error}</p>}<div className="stats-grid">{cards.map(([label, value]) => <article className="stat-card" key={label}><span>{label}</span><strong>{value}</strong></article>)}</div>
    <AttendanceTrendChart days={trend} title="This month's attendance" />
    <section className="panel"><h2>Quick access</h2><a className="action-link" href="/admin/attendance">Review attendance records →</a><a className="action-link" href="/admin/leaves">Review leave requests →</a></section></main>;
}
