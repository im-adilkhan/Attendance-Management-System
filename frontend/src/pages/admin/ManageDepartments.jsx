import ResourcePage from '../../components/common/ResourcePage';
export default function ManageDepartments() { return <ResourcePage title="Departments" endpoint="/admin/departments" fields={[{ name: 'name', label: 'Department name' }, { name: 'code', label: 'Department code' }]} />; }
