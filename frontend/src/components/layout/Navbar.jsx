import useAuth from '../../hooks/useAuth';
export default function Navbar() {
  const { user, logout } = useAuth();
  return <header className="topbar"><a href="/" className="brand" aria-label="BBDIT Attendance Manager home"><span className="brand-mark">B</span><span className="brand-title">BBDIT</span><small>ATTENDANCE MANAGER</small></a>
    <div className="user-menu"><span>{user?.full_name}</span><button onClick={logout}>Sign out</button></div></header>;
}
