import ResourcePage from '../../components/common/ResourcePage';
export default function ManageHolidays() { return <ResourcePage title="Holidays" endpoint="/admin/holidays" fields={[{ name: 'name', label: 'Holiday name' }, { name: 'date', label: 'Date', type: 'date' }, { name: 'description', label: 'Description', required: false }]} />; }
