'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  QrCode,
  Camera,
  CameraOff,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Wifi,
  WifiOff,
  Sparkles,
  Volume2,
  VolumeX,
  FlipHorizontal,
  ChevronRight,
  Filter,
  Check,
  AlertOctagon,
  Flashlight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import jsQR from 'jsqr';

interface MetricState {
  totalRegistered: number;
  checkedInToday: number;
  pendingEntry: number;
  checkInRate: number;
  gateDistribution: Record<string, number>;
}

interface ScanFeedback {
  type: 'VALID' | 'ALREADY_CHECKED_IN' | 'WRONG_EVENT' | 'REGISTRATION_NOT_FOUND' | 'CANCELLED_REGISTRATION' | 'EVENT_POSTPONED' | 'INVALID_QR' | 'OFFLINE_SAVED';
  title: string;
  message: string;
  participant?: any;
  event?: any;
  checkIn?: any;
  timestamp: string;
}

export default function EntryGatePage() {
  const router = useRouter();

  // Authentication State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Gate & Filter Controls
  const [gates, setGates] = useState<any[]>([]);
  const [selectedGateId, setSelectedGateId] = useState<string>('gate-main');
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('ALL');

  // Metrics & Feed
  const [metrics, setMetrics] = useState<MetricState>({
    totalRegistered: 0,
    checkedInToday: 0,
    pendingEntry: 0,
    checkInRate: 0,
    gateDistribution: {},
  });
  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // Scanner & Inputs
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [scanCodeInput, setScanCodeInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Status feedback & High-Throughput Auto-Reset
  const [feedback, setFeedback] = useState<ScanFeedback | null>(null);
  const [autoResetSeconds, setAutoResetSeconds] = useState<number | null>(null);
  const autoResetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Offline detection & queue
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState<string[]>([]);

  // Synthesize audio chimes using standard Web Audio API
  const playSound = (type: 'SUCCESS' | 'WARNING' | 'ERROR') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'SUCCESS') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'WARNING') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(349.23, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      // Audio autoplay policy fallback
    }
  };

  // Check authentication on mount
  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => {
        if (!res.ok) throw new Error('Not logged in');
        return res.json();
      })
      .then((data) => {
        if (!data.authenticated) {
          router.push('/entry/login');
        } else {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {
        router.push('/entry/login');
      })
      .finally(() => setAuthLoading(false));

    // Online / Offline listener
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const savedQueue = localStorage.getItem('colorido_offline_gate_queue');
    if (savedQueue) {
      try {
        setOfflineQueue(JSON.parse(savedQueue));
      } catch (e) {}
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (autoResetTimerRef.current) {
        clearInterval(autoResetTimerRef.current);
        autoResetTimerRef.current = null;
      }
      stopCamera();
    };
  }, [router]);

  // High-throughput auto-reset handler
  const resetScanner = () => {
    if (autoResetTimerRef.current) {
      clearInterval(autoResetTimerRef.current);
      autoResetTimerRef.current = null;
    }
    setAutoResetSeconds(null);
    setFeedback(null);
    lastScannedCodeRef.current = '';
    isProcessingRef.current = false;
  };

  // Keyboard shortcut (Space / Enter) to advance to next attendee immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA')) {
          return;
        }
        e.preventDefault();
        resetScanner();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch metrics & check-in list
  const loadCheckInData = async () => {
    setLoadingMetrics(true);
    try {
      const url = `/api/checkin?gateId=${selectedGateId}&eventId=${selectedEventId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
        setRecentCheckIns(data.recentCheckIns || []);
        if (data.gates?.length) setGates(data.gates);
        if (data.events?.length) setEvents(data.events);
      }
    } catch (e) {
      console.error('Error fetching checkin metrics:', e);
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadCheckInData();
      const interval = setInterval(loadCheckInData, 6000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, selectedGateId, selectedEventId]);

  // Camera Management with Universal Compatibility & Device Selection
  const startCamera = async (overrideDeviceId?: string) => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setTorchOn(false);

      const deviceIdToUse = overrideDeviceId !== undefined ? overrideDeviceId : selectedDeviceId;

      const videoConstraints: MediaTrackConstraints = deviceIdToUse
        ? { deviceId: { exact: deviceIdToUse } }
        : {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false,
        });
      } catch (err: any) {
        console.warn('Advanced camera constraints failed, attempting fallback:', err);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;

      // Inspect torch capabilities
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && typeof videoTrack.getCapabilities === 'function') {
        const capabilities = videoTrack.getCapabilities() as any;
        setHasTorch(Boolean(capabilities?.torch));
      } else {
        setHasTorch(false);
      }

      // Enumerate available video inputs
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setVideoDevices(videoInputs);
        if (!deviceIdToUse && videoTrack) {
          const currentSettings = videoTrack.getSettings();
          if (currentSettings.deviceId) {
            setSelectedDeviceId(currentSettings.deviceId);
          }
        }
      } catch (e) {
        console.warn('Device enumeration error:', e);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        videoRef.current.muted = true;
        videoRef.current.defaultMuted = true;
        try {
          await videoRef.current.play();
        } catch (e) {
          console.warn('Video play auto-call:', e);
        }
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      let errorMsg = 'Camera access unavailable. Ensure permissions are granted or use manual search below.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Camera permission denied. Please allow camera access in your browser to scan QR tickets.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'No camera found on this device. Please use manual entry below.';
      }
      setCameraError(errorMsg);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setTorchOn(false);
    setHasTorch(false);
    setCameraActive(false);
    isProcessingRef.current = false;
  };

  const toggleTorch = async () => {
    if (!streamRef.current || !hasTorch) return;
    try {
      const track = streamRef.current.getVideoTracks()[0];
      if (track) {
        const nextState = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchOn(nextState);
      }
    } catch (e) {
      console.warn('Could not toggle torch:', e);
    }
  };

  const toggleCamera = () => {
    if (cameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    if (cameraActive) {
      startCamera(deviceId);
    }
  };

  const lastScannedCodeRef = useRef<string>('');
  const lastScanTimeRef = useRef<number>(0);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  // Real-time camera frame detection loop with universal jsQR (High-throughput optimized)
  useEffect(() => {
    if (!cameraActive) {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      return;
    }

    let isScanning = true;
    let barcodeDetector: any = null;

    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        barcodeDetector = new (window as any).BarcodeDetector({
          formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'upc_a'],
        });
      } catch (e) {
        console.warn('BarcodeDetector format init error:', e);
      }
    }

    // Hidden canvas for universal frame extraction
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const scanFrame = async () => {
      if (!isScanning || !videoRef.current || isProcessingRef.current) return;
      const video = videoRef.current;
      if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) return;

      try {
        // Universal Engine 1: Scaled canvas + jsQR (high throughput, zero stutter)
        if (ctx) {
          const MAX_DIM = 640;
          let w = video.videoWidth;
          let h = video.videoHeight;
          if (w > MAX_DIM || h > MAX_DIM) {
            if (w > h) {
              h = Math.round((h * MAX_DIM) / w);
              w = MAX_DIM;
            } else {
              w = Math.round((w * MAX_DIM) / h);
              h = MAX_DIM;
            }
          }

          if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
          }

          ctx.drawImage(video, 0, 0, w, h);
          const imageData = ctx.getImageData(0, 0, w, h);

          // Fast universal decode (attemptBoth covers normal & inverted in one call)
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });

          if (qrCode && qrCode.data) {
            const rawVal = qrCode.data.trim();
            if (rawVal) {
              const now = Date.now();
              if (rawVal === lastScannedCodeRef.current && now - lastScanTimeRef.current < 2500) {
                return;
              }
              // Immediately lock scanner synchronously
              isProcessingRef.current = true;
              lastScannedCodeRef.current = rawVal;
              lastScanTimeRef.current = now;
              setProcessing(true);
              processCheckIn(rawVal, 'CAMERA_SCAN');
              return;
            }
          }
        }

        // Secondary Engine 2: Native BarcodeDetector if available
        if (barcodeDetector && !isProcessingRef.current) {
          const barcodes = await barcodeDetector.detect(video);
          if (barcodes && barcodes.length > 0 && !isProcessingRef.current) {
            const rawVal = barcodes[0].rawValue?.trim();
            if (rawVal) {
              const now = Date.now();
              if (rawVal === lastScannedCodeRef.current && now - lastScanTimeRef.current < 2500) {
                return;
              }
              isProcessingRef.current = true;
              lastScannedCodeRef.current = rawVal;
              lastScanTimeRef.current = now;
              setProcessing(true);
              processCheckIn(rawVal, 'CAMERA_SCAN');
              return;
            }
          }
        }
      } catch (err) {
        // Frame dropped or busy
      }
    };

    scanIntervalRef.current = setInterval(scanFrame, 100);

    return () => {
      isScanning = false;
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
    };
  }, [cameraActive]);

  const flipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    setSelectedDeviceId('');
    if (cameraActive) {
      stopCamera();
      setTimeout(() => {
        setFacingMode(nextMode);
        startCamera();
      }, 150);
    }
  };

  // Process check-in for an ID
  const processCheckIn = async (rawCode: string, mode: 'CAMERA_SCAN' | 'MANUAL_ENTRY' = 'CAMERA_SCAN') => {
    const code = rawCode.trim();
    if (!code) {
      isProcessingRef.current = false;
      setProcessing(false);
      return;
    }

    isProcessingRef.current = true;
    setProcessing(true);
    const selectedGate = gates.find((g) => g.id === selectedGateId);
    const gateName = selectedGate ? selectedGate.name : 'Main Gate';

    // Safely extract registration ID or ticket ID if payload is JSON, /verify/ URL, or /ticket/ URL
    let targetCode = code;
    try {
      if (code.startsWith('{') && code.endsWith('}')) {
        const parsed = JSON.parse(code);
        targetCode = (parsed.regId || parsed.id || parsed.registrationId || parsed.tktId || code).trim();
      } else if (code.includes('/verify/')) {
        const parts = code.split('/verify/');
        targetCode = parts[parts.length - 1].split('?')[0].split('#')[0].trim();
      } else if (code.includes('/ticket/')) {
        const parts = code.split('/ticket/');
        targetCode = parts[parts.length - 1].split('?')[0].split('#')[0].trim();
      }
    } catch {}

    // Offline handling
    if (!navigator.onLine) {
      const updatedQueue = [...offlineQueue, targetCode];
      setOfflineQueue(updatedQueue);
      localStorage.setItem('colorido_offline_gate_queue', JSON.stringify(updatedQueue));
      setFeedback({
        type: 'OFFLINE_SAVED',
        title: 'Offline Scan Buffered',
        message: `Network offline: Stored entry record for "${targetCode}". Will sync when gate reconnects.`,
        timestamp: new Date().toLocaleTimeString(),
      });
      playSound('WARNING');
      setScanCodeInput('');
      setProcessing(false);
      return;
    }

    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: targetCode,
          qrPayload: code,
          mode,
          eventIdFilter: selectedEventId,
          gateId: selectedGateId,
          gateName,
        }),
      });

      const data = await res.json();

      if (data.code === 'VALID') {
        playSound('SUCCESS');
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#00DCEB', '#5227FF', '#FF2E93', '#10B981'],
        });
        setFeedback({
          type: 'VALID',
          title: 'ACCESS GRANTED • CHECK-IN VERIFIED',
          message: data.message,
          participant: data.participant,
          event: data.event,
          checkIn: data.checkIn,
          timestamp: new Date().toLocaleTimeString(),
        });
        loadCheckInData();
      } else if (data.code === 'ALREADY_CHECKED_IN') {
        playSound('WARNING');
        setFeedback({
          type: 'ALREADY_CHECKED_IN',
          title: 'ALREADY CHECKED IN • DUPLICATE DETECTED',
          message: data.message,
          participant: data.participant,
          event: data.event,
          checkIn: data.checkIn,
          timestamp: new Date().toLocaleTimeString(),
        });
      } else if (data.code === 'WRONG_EVENT') {
        playSound('WARNING');
        setFeedback({
          type: 'WRONG_EVENT',
          title: 'WRONG EVENT DESK',
          message: data.message,
          participant: data.participant,
          event: data.event,
          timestamp: new Date().toLocaleTimeString(),
        });
      } else if (data.code === 'REGISTRATION_NOT_FOUND') {
        playSound('ERROR');
        setFeedback({
          type: 'REGISTRATION_NOT_FOUND',
          title: 'REGISTRATION NOT FOUND',
          message: data.message,
          timestamp: new Date().toLocaleTimeString(),
        });
      } else if (data.code === 'CANCELLED_REGISTRATION') {
        playSound('ERROR');
        setFeedback({
          type: 'CANCELLED_REGISTRATION',
          title: 'CANCELLED REGISTRATION • ENTRY FORBIDDEN',
          message: data.message,
          participant: data.participant,
          timestamp: new Date().toLocaleTimeString(),
        });
      } else {
        playSound('ERROR');
        setFeedback({
          type: 'INVALID_QR',
          title: 'INVALID ENTRY PASS',
          message: data.message || 'Verification could not be completed.',
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    } catch (err: any) {
      playSound('ERROR');
      setFeedback({
        type: 'INVALID_QR',
        title: 'NETWORK VERIFICATION FAILURE',
        message: 'Could not contact gate server. Check connectivity or retry.',
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setProcessing(false);
      setScanCodeInput('');
      // Trigger high-throughput 3-second auto-reset countdown
      if (autoResetTimerRef.current) {
        clearInterval(autoResetTimerRef.current);
        autoResetTimerRef.current = null;
      }
      setAutoResetSeconds(3);
      let remaining = 3;
      autoResetTimerRef.current = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          if (autoResetTimerRef.current) {
            clearInterval(autoResetTimerRef.current);
            autoResetTimerRef.current = null;
          }
          setAutoResetSeconds(null);
          setFeedback(null);
          lastScannedCodeRef.current = '';
          isProcessingRef.current = false;
        } else {
          setAutoResetSeconds(remaining);
        }
      }, 1000);
    }
  };

  // Search registrations on manual query
  const handleSearchRegistrations = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(`/api/registrations?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success && data.registrations) {
        setSearchResults(data.registrations.slice(0, 5));
      }
    } catch (e) {}
  };

  // Sync offline queue
  const handleSyncOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;
    setProcessing(true);
    for (const code of offlineQueue) {
      await processCheckIn(code, 'MANUAL_ENTRY');
    }
    setOfflineQueue([]);
    localStorage.removeItem('colorido_offline_gate_queue');
    setProcessing(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/entry/login');
    } catch (e) {
      router.push('/entry/login');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-400">Initializing Entry Gate Terminal...</p>
        </div>
      </div>
    );
  }

  const selectedGateObj = gates.find((g) => g.id === selectedGateId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Top Command Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Gate Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-pink-500 p-[2px] shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <QrCode className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-tight text-base sm:text-lg">
                  COLORIDO 2K26
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  ENTRY CONTROL
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                R.V.R. & J.C. College of Engineering • Official Checkpoint
              </p>
            </div>
          </div>

          {/* Gate Selector & Event Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Gate Selector */}
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <select
                value={selectedGateId}
                onChange={(e) => setSelectedGateId(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-1"
              >
                {gates.map((g) => (
                  <option key={g.id} value={g.id} className="bg-slate-900 text-white">
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Filter */}
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-1 max-w-[180px] truncate"
              >
                <option value="ALL" className="bg-slate-900 text-white">
                  All Events (General Entry)
                </option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id} className="bg-slate-900 text-white">
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* User Badge, Sound, Offline, Logout */}
          <div className="flex items-center gap-2">
            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Audio Alerts' : 'Enable Audio Alerts'}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Connectivity Status */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold ${
                isOnline
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : 'bg-red-950/60 border-red-800 text-red-300'
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-red-400" />}
              <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            {/* User Chip */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <div className="text-left hidden md:block">
                <p className="font-semibold text-white leading-tight">{currentUser?.name || 'Staff'}</p>
                <p className="text-[10px] text-slate-400">{currentUser?.role || 'CHECK_IN_STAFF'}</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Offline Alert Banner */}
      {(!isOnline || offlineQueue.length > 0) && (
        <div className="bg-amber-950/80 border-b border-amber-800 px-4 py-2 text-xs text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>
              {!isOnline
                ? 'Network disconnected. Check-ins are saved locally and will sync once reconnected.'
                : `You have ${offlineQueue.length} pending offline check-ins stored.`}
            </span>
          </div>
          {offlineQueue.length > 0 && isOnline && (
            <button
              onClick={handleSyncOfflineQueue}
              disabled={processing}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition"
            >
              Sync {offlineQueue.length} Queue Items
            </button>
          )}
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Top Real Metrics Row */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Checked In Today</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">
              {metrics.checkedInToday}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Verified physical entries</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Registered</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 mt-1">
              {metrics.totalRegistered}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Users className="w-3 h-3 text-cyan-400" />
              <span>{selectedEventId === 'ALL' ? 'Across all events' : 'For selected event'}</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Entry</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1">
              {metrics.pendingEntry}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Awaiting checkpoint arrival</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Check-In Rate</span>
              <span className="text-xs font-bold text-pink-400">{metrics.checkInRate}%</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {metrics.checkInRate}%
            </div>
            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-gradient-to-r from-cyan-400 to-pink-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, metrics.checkInRate)}%` }}
              />
            </div>
          </div>
        </section>

        {/* Central Operations Grid: Scanner & Status Cards */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: QR Scanner & Barcode Gun Input (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Scanner Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                    <Camera className="w-4 h-4" />
                  </div>
                  <h2 className="font-bold text-white text-base">QR Camera & Barcode Station</h2>
                </div>

                <div className="flex items-center gap-2">
                  {cameraActive && (
                    <>
                      {hasTorch && (
                        <button
                          type="button"
                          onClick={toggleTorch}
                          title={torchOn ? 'Turn Off Flashlight' : 'Turn On Flashlight for Dark Checkpoints'}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                            torchOn
                              ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/30'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          }`}
                        >
                          <Flashlight className={`w-3.5 h-3.5 ${torchOn ? 'text-slate-950' : 'text-amber-400'}`} />
                          <span className="hidden sm:inline">{torchOn ? 'Torch On' : 'Torch'}</span>
                        </button>
                      )}
                      {videoDevices.length > 1 && (
                        <select
                          value={selectedDeviceId}
                          onChange={(e) => handleDeviceChange(e.target.value)}
                          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5 max-w-[120px] truncate focus:outline-none"
                          title="Select Camera Device"
                        >
                          {videoDevices.map((dev, idx) => (
                            <option key={dev.deviceId || idx} value={dev.deviceId} className="bg-slate-900 text-white">
                              {dev.label || `Camera ${idx + 1}`}
                            </option>
                          ))}
                        </select>
                      )}
                      <button
                        type="button"
                        onClick={flipCamera}
                        title="Flip Camera (Front/Back)"
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1 transition"
                      >
                        <FlipHorizontal className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Flip</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={toggleCamera}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                      cameraActive
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/25'
                    }`}
                  >
                    {cameraActive ? (
                      <>
                        <CameraOff className="w-3.5 h-3.5" />
                        <span>Stop Camera</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-3.5 h-3.5" />
                        <span>Activate Camera</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Camera Viewfinder Box */}
              <div className="relative w-full aspect-[4/3] max-h-[320px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                {cameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                      autoPlay
                    />
                    {/* Auto Scan Indicator Badge */}
                    <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-cyan-500/60 text-cyan-300 text-[10px] font-bold flex items-center gap-1.5 shadow-md backdrop-blur-xs">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span>{processing ? 'QR DETECTED • VERIFYING TICKET...' : 'READY TO SCAN • LIVE QR ACTIVE'}</span>
                    </div>
                    {/* Targeting Laser Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-56 h-56 border-2 border-cyan-400/70 rounded-2xl relative shadow-2xl">
                        {/* Target corners */}
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-cyan-400" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-cyan-400" />
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-cyan-400" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-cyan-400" />
                        {/* Moving laser sweep line */}
                        <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-300">Camera Scanner Inactive</p>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Click &quot;Activate Camera&quot; above to scan mobile tickets directly, or use a handheld barcode scanner gun below.
                    </p>
                  </div>
                )}

                {cameraError && (
                  <div className="absolute inset-x-4 bottom-4 p-3 rounded-lg bg-red-950/90 border border-red-800 text-red-200 text-xs">
                    {cameraError}
                  </div>
                )}
              </div>

              {/* Barcode Scanner Gun / Fast Input */}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Barcode Scanner Gun / Instant Code Entry
                </label>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    processCheckIn(scanCodeInput, 'MANUAL_ENTRY');
                  }}
                  className="flex gap-2"
                >
                  <div className="relative flex-1">
                    <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={scanCodeInput}
                      onChange={(e) => setScanCodeInput(e.target.value)}
                      placeholder="Scan with gun or type (e.g. CLR26-CLT-K834)"
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                      disabled={processing}
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={processing || !scanCodeInput.trim()}
                    className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition disabled:opacity-40 shrink-0"
                  >
                    {processing ? 'Verifying...' : 'Check In'}
                  </button>
                </form>
              </div>

              {/* Real Database Checkpoint Verification */}
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <span className="text-[11px] font-medium text-slate-400 block mb-2">
                  System Diagnostics & Genuine Ticket Verification:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => processCheckIn('CLR26-CLT-K834')}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-cyan-300 border border-slate-700 transition"
                  >
                    Verify Pass: CLR26-CLT-K834 (Venkata Mani Gopal)
                  </button>
                  <button
                    type="button"
                    onClick={() => processCheckIn('TKT-CLR26-CLT-K834')}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-pink-300 border border-slate-700 transition"
                  >
                    Verify Ticket ID: TKT-CLR26-CLT-K834
                  </button>
                  <button
                    type="button"
                    onClick={() => processCheckIn('CLR26-UNREGISTERED-PASS')}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-red-400 border border-slate-700 transition"
                  >
                    Test Unregistered / Invalid Pass
                  </button>
                </div>
              </div>
            </div>

            {/* Fast Manual Search */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">Fast Manual Participant Lookup</h3>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Search by attendee name, mobile number, student ID, or college if physical pass or QR is damaged.
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchRegistrations(e.target.value)}
                  placeholder="Type participant name, phone, or college..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              {searchResults.length > 0 && (
                <div className="mt-3 divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                  {searchResults.map((reg) => (
                    <div key={reg.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-bold text-white">{reg.participantName}</div>
                        <div className="text-[11px] text-slate-400">{reg.collegeName} • {reg.eventTitle}</div>
                        <div className="text-[10px] text-cyan-400 font-mono mt-0.5">{reg.id} • {reg.phone}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {reg.checkInStatus === 'CHECKED_IN' ? (
                          <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
                            Checked In
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => processCheckIn(reg.id, 'MANUAL_ENTRY')}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition"
                          >
                            Check In
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Instant Live Status Feedback (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Feedback Panel */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl min-h-[380px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Checkpoint Status Feedback
                  </h3>
                  {feedback && (
                    <span className="text-[11px] font-mono text-slate-400">{feedback.timestamp}</span>
                  )}
                </div>

                {processing ? (
                  <div className="py-16 text-center space-y-4 animate-pulse">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-950/60 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
                      <RefreshCw className="w-7 h-7 animate-spin" />
                    </div>
                    <div>
                      <div className="font-extrabold text-cyan-300 text-sm uppercase tracking-wider">
                        VERIFYING TICKET...
                      </div>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                        Validating attendee credentials against official festival database...
                      </p>
                    </div>
                  </div>
                ) : !feedback ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400">
                      <QrCode className="w-7 h-7" />
                    </div>
                    <div className="font-semibold text-slate-300 text-sm">READY TO SCAN</div>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Scan a badge via camera or scanner gun to verify validity, event registration, and identity.
                    </p>
                  </div>
                ) : feedback.type === 'VALID' ? (
                  /* VALID PASS BANNER (Green) */
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="p-4 rounded-xl bg-emerald-950/80 border-2 border-emerald-500 text-emerald-100 shadow-xl">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-emerald-500 text-slate-950 shrink-0">
                          <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="font-extrabold text-lg text-emerald-300 leading-tight">
                            {feedback.title}
                          </div>
                          <div className="text-xs text-emerald-200 mt-1">{feedback.message}</div>
                        </div>
                      </div>
                    </div>

                    {/* Participant & Event Credentials */}
                    {feedback.participant && (
                      <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2 text-xs">
                        <div className="flex justify-between border-b border-slate-800/80 pb-2">
                          <span className="text-slate-400">Participant Name:</span>
                          <span className="font-bold text-white text-sm">{feedback.participant.participantName}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800/80 pb-2">
                          <span className="text-slate-400">College / Institution:</span>
                          <span className="font-medium text-slate-200 text-right max-w-[200px] truncate">{feedback.participant.collegeName}</span>
                        </div>
                        {feedback.participant.department && (
                          <div className="flex justify-between border-b border-slate-800/80 pb-2">
                            <span className="text-slate-400">Department & Year:</span>
                            <span className="font-medium text-slate-200 text-right">
                              {feedback.participant.department} {feedback.participant.year ? `• ${feedback.participant.year}` : ''}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between border-b border-slate-800/80 pb-2">
                          <span className="text-slate-400">Registered Event:</span>
                          <span className="font-bold text-cyan-300 text-right">{feedback.participant.eventTitle}</span>
                        </div>
                        {feedback.participant.category && (
                          <div className="flex justify-between border-b border-slate-800/80 pb-2">
                            <span className="text-slate-400">Category:</span>
                            <span className="font-semibold uppercase tracking-wider text-[11px] text-pink-300">
                              {feedback.participant.category}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between border-b border-slate-800/80 pb-2">
                          <span className="text-slate-400">Registration ID:</span>
                          <span className="font-mono text-cyan-300">{feedback.participant.id}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800/80 pb-2">
                          <span className="text-slate-400">Ticket ID:</span>
                          <span className="font-mono text-pink-300">{feedback.participant.ticketId || `TKT-${feedback.participant.id}`}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800/80 pb-2">
                          <span className="text-slate-400">Registration Status:</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {feedback.participant.status || 'CONFIRMED'}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800/80 pb-2">
                          <span className="text-slate-400">Check-in Status:</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            {feedback.participant.checkInStatus || 'CHECKED_IN'}
                          </span>
                        </div>
                        {feedback.participant.teamName && (
                          <div className="flex justify-between border-b border-slate-800/80 pb-2">
                            <span className="text-slate-400">Team Name:</span>
                            <span className="font-bold text-amber-300">{feedback.participant.teamName}</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-1">
                          <span className="text-slate-400">Verified Gate:</span>
                          <span className="font-semibold text-emerald-400">{feedback.checkIn?.gateName || selectedGateObj?.name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : feedback.type === 'ALREADY_CHECKED_IN' ? (
                  /* ALREADY CHECKED IN BANNER (Amber) */
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="p-4 rounded-xl bg-amber-950/80 border-2 border-amber-500 text-amber-100 shadow-xl">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shrink-0">
                          <AlertTriangle className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="font-extrabold text-base text-amber-300 leading-tight">
                            {feedback.title}
                          </div>
                          <div className="text-xs text-amber-200 mt-1">{feedback.message}</div>
                        </div>
                      </div>
                    </div>

                    {feedback.participant && (
                      <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2 text-xs">
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-slate-400">Attendee:</span>
                          <span className="font-bold text-white">{feedback.participant.participantName}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-slate-400">Event:</span>
                          <span className="font-semibold text-cyan-300">{feedback.participant.eventTitle}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-slate-400">First Check-In Time:</span>
                          <span className="font-mono text-amber-400">
                            {feedback.participant.checkedInAt
                              ? new Date(feedback.participant.checkedInAt).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                })
                              : 'Earlier Today'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Checked In By:</span>
                          <span className="font-semibold text-white">{feedback.participant.checkedInBy || 'Staff'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : feedback.type === 'WRONG_EVENT' ? (
                  /* WRONG EVENT BANNER (Orange) */
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="p-4 rounded-xl bg-orange-950/80 border-2 border-orange-500 text-orange-100 shadow-xl">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-orange-500 text-slate-950 shrink-0">
                          <AlertOctagon className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="font-extrabold text-base text-orange-300 leading-tight">
                            {feedback.title}
                          </div>
                          <div className="text-xs text-orange-200 mt-1">{feedback.message}</div>
                        </div>
                      </div>
                    </div>

                    {feedback.participant && (
                      <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2 text-xs">
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-slate-400">Participant:</span>
                          <span className="font-bold text-white">{feedback.participant.participantName}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                          <span className="text-slate-400">Their Event:</span>
                          <span className="font-bold text-orange-300">{feedback.participant.eventTitle}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Current Checkpoint:</span>
                          <span className="font-semibold text-white">
                            {events.find((e) => e.id === selectedEventId)?.title || 'Selected Event Desk'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* INVALID OR CANCELLED BANNER (Red) */
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="p-4 rounded-xl bg-red-950/80 border-2 border-red-500 text-red-100 shadow-xl">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-red-500 text-slate-950 shrink-0">
                          <XCircle className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="font-extrabold text-base text-red-300 leading-tight">
                            {feedback.title}
                          </div>
                          <div className="text-xs text-red-200 mt-1">{feedback.message}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* High-Throughput Auto-Reset & Next Attendee Action */}
              {feedback && (
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                  {autoResetSeconds !== null && (
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1.5 font-medium text-cyan-300">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        Auto-ready for next attendee in {autoResetSeconds}s...
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Press Space / Enter</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={resetScanner}
                    className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Scan Next Attendee [Spacebar]</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Live Check-In Feed Section */}
        <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h2 className="font-bold text-white text-base">Live Check-In Activity Feed</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {recentCheckIns.length} Records
              </span>
            </div>
            <button
              onClick={loadCheckInData}
              disabled={loadingMetrics}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingMetrics ? 'animate-spin' : ''}`} />
              <span>Refresh Feed</span>
            </button>
          </div>

          {recentCheckIns.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              No entries logged for the current filter yet. Ready for incoming participants!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Participant</th>
                    <th className="py-2.5 px-3">Event</th>
                    <th className="py-2.5 px-3">College</th>
                    <th className="py-2.5 px-3">Gate</th>
                    <th className="py-2.5 px-3">Staff Desk</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {recentCheckIns.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-white">{item.participantName}</div>
                        <div className="text-[10px] text-cyan-400 font-mono">{item.registrationId}</div>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-200">{item.eventTitle}</td>
                      <td className="py-2.5 px-3 text-slate-400 max-w-[160px] truncate">{item.collegeName}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold border border-slate-700">
                          {item.gateName || 'Main Gate'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{item.staffName || 'Staff'}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.mode === 'CAMERA_SCAN' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-purple-500/20 text-purple-300'
                        }`}>
                          {item.mode === 'CAMERA_SCAN' ? 'Camera QR' : 'Manual Entry'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
