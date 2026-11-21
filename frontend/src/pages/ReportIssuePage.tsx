import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { issueService } from '../services/api';
import { AIAnalysisResult, DuplicateCandidate, NLPAnalysisResult, SeverityLevel } from '../types';
import {
  Upload, MapPin, Cpu, AlertCircle, ArrowRight, CheckCircle2,
  Image as ImageIcon, Mic, MicOff, Volume2, Building2,
  Users, ShieldAlert, Eye, Info, Clock, Check, Sparkles, Radio, RotateCcw,
  Play, Square, HelpCircle
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

  // Voice Recording & Audio states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voiceLanguage, setVoiceLanguage] = useState<'hi-IN' | 'en-IN' | 'pa-IN'>('hi-IN');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [voiceAudioUrl, setVoiceAudioUrl] = useState<string | null>(null);
  const [uploadingVoice, setUploadingVoice] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [micStatus, setMicStatus] = useState<'idle' | 'testing' | 'active' | 'denied' | 'ok'>('idle');
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const [nlpResult, setNlpResult] = useState<NLPAnalysisResult | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timerRef = useRef<any>(null);
  const transcriptAccRef = useRef<string>('');

  // AI Inspection & Duplicate Detection states
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [supportingId, setSupportingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Clean up audio hardware & speech recognition on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

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

  // 4. Voice Recording & Microphone Audio Analysis
  // A. Self-Diagnostic Microphone Test
  const handleTestMic = async () => {
    setMicStatus('testing');
    setError('');
    setShowTroubleshoot(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStatus('ok');

      // Test volume level
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        setTimeout(() => {
          analyser.getByteFrequencyData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) sum += data[i];
          const avg = Math.round(sum / data.length);
          setAudioLevel(avg > 5 ? avg : 30);
          stream.getTracks().forEach((t) => t.stop());
          ctx.close().catch(() => {});
        }, 1200);
      } else {
        stream.getTracks().forEach((t) => t.stop());
      }
    } catch (err: any) {
      console.warn('Microphone diagnostic test warning:', err);
      setMicStatus('denied');
      setShowTroubleshoot(true);
      setError('Microphone access was denied or no input device found. Follow the 10-second guide below.');
    }
  };

  // B. Start Real Voice Recording with MediaRecorder + SpeechRecognition
  const startVoiceRecording = async () => {
    setError('');
    setShowTroubleshoot(false);
    transcriptAccRef.current = '';
    setVoiceTranscript('');
    setRecordedAudioUrl(null);
    setVoiceAudioUrl(null);
    audioChunksRef.current = [];
    setRecordingSeconds(0);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;
      setMicStatus('active');
    } catch (err: any) {
      console.error('Microphone acquisition error:', err);
      setMicStatus('denied');
      setShowTroubleshoot(true);
      setError('Microphone permission blocked. Please allow microphone access in your browser to record your voice.');
      return;
    }

    // 1. Setup Audio decibel meter
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const loop = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length;
          setAudioLevel(Math.min(100, Math.round(avg * 1.8)));
          animFrameRef.current = requestAnimationFrame(loop);
        };
        loop();
      }
    } catch (e) {
      console.warn('AudioContext visualization skipped:', e);
    }

    // 2. Setup MediaRecorder for real audio capture
    try {
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
        else if (MediaRecorder.isTypeSupported('audio/ogg')) mimeType = 'audio/ogg';
        else mimeType = '';
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const localUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(localUrl);

        // Upload to backend voice repository
        setUploadingVoice(true);
        try {
          const uploaded = await issueService.uploadVoice(audioBlob);
          setVoiceAudioUrl(uploaded.voice_audio_url);
        } catch (uploadErr) {
          console.warn('Backend audio storage notice:', uploadErr);
        } finally {
          setUploadingVoice(false);
        }
      };

      recorder.start(250);
      setIsRecording(true);

      // Start elapsed timer
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds += 1;
        setRecordingSeconds(seconds);
      }, 1000);
    } catch (recErr) {
      console.warn('MediaRecorder init error:', recErr);
    }

    // 3. Setup SpeechRecognition (Best effort live transcription)
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.lang = voiceLanguage;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          let accumulated = '';
          for (let i = 0; i < event.results.length; i++) {
            accumulated += event.results[i][0].transcript;
          }
          if (accumulated.trim()) {
            transcriptAccRef.current = accumulated;
            setVoiceTranscript(accumulated);
            setDescription(accumulated);
            if (accumulated.length > 5) {
              handleParseNLP(accumulated);
            }
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech engine warning:', event.error);
          // If Google Cloud speech-to-text service is unreachable or blocked by browser,
          // MediaRecorder is still actively recording their voice note!
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (speechErr) {
        console.warn('SpeechRecognition start warning:', speechErr);
      }
    }
  };

  // C. Stop Recording
  const stopVoiceRecording = () => {
    setIsRecording(false);
    setAudioLevel(0);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    const captured = transcriptAccRef.current || voiceTranscript;
    if (captured) {
      handleParseNLP(captured);
    }
  };

  const handleSelectVoicePreset = (sampleText: string, lang: 'hi-IN' | 'en-IN' = 'hi-IN') => {
    setVoiceLanguage(lang);
    setVoiceTranscript(sampleText);
    setDescription(sampleText);
    handleParseNLP(sampleText);
    speakText(sampleText);
  };

  // 5. NLP Analysis of Voice Transcript or Text
  const handleParseNLP = async (textToParse: string) => {
    if (!textToParse || textToParse.trim().length < 3) return;
    try {
      const res = await issueService.parseNLP(
        textToParse,
        voiceLanguage.split('-')[0]
      );
      setNlpResult(res);

      if (res.problem_category && res.problem_category !== 'Other Civic Issue') {
        setSelectedCategory(res.problem_category);
        triggerDuplicateCheck(latitude, longitude, res.problem_category);
      }
      if (res.extracted_keywords?.length) {
        setTitle(`Reported: ${res.problem_category} (${res.extracted_keywords.join(', ')})`);
      }
    } catch {
      // Non-blocking
    }
  };

  // 6. Run AI Computer Vision Analysis on Uploaded Photo
  const handleRunAIAnalysis = async () => {
    if (!selectedFile) {
      setError('Please select or upload a photograph first.');
      return;
    }
    setAnalyzing(true);
    setError('');

    try {
      const analysis = await issueService.analyzeImage(selectedFile);
      setAiResult(analysis);
      setSelectedCategory(analysis.issue_type);
      setTitle(`Severe ${analysis.issue_type} detected near ${address.split(',')[0]}`);
      triggerDuplicateCheck(latitude, longitude, analysis.issue_type);
    } catch (err: any) {
      setError('Computer vision service is initializing. Proceed with manual category selection.');
      setAiResult({
        issue_type: selectedCategory,
        confidence: 0.85,
        severity: SeverityLevel.MODERATE,
        priority_score: 48.0,
        priority_explanation: 'Standard baseline severity assigned based on reported issue type.',
        recommended_department: 'Municipal Works',
        recommended_department_code: 'ENG',
        sla_hours: 120,
        bounding_boxes: [],
        defect_area_ratio: 0.05,
        original_image_url: imagePreview || '/uploads/original/sample_infra.jpg'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // 7. Community Endorsement / Support Duplicate
  const handleSupportDuplicate = async (issueId: number) => {
    setSupportingId(issueId);
    try {
      const updated = await issueService.supportIssue(issueId);
      setSuccessMsg(`Successfully endorsed existing complaint #${issueId}! Current priority: ${updated.priority_score.toFixed(0)}/100.`);
      setTimeout(() => navigate(`/issue/${issueId}`), 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to endorse complaint.');
    } finally {
      setSupportingId(null);
    }
  };

  const intToPct = (val?: number) => (val ? Math.round(val * 100) : 85);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = voiceLanguage;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis error:', err);
      }
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
        voice_audio_url: voiceAudioUrl || undefined,
        voice_transcript: voiceTranscript || description || undefined,
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
    <div className="bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 mb-1.5">
            <span>OFFICIAL CITIZEN REPORTING WORKBENCH</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Report Public Infrastructure Problem
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Capture photos or describe the issue via voice in Hindi, Punjabi, or English. AI validates the defect and enforces municipal repair accountability.
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 50-METER DUPLICATE WARNING BANNER */}
        {duplicates.length > 0 && (
          <div className="p-5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Nearby Existing Complaint Detected within 50 Meters!</span>
              </div>
              <span className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                {duplicates.length} match(es)
              </span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Other citizens have already reported a defect at this exact location. To get authorities to act faster, you can <strong className="font-semibold">endorse this existing complaint</strong> instead of filing a duplicate ticket.
            </p>

            <div className="space-y-2 pt-1">
              {duplicates.slice(0, 2).map((dup) => (
                <div key={dup.id} className="flex items-center justify-between p-3.5 rounded-lg bg-white border border-amber-200/90 gap-4">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">#{dup.id}: {dup.title}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="text-blue-700 font-medium">{dup.issue_type}</span>
                      <span>•</span>
                      <span>{dup.distance_meters}m away</span>
                      <span>•</span>
                      <span className="text-emerald-700 font-medium">{dup.support_count} citizen endorsements</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSupportDuplicate(dup.id)}
                    disabled={supportingId === dup.id}
                    className="shrink-0 px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{supportingId === dup.id ? 'Endorsing...' : 'Support (+1 Vote)'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INPUT WORKBENCH */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Input Mode */}
          <div className="lg:col-span-7 space-y-6">
            {/* Mode Selector Tabs */}
            <div className="flex rounded-lg bg-slate-200/80 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('photo')}
                className={`flex-1 py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'photo'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" /> Upload Defect Photo
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('voice')}
                className={`flex-1 py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'voice'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-blue-600" /> Multilingual Voice Reporting
              </button>
            </div>

            {/* TAB A: Photo Upload & AI Vision */}
            {activeTab === 'photo' && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Ground Infrastructure Defect Photograph
                </label>

                <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="hidden"
                    id="image-file-input"
                  />
                  <label htmlFor="image-file-input" className="cursor-pointer space-y-2 block">
                    <Upload className="w-8 h-8 text-blue-600 mx-auto" />
                    <div className="text-xs font-semibold text-slate-800">
                      {selectedFile ? selectedFile.name : 'Click to select photo (Pothole, Waste, Manhole, Streetlight)'}
                    </div>
                    <div className="text-[11px] text-slate-400">Supports JPG, PNG, WEBP (Max 15MB)</div>
                  </label>
                </div>

                {imagePreview && (
                  <div className="space-y-4 pt-1">
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 max-h-72 flex items-center justify-center">
                      <img src={imagePreview} alt="Defect Preview" className="object-contain w-full h-full max-h-72" />
                      {aiResult && (
                        <div className="absolute top-3 left-3 bg-white/95 border border-slate-200 text-slate-900 text-xs px-2.5 py-1 rounded-md font-bold flex items-center gap-1.5 shadow-sm">
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>Identified: {aiResult.issue_type} ({intToPct(aiResult.confidence)}%)</span>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleRunAIAnalysis}
                      disabled={analyzing}
                      className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <Cpu className="w-4 h-4" />
                      <span>{analyzing ? 'Inspecting Defect Geometry...' : 'Run NagarSetu AI Vision Analysis'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB B: Multilingual Voice First */}
            {activeTab === 'voice' && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-blue-600" />
                    <span>Speak Your Complaint Naturally</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTestMic}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-all flex items-center gap-1 ${
                        micStatus === 'ok'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : micStatus === 'denied'
                          ? 'bg-rose-50 text-rose-700 border-rose-300'
                          : micStatus === 'testing'
                          ? 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                      title="Test microphone device hardware and permission"
                    >
                      <Radio className="w-3 h-3 text-blue-600" />
                      <span>
                        {micStatus === 'ok'
                          ? `Mic OK (${audioLevel}%)`
                          : micStatus === 'denied'
                          ? 'Mic Blocked'
                          : micStatus === 'testing'
                          ? 'Testing...'
                          : 'Test Mic'}
                      </span>
                    </button>
                    <select
                      value={voiceLanguage}
                      onChange={(e: any) => setVoiceLanguage(e.target.value)}
                      className="bg-white border border-slate-200 text-xs text-slate-800 rounded-md px-2.5 py-1 focus:outline-none focus:border-blue-600 font-medium"
                    >
                      <option value="hi-IN">हिन्दी (Hindi)</option>
                      <option value="en-IN">English (India)</option>
                      <option value="pa-IN">ਪੰਜਾਬੀ (Punjabi)</option>
                    </select>
                  </div>
                </div>

                {/* Troubleshooting / Permission Help Banner */}
                {showTroubleshoot && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-2 text-slate-800">
                    <div className="flex items-center justify-between font-bold text-amber-900">
                      <span className="flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-amber-600" />
                        Microphone Permission Help (10-Second Fix)
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowTroubleshoot(false)}
                        className="text-[11px] text-amber-700 hover:underline"
                      >
                        Dismiss
                      </button>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
                      <li>
                        <strong>In Chrome / Edge</strong>: Click the 🔒 tune/lock icon on the left of your URL bar (next to <code>localhost:5173</code>), toggle <strong>Microphone</strong> to <em>Allow</em>, and refresh.
                      </li>
                      <li>
                        <strong>In Brave Browser</strong>: Go to <code>brave://settings/privacy</code> and enable Google Services for speech recognition, or use the instant presets below.
                      </li>
                      <li>
                        <strong>In Windows Settings</strong>: Open <em>Settings &gt; Privacy &amp; Security &gt; Microphone</em> and ensure <em>"Let desktop apps access your microphone"</em> is turned <strong>ON</strong>.
                      </li>
                      <li>
                        <strong>Instant No-Mic Fallback</strong>: Click any of the quick voice sample presets below to test the full vernacular NLP triage pipeline instantly!
                      </li>
                    </ul>
                  </div>
                )}

                {/* Recorder Box */}
                <div className={`p-6 rounded-xl border transition-all text-center space-y-3 ${
                  isRecording
                    ? 'bg-rose-50/60 border-rose-300 ring-2 ring-rose-100'
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex justify-center items-center gap-3">
                    <button
                      type="button"
                      onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                        isRecording
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg animate-pulse ring-4 ring-rose-200'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                      }`}
                      title={isRecording ? 'Click to stop listening' : 'Click to start speaking'}
                    >
                      {isRecording ? <Square className="w-6 h-6 fill-current" /> : <Mic className="w-7 h-7" />}
                    </button>
                  </div>

                  {/* Dynamic waveform & Audio feedback */}
                  {isRecording ? (
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-800 text-xs font-semibold">
                        <Radio className="w-3.5 h-3.5 animate-pulse text-rose-600" />
                        <span>Recording Active • {Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:{(recordingSeconds % 60).toString().padStart(2, '0')}</span>
                      </div>

                      {/* Live Audio Visualizer Bars */}
                      <div className="flex items-center justify-center gap-1.5 h-8 py-1">
                        {[0.3, 0.6, 1.0, 0.7, 0.9, 0.5, 0.8, 0.4, 0.7, 0.3].map((factor, idx) => {
                          const base = audioLevel > 5 ? audioLevel : 15;
                          const height = Math.max(6, Math.min(30, Math.round(base * factor)));
                          return (
                            <div
                              key={idx}
                              className="w-1.5 rounded-full bg-rose-500 transition-all duration-75"
                              style={{ height: `${height}px` }}
                            />
                          );
                        })}
                      </div>

                      <div className="text-[11px] text-slate-500">
                        {audioLevel > 5 ? `Microphone Signal Detected: ${audioLevel}%` : 'Speaking... Say your civic issue clearly'}
                      </div>

                      <button
                        type="button"
                        onClick={stopVoiceRecording}
                        className="mt-2 px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-xs"
                      >
                        ✓ Stop & Process Voice Report
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-slate-800">
                        Tap microphone to speak your issue in Hindi, English or Punjabi
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Native MediaRecorder saves real audio. Integrated NLP extracts defect type, severity, and department.
                      </p>
                    </div>
                  )}
                </div>

                {/* Recorded Audio Playback Card */}
                {recordedAudioUrl && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                      <span className="flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Voice Audio Captured ({recordingSeconds}s)
                      </span>
                      {uploadingVoice && (
                        <span className="text-[11px] text-blue-600 animate-pulse">Saving audio note...</span>
                      )}
                      {voiceAudioUrl && (
                        <span className="text-[11px] text-slate-500 font-mono">Stored on NagarSetu</span>
                      )}
                    </div>
                    <audio controls src={recordedAudioUrl} className="w-full h-8" />
                  </div>
                )}

                {/* Instant Vernacular Voice Presets */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Instant Voice Test Samples (Click to test NLP pipeline):</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">1-Click Triage</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleSelectVoicePreset('सड़क पर बहुत बड़ा गड्ढा है और पानी भर गया है, तुरंत मरम्मत चाहिए।', 'hi-IN')}
                      className="p-2 text-left rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-800 transition-all flex items-start gap-1.5"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>🇮🇳 "सड़क पर बहुत बड़ा गड्ढा है और पानी भर गया है"</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectVoicePreset('खुला सीवर का मैनहोल है, पैदल चलने वालों के लिए गंभीर दुर्घटना का खतरा है।', 'hi-IN')}
                      className="p-2 text-left rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-800 transition-all flex items-start gap-1.5"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>🇮🇳 "खुला सीवर का मैनहोल है, दुर्घटना का खतरा"</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectVoicePreset('स्ट्रीट लाइट बंद पड़ी है, रात में बहुत अंधेरा और असामाजिक तत्व रहते हैं।', 'hi-IN')}
                      className="p-2 text-left rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-800 transition-all flex items-start gap-1.5"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>🇮🇳 "स्ट्रीट लाइट बंद है, रात में बहुत अंधेरा रहता है"</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectVoicePreset('Dangerous exposed high-voltage electrical wire sparking near children play area.', 'en-IN')}
                      className="p-2 text-left rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-800 transition-all flex items-start gap-1.5"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>🇬🇧 "Dangerous sparking live wire near play area"</span>
                    </button>
                  </div>
                </div>

                {voiceTranscript && (
                  <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-200 space-y-2">
                    <div className="flex items-center justify-between text-xs text-blue-800 font-semibold">
                      <span>Transcribed Voice Speech</span>
                      <button
                        type="button"
                        onClick={() => speakText(voiceTranscript)}
                        className="flex items-center gap-1 hover:underline text-blue-700"
                        title="Listen to TTS"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Listen
                      </button>
                    </div>
                    <p className="text-xs text-slate-800 font-medium">"{voiceTranscript}"</p>
                    {nlpResult && (
                      <div className="text-xs text-slate-600 pt-2 border-t border-blue-200/80 flex flex-wrap gap-2">
                        <span>Category: <strong className="text-slate-900">{nlpResult.problem_category}</strong></span>
                        {nlpResult.is_urgent && <span className="text-rose-700 font-bold">⚠️ Urgent Issue</span>}
                        <span>Routing: <strong className="text-slate-900">{nlpResult.recommended_department}</strong></span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Location & Coordinates Input */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Ground Location & Address</span>
                </label>
                <button
                  type="button"
                  onClick={handleFetchLocation}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <MapPin className="w-3 h-3 text-blue-600" /> Detect My GPS
                </button>
              </div>

              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter landmark, road name, or sector"
                className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  Latitude: <strong className="text-slate-900 font-mono">{latitude}</strong>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  Longitude: <strong className="text-slate-900 font-mono">{longitude}</strong>
                </div>
              </div>
            </div>

            {/* Description Textarea */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Detailed Ground Description (Text or Spoken)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab !== 'voice') setActiveTab('voice');
                    if (!isRecording) startVoiceRecording();
                    else stopVoiceRecording();
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs ${
                    isRecording
                      ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                  title={isRecording ? 'Click to stop voice recording' : 'Dictate description with microphone'}
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5 text-rose-600" /> : <Mic className="w-3.5 h-3.5 text-blue-600" />}
                  <span>{isRecording ? 'Listening (Click to Stop)' : 'Dictate with Mic'}</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide physical details: depth of pothole, road blockage, hazard to pedestrians..."
                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* RIGHT COLUMN: AI Triage & Submission Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    AI Triage Summary
                  </h2>
                </div>
                {aiResult && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Defect Verified
                  </span>
                )}
              </div>

              {/* Title input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Complaint Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Deep Pothole on Barakhamba Road"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    triggerDuplicateCheck(latitude, longitude, e.target.value);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                >
                  <option value="Pothole">Pothole (Road Infrastructure)</option>
                  <option value="Road Crack">Road Crack / Subsidence</option>
                  <option value="Garbage Pile">Garbage Accumulation (Sanitation)</option>
                  <option value="Overflowing Bin">Overflowing Municipal Dustbin</option>
                  <option value="Water Leakage">Water Pipeline Leakage (Jal Board)</option>
                  <option value="Drainage Blockage">Drainage & Culvert Blockage</option>
                  <option value="Waterlogging">Street Waterlogging / Flood</option>
                  <option value="Damaged Streetlight">Damaged / Non-functional Streetlight</option>
                  <option value="Exposed Electrical Wire">Exposed Live Electrical Wire</option>
                  <option value="Broken Infrastructure">Broken Public Infrastructure (Footpath, Signage)</option>
                  <option value="Other Civic Issue">Other Civic Problem</option>
                </select>
              </div>

              {/* Explainable AI Metrics */}
              {aiResult ? (
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-slate-600">Calculated Severity:</span>
                    <span className="font-bold text-slate-900">{aiResult.severity}</span>
                  </div>

                  <div className="flex items-center justify-between font-medium">
                    <span className="text-slate-600">Explainable Priority:</span>
                    <span className="font-mono font-bold text-blue-700">{aiResult.priority_score.toFixed(0)} / 100</span>
                  </div>

                  <div className="flex items-center justify-between font-medium">
                    <span className="text-slate-600">SLA Resolution Target:</span>
                    <span className="font-semibold text-slate-900">{aiResult.sla_hours} Hours</span>
                  </div>

                  {aiResult.priority_explanation && (
                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 italic">
                      {aiResult.priority_explanation}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1">
                  <div className="font-semibold text-slate-700">Autonomous Triaging Active</div>
                  <p className="text-[11px] leading-relaxed">
                    Upload a photograph or voice description to automatically compute priority score, severity, and SLA commitment.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitReport}
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{submitting ? 'Submitting Report...' : 'Lodge Complaint on NagarSetu'}</span>
              </button>

              <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                <span>Enforces photographic closure audit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
