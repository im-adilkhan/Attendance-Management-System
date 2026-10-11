import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
export default function Register() {
  const { user, register } = useAuth();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'teacher' });
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  if (user) return <Navigate to="/" replace />;
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { await register(form); }
    catch (err) { setError(err.response?.data?.detail || 'Could not create account.'); }
    finally { setBusy(false); }
  }
  return <main className="login-page"><section className="login-art"><div className="login-brand">Attend<span>ly</span></div><h1>Make every day count.</h1></section>
    <form className="login-card" onSubmit={submit}><p className="eyebrow">NEW ACCOUNT</p><h2>Create your account</h2>
      {error && <p role="alert" className="error-banner">{error}</p>}
      <label>Full name<input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></label>
      <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label>Password<input type="password" minLength="8" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
      <label>Account type<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="teacher">Teacher</option><option value="student">Student</option></select></label>
      <button className="primary-button" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button><small>Already registered? <Link to="/login">Sign in</Link></small>
    </form></main>;
}
