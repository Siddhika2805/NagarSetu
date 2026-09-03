import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, MapPin, ShieldCheck, AlertTriangle, ArrowRight, Zap, CheckCircle2, BarChart3, Layers } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-20 pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.15),rgba(255,255,255,0))]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wide">
              <Zap className="w-3.5 h-3.5" /> NEXT-GEN CIVIC INFRASTRUCTURE INTELLIGENCE
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent leading-tight">
              AI-Powered Municipal Infrastructure Resolution Platform
            </h1>
            
            <p className="text-lg text-slate-400 leading-relaxed">
              Detect potholes, open manholes, waterlogging, and urban defects instantly using Ultralytics YOLO & OpenCV. Automated spatial duplicate detection, explainable priority scoring, and department dispatching.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                to="/report"
                className="px-6 py-3.5 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                Report an Issue <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/map"
                className="px-6 py-3.5 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all"
              >
                <MapPin className="w-5 h-5 text-cyan-400" /> Explore Public Map
              </Link>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Vision Defect Detection</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Computer Vision automatically identifies defect classes (potholes, garbage, waterlogging, broken streetlights) with bounding box localization & confidence scoring.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Explainable Priority Engine</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Multi-factor scoring algorithm (0-100) incorporating defect risk, AI confidence, bounding box area, duplicate report clustering, and unresolved aging hours.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-2xl border border-slate-800 hover:border-purple-500/30 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Spatial Haversine Matching</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Detects nearby duplicate citizen reports within 50m radius and 72h window, avoiding municipal ticket clutter while escalating duplicate urgency.
              </p>
            </div>
          </div>

          {/* Supported AI Issue Classes */}
          <div className="mt-20 glass-panel p-8 rounded-2xl border border-slate-800">
            <h3 className="text-center text-lg font-semibold text-slate-300 mb-6">
              AI Object Detection Target Classes
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {[
                'Pothole',
                'Garbage Accumulation',
                'Waterlogging',
                'Broken Streetlight',
                'Open Manhole',
                'Road Damage'
              ].map((cls, idx) => (
                <div key={idx} className="bg-slate-900/80 px-4 py-3 rounded-xl border border-slate-800 text-center text-xs font-semibold text-cyan-300">
                  {cls}
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};
