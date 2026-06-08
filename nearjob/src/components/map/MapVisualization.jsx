import { useEffect, useState, useRef, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Target,
  Search,
  X,
  Briefcase,
  MapPin,
  Navigation,
  Loader2,
  Radio,
} from 'lucide-react';
import { API_BASE, logoKind } from '../../utils/api';

// ── Fix default marker icons ──────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ── CSS injected once for the pulse animation ─────────────────────────────────
const PULSE_CSS = `
@keyframes livePulse {
  0%   { transform: scale(1);   opacity: 0.9; }
  50%  { transform: scale(1.6); opacity: 0;   }
  100% { transform: scale(1);   opacity: 0;   }
}
.live-pulse-ring {
  position: absolute;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(59,130,246,0.5);
  animation: livePulse 1.8s ease-out infinite;
  top: -9px;
  left: -9px;
}
`;
if (!document.getElementById('nearjob-map-css')) {
  const s = document.createElement('style');
  s.id = 'nearjob-map-css';
  s.textContent = PULSE_CSS;
  document.head.appendChild(s);
}

// ── Marker icons ──────────────────────────────────────────────────────────────
const USER_ICON = L.divIcon({
  html: `<div style="position:relative;width:18px;height:18px;">
           <div class="live-pulse-ring"></div>
           <div style="background:#3b82f6;width:18px;height:18px;border-radius:50%;
                       border:3px solid white;box-shadow:0 0 0 3px rgba(59,130,246,0.3);
                       position:relative;z-index:1;"></div>
         </div>`,
  iconSize: [18, 18],
  className: '',
});

const COMPANY_ICON = L.divIcon({
  html: `<div style="background:#f59e0b;width:22px;height:22px;border-radius:50%;
                     border:3px solid white;box-shadow:0 4px 12px rgba(245,158,11,0.5);
                     display:flex;align-items:center;justify-content:center;font-size:10px;">
           🏢
         </div>`,
  iconSize: [22, 22],
  className: '',
});

const SELECTED_ICON = L.divIcon({
  html: `<div style="background:#10b981;width:26px;height:26px;border-radius:50%;
                     border:3px solid white;box-shadow:0 0 0 4px rgba(16,185,129,0.35),0 4px 14px rgba(16,185,129,0.5);
                     display:flex;align-items:center;justify-content:center;font-size:12px;">
           🏢
         </div>`,
  iconSize: [26, 26],
  className: '',
});

// ── Map mover — re-centres map whenever center changes ────────────────────────
const SetView = ({ center, zoom = 14 }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom);
  }, [center, map, zoom]);
  return null;
};

// ── Geocode a text address to {lat,lng} via Nominatim ────────────────────────
const geocodeCache = {};
async function geocodeAddress(address) {
  if (!address) return null;
  if (geocodeCache[address]) return geocodeCache[address];
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}&limit=1`
    );
    const d = await r.json();
    if (d[0]) {
      const result = { lat: parseFloat(d[0].lat), lng: parseFloat(d[0].lon) };
      geocodeCache[address] = result;
      return result;
    }
  } catch {}
  return null;
}

// ── Reverse-geocode {lat,lng} to display_name ─────────────────────────────────
async function reverseGeocode(lat, lng) {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const d = await r.json();
    return d.display_name || null;
  } catch {
    return null;
  }
}

// ── Open Google Maps navigation ───────────────────────────────────────────────
function openNavigation(fromLat, fromLng, toLat, toLng) {
  const url = `https://www.google.com/maps/dir/${fromLat},${fromLng}/${toLat},${toLng}`;
  window.open(url, '_blank');
}

