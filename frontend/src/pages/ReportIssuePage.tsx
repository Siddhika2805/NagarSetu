import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { issueService } from '../services/api';
import { AIAnalysisResult } from '../types';
import { Upload, MapPin, Cpu, AlertCircle, ArrowRight, CheckCircle2, Image as ImageIcon } from 'lucide-react';

export const ReportIssuePage: React.FC = () => {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState<number>(28.6139);
  const [longitude, setLongitude] = useState<number>(77.2090);
  const [address, setAddress] = useState('Connaught Place Ring Road, Sector 4');
  
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith || !file.type.includes('image')) {
      setError('Please select a valid image file (JPG, PNG, WEBP)');
      return;
    }
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError('');
  };

  const handleFetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(4)));
          setLongitude(Number(pos.coords.longitude.toFixed(4)));
          setAddress(`GPS Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        },
        (err) => {
          setError('Could not retrieve current location. Using default location coordinates.');
        }
      );
    }
  };

  const handleRunAIAnalysis = async () => {
    if (!selectedFile) {
      setError('Please upload an infrastructure issue image first.');
      return;
    }
    setError('');
    setAnalyzing(true);

    try {
      const result = await issueService.analyzeImage(selectedFile);
      setAiResult(result);
      if (!title) {
        setTitle(`Reported ${result.issue_type} near ${address.split(',')[0]}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to analyze image with AI model.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!aiResult) {
      setError('Please run AI analysis first before submitting.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const createdIssue = await issueService.createIssue({
        title: title || `${aiResult.issue_type} Defect Report`,
        description,
        issue_type: aiResult.issue_type,
        latitude,
        longitude,
        address,
        original_image_url: aiResult.original_image_url,
        annotated_image_url: aiResult.annotated_image_url,
        ai_confidence: aiResult.confidence,
        severity: aiResult.severity,
        priority_score: aiResult.priority_score,
        bounding_box_json: JSON.stringify(aiResult.bounding_boxes)
      });

      navigate(`/issue/${createdIssue.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit issue report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
          <Cpu className="w-3.5 h-3.5" /> AI REPORTING WIZARD
        </div>
        <h1 className="text-3xl font-extrabold text-white">Report Infrastructure Issue</h1>
        <p className="text-slate-400 text-sm mt-1">
          Upload an image of a pothole, open manhole, or garbage accumulation. CivicSense AI will automatically detect defects and calculate priority.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Image Upload & AI Analysis Button */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-cyan-400" />
              1. Upload Infrastructure Image
            </h2>

            <div
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
                imagePreview ? 'border-cyan-500/50 bg-slate-900/50' : 'border-slate-700 hover:border-cyan-500/40 bg-slate-900/80'
              }`}
              onClick={() => document.getElementById('imageInput')?.click()}
            >
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              />

              {imagePreview ? (
                <div className="space-y-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-xl object-cover border border-slate-700 shadow-md"
                  />
                  <p className="text-xs text-cyan-400 font-semibold">Click to change image</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Click to upload or drag & drop</p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG, or WEBP (Max 10MB)</p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleRunAIAnalysis}
              disabled={!selectedFile || analyzing}
              className="w-full py-3 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            >
              <Cpu className="w-5 h-5" />
              {analyzing ? 'Running OpenCV & YOLO AI Pipeline...' : 'Run Instant AI Vision Analysis'}
            </button>
          </div>

          {/* Location & Metadata */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                2. Location Coordinates
              </h2>
              <button
                onClick={handleFetchLocation}
                type="button"
                className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
              >
                Fetch GPS Location
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Street Address / Landmark</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis Result & Final Submit */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              3. AI Vision Inspection Output
            </h2>

            {aiResult ? (
              <div className="space-y-5 animate-fadeIn">
                {/* Detection Image with Bounding Box overlay */}
                {aiResult.annotated_image_url && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-700">
                    <img
                      src={aiResult.annotated_image_url}
                      alt="AI Annotated Defect"
                      className="w-full h-56 object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-slate-950/80 px-2.5 py-1 rounded-lg text-xs font-semibold text-cyan-300 border border-cyan-500/40">
                      Bounding Box & Label Overlay Rendered
                    </div>
                  </div>
                )}

                {/* AI Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                    <div className="text-[11px] font-medium text-slate-400">Detected Class</div>
                    <div className="text-base font-bold text-cyan-400 mt-0.5">{aiResult.issue_type}</div>
                  </div>

                  <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                    <div className="text-[11px] font-medium text-slate-400">AI Confidence Score</div>
                    <div className="text-base font-bold text-emerald-400 mt-0.5">{(aiResult.confidence * 100).toFixed(1)}%</div>
                  </div>

                  <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                    <div className="text-[11px] font-medium text-slate-400">Estimated Priority Score</div>
                    <div className="text-base font-bold text-amber-400 mt-0.5">{aiResult.priority_score} / 100</div>
                  </div>

                  <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                    <div className="text-[11px] font-medium text-slate-400">Calculated Severity</div>
                    <div className="text-base font-bold text-rose-400 mt-0.5">{aiResult.severity}</div>
                  </div>
                </div>

                {/* Department Recommendation */}
                <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-xs font-semibold text-slate-400">Recommended Department Routing</div>
                  <div className="text-sm font-bold text-indigo-400">{aiResult.recommended_department}</div>
                </div>

                {/* Additional Description & Final Submit */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Issue Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Title of issue"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Additional Citizen Description</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add extra context (e.g. hazardous during peak hours)"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={handleSubmitReport}
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Submitting Report...' : 'Submit Municipal Report'} <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl space-y-2">
                <Cpu className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-400">No AI analysis executed yet</p>
                <p className="text-xs text-slate-500">Upload an image on the left and click "Run Instant AI Vision Analysis"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
