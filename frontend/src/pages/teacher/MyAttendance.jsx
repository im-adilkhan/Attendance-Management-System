import { useEffect, useState } from 'react';
import api from '../../api/axios';
export default function MyAttendance() {
  const [rows, setRows] = useState([]); const [error, setError] = useState('');
  useEffect(() => { api.get('/attendance/my-history').then(({ data }) => setRows(data)).catch(() => setError('Could not load your attendance history.')); }, []);
  return <main className="page-content"><h1>My attendance</h1>{error && <p role="alert">{error}</p>}<div className="table-wrap"><table>
    <thead><tr><th>Date</th><th>Check in</th><th>Check out</th><th>Status</th><th>Hours</th></tr></thead><tbody>
      {rows.map((row) => <tr key={row.id}><td>{row.date}</td><td>{row.in_time ? new Date(row.in_time).toLocaleTimeString() : '—'}</td><td>{row.out_time ? new Date(row.out_time).toLocaleTimeString() : '—'}</td><td><span className="status-pill">{row.status}</span></td><td>{row.working_hours ?? '—'}</td></tr>)}
      {!rows.length && !error && <tr><td colSpan="5">No attendance records yet.</td></tr>}</tbody></table></div></main>;
}
