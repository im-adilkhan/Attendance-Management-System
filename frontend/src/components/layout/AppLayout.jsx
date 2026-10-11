import { Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
export default function AppLayout() {
  const { user } = useAuth();
  return <><Navbar /><div className={`app-shell app-shell-${user?.role || 'default'}`}><Sidebar /><div className="main-panel"><Outlet /></div></div></>;
}
