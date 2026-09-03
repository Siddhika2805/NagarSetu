import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { issueService } from '../services/api';
import { MapPoint, IssueType, IssueStatus } from '../types';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { MapPin, Filter, Search, Eye, Cpu, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

// Custom Marker Icons by Category
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px ${color};"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
};

const categoryColors: Record<string, string> = {
  'Pothole': '#ef4444',             // Red
  'Garbage Accumulation': '#f97316',// Orange
  'Waterlogging': '#3b82f6',        // Blue
  'Broken Streetlight': '#eab308',   // Yellow
  'Open Manhole': '#d946ef',        // Magenta
  'Road Damage': '#f43f5e',         // Rose
};

export const PublicIssueMapPage: React.FC = () => {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadMapData = async () => {
    setLoading(true);
    try {
      const data = await issueService.getMapData();
      setPoints(data);
    } catch (err) {
      console.error('Failed to load map data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapData();
  }, []);

  const filteredPoints = points.filter((pt) => {
    if (selectedType !== 'ALL' && pt.issue_type !== selectedType) return false;
    if (selectedStatus !== 'ALL' && pt.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = pt.title.toLowerCase().includes(q);
      const matchAddress = pt.address?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchAddress) return false;
    }
    return true;
  });

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col relative overflow-hidden bg-slate-950">
      {/* Filter Header Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-4 z-20">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">Public Infrastructure Issue Map</h1>
              <p className="text-xs text-slate-400">Real-time geographic visualization of reported defects</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search area/landmark..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 w-44 sm:w-56"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All AI Categories</option>
              {Object.values(IssueType).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Statuses</option>
              {Object.values(IssueStatus).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <button
              onClick={loadMapData}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Refresh Map Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div className="flex-1 relative z-10">
        <MapContainer
          center={[28.6139, 77.2090]}
          zoom={13}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredPoints.map((pt) => {
            const markerColor = categoryColors[pt.issue_type] || '#10b981';
            return (
              <Marker
                key={pt.id}
                position={[pt.latitude, pt.longitude]}
                icon={createCustomIcon(markerColor)}
              >
                <Popup minWidth={260} maxWidth={320}>
                  <div className="p-1 space-y-2">
                    {pt.image_url && (
                      <div className="rounded-lg overflow-hidden max-h-32">
                        <img src={pt.image_url} alt={pt.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wide">
                          {pt.issue_type}
                        </span>
                        <StatusBadge status={pt.status} />
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{pt.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{pt.address}</p><p className="text-[10px] text-slate-500 mt-1">Severity: {pt.severity} · Department: {pt.department || 'Pending'} · Reported: {new Date(pt.created_at).toLocaleDateString()}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-700">
                      <PriorityBadge score={pt.priority_score} severity={pt.severity} />
                      <Link
                        to={`/issue/${pt.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:underline"
                      >
                        View Public Details <Eye className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Floating Map Legend */}
        <div className="absolute bottom-6 right-6 z-20 glass-panel p-4 rounded-2xl border border-slate-800 hidden sm:block max-w-xs">
          <h4 className="text-xs font-bold text-slate-200 mb-2">Category Color Codes</h4>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
            {Object.entries(categoryColors).map(([cat, col]) => (
              <div key={cat} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col }} />
                <span>{cat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
