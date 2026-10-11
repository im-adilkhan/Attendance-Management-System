import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
export default function Login() {
  const { user, login, loading } = useAuth(); const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();
  if (!loading && user) return <Navigate to="/" replace />;
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { await login(email, password); }
    catch { setError('Sign in failed. Check your email and password.'); }
    finally { setBusy(false); }
  }
  return <main className="login-page"><section className="login-art"><div className="login-brand">Attend<span>ly</span></div><h1>Good work starts with showing up.</h1><p>A simpler way to manage your daily attendance.</p></section>
    <form className="login-card" onSubmit={submit}><p className="eyebrow">WELCOME BACK</p><h2>Sign in to your account</h2>
      {error && <p role="alert" className="error-banner">{error}</p>}
      <label>Email address<input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label>Password<span className="password-input-wrap"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /><button className="password-toggle" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />{showPassword && <path d="m4 4 16 16" />}</svg></button></span></label>
      <button className="primary-button" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      <small>Demo admin: admin@demo.com · admin123</small>{location.state?.from && <small>Please sign in to continue.</small>}
    </form></main>;
}
