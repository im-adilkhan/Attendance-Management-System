import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './assets/styles/app.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TeacherDashboard from './pages/teacher/Dashboard';
import MarkAttendance from './pages/teacher/MarkAttendance';
import MyAttendance from './pages/teacher/MyAttendance';
import ApplyLeave from './pages/teacher/ApplyLeave';
import Profile from './pages/teacher/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import AttendanceRecords from './pages/admin/AttendanceRecords';
import ManageTeachers from './pages/admin/ManageTeachers';
import ManageStudents from './pages/admin/ManageStudents';
import ManageClasses from './pages/admin/ManageClasses';
import ManageDepartments from './pages/admin/ManageDepartments';
import ManageLocations from './pages/admin/ManageLocations';
import ManageLeaves from './pages/admin/ManageLeaves';
import ManageHolidays from './pages/admin/ManageHolidays';
import Settings from './pages/admin/Settings';
import Reports from './pages/admin/Reports';

function App() {
  return <AuthProvider><BrowserRouter><Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route element={<ProtectedRoute />}><Route element={<AppLayout />}>
      <Route index element={<RoleHome />} />
      <Route path="teacher/mark-attendance" element={<ProtectedRoute roles={['teacher', 'student']}><MarkAttendance /></ProtectedRoute>} />
      <Route path="teacher/history" element={<ProtectedRoute roles={['teacher', 'student']}><MyAttendance /></ProtectedRoute>} />
      <Route path="teacher/leave" element={<ProtectedRoute roles={['teacher', 'student']}><ApplyLeave /></ProtectedRoute>} />
      <Route path="teacher/profile" element={<ProtectedRoute roles={['teacher', 'student']}><Profile /></ProtectedRoute>} />
      <Route path="admin/attendance" element={<ProtectedRoute roles={['admin']}><AttendanceRecords /></ProtectedRoute>} />
      <Route path="admin/teachers" element={<ProtectedRoute roles={['admin']}><ManageTeachers /></ProtectedRoute>} />
      <Route path="admin/students" element={<ProtectedRoute roles={['admin']}><ManageStudents /></ProtectedRoute>} />
      <Route path="admin/classes" element={<ProtectedRoute roles={['admin']}><ManageClasses /></ProtectedRoute>} />
      <Route path="admin/departments" element={<ProtectedRoute roles={['admin']}><ManageDepartments /></ProtectedRoute>} />
      <Route path="admin/locations" element={<ProtectedRoute roles={['admin']}><ManageLocations /></ProtectedRoute>} />
      <Route path="admin/leaves" element={<ProtectedRoute roles={['admin']}><ManageLeaves /></ProtectedRoute>} />
      <Route path="admin/holidays" element={<ProtectedRoute roles={['admin']}><ManageHolidays /></ProtectedRoute>} />
      <Route path="admin/settings" element={<ProtectedRoute roles={['admin']}><Settings /></ProtectedRoute>} />
      <Route path="admin/reports" element={<ProtectedRoute roles={['admin']}><Reports /></ProtectedRoute>} />
    </Route></Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter></AuthProvider>;
}

import useAuth from './hooks/useAuth';
function RoleHome() { const { user } = useAuth(); return user?.role === 'admin' ? <AdminDashboard /> : <TeacherDashboard />; }

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