// =============================================================================
const MapVisualization = ({ onContact }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [searchAddress, setSearchAddress] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isLive, setIsLive] = useState(false); // true = watchPosition active
  const [accuracy, setAccuracy] = useState(null);

  const watchIdRef = useRef(null);
  const mapCenterRef = useRef(null); // avoid re-centering after first fix

  // ── Start / stop live GPS tracking ─────────────────────────────────────────
  const startLiveTracking = useCallback(() => {
    if (!navigator.geolocation) return;
    stopLiveTracking();
    setIsLive(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy: acc } = pos.coords;
        setAccuracy(Math.round(acc));

        setUserLocation((prev) => {
          // Keep the address label from the first fix, update coords silently
          const address = prev?.address || null;
          return { lat, lng, address };
        });

        // Only reverse-geocode once (first fix)
        if (!mapCenterRef.current) {
          mapCenterRef.current = true;
          const addr = await reverseGeocode(lat, lng);
          if (addr) {
            setUserLocation((prev) => ({ ...prev, address: addr }));
            setSearchAddress(addr);
          }
          setLoading(false);
        }
      },
      () => {
        // Fallback if permission denied
        setUserLocation({ lat: 40.7128, lng: -74.006, address: 'New York City (fallback)' });
        setIsLive(false);
        setLoading(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  }, []);

  const stopLiveTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsLive(false);
  }, []);

  // ── Start tracking on mount, stop on unmount ────────────────────────────────
  useEffect(() => {
    startLiveTracking();
    return () => stopLiveTracking();
  }, [startLiveTracking, stopLiveTracking]);

  // ── Fetch real companies and geocode their addresses ────────────────────────
  useEffect(() => {
    const fetchAndGeocode = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users?userType=company`);
        const raw = await res.json();
        const list = raw?.data || raw || [];
        if (!Array.isArray(list)) return;

        const baseLat = userLocation?.lat || 40.7128;
        const baseLng = userLocation?.lng || -74.006;

        const geocoded = await Promise.all(
          list.map(async (c) => {
            // 1️⃣ Already has real GPS coords — use them
            if (c.latitude && c.longitude) {
              return { ...c, lat: parseFloat(c.latitude), lng: parseFloat(c.longitude), hasRealCoords: true };
            }
            // 2️⃣ Has a text address — geocode it
            if (c.location && c.location.trim().length > 3) {
              const coords = await geocodeAddress(c.location);
              if (coords) return { ...c, lat: coords.lat, lng: coords.lng, hasRealCoords: true };
            }
            // 3️⃣ No location data — jitter around user for demo
            return {
              ...c,
              lat: baseLat + (Math.random() - 0.5) * 0.04,
              lng: baseLng + (Math.random() - 0.5) * 0.04,
              hasRealCoords: false,
            };
          })
        );

        setCompanies(geocoded);
      } catch (err) {
        console.error('[MAP] Failed to load companies:', err);
      }
    };

    // Run once userLocation is set
    if (userLocation) fetchAndGeocode();
  }, [!!userLocation]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Address search ──────────────────────────────────────────────────────────
  const searchLocation = async () => {
    if (!searchAddress.trim()) return;
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchAddress
        )}&limit=5`
      );
      setSuggestions(await r.json());
    } catch {}
  };

  const selectSuggestion = (s) => {
    setUserLocation({ lat: parseFloat(s.lat), lng: parseFloat(s.lon), address: s.display_name });
    setSearchAddress(s.display_name);
    setSuggestions([]);
    stopLiveTracking(); // manual override stops live
  };

  // ── Selected company route ──────────────────────────────────────────────────
  const routePoints =
    selectedCompany && userLocation
      ? [
          [userLocation.lat, userLocation.lng],
          [selectedCompany.lat, selectedCompany.lng],
        ]
      : null;

  // ─────────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 h-[520px] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm">Acquiring your live location…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-2 h-[520px] relative overflow-hidden">

      {/* ── Search bar ─────────────────────────────────────────────────────── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-80">
        <div className="relative">
          <div className="flex gap-2">
            {/* Live-locate button */}
            <button
              onClick={isLive ? stopLiveTracking : startLiveTracking}
              title={isLive ? 'Stop live tracking' : 'Start live tracking'}
              className={`p-2 rounded-xl border backdrop-blur-sm transition-all ${
                isLive
                  ? 'bg-blue-600/90 text-white border-blue-400 shadow-lg shadow-blue-500/30'
                  : 'bg-black/80 text-white border-white/20 hover:border-blue-500'
              }`}
            >
              {isLive ? (
                <Radio className="w-5 h-5 animate-pulse" />
              ) : (
                <Target className="w-5 h-5" />
              )}
            </button>

            <div className="relative flex-1">
              <input
                type="text"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                placeholder="Search address…"
                className="w-full px-4 py-2 bg-black/80 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 transition-all"
              />
              {searchAddress && (
                <button
                  onClick={() => setSearchAddress('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              onClick={searchLocation}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Suggestions dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-black/90 backdrop-blur-sm border border-white/20 rounded-xl max-h-60 overflow-y-auto z-[1001]">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => selectSuggestion(s)}
                  className="w-full text-left px-4 py-2 text-white text-sm hover:bg-white/10 transition"
                >
                  {s.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Map ────────────────────────────────────────────────────────────── */}
      <MapContainer
        center={userLocation}
        zoom={14}
        style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
        scrollWheelZoom
        zoomControl
      >
        {/* Only re-centre once on first live fix; manual search always re-centres */}
        {!isLive && <SetView center={userLocation} />}

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ── User location ──────────────────────────────────────────────── */}
        {userLocation && (
          <>
            <Circle
              center={userLocation}
              radius={accuracy || 40}
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.12, weight: 1.5 }}
            />
            <Marker position={userLocation} icon={USER_ICON}>
              <Popup>
                <div className="text-center min-w-[180px]">
                  <p className="font-bold text-sm mb-1">📍 Your live location</p>
                  <p className="text-xs text-gray-500 break-words max-w-[200px]">
                    {userLocation.address ||
                      `${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}`}
                  </p>
                  {accuracy && (
                    <p className="text-xs text-blue-500 mt-1">Accuracy: ±{accuracy} m</p>
                  )}
                  {isLive && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 mt-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      LIVE
                    </span>
                  )}
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* ── Route line to selected company ─────────────────────────────── */}
        {routePoints && (
          <Polyline
            positions={routePoints}
            pathOptions={{
              color: '#10b981',
              weight: 3,
              dashArray: '8 6',
              opacity: 0.85,
            }}
          />
        )}

        {/* ── Company markers ────────────────────────────────────────────── */}
        {companies.map((company) => (
          <Marker
            key={company.id}
            position={[company.lat, company.lng]}
            icon={selectedCompany?.id === company.id ? SELECTED_ICON : COMPANY_ICON}
          >
            <Popup className="premium-map-popup">
              <div className="min-w-[230px] p-2 bg-slate-900 text-white rounded-2xl">
                {/* Header */}
                <div className="flex items-center gap-3 mb-3 border-b border-white/10 pb-2">
                  {logoKind(company.logo) === 'url' ? (
                    <img src={company.logo} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <span className="text-2xl w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg">
                      {company.logo || '🏢'}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="font-black text-amber-400 truncate text-xs uppercase tracking-widest">
                      {company.companyName || company.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold truncate uppercase">
                      {company.industry || 'Tech Sector'}
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-start gap-2 text-[10px] font-bold text-slate-300">
                    <MapPin className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span className="break-words">
                      {company.location || 'Remote HQ'}
                      {!company.hasRealCoords && (
                        <span className="text-yellow-500 ml-1">(approx.)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400">
                    <Briefcase className="w-3 h-3" />
                    {company.companySize || 'verified'} squad size
                  </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedCompany(company)}
                    className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    View HQ
                  </button>
                  {userLocation && (
                    <button
                      onClick={() =>
                        openNavigation(
                          userLocation.lat,
                          userLocation.lng,
                          company.lat,
                          company.lng
                        )
                      }
                      className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1"
                    >
                      <Navigation className="w-3 h-3" /> Go
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* ── Legend ─────────────────────────────────────────────────────────── */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ring-2 ring-white/50 ${
                isLive ? 'bg-blue-500 animate-pulse' : 'bg-blue-400'
              }`}
            />
            <span className="text-white">
              You {isLive && <span className="text-blue-400 font-bold">(LIVE)</span>}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full ring-2 ring-white/50 animate-pulse" />
            <span className="text-white">Companies ({companies.length})</span>
          </div>
          {selectedCompany && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white/50" />
              <span className="text-emerald-400">Route</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Accuracy badge ─────────────────────────────────────────────────── */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5">
        {isLive ? (
          <p className="text-white text-xs flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Live GPS {accuracy ? `±${accuracy}m` : '…'}
          </p>
        ) : (
          <p className="text-white text-xs">📍 Manual mode</p>
        )}
      </div>

      {/* ── Selected Company Modal ──────────────────────────────────────────── */}
      {selectedCompany && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[2000]"
          onClick={() => setSelectedCompany(null)}
        >
          <div
            className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 max-w-sm w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Logo + name */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-4 border border-white/10 shadow-xl overflow-hidden">
                {logoKind(selectedCompany.logo) === 'url' ? (
                  <img src={selectedCompany.logo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">{selectedCompany.logo || '🏢'}</span>
                )}
              </div>
              <h3 className="text-2xl font-black text-white">
                {selectedCompany.companyName || selectedCompany.name}
              </h3>
              <p className="text-amber-500 text-xs font-black uppercase tracking-[0.2em] mt-1">
                {selectedCompany.industry || 'Global Entity'}
              </p>
            </div>

            {/* Info cards */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="text-left min-w-0">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Address
                  </p>
                  <p className="text-sm text-slate-200 font-medium break-words">
                    {selectedCompany.location || 'Distributed'}
                    {!selectedCompany.hasRealCoords && (
                      <span className="text-yellow-500 text-xs ml-1">(approx.)</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                <Briefcase className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Team size
                  </p>
                  <p className="text-sm text-slate-200 font-medium">
                    {selectedCompany.companySize || 'Verified Scale'}
                  </p>
                </div>
              </div>

              {/* Distance indicator */}
              {userLocation && (
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <Navigation className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Straight-line distance
                    </p>
                    <p className="text-sm text-slate-200 font-medium">
                      {calcDistanceKm(
                        userLocation.lat,
                        userLocation.lng,
                        selectedCompany.lat,
                        selectedCompany.lng
                      )} km away
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setSelectedCompany(null)}
                className="py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Back
              </button>
              {userLocation && (
                <button
                  onClick={() =>
                    openNavigation(
                      userLocation.lat,
                      userLocation.lng,
                      selectedCompany.lat,
                      selectedCompany.lng
                    )
                  }
                  className="py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.95] transition-all flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Navigate
                </button>
              )}
              <button
                onClick={() => onContact?.(selectedCompany)}
                className="py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.95] transition-all"
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Haversine distance ────────────────────────────────────────────────────────
function calcDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}
function deg2rad(d) { return d * (Math.PI / 180); }

export default MapVisualization;