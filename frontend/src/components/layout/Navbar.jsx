import useAuth from '../../hooks/useAuth';
export default function Navbar() {
  const { user, logout } = useAuth();
  return <header className="topbar"><a href="/" className="brand">Attend<span>ly</span></a>
    <div className="user-menu"><span>{user?.full_name}</span><button onClick={logout}>Sign out</button></div></header>;
}
