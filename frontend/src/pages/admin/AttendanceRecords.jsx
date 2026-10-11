import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AttendanceMap from '../../components/maps/AttendanceMap';
import ProtectedPhoto from '../../components/common/ProtectedPhoto';
export default function AttendanceRecords() {
  const [records, setRecords] = useState([]); const [email, setEmail] = useState('');
  const [date, setDate] = useState(''); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  async function load(search = email, day = date) {
    setLoading(true); setError('');
    try {
      const params = {}; if (search) params.email = search; if (day) params.date = day;
      const { data } = await api.get('/attendance/records', { params }); setRecords(data);
    } catch (err) { setError(err.response?.data?.detail || 'Could not load attendance records.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load('', ''); }, []);
  function exportCsv() {
    const headings = ['Email', 'Date', 'Check in', 'Check out', 'Status', 'Hours', 'Latitude', 'Longitude', 'Address'];
    const values = records.map((r) => [r.in_email, r.date, r.in_time || r.check_in_at, r.out_time || r.check_out_at, r.status, r.working_hours, r.in_lat, r.in_lng, r.in_address]);
    const csv = [headings, ...values].map((row) => row.map((v) => '"' + String(v ?? '').replaceAll('"', '""') + '"').join(',')).join('\n');
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = 'attendance-records.csv'; link.click(); URL.revokeObjectURL(link.href);
  }
  async function exportExcel() {
    try {
      const params = {}; if (email) params.email = email; if (date) params.date = date;
      const response = await api.get('/attendance/records/export', { params, responseType: 'blob' });
      const href = URL.createObjectURL(response.data); const link = document.createElement('a');
      link.href = href; link.download = 'attendance-records.xlsx'; link.click(); URL.revokeObjectURL(href);
    } catch { setError('Could not export the Excel file.'); }
  }
  return <main className="page-content"><div className="page-heading"><div><p className="eyebrow">ADMINISTRATION</p><h1>Attendance records</h1><p className="muted">Search, review stamped photos, and inspect check-in locations.</p></div><div className="button-row"><button className="secondary-button" onClick={exportCsv}>Export CSV</button><button className="secondary-button" onClick={exportExcel}>Export Excel</button></div></div>
    <form className="filter-bar" onSubmit={(e) => { e.preventDefault(); load(); }}>
      <label>Email<input type="search" value={email} placeholder="Search email" onChange={(e) => setEmail(e.target.value)} /></label>
      <label>Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
      <button className="primary-button">Apply filters</button><button type="button" className="secondary-button" onClick={() => { setEmail(''); setDate(''); load('', ''); }}>Clear</button>
    </form>
    {error && <p role="alert" className="error-banner">{error}</p>}
    <section className="panel map-panel"><h2>Check-in locations</h2><AttendanceMap records={records} /></section>
    <section className="panel records-panel"><h2>Records <span className="count-badge">{records.length}</span></h2>
      {loading ? <p className="page-state">Loading attendance…</p> : <div className="table-wrap"><table>
        <thead><tr><th>Email</th><th>Date</th><th>Check in</th><th>Check-in photo</th><th>Check out</th><th>Check-out photo</th></tr></thead>
        <tbody>{records.map((record) => <tr key={record.id}><td>{record.in_email}<small className="table-subtext">{record.out_email && 'Out: ' + record.out_email}</small></td>
          <td>{record.date}</td><td>{record.in_time || record.check_in_at ? new Date(record.in_time || record.check_in_at).toLocaleString() : '—'}<small className="table-subtext">{record.in_lat}, {record.in_lng}</small></td>
          <td>{(record.in_photo_stamped || record.in_photo) && <ProtectedPhoto className="record-photo" recordId={record.id} side="in" alt={'Stamped check-in for ' + record.in_email} />}</td>
          <td>{record.out_time || record.check_out_at ? new Date(record.out_time || record.check_out_at).toLocaleString() : '—'}<small className="table-subtext">{record.out_lat != null && record.out_lat + ', ' + record.out_lng}</small></td>
          <td>{(record.out_photo_stamped || record.out_photo) && <ProtectedPhoto className="record-photo" recordId={record.id} side="out" alt={'Stamped check-out for ' + record.out_email} />}</td></tr>)}
          {!records.length && <tr><td colSpan="6">No records match these filters.</td></tr>}</tbody></table></div>}
    </section></main>;
}
