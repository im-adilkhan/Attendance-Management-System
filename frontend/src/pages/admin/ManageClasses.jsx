import ResourcePage from '../../components/common/ResourcePage';
export default function ManageClasses() { return <ResourcePage title="Classes" endpoint="/admin/classes" fields={[{ name: 'name', label: 'Class name' }, { name: 'section', label: 'Section' }, { name: 'academic_year', label: 'Academic year' }]} />; }
