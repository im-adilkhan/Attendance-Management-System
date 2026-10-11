import { useEffect, useState } from 'react';
import api from '../../api/axios';
import useAuth from '../../hooks/useAuth';
export default function TeacherDashboard() {
  const { user } = useAuth(); const [summary, setSummary] = useState(null); const [error, setError] = useState('');
  useEffect(() => { api.get('/attendance/my-history').then(({ data }) => setSummary(data[0] || null)).catch(() => setError('Attendance summary is temporarily unavailable.')); }, []);
  return <main className="page-content"><p className="eyebrow">TEACHER WORKSPACE</p><h1>Good day, {user?.full_name?.split(' ')[0]}</h1><p className="muted">Here is your attendance snapshot for today.</p>
    {error && <p role="alert">{error}</p>}<div className="stats-grid">
      <article className="stat-card"><span>Today</span><strong>{summary ? summary.status : 'Not marked'}</strong></article>
      <article className="stat-card"><span>Check in</span><strong>{summary?.in_time ? new Date(summary.in_time).toLocaleTimeString() : '—'}</strong></article>
      <article className="stat-card"><span>Working hours</span><strong>{summary?.working_hours ?? '—'}</strong></article></div>
    <div className="panel"><h2>Quick actions</h2><a className="action-link" href="/teacher/mark-attendance">Mark attendance →</a><a className="action-link" href="/teacher/leave">Apply for leave →</a></div></main>;
}
