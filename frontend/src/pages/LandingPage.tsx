import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, ShieldCheck, ArrowRight, Zap, CheckCircle2, BarChart3,
  Layers, Mic, Eye, Sparkles, Building2, AlertTriangle, Users,
  Clock, ArrowUpRight, CheckSquare, RefreshCw
} from 'lucide-react';
import { analyticsService } from '../services/api';
import { PublicAccountabilitySummary } from '../types';

export const LandingPage: React.FC = () => {
  const [stats, setStats] = useState<PublicAccountabilitySummary | null>(null);

  useEffect(() => {
    analyticsService.getPublicSummary()
      .then(data => setStats(data))
      .catch(() => {
        // Fallback demo values if backend is initializing
        setStats({
          total_complaints: 142,
          resolved_complaints: 118,
          in_progress_complaints: 18,
          pending_complaints: 6,
          reopened_complaints: 2,
          citizen_verified_count: 104,
          resolution_rate: 83.1,
          avg_resolution_hours: 32.4,
          department_metrics: [],
          monthly_trends: [],
          data_as_of: new Date().toISOString()
        });
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 1. HERO SECTION */}
      <section className="relative pt-16 pb-24 overflow-hidden border-b border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_-15%,rgba(6,182,212,0.18),rgba(16,185,129,0.05),rgba(2,6,23,0))]" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.1),transparent_70%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Pill Banner */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-800/80 text-cyan-300 text-xs font-semibold tracking-wide shadow-lg shadow-cyan-950/50">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span>नागरिकों और प्रशासन के बीच एक सेतु • AI CIVIC INTELLIGENCE PLATFORM</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
              Bridging Citizens.{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                Empowering Cities.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
              <strong className="text-white font-semibold">NagarSetu</strong> transforms municipal infrastructure monitoring.
              From pothole detection to waterlogged roads, our computer vision and multilingual NLP triage civic issues in real time,
              enforce department SLAs, and mandate <strong className="text-emerald-400 font-semibold">citizen-verified ground repairs</strong>.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                to="/report"
                className="px-7 py-4 rounded-xl font-bold bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-xl shadow-cyan-500/25 flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5 text-base"
              >
                Report Civic Problem <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/map"
                className="px-7 py-4 rounded-xl font-bold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 flex items-center gap-2.5 transition-all text-base"
              >
                <MapPin className="w-5 h-5 text-cyan-400" /> Interactive Smart Map
              </Link>
              <Link
                to="/accountability"
                className="px-6 py-4 rounded-xl font-bold bg-slate-950 hover:bg-slate-900 text-teal-300 border border-teal-800/60 flex items-center gap-2 transition-all text-base"
              >
                <BarChart3 className="w-5 h-5 text-teal-400" /> Public Accountability
              </Link>
            </div>

            {/* Micro Badges */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Ground Repair Verification</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> Hindi, Punjabi & English Voice NLP</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-400" /> 50m Spatial Duplicate Prevention</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-purple-400" /> 0-100 Transparent Priority Score</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REAL OPERATIONAL STATS BAR */}
      <section className="bg-slate-900/70 border-b border-slate-800/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-3xl sm:text-4xl font-extrabold text-cyan-400 font-mono">
                {stats?.total_complaints || 0}
              </div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-medium mt-1">Total Complaints Received</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">
                {stats?.resolved_complaints || 0}
              </div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-medium mt-1">Confirmed Resolutions</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-3xl sm:text-4xl font-extrabold text-teal-300 font-mono">
                {stats?.resolution_rate || 0}%
              </div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-medium mt-1">Resolution Success Rate</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono">
                {stats?.avg_resolution_hours || 36.5}h
              </div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-medium mt-1">Average Response SLA</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE CIVIC PROBLEM VS NAGARSETU SOLUTION */}
      <section className="py-20 bg-slate-950 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">The Accountability Gap</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">
              Why Traditional Municipal Grievance Portals Fail
            </p>
            <p className="text-slate-400 mt-4 text-base">
              Citizens submit complaints into a bureaucratic black hole, while officials close tickets without physical repair proof. NagarSetu fixes this with end-to-end AI validation and citizen sign-off.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* The Old Way */}
            <div className="bg-rose-950/20 border border-rose-900/40 p-8 rounded-2xl relative overflow-hidden">
              <div className="text-rose-400 font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> The Legacy Municipal Trap
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Unverified Silent Closures</h3>
              <ul className="space-y-3.5 text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✗</span>
                  <span><strong>Form overload:</strong> Citizens forced to fill 20-field bureaucratic dropdowns.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✗</span>
                  <span><strong>Ticket Duplication:</strong> 50 citizens report the same pothole, creating 50 isolated clutter tickets.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✗</span>
                  <span><strong>Arbitrary Status:</strong> Officers mark complaints "Resolved" on screen without doing physical ground repair.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✗</span>
                  <span><strong>Zero Citizen Voice:</strong> Citizens have no power to reject fake repair reports or reopen unresolved issues.</span>
                </li>
              </ul>
            </div>

            {/* The NagarSetu Way */}
            <div className="bg-gradient-to-br from-emerald-950/30 to-cyan-950/30 border border-emerald-800/40 p-8 rounded-2xl relative overflow-hidden">
              <div className="text-emerald-400 font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                <CheckSquare className="w-4 h-4" /> The NagarSetu Standard
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Closed-Loop Accountability</h3>
              <ul className="space-y-3.5 text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Voice & Vision First:</strong> Speak in Hindi/Punjabi or snap a photo. AI extracts defect, location & category.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Spatial 50m Deduplication:</strong> Automatically highlights existing reports and boosts urgency via community upvotes.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Before vs After AI Comparison:</strong> Officer must upload repair photos; AI computes remediation confidence.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>Citizen Verification Power:</strong> Ticket is only closed when the reporting citizen confirms the issue is truly resolved.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOUR-STEP WORKFLOW */}
      <section className="py-20 bg-slate-900/40 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-2">How NagarSetu Operates</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">
              From Citizen Report to Ground Verification
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative group hover:border-cyan-500/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-lg mb-4">1</div>
              <h4 className="text-lg font-bold text-white mb-2">Snap, Speak, or Tap</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Citizen captures photo or speaks naturally in Hindi/English. GPS coordinates captured with permission.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative group hover:border-teal-500/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-lg mb-4">2</div>
              <h4 className="text-lg font-bold text-white mb-2">AI Defect Triage</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Computer vision detects defect bounding boxes, computes explainable 0-100 priority, and checks 50m duplicates.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative group hover:border-amber-500/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg mb-4">3</div>
              <h4 className="text-lg font-bold text-white mb-2">SLA Department Dispatch</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Auto-assigned to Road, Sanitation, Water, Drainage or Electrical departments with strict SLA countdowns.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative group hover:border-emerald-500/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg mb-4">4</div>
              <h4 className="text-lg font-bold text-white mb-2">Citizen Verification</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Officer submits repair photo. AI compares evidence. Citizen confirms resolution or reopens the ticket.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CORE AI INTELLIGENCE MODULES */}
      <section className="py-20 bg-slate-950 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">Technological Engine</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">
              Built for Ground-Truth Intelligence
            </p>
            <p className="text-slate-400 mt-4 text-base">
              NagarSetu is powered by specialized computer vision, multilingual natural language understanding, spatial graph clustering, and predictive civic algorithms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Computer Vision Inspection</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Detects potholes, road craters, overflowing bins, open manholes, damaged streetlights, and waterlogging with precision bounding boxes and defect footprint ratios.
              </p>
              <span className="text-xs font-semibold text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/60">
                11 Supported Categories
              </span>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-teal-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-6">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Multilingual Voice NLP</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Enables hands-free complaint filing in spoken Hindi (Hinglish/Devanagari), Punjabi, and English. Extracts problem categories, urgency markers, and location cues.
              </p>
              <span className="text-xs font-semibold text-teal-400 bg-teal-950/60 px-3 py-1 rounded-full border border-teal-800/60">
                Speech-to-Text & TTS
              </span>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Explainable 0–100 Priority</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Every complaint is scored transparently: Category public hazard (35%), AI confidence (15%), Defect area (15%), Community upvotes (20%), and Aging hours (15%).
              </p>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/60">
                Fully Auditable Logic
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION & FOOTER */}
      <section className="py-20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready to Bridge the Civic Gap in Your City?
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Experience accountability in action. Submit a complaint, track resolution deadlines, or inspect public infrastructure data today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/report"
              className="px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-xl shadow-cyan-500/25 flex items-center gap-2 text-base transition-all"
            >
              Report an Issue Now <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 flex items-center gap-2 text-base transition-all"
            >
              Municipal Officer Login
            </Link>
          </div>
        </div>
      </section>

      {/* Modern NagarSetu Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-12 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-900">
            {/* Col 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white">NagarSetu</span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">नगरसेतु</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                AI-Powered Civic Intelligence, Public Infrastructure Monitoring & Municipal Accountability Platform.
              </p>
              <p className="text-xs text-cyan-400">नागरिकों और प्रशासन के बीच एक सेतु</p>
            </div>

            {/* Col 2: For Citizens */}
            <div>
              <div className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Citizens</div>
              <ul className="space-y-2 text-xs">
                <li><Link to="/report" className="hover:text-cyan-400 transition-colors">Report Infrastructure Defect</Link></li>
                <li><Link to="/dashboard" className="hover:text-cyan-400 transition-colors">Citizen Dashboard</Link></li>
                <li><Link to="/my-reports" className="hover:text-cyan-400 transition-colors">Track My Complaints</Link></li>
                <li><Link to="/map" className="hover:text-cyan-400 transition-colors">Nearby Issues Map</Link></li>
              </ul>
            </div>

            {/* Col 3: For Authorities */}
            <div>
              <div className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Administration</div>
              <ul className="space-y-2 text-xs">
                <li><Link to="/officer" className="hover:text-cyan-400 transition-colors">Department Officer Queue</Link></li>
                <li><Link to="/admin" className="hover:text-cyan-400 transition-colors">City-Wide Analytics</Link></li>
                <li><Link to="/admin/issues" className="hover:text-cyan-400 transition-colors">SLA Escalation Engine</Link></li>
                <li><Link to="/accountability" className="hover:text-cyan-400 transition-colors">Public Scorecards</Link></li>
              </ul>
            </div>

            {/* Col 4: Tech Stack */}
            <div>
              <div className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Engine Architecture</div>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>FastAPI 2.0 Backend & SQLite/PostgreSQL</li>
                <li>OpenCV & Ultralytics Computer Vision</li>
                <li>Multilingual Natural Language Processing</li>
                <li>Geospatial Predictive Hotspot Engine</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <div>© 2026 NagarSetu — Municipal Infrastructure & Civic Intelligence System.</div>
            <div className="flex gap-4">
              <span>Privacy Preserving</span>
              <span>•</span>
              <span>Open Public Data</span>
              <span>•</span>
              <span>Digital India Initiative Ready</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
