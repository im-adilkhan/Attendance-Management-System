import useAuth from '../../hooks/useAuth';
export default function Profile() {
  const { user } = useAuth();
  return <main className="page-content"><p className="eyebrow">ACCOUNT</p><h1>Your profile</h1><section className="panel profile-card">
    <div className="avatar">{user?.full_name?.charAt(0)}</div><div><h2>{user?.full_name}</h2><p>{user?.email}</p><span className="status-pill">{user?.role}</span></div></section></main>;
}
