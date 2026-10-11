import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import LiveClock from '../../components/common/LiveClock';
import AttendanceTrendChart from '../../components/common/AttendanceTrendChart';
import { indiaDateKey } from '../../utils/date';

export default function TeacherDashboard() {
  const { user } = useAuth(); const [rows, setRows] = useState([]); const [error, setError] = useState('');
  useEffect(() => { api.get('/attendance/my-history').then(({ data }) => setRows(data)).catch(() => setError('Attendance summary is temporarily unavailable.')); }, []);
  const today = indiaDateKey();
  const todayRecord = rows.find((row) => row.date === today);
  const attended = rows.filter((row) => ['present', 'late', 'half-day'].includes(row.status)).length;
  const percentage = rows.length ? Math.round(attended * 100 / rows.length) : 0;
  const chartDays = useMemo(() => {
    const dayMap = new Map(rows.map((row) => [row.date, row]));
    return Array.from({ length: 14 }, (_, index) => {
      const day = new Date(today + 'T00:00:00Z'); day.setUTCDate(day.getUTCDate() - (13 - index));
      const date = day.toISOString().slice(0, 10); const row = dayMap.get(date);
      return { date, present: row && ['present', 'late', 'half-day'].includes(row.status) ? 1 : 0, late: row?.status === 'late' ? 1 : 0, absent: 0 };
    });
  }, [rows, today]);
  return <main className="page-content dashboard-page"><p className="eyebrow">BBDIT · {user?.role === 'student' ? 'STUDENT' : 'TEACHER'} DASHBOARD</p><h1>Good day, {user?.full_name?.split(' ')[0]}</h1><p className="muted">Here is your attendance snapshot for today.</p>
    <LiveClock />{error && <p role="alert" className="error-banner">{error}</p>}<div className="stats-grid">
      <article className="stat-card"><span>Today's check-in</span><strong>{todayRecord?.in_time ? new Date(todayRecord.in_time).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }) : 'Not marked'}</strong></article>
      <article className="stat-card"><span>Present days</span><strong>{attended}</strong></article>
      <article className="stat-card"><span>Attendance rate (recorded days)</span><strong>{percentage}%</strong><div className="progress-track" role="progressbar" aria-label="Attendance rate across recorded days" aria-valuenow={percentage} aria-valuemin="0" aria-valuemax="100"><span style={{ width: percentage + '%' }} /></div></article>
      <article className="stat-card"><span>Today's status</span><strong>{todayRecord?.status || 'Not marked'}</strong></article>
      <article className="stat-card"><span>Working hours today</span><strong>{todayRecord?.working_hours ?? '—'}</strong></article></div>
    <AttendanceTrendChart days={chartDays} title="Your last 14 days" />
    <div className="panel"><h2>Quick actions</h2><div className="quick-actions">
      <Link className="action-link quick-action" to="/teacher/mark-attendance">Mark attendance <span aria-hidden="true">→</span></Link>
      <Link className="action-link quick-action" to="/teacher/leave">Apply for leave <span aria-hidden="true">→</span></Link>
    </div></div></main>;
}
