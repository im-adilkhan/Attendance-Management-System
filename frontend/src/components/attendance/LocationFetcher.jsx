export default function LocationFetcher({ geo, onFetch }) {
  return <section className="location-card"><button type="button" onClick={onFetch} disabled={geo.loading}>{geo.loading ? 'Finding location…' : 'Get current location'}</button>
    {geo.location && <p>{geo.location.latitude.toFixed(6)}, {geo.location.longitude.toFixed(6)}</p>}
    {geo.address && <p className="muted">{geo.address}</p>}{geo.error && <p role="alert" className="error-text">{geo.error}</p>}</section>;
}
