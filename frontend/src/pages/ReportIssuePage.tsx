import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { issueService } from '../services/api';
import { AIAnalysisResult, DuplicateCandidate, NLPAnalysisResult } from '../types';
import {
  Upload, MapPin, Cpu, AlertCircle, ArrowRight, CheckCircle2,
  Image as ImageIcon, Mic, MicOff, Volume2, Sparkles, Building2,
  Users, ShieldAlert, Eye, Info
} from 'lucide-react';

export const ReportIssuePage: React.FC = () => {
  const navigate = useNavigate();

  // Mode: 'photo' or 'voice'
  const [activeTab, setActiveTab] = useState<'photo' | 'voice'>('photo');

  // Input states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Pothole');
  const [latitude, setLatitude] = useState<number>(28.6139);
  const [longitude, setLongitude] = useState<number>(77.2090);
  const [address, setAddress] = useState('Connaught Place Ring Road, Sector 4, New Delhi');

  // Voice Recording & NLP states
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState<'hi-IN' | 'en-IN' | 'pa-IN'>('hi-IN');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [nlpResult, setNlpResult] = useState<NLPAnalysisResult | null>(null);
  const recognitionRef = useRef<any>(null);

  // AI Inspection & Duplicate Detection states
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [supportingId, setSupportingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. File Upload Handler
  const handleFileChange = (file: File | null) => {
    if (!file) return;
    if (!file.type || !file.type.includes('image')) {
      setError('Please select a valid image file (JPG, PNG, WEBP)');
      return;
    }
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError('');
  };

  // 2. Fetch GPS Location
  const handleFetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(4));
          const lng = Number(pos.coords.longitude.toFixed(4));
          setLatitude(lat);
          setLongitude(lng);
          setAddress(`GPS Location (${lat}, ${lng})`);
          triggerDuplicateCheck(lat, lng, selectedCategory);
        },
        () => {
          setError('Could not retrieve current location. Using default location coordinates.');
        }
      );
    }
  };

  // 3. Trigger 50m Spatial Duplicate Check
  const triggerDuplicateCheck = async (lat: number, lng: number, cat: string) => {
    setCheckingDuplicates(true);
    try {
      const res = await issueService.checkDuplicates({
        latitude: lat,
        longitude: lng,
        issue_type: cat,
        title,
        description,
        radius_meters: 50.0
      });
      setDuplicates(res.candidates || []);
    } catch {
      // Non-blocking
    } finally {
      setCheckingDuplicates(false);
    }
  };

  // 4. Voice Recording with Web Speech API
  const startVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported on this browser. Please type your description.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = voiceLanguage;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
        setError('');
      };

      recognition.onresult = async (event: any) => {
        const transcriptText = event.results[0][0].transcript;
        setVoiceTranscript(transcriptText);
        setDescription(prev => prev ? `${prev} ${transcriptText}` : transcriptText);
        setIsRecording(false);

        // Run NLP parsing
        try {
          const nlp = await issueService.parseNlp(transcriptText, voiceLanguage.split('-')[0]);
          setNlpResult(nlp);
          setSelectedCategory(nlp.problem_category);
          if (!title) {
            setTitle(nlp.suggested_title);
          }
          triggerDuplicateCheck(latitude, longitude, nlp.problem_category);
        } catch {
          // ignore NLP failure
        }
      };

      recognition.onerror = (e: any) => {
        setIsRecording(false);
        setError(`Voice input error (${e.error}). Please type your description.`);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setIsRecording(false);
      setError('Could not start voice recognition.');
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // 5. Run Computer Vision Defect Engine
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
      setSelectedCategory(result.issue_type);
      if (!title) {
        setTitle(`Reported ${result.issue_type} near ${address.split(',')[0]}`);
      }
      triggerDuplicateCheck(latitude, longitude, result.issue_type);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to analyze image with AI model.');
    } finally {
      setAnalyzing(false);
    }
  };

  // 6. Citizen Supports Existing Duplicate Instead of Filing Clutter
  const handleSupportDuplicate = async (dupId: number) => {
    setSupportingId(dupId);
    try {
      await issueService.supportIssue(dupId);
      setSuccessMsg('You have successfully endorsed this existing nearby report! Priority has been boosted.');
      setTimeout(() => navigate(`/issue/${dupId}`), 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Could not support existing report.');
    } finally {
      setSupportingId(null);
    }
  };

  // 7. Text-to-Speech Playback
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voiceLanguage;
      window.speechSynthesis.speak(utterance);
    }
  };

  // 8. Submit Report to NagarSetu
  const handleSubmitReport = async () => {
    if (!aiResult && !selectedFile) {
      setError('Please provide an image of the civic issue or run AI analysis.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const createdIssue = await issueService.createIssue({
        title: title || `${selectedCategory} Defect Report`,
        description,
        issue_type: selectedCategory,
        latitude,
        longitude,
        address,
        original_image_url: aiResult?.original_image_url || '/uploads/original/sample_infra.jpg',
        annotated_image_url: aiResult?.annotated_image_url,
        ai_confidence: aiResult?.confidence || 0.88,
        severity: aiResult?.severity || 'MODERATE',
        priority_score: aiResult?.priority_score || 50.0,
        priority_explanation: aiResult?.priority_explanation,
        bounding_box_json: aiResult ? JSON.stringify(aiResult.bounding_boxes) : undefined,
        voice_transcript: voiceTranscript,
        original_language: voiceLanguage.split('-')[0]
      });

      navigate(`/issue/${createdIssue.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit issue report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800 text-cyan-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> NAGARSETU CITIZEN REPORTING PORTAL
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Report Public Infrastructure Problem
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Capture photos or describe the issue via voice in Hindi, Punjabi, or English. AI validates the defect and enforces municipal repair accountability.
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 50-METER DUPLICATE WARNING BANNER */}
        {duplicates.length > 0 && (
          <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <span>Nearby Existing Complaint Detected within 50 Meters!</span>
              </div>
              <span className="text-xs bg-amber-900/60 text-amber-200 px-2.5 py-0.5 rounded-full border border-amber-700">
                {duplicates.length} match(es)
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Other citizens have already reported a defect at this exact location. To get authorities to act faster, you can <strong>endorse this existing complaint</strong> instead of filing a redundant ticket.
            </p>

            <div className="space-y-2 pt-1">
              {duplicates.slice(0, 2).map((dup) => (
                <div key={dup.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{dup.title}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                      <span className="text-cyan-400 font-medium">{dup.issue_type}</span>
                      <span>•</span>
                      <span>{dup.distance_meters}m away</span>
                      <span>•</span>
                      <span className="text-emerald-400">{dup.support_count} citizen endorsements</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSupportDuplicate(dup.id)}
                    disabled={supportingId === dup.id}
                    className="flex-shrink-0 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Users className="w-4 h-4" />
                    {supportingId === dup.id ? 'Endorsing...' : 'Support (+1 Vote)'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INPUT WORKBENCH */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Input Mode */}
          <div className="lg:col-span-7 space-y-6">
            {/* Mode Selector Tabs */}
            <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('photo')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'photo'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4" /> Upload Defect Photo
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('voice')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'voice'
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mic className="w-4 h-4" /> Multilingual Voice Reporting
              </button>
            </div>

            {/* TAB A: Photo Upload & AI Vision */}
            {activeTab === 'photo' && (
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
                <label className="block text-sm font-semibold text-slate-200">
                  Ground Infrastructure Defect Photograph
                </label>

                <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-6 text-center cursor-pointer transition-all bg-slate-950/40">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="hidden"
                    id="image-file-input"
                  />
                  <label htmlFor="image-file-input" className="cursor-pointer space-y-2 block">
                    <Upload className="w-8 h-8 text-cyan-400 mx-auto" />
                    <div className="text-sm font-medium text-slate-300">
                      {selectedFile ? selectedFile.name : 'Click to select photo (Pothole, Waste, Manhole, Streetlight)'}
                    </div>
                    <div className="text-xs text-slate-500">Supports JPG, PNG, WEBP (Max 15MB)</div>
                  </label>
                </div>

                {imagePreview && (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 max-h-72 flex items-center justify-center">
                      <img src={imagePreview} alt="Defect Preview" className="object-contain w-full h-full max-h-72" />
                      {aiResult && (
                        <div className="absolute top-3 left-3 bg-slate-950/90 border border-cyan-500 text-cyan-300 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-lg">
                          <Eye className="w-3.5 h-3.5" /> Defect Identified: {aiResult.issue_type} ({intToPct(aiResult.confidence)}%)
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleRunAIAnalysis}
                      disabled={analyzing}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-950"
                    >
                      <Cpu className="w-4 h-4" />
                      {analyzing ? 'Inspecting Defect Geometry...' : 'Run NagarSetu AI Vision Analysis'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB B: Multilingual Voice First */}
            {activeTab === 'voice' && (
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Mic className="w-4 h-4 text-teal-400" />
                    Speak Your Complaint Naturally
                  </label>
                  <select
                    value={voiceLanguage}
                    onChange={(e: any) => setVoiceLanguage(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-xs text-slate-300 rounded-lg px-2.5 py-1"
                  >
                    <option value="hi-IN">हिन्दी (Hindi)</option>
                    <option value="en-IN">English (India)</option>
                    <option value="pa-IN">ਪੰਜਾਬੀ (Punjabi)</option>
                  </select>
                </div>

                <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-4">
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                        isRecording
                          ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/40 ring-4 ring-rose-500/20'
                          : 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/30'
                      }`}
                    >
                      {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                    </button>
                  </div>
                  <div className="text-sm font-semibold text-slate-300">
                    {isRecording ? 'Listening... Speak now' : 'Tap microphone to speak in Hindi or English'}
                  </div>
                  <div className="text-xs text-slate-500 italic">
                    Example: "Mere ghar ke paas sadak par bahut bada gaddha hai aur andhera hai"
                  </div>
                </div>

                {voiceTranscript && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-teal-800/60 space-y-2">
                    <div className="flex items-center justify-between text-xs text-teal-400 font-semibold">
                      <span>Transcribed Voice Speech</span>
                      <button
                        type="button"
                        onClick={() => speakText(voiceTranscript)}
                        className="flex items-center gap-1 hover:text-white"
                        title="Listen to TTS"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Listen
                      </button>
                    </div>
                    <p className="text-sm text-slate-200">"{voiceTranscript}"</p>
                    {nlpResult && (
                      <div className="text-xs text-slate-400 pt-1 border-t border-slate-800 flex flex-wrap gap-2">
                        <span className="text-cyan-300">Category: <strong>{nlpResult.problem_category}</strong></span>
                        {nlpResult.is_urgent && <span className="text-rose-400 font-bold">⚠️ Urgent Issue</span>}
                        <span>Routing: {nlpResult.recommended_department}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Location & Coordinates Input */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" /> Ground Location & Address
                </label>
                <button
                  type="button"
                  onClick={handleFetchLocation}
                  className="px-3 py-1 rounded-lg bg-cyan-950/70 border border-cyan-800 text-cyan-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" /> Detect My GPS
                </button>
              </div>

              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter landmark, road name, or sector"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              />

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  Latitude: <strong className="text-slate-200 font-mono">{latitude}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  Longitude: <strong className="text-slate-200 font-mono">{longitude}</strong>
                </div>
              </div>
            </div>

            {/* Description Textarea */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <label className="text-sm font-semibold text-slate-200">
                Detailed Ground Description (Text or Spoken)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the severity, hazard to vehicles/pedestrians, or exact spot..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* RIGHT COLUMN: AI Analysis & Final Review */}
          <div className="lg:col-span-5 space-y-6">
            {/* AI Results Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <Cpu className="w-4 h-4" />
                  <span>AI Triage & Classification</span>
                </div>
                <span className="text-xs text-slate-400 font-mono">v2.0 Engine</span>
              </div>

              {aiResult ? (
                <div className="space-y-4">
                  {/* Category Pill */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Detected Category</span>
                    <span className="text-sm font-bold text-white bg-cyan-950 px-3 py-1 rounded-lg border border-cyan-800">
                      {aiResult.issue_type}
                    </span>
                  </div>

                  {/* Priority Gauge */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">Explainable Priority Score</span>
                      <span className="font-extrabold text-amber-400 font-mono text-sm">
                        {aiResult.priority_score}/100 ({aiResult.severity})
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 h-full rounded-full transition-all duration-700"
                        style={{ width: `${aiResult.priority_score}%` }}
                      />
                    </div>
                    {aiResult.priority_explanation && (
                      <div className="text-[11px] text-slate-400 whitespace-pre-line pt-2 border-t border-slate-800/80 leading-relaxed">
                        {aiResult.priority_explanation}
                      </div>
                    )}
                  </div>

                  {/* Routing & SLA */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-teal-400" />
                      <span>Target Department & SLA</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-200">
                      {aiResult.recommended_department}
                    </div>
                    <div className="text-xs text-emerald-400 font-mono">
                      Target SLA Commitment: {aiResult.sla_hours || 48} hours
                    </div>
                  </div>

                  {/* Annotated Defect Preview */}
                  {aiResult.annotated_image_url && (
                    <div className="space-y-1.5">
                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Computer Vision Bounding Box Overlay</span>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 max-h-48">
                        <img
                          src={aiResult.annotated_image_url}
                          alt="AI Bounding Box"
                          className="w-full h-full object-contain max-h-48"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <Cpu className="w-10 h-10 text-slate-700 mx-auto" />
                  <p className="text-xs">Upload a defect photo or speak to trigger AI triage.</p>
                </div>
              )}
            </div>

            {/* Editable Title */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Complaint Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of defect"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmitReport}
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-cyan-950 disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" />
              {submitting ? 'Submitting to NagarSetu...' : 'Submit Complaint to Authorities'}
            </button>
            <p className="text-[11px] text-center text-slate-500">
              By submitting, your complaint enters the NagarSetu audit trail and requires official repair proof.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

function intToPct(val: number): number {
  return Math.round(val <= 1.0 ? val * 100 : val);
}
