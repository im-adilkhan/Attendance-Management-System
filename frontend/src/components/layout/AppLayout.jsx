import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
export default function AppLayout() {
  return <><Navbar /><div className="app-shell"><Sidebar /><div className="main-panel"><Outlet /></div></div></>;
}
