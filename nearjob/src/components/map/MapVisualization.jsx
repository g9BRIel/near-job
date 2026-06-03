import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Target, Search, X, Briefcase, MapPin } from 'lucide-react';
import { API_BASE, logoKind } from '../../utils/api';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const SetViewOnLocation = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);
  return null;
};

const MapVisualization = ({ onContact }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [searchAddress, setSearchAddress] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [findingMe, setFindingMe] = useState(false);

  const locateUser = () => {
    setFindingMe(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          
          // Try to get address for the GPS point
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data.display_name) {
              setUserLocation(prev => ({ ...prev, address: data.display_name }));
              setSearchAddress(data.display_name);
            }
          } catch (e) {}
          
          setFindingMe(false);
          setLoading(false);
        },
        () => {
          setUserLocation({ lat: 40.7128, lng: -74.0060, address: 'Default: New York City' });
          setFindingMe(false);
          setLoading(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setUserLocation({ lat: 40.7128, lng: -74.0060 });
      setLoading(false);
    }
  };

  useEffect(() => {
    locateUser();
    
    // Fetch REAL companies
    const fetchCompanies = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users?userType=company`);
        const companiesRaw = await res.json();
        const companiesList = companiesRaw?.data || companiesRaw || [];
        
        // Filter those with coords, or generate random ones nearby for demo/testing if they're null 
        // (In production we'll require them upon profile completion)
        const mapped = (Array.isArray(companiesList) ? companiesList : []).map(c => {
          // If no lat/lng, jitter around user or default NYC
          const baseLat = userLocation?.lat || 40.7128;
          const baseLng = userLocation?.lng || -74.0060;
          
          return {
            ...c,
            lat: c.latitude || (baseLat + (Math.random() - 0.5) * 0.05),
            lng: c.longitude || (baseLng + (Math.random() - 0.5) * 0.05)
          };
        });
        setCompanies(mapped);
      } catch (err) {
        console.error('Failed to fetch companies for map:', err);
      }
    };
    fetchCompanies();
  }, [userLocation?.lat, userLocation?.lng]);

  // Search for address using OpenStreetMap Nominatim
  const searchLocation = async () => {
    if (!searchAddress.trim()) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=5`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const selectLocation = (location) => {
    setUserLocation({
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lon),
      address: location.display_name
    });
    setSearchAddress(location.display_name);
    setSuggestions([]);
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-400">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-2 h-[500px] relative overflow-hidden">
      {/* Search Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-80">
        <div className="relative">
          <div className="flex gap-2">
            <button 
              onClick={locateUser}
              className={`p-2 rounded-xl border bg-black/80 backdrop-blur-sm transition-all ${findingMe ? 'text-blue-500 animate-pulse border-blue-500' : 'text-white border-white/20 hover:border-blue-500'}`}
              title="Locate Me"
            >
              <Target className="w-5 h-5" />
            </button>
            <div className="relative flex-1">
              <input
                type="text"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                placeholder="Search precise address..."
                className="w-full px-4 py-2 bg-black/80 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 transition-all"
              />
              {searchAddress && (
                <button onClick={() => setSearchAddress('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
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
          
          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-black/90 backdrop-blur-sm border border-white/20 rounded-xl max-h-60 overflow-y-auto z-[1001]">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => selectLocation(suggestion)}
                  className="w-full text-left px-4 py-2 text-white text-sm hover:bg-white/10 transition"
                >
                  {suggestion.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <MapContainer
        center={userLocation}
        zoom={15}
        style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <SetViewOnLocation center={userLocation} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User Location */}
        <Circle
          center={userLocation}
          radius={30}
          pathOptions={{
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.2,
            weight: 2
          }}
        />
        <Marker
          position={userLocation}
          icon={L.divIcon({
            html: `<div style="background-color: #3b82f6; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 3px rgba(59,130,246,0.4);"></div>`,
            iconSize: [18, 18],
            className: 'custom-marker'
          })}
        >
          <Popup>
            <div className="text-center">
              <p className="font-semibold text-sm">📍 Your Location</p>
              <p className="text-xs text-gray-500 max-w-[200px] break-words">
                {userLocation.address || `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`}
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Active Companies */}
        {companies.map((company) => (
          <Marker
            key={company.id}
            position={[company.lat, company.lng]}
            icon={L.divIcon({
              html: `<div style="background-color: #f59e0b; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(245,158,11,0.4); cursor: pointer; display: flex; align-items: center; justify-center; overflow: hidden;"><span style="font-size: 8px;">🏢</span></div>`,
              iconSize: [16, 16],
              className: 'company-marker'
            })}
          >
            <Popup className="premium-map-popup">
              <div className="min-w-[220px] p-2 bg-slate-900 text-white rounded-2xl">
                <div className="flex items-center gap-3 mb-3 border-b border-white/10 pb-2">
                  {logoKind(company.logo) === 'url' ? (
                    <img src={company.logo} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <span className="text-2xl w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg">{company.logo || '🏢'}</span>
                  )}
                  <div className="min-w-0">
                    <p className="font-black text-amber-500 truncate text-xs uppercase tracking-widest">{company.companyName || company.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold truncate uppercase">{company.industry || 'Tech Sector'}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                    <MapPin className="w-3 h-3 text-blue-500" /> {company.location || 'Remote HQ'}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400">
                    <Briefcase className="w-3 h-3" /> {company.employees || 'verified'} squad size
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCompany(company)}
                  className="w-full px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Inspect HQ
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full ring-2 ring-white/50"></div>
            <span className="text-white">You</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full ring-2 ring-white/50 animate-pulse"></div>
            <span className="text-white">Active HQs ({companies.length})</span>
          </div>
        </div>
      </div>

      {/* Instruction */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5">
        <p className="text-white text-xs">🔍 Search your exact address above</p>
      </div>

      {/* Selected Company Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[2000]" onClick={() => setSelectedCompany(null)}>
          <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 max-w-sm w-full mx-4 shadow-2xl animate-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-4 border border-white/10 shadow-xl overflow-hidden">
                {logoKind(selectedCompany.logo) === 'url' ? (
                  <img src={selectedCompany.logo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">{selectedCompany.logo || '🏢'}</span>
                )}
              </div>
              <h3 className="text-2xl font-black text-white">{selectedCompany.companyName || selectedCompany.name}</h3>
              <p className="text-amber-500 text-xs font-black uppercase tracking-[0.2em] mt-1">{selectedCompany.industry || 'Global Entity'}</p>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                <MapPin className="w-5 h-5 text-blue-500" />
                <div className="text-left">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Base of Operations</p>
                  <p className="text-sm text-slate-200 font-medium">{selectedCompany.location || 'Distributed'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                <Target className="w-5 h-5 text-emerald-500" />
                <div className="text-left">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Personnel Count</p>
                  <p className="text-sm text-slate-200 font-medium">{selectedCompany.employees || 'Verified Scale'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setSelectedCompany(null)}
                className="py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Retreat
              </button>
              <button 
                onClick={() => onContact?.(selectedCompany)}
                className="py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.95] transition-all"
              >
                Contact HQ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapVisualization;