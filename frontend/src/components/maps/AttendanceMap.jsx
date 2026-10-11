import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import markerUrl from 'leaflet/dist/images/marker-icon.png';
import markerRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';
const markerIcon = new L.Icon({
  iconUrl: markerUrl, iconRetinaUrl: markerRetinaUrl, shadowUrl: markerShadowUrl,
  iconSize: [25, 41], iconAnchor: [12, 41],
});
export default function AttendanceMap({ records }) {
  const points = records.filter((row) => row.in_lat != null && row.in_lng != null);
  const center = points.length ? [Number(points[0].in_lat), Number(points[0].in_lng)] : [20.5937, 78.9629];
  return <MapContainer center={center} zoom={points.length ? 13 : 4} scrollWheelZoom className="attendance-map">
    <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    {points.map((row) => <Marker key={row.id} icon={markerIcon} position={[Number(row.in_lat), Number(row.in_lng)]}>
      <Popup>{row.in_email}<br />{new Date(row.in_time || row.check_in_at).toLocaleString()}<br />{row.in_address || ''}</Popup></Marker>)}
  </MapContainer>;
}
