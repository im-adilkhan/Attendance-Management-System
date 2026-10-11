import ResourcePage from '../../components/common/ResourcePage';
export default function ManageTeachers() { return <ResourcePage title="Teachers" endpoint="/admin/teachers" fields={[{ name: 'full_name', label: 'Full name' }, { name: 'email', label: 'Email', type: 'email' }, { name: 'employee_number', label: 'Employee ID' }, { name: 'password', label: 'Initial password', type: 'password' }]} />; }
