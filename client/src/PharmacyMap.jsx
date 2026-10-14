import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

export default function PharmacyMap({ pharmacies, highlightCity }) {
  const withCoords = pharmacies.filter(p => p.latitude != null && p.longitude != null);
  const center = withCoords.length
    ? [withCoords[0].latitude, withCoords[0].longitude]
    : [21.1702, 72.8311];

  return (
    <div className="map-wrap">
      <MapContainer center={center} zoom={12} scrollWheelZoom={false} className="pharmacy-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withCoords.map(p => (
          <Marker key={p.id} position={[p.latitude, p.longitude]}>
            <Popup>
              <strong>{p.name}</strong>
              <br />
              {p.address}, {p.city}
              {highlightCity && p.city.toLowerCase().includes(highlightCity.toLowerCase()) ? (
                <><br /><em>Matches your city filter</em></>
              ) : null}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {!withCoords.length && <p className="map-hint">Map markers appear when pharmacy locations are stored in the cloud database.</p>}
    </div>
  );
}
