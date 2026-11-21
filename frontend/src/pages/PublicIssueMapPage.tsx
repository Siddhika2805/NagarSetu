import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { issueService, analyticsService } from '../services/api';
import { MapPoint, IssueType, IssueStatus, PredictiveHotspot } from '../types';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { MapPin, Filter, Search, Eye, Cpu, RefreshCw, Flame, Users, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const createCustomIcon = (color: string, isOverdue: boolean = false) => {
  const borderCol = isOverdue ? '#ef4444' : '#ffffff';
  const shadow = isOverdue ? 'box-shadow: 0 0 8px #ef4444;' : 'box-shadow: 0 2px 4px rgba(0,0,0,0.2);';
  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 2.5px solid ${borderCol}; ${shadow}"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
};

const categoryColors: Record<string, string> = {
  'Pothole': '#ea580c',
  'Damaged Road': '#c2410c',
  'Garbage Accumulation': '#d97706',
  'Overflowing Dustbin': '#b45309',
  'Water Leakage': '#0284c7',
  'Drainage Blockage': '#7c3aed',
  'Waterlogging': '#2563eb',
  'Damaged Streetlight': '#ca8a04',
  'Exposed Electrical Wire': '#dc2626',
  'Open Manhole': '#b91c1c',
  'Broken Public Infrastructure': '#0d9488',
  'Other Civic Problem': '#475569'
};

export const PublicIssueMapPage: React.FC = () => {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [hotspots, setHotspots] = useState<PredictiveHotspot[]>([]);
  const [showHotspots, setShowHotspots] = useState(true);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadMapData = async () => {
    setLoading(true);
    try {
      const [pts, hots] = await Promise.all([
        issueService.getMapData(),
        analyticsService.getPredictiveHotspots()
      ]);
      setPoints(pts);
      setHotspots(hots || []);
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
    <div className="h-[calc(100vh-4rem)] flex flex-col relative overflow-hidden bg-slate-50 font-sans">
      {/* Filter Header Bar */}
      <div className="bg-white border-b border-slate-200 p-4 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700 border border-blue-200">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight flex items-center gap-2">
                <span>NagarSetu Smart Infrastructure Map</span>
                <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.2 rounded border border-slate-200 font-mono font-semibold">
                  {filteredPoints.length} Live Points
                </span>
              </h1>
              <p className="text-[11px] text-slate-500">Geospatial civic tracking with predictive recurrence hotspot analytics</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Toggle Predictive Hotspots */}
            <button
              onClick={() => setShowHotspots(!showHotspots)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs ${
                showHotspots
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-blue-600" />
              <span>{showHotspots ? 'Hotspots Active' : 'Show Hotspots'}</span>
            </button>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search area/landmark..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 w-40 sm:w-48"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            >
              <option value="ALL">All Categories</option>
              {Object.values(IssueType).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            >
              <option value="ALL">All Statuses</option>
              {Object.values(IssueStatus).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <button
              onClick={loadMapData}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 transition-colors shadow-xs"
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
          center={[28.6180, 77.2140]}
          zoom={13}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Predictive Hotspot Density Rings */}
          {showHotspots &&
            hotspots.map((h) => (
              <Circle
                key={h.cluster_id}
                center={[h.latitude, h.longitude]}
                radius={220}
                pathOptions={{
                  fillColor: h.risk_color,
                  fillOpacity: 0.16,
                  color: h.risk_color,
                  weight: 2,
                  dashArray: '4, 6',
                }}
              >
                <Popup minWidth={240}>
                  <div className="p-1 space-y-1.5 text-xs font-sans">
                    <div className="font-bold text-slate-900 flex items-center justify-between">
                      <span>Predictive Hotspot</span>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                        style={{ backgroundColor: `${h.risk_color}20`, color: h.risk_color }}
                      >
                        {h.risk_level} Risk
                      </span>
                    </div>
                    <p className="text-slate-600 font-medium">{h.address}</p>
                    <div className="text-[11px] text-slate-500">
                      Dominant: <strong className="text-slate-800">{h.dominant_issue_type}</strong>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Recurrence Probability: <strong className="text-slate-800 font-mono">{h.recurrence_probability}%</strong>
                    </div>
                    <p className="text-[11px] text-slate-600 italic bg-slate-50 p-1.5 rounded border border-slate-200">
                      {h.preventive_recommendation}
                    </p>
                  </div>
                </Popup>
              </Circle>
            ))}

          {/* Render All Filtered Civic Defect Points */}
          {filteredPoints.map((pt) => {
            const color = categoryColors[pt.issue_type] || '#2563eb';
            const icon = createCustomIcon(color, pt.is_overdue);

            return (
              <Marker
                key={pt.id}
                position={[pt.latitude, pt.longitude]}
                icon={icon}
              >
                <Popup minWidth={260} maxWidth={320}>
                  <div className="p-1.5 space-y-2 text-xs font-sans">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                      <span className="font-mono font-bold text-slate-500">#{pt.id}</span>
                      <StatusBadge status={pt.status} />
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{pt.title}</h3>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <PriorityBadge score={pt.priority_score} severity={pt.severity} />
                      {pt.is_overdue && (
                        <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded font-bold border border-rose-200">
                          OVERDUE
                        </span>
                      )}
                    </div>

                    <p className="text-slate-600 text-xs">{pt.description}</p>

                    <div className="pt-1 text-[11px] text-slate-500 space-y-0.5 border-t border-slate-100">
                      <div>Location: <span className="font-medium text-slate-800">{pt.address || 'GPS Location'}</span></div>
                      {pt.department && (
                        <div>Department: <span className="font-medium text-blue-700">{pt.department}</span></div>
                      )}
                      <div>Community Endorsements: <span className="font-bold text-emerald-700">{pt.support_count}</span></div>
                    </div>

                    <Link
                      to={`/issue/${pt.id}`}
                      className="block text-center w-full py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
                    >
                      Inspect Full Resolution Audit
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};
