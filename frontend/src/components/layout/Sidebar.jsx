import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
const teacherLinks = [['/', 'Overview'], ['/teacher/mark-attendance', 'Mark attendance'], ['/teacher/history', 'My attendance'], ['/teacher/leave', 'Apply leave'], ['/teacher/profile', 'Profile']];
const studentLinks = [['/', 'Overview'], ['/teacher/mark-attendance', 'Mark attendance'], ['/teacher/history', 'My attendance'], ['/teacher/leave', 'Apply leave'], ['/teacher/profile', 'Profile']];
const adminLinks = [['/', 'Overview'], ['/admin/attendance', 'Attendance records'], ['/admin/teachers', 'Teachers'], ['/admin/students', 'Students'], ['/admin/classes', 'Classes'], ['/admin/departments', 'Departments'], ['/admin/locations', 'Locations'], ['/admin/leaves', 'Leave requests'], ['/admin/holidays', 'Holidays'], ['/admin/settings', 'Settings'], ['/admin/reports', 'Reports']];
export default function Sidebar() {
  const { user } = useAuth(); const links = user?.role === 'admin' ? adminLinks : (user?.role === 'student' ? studentLinks : teacherLinks);
  return <aside className="sidebar"><small>WORKSPACE</small>{links.map(([to, label]) => <NavLink end={to === '/'} to={to} key={to}>{label}</NavLink>)}</aside>;
}
