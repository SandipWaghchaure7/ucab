import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { X, MapPin, Navigation } from 'lucide-react';

// ── Fix default marker icons (leaflet bug fix) ────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Custom yellow marker (pickup) ─────────────────────
const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:   [25, 41],
  iconAnchor: [12, 41],
  popupAnchor:[1, -34],
});

// ── Custom red marker (dropoff) ───────────────────────
const dropoffIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize:   [25, 41],
  iconAnchor: [12, 41],
  popupAnchor:[1, -34],
});

// ── Default center: Pune, India ───────────────────────
const DEFAULT_CENTER = [18.5204, 73.8567];

// ── Get address from coordinates (Nominatim - Free) ───
const reverseGeocode = async (lat, lng) => {
  try {
    const res  = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};

// ── Search address (Nominatim - Free) ─────────────────
const searchAddress = async (query) => {
  try {
    const res  = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=in`
    );
    return await res.json();
  } catch {
    return [];
  }
};

// ── Get route between two points (OSRM - Free) ────────
const getRoute = async (pickup, dropoff) => {
  try {
    const res  = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?overview=full&geometries=geojson`
    );
    const data = await res.json();
    if (data.code !== 'Ok') return null;

    const route       = data.routes[0];
    const distanceKm  = parseFloat((route.distance / 1000).toFixed(2));
    const durationMin = Math.ceil(route.duration / 60);
    const coords      = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

    return { distanceKm, durationMin, coords,
      distanceText: `${distanceKm} km`,
      durationText: durationMin < 60
        ? `${durationMin} mins`
        : `${Math.floor(durationMin/60)}h ${durationMin%60}m`
    };
  } catch {
    return null;
  }
};

// ── Map click handler component ───────────────────────
function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: onMapClick });
  return null;
}

// ── Auto fit map to markers ───────────────────────────
function FitBounds({ pickup, dropoff }) {
  const map = useMap();
  useEffect(() => {
    if (pickup && dropoff) {
      map.fitBounds([
        [pickup.lat,  pickup.lng],
        [dropoff.lat, dropoff.lng]
      ], { padding: [40, 40] });
    } else if (pickup) {
      map.setView([pickup.lat, pickup.lng], 14);
    }
  }, [pickup, dropoff, map]);
  return null;
}

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════
export default function MapPicker({ onLocationSelect }) {
  const [pickup,       setPickup]       = useState(null);
  const [dropoff,      setDropoff]      = useState(null);
  const [routeCoords,  setRouteCoords]  = useState([]);
  const [routeInfo,    setRouteInfo]    = useState(null);
  const [loading,      setLoading]      = useState(false);

  // Search states
  const [pickupQuery,  setPickupQuery]  = useState('');
  const [dropoffQuery, setDropoffQuery] = useState('');
  const [pickupResults, setPickupResults]   = useState([]);
  const [dropoffResults,setDropoffResults]  = useState([]);
  const [searchingPickup, setSearchingPickup]   = useState(false);
  const [searchingDropoff,setSearchingDropoff]  = useState(false);

  const pickupTimer  = useRef(null);
  const dropoffTimer = useRef(null);

  // ── Calculate route when both set ──────────────────
  useEffect(() => {
    if (pickup && dropoff) {
      calculateRoute(pickup, dropoff);
    }
  }, [pickup, dropoff]);

  const calculateRoute = async (p, d) => {
    setLoading(true);
    const result = await getRoute(p, d);
    if (result) {
      setRouteCoords(result.coords);
      setRouteInfo(result);
      onLocationSelect({
        pickupAddress:  p.address,
        dropoffAddress: d.address,
        pickupLat:      p.lat,
        pickupLng:      p.lng,
        dropoffLat:     d.lat,
        dropoffLng:     d.lng,
        distanceKm:     result.distanceKm,
        durationMin:    result.durationMin,
        distanceText:   result.distanceText,
        durationText:   result.durationText,
      });
    }
    setLoading(false);
  };

  // ── Map click ───────────────────────────────────────
  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    setLoading(true);
    const address = await reverseGeocode(lat, lng);

    if (!pickup) {
      setPickup({ lat, lng, address });
      setPickupQuery(address);
    } else if (!dropoff) {
      setDropoff({ lat, lng, address });
      setDropoffQuery(address);
    }
    setLoading(false);
  };

  // ── Pickup search with debounce ─────────────────────
  const handlePickupSearch = (value) => {
    setPickupQuery(value);
    clearTimeout(pickupTimer.current);
    if (value.length < 3) { setPickupResults([]); return; }
    setSearchingPickup(true);
    pickupTimer.current = setTimeout(async () => {
      const results = await searchAddress(value);
      setPickupResults(results);
      setSearchingPickup(false);
    }, 500);
  };

  // ── Dropoff search with debounce ────────────────────
  const handleDropoffSearch = (value) => {
    setDropoffQuery(value);
    clearTimeout(dropoffTimer.current);
    if (value.length < 3) { setDropoffResults([]); return; }
    setSearchingDropoff(true);
    dropoffTimer.current = setTimeout(async () => {
      const results = await searchAddress(value);
      setDropoffResults(results);
      setSearchingDropoff(false);
    }, 500);
  };

  // ── Select from search results ──────────────────────
  const selectPickup = (result) => {
    const loc = {
      lat:     parseFloat(result.lat),
      lng:     parseFloat(result.lon),
      address: result.display_name
    };
    setPickup(loc);
    setPickupQuery(result.display_name);
    setPickupResults([]);
  };

  const selectDropoff = (result) => {
    const loc = {
      lat:     parseFloat(result.lat),
      lng:     parseFloat(result.lon),
      address: result.display_name
    };
    setDropoff(loc);
    setDropoffQuery(result.display_name);
    setDropoffResults([]);
  };

  // ── Reset ────────────────────────────────────────────
  const reset = () => {
    setPickup(null);
    setDropoff(null);
    setRouteCoords([]);
    setRouteInfo(null);
    setPickupQuery('');
    setDropoffQuery('');
    setPickupResults([]);
    setDropoffResults([]);
    onLocationSelect(null);
  };

  // ── Dropdown style ───────────────────────────────────
  const dropdownStyle = {
    position:   'absolute', top: '100%', left: 0, right: 0,
    background: '#1A1A1A', border: '1px solid #2A2A2A',
    borderRadius: 10, zIndex: 9999, maxHeight: 200,
    overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
  };

  const dropdownItemStyle = (hover) => ({
    padding: '10px 14px', cursor: 'pointer', fontSize: 13,
    color: hover ? '#F5C518' : '#CCCCCC',
    borderBottom: '1px solid #2A2A2A',
    background: hover ? 'rgba(245,197,24,0.06)' : 'transparent',
    transition: 'all 0.15s'
  });

  return (
    <div>

      {/* ── Search Inputs ─────────────────────────────── */}
      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:14 }}>

        {/* Pickup Search */}
        <div style={{ position:'relative' }}>
          <div style={{ position:'relative' }}>
            <span style={{
              position:'absolute', left:13, top:'50%',
              transform:'translateY(-50%)', fontSize:16
            }}>🟡</span>
            <input
              style={{
                width:'100%', boxSizing:'border-box',
                background:'#111111',
                border:`1.5px solid ${pickup ? '#F5C518' : '#2A2A2A'}`,
                borderRadius:12, padding:'13px 14px 13px 38px',
                color:'#F0F0F0', fontFamily:'DM Sans',
                fontSize:14, outline:'none', transition:'border 0.2s'
              }}
              placeholder="📍 Search pickup location..."
              value={pickupQuery}
              onChange={e => handlePickupSearch(e.target.value)}
            />
            {searchingPickup && (
              <span style={{
                position:'absolute', right:14, top:'50%',
                transform:'translateY(-50%)',
                color:'#888', fontSize:12
              }}>searching...</span>
            )}
          </div>
          {/* Pickup Dropdown */}
          {pickupResults.length > 0 && (
            <div style={dropdownStyle}>
              {pickupResults.map((r, i) => (
                <div
                  key={i}
                  style={dropdownItemStyle(false)}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(245,197,24,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  onClick={() => selectPickup(r)}
                >
                  📍 {r.display_name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dropoff Search */}
        <div style={{ position:'relative' }}>
          <div style={{ position:'relative' }}>
            <span style={{
              position:'absolute', left:13, top:'50%',
              transform:'translateY(-50%)', fontSize:16
            }}>🔴</span>
            <input
              style={{
                width:'100%', boxSizing:'border-box',
                background:'#111111',
                border:`1.5px solid ${dropoff ? '#FF4444' : '#2A2A2A'}`,
                borderRadius:12, padding:'13px 14px 13px 38px',
                color:'#F0F0F0', fontFamily:'DM Sans',
                fontSize:14, outline:'none', transition:'border 0.2s'
              }}
              placeholder="🏁 Search drop-off location..."
              value={dropoffQuery}
              onChange={e => handleDropoffSearch(e.target.value)}
            />
            {searchingDropoff && (
              <span style={{
                position:'absolute', right:14, top:'50%',
                transform:'translateY(-50%)',
                color:'#888', fontSize:12
              }}>searching...</span>
            )}
          </div>
          {/* Dropoff Dropdown */}
          {dropoffResults.length > 0 && (
            <div style={dropdownStyle}>
              {dropoffResults.map((r, i) => (
                <div
                  key={i}
                  style={dropdownItemStyle(false)}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(245,197,24,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  onClick={() => selectDropoff(r)}
                >
                  🏁 {r.display_name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Map ───────────────────────────────────────── */}
      <div style={{ borderRadius:14, overflow:'hidden', border:'1px solid #2A2A2A' }}>
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={12}
          style={{ height:'340px', width:'100%' }}
          zoomControl={true}
        >
          {/* Dark OpenStreetMap tiles */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          />

          <MapClickHandler onMapClick={handleMapClick} />
          <FitBounds pickup={pickup} dropoff={dropoff} />

          {/* Pickup Marker */}
          {pickup && (
            <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
              <Popup>
                <b>📍 Pickup</b><br/>
                {pickup.address.substring(0, 60)}...
              </Popup>
            </Marker>
          )}

          {/* Dropoff Marker */}
          {dropoff && (
            <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffIcon}>
              <Popup>
                <b>🏁 Drop-off</b><br/>
                {dropoff.address.substring(0, 60)}...
              </Popup>
            </Marker>
          )}

          {/* Route Line */}
          {routeCoords.length > 0 && (
            <Polyline
              positions={routeCoords}
              color="#F5C518"
              weight={4}
              opacity={0.8}
            />
          )}
        </MapContainer>
      </div>

      {/* ── Route Info Bar ────────────────────────────── */}
      {routeInfo && (
        <div style={{
          marginTop:12, padding:'12px 16px',
          background:'rgba(245,197,24,0.08)',
          border:'1px solid rgba(245,197,24,0.3)',
          borderRadius:12,
          display:'flex', justifyContent:'space-between', alignItems:'center'
        }}>
          <div style={{ display:'flex', gap:24 }}>
            <div>
              <div style={{ color:'#888', fontSize:11, marginBottom:2 }}>
                DISTANCE
              </div>
              <div style={{
                color:'#F5C518', fontFamily:'Syne',
                fontWeight:700, fontSize:18
              }}>
                {routeInfo.distanceText}
              </div>
            </div>
            <div>
              <div style={{ color:'#888', fontSize:11, marginBottom:2 }}>
                DURATION
              </div>
              <div style={{
                color:'#F5C518', fontFamily:'Syne',
                fontWeight:700, fontSize:18
              }}>
                {routeInfo.durationText}
              </div>
            </div>
          </div>
          <button
            onClick={reset}
            style={{
              background:'transparent',
              border:'1px solid #2A2A2A',
              borderRadius:8, padding:'6px 12px',
              color:'#888', cursor:'pointer',
              display:'flex', alignItems:'center',
              gap:6, fontSize:12
            }}>
            <X size={12} /> Reset
          </button>
        </div>
      )}

      {/* ── Loading ───────────────────────────────────── */}
      {loading && (
        <p style={{
          textAlign:'center', color:'#888',
          fontSize:12, marginTop:10
        }}>
          🔄 {!pickup ? 'Getting location...' : 'Calculating route...'}
        </p>
      )}

      {/* ── Hints ─────────────────────────────────────── */}
      {!pickup && !loading && (
        <p style={{
          textAlign:'center', color:'#888',
          fontSize:12, marginTop:10
        }}>
          💡 Type address in search box OR click directly on the map
        </p>
      )}
      {pickup && !dropoff && !loading && (
        <p style={{
          textAlign:'center', color:'#F5C518',
          fontSize:12, marginTop:10
        }}>
          ✅ Pickup set! Now search or click drop-off location
        </p>
      )}
    </div>
  );
}