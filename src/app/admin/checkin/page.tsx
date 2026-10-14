'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
  QrCode,
  Camera,
  CameraOff,
  FlipHorizontal,
  Flashlight,
  RefreshCw,
  Wifi,
  WifiOff,
  UserCheck,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  Shield,
  Layers,
  GraduationCap,
  Hash,
  AlertOctagon,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import jsQR from 'jsqr';

export default function AdminCheckInPage() {
  const [manualId, setManualId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [scanStatus, setScanStatus] = useState<'IDLE' | 'SCANNING' | 'DETECTED' | 'VERIFYING'>('IDLE');
  const [isOnline, setIsOnline] = useState(true);
  const [offlineScans, setOfflineScans] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);

  // Camera Management States
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // References for camera & frame loop
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastScannedCodeRef = useRef<string>('');
  const lastScanTimeRef = useRef<number>(0);
  const isProcessingRef = useRef<boolean>(false);

  // Auto-reset timer
  const [autoResetSeconds, setAutoResetSeconds] = useState<number | null>(null);
  const autoResetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Web Audio feedback chimes
  const playSound = (type: 'SUCCESS' | 'WARNING' | 'ERROR') => {
    if (typeof window === 'undefined') return;
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
    } catch (e) {}
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load offline scan queue
    const cached = localStorage.getItem('colorido_offline_checkins');
    if (cached) {
      try {
        setOfflineScans(JSON.parse(cached));
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
  }, []);

  // Keyboard shortcut (Space / Enter) outside input to scan next participant
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

  const resetScanner = () => {
    if (autoResetTimerRef.current) {
      clearInterval(autoResetTimerRef.current);
      autoResetTimerRef.current = null;
    }
    setAutoResetSeconds(null);
    setResult(null);
    setScanStatus(cameraActive ? 'SCANNING' : 'IDLE');
    lastScannedCodeRef.current = '';
    isProcessingRef.current = false;
  };

  // Camera Management
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
        console.warn('Strict camera constraints failed, attempting fallback:', err);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && typeof videoTrack.getCapabilities === 'function') {
        const capabilities = videoTrack.getCapabilities() as any;
        setHasTorch(Boolean(capabilities?.torch));
      } else {
        setHasTorch(false);
      }

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
      setScanStatus('SCANNING');
    } catch (err: any) {
      console.error('Camera access error:', err);
      let errorMsg = 'Camera access unavailable. Ensure permissions are granted or use manual entry below.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Camera permission denied. Please allow camera access in your browser.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'No camera found on this device. Please use manual entry below.';
      }
      setCameraError(errorMsg);
      setCameraActive(false);
      setScanStatus('IDLE');
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
    setScanStatus('IDLE');
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

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    if (cameraActive) {
      startCamera(deviceId);
    }
  };

  // Real-Time Frame Detection Loop with Universal jsQR
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
      } catch (e) {}
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const scanFrame = async () => {
      if (!isScanning || !videoRef.current || isProcessingRef.current) return;
      const video = videoRef.current;
      if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) return;

      try {
        const now = Date.now();

        // 1. Primary: Hardware-accelerated BarcodeDetector (instant C++ sub-frame detection)
        if (barcodeDetector && !isProcessingRef.current) {
          try {
            const barcodes = await barcodeDetector.detect(video);
            if (barcodes && barcodes.length > 0 && !isProcessingRef.current) {
              const rawVal = barcodes[0].rawValue?.trim();
              if (rawVal) {
                if (rawVal === lastScannedCodeRef.current && now - lastScanTimeRef.current < 2500) {
                  return;
                }
                // Immediately synchronously lock the scanner
                isProcessingRef.current = true;
                lastScannedCodeRef.current = rawVal;
                lastScanTimeRef.current = now;

                setScanStatus('VERIFYING');
                setLoading(true);
                handleProcessCheckIn(rawVal, 'CAMERA_SCAN');
                return;
              }
            }
          } catch (barcodeErr) {}
        }

        // 2. Secondary / Universal: jsQR with high-definition crisp downscaling
        if (ctx && !isProcessingRef.current) {
          const MAX_DIM = 800;
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

          // Fast universal decode (attemptBoth covers standard and inverted in one single pass)
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth',
          });

          if (qrCode && qrCode.data && !isProcessingRef.current) {
            const rawVal = qrCode.data.trim();
            if (rawVal) {
              if (rawVal === lastScannedCodeRef.current && now - lastScanTimeRef.current < 2500) {
                return;
              }
              // Immediately synchronously lock the scanner
              isProcessingRef.current = true;
              lastScannedCodeRef.current = rawVal;
              lastScanTimeRef.current = now;

              setScanStatus('VERIFYING');
              setLoading(true);
              handleProcessCheckIn(rawVal, 'CAMERA_SCAN');
              return;
            }
          }
        }
      } catch (err) {}
    };

    scanIntervalRef.current = setInterval(scanFrame, 60);

    return () => {
      isScanning = false;
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
    };
  }, [cameraActive]);

  // Main Backend Verification & Check-In Handler
  const handleProcessCheckIn = async (
    targetId: string,
    mode: 'CAMERA_SCAN' | 'MANUAL_ENTRY' = 'MANUAL_ENTRY'
  ) => {
    const rawCode = targetId.trim();
    if (!rawCode) {
      isProcessingRef.current = false;
      setLoading(false);
      setScanStatus(cameraActive ? 'SCANNING' : 'IDLE');
      return;
    }

    isProcessingRef.current = true;
    setLoading(true);
    setScanStatus('VERIFYING');

    // Extract identifier if JSON payload, /verify/ URL, or /ticket/ URL was provided
    let idToScan = rawCode;
    try {
      if (rawCode.startsWith('{') && rawCode.endsWith('}')) {
        const parsed = JSON.parse(rawCode);
        idToScan = (parsed.regId || parsed.id || parsed.registrationId || parsed.tktId || rawCode).trim();
      } else if (rawCode.includes('/verify/')) {
        const parts = rawCode.split('/verify/');
        idToScan = parts[parts.length - 1].split('?')[0].split('#')[0].trim();
      } else if (rawCode.includes('/ticket/')) {
        const parts = rawCode.split('/ticket/');
        idToScan = parts[parts.length - 1].split('?')[0].split('#')[0].trim();
      }
    } catch {}

    // Offline buffer
    if (!navigator.onLine) {
      const updated = [...offlineScans, idToScan];
      setOfflineScans(updated);
      localStorage.setItem('colorido_offline_checkins', JSON.stringify(updated));
      setResult({
        success: true,
        offline: true,
        code: 'OFFLINE_SAVED',
        message: `Offline mode: Saved scan for "${idToScan}". Will sync when reconnected.`,
      });
      playSound('WARNING');
      setManualId('');
      setLoading(false);
      startAutoReset();
      return;
    }

    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: idToScan,
          qrPayload: rawCode,
          mode,
          gateId: 'gate-admin',
          gateName: 'Admin Central Desk',
        }),
      });

      const json = await res.json();
      setResult(json);

      if (json.code === 'VALID') {
        playSound('SUCCESS');
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#00DCEB', '#5227FF', '#FF2E93', '#10B981'],
        });
      } else if (json.code === 'ALREADY_CHECKED_IN' || json.code === 'WRONG_EVENT') {
        playSound('WARNING');
      } else {
        playSound('ERROR');
      }

      setManualId('');
    } catch (e: any) {
      playSound('ERROR');
      setResult({
        success: false,
        code: 'NETWORK_ERROR',
        message: 'Could not contact gate server. Check connectivity or retry.',
      });
    } finally {
      setLoading(false);
      setScanStatus('IDLE');
      startAutoReset();
    }
  };

  const startAutoReset = () => {
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
        resetScanner();
      } else {
        setAutoResetSeconds(remaining);
      }
    }, 1000);
  };

  const handleSyncOffline = async () => {
    if (offlineScans.length === 0) return;
    setSyncing(true);

    for (const scanId of offlineScans) {
      try {
        await fetch('/api/checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            registrationId: scanId,
            mode: 'OFFLINE_SYNC',
            gateId: 'gate-admin',
            gateName: 'Admin Central Desk',
          }),
        });
      } catch (e) {
        console.error('Failed to sync scan:', scanId);
      }
    }

    setOfflineScans([]);
    localStorage.removeItem('colorido_offline_checkins');
    setSyncing(false);
    alert('Offline check-ins synced successfully!');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-widest mb-2 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>FESTIVAL ARENA CHECK-IN &amp; QR SCANNER</span>
          </div>
          <h1 className="font-display font-black text-3xl text-[#090814]">
            CAMPUS CHECK-IN DESK
          </h1>
          <p className="text-xs sm:text-sm text-[#525266]">
            Real-time machine-readable QR detection, central database verification, and entry credential validation.
          </p>
        </div>

        {/* Connectivity Status & Offline Sync */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
              isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'ONLINE DESK' : 'OFFLINE MODE'}</span>
          </div>

          {offlineScans.length > 0 && (
            <button
              onClick={handleSyncOffline}
              disabled={syncing}
              className="px-3 py-1.5 rounded-xl bg-[#5227FF] text-white text-xs font-bold hover:bg-primary-hover shadow-sm transition"
            >
              {syncing ? 'Syncing...' : `Sync (${offlineScans.length}) Scans`}
            </button>
          )}
        </div>
      </div>

      {/* Main Scanner & Input Station */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Camera Scanner & Barcode Gun Input (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl bg-white border-2 border-gray-200 shadow-xl space-y-4">
            {/* Camera Viewfinder Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-cyan-100 text-cyan-800">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-display font-black text-base text-[#090814]">
                    LIVE CAMERA QR SCANNER
                  </h2>
                  <p className="text-[11px] text-[#717188]">
                    Point device camera at attendee ticket pass
                  </p>
                </div>
              </div>

              {/* Camera Controls */}
              <div className="flex items-center gap-2">
                {cameraActive && (
                  <>
                    {hasTorch && (
                      <button
                        type="button"
                        onClick={toggleTorch}
                        title={torchOn ? 'Turn Off Flashlight' : 'Turn On Flashlight'}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                          torchOn
                            ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/30'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }`}
                      >
                        <Flashlight className={`w-3.5 h-3.5 ${torchOn ? 'text-slate-950' : 'text-amber-500'}`} />
                        <span className="hidden sm:inline">{torchOn ? 'Torch On' : 'Torch'}</span>
                      </button>
                    )}

                    {videoDevices.length > 1 && (
                      <select
                        value={selectedDeviceId}
                        onChange={(e) => handleDeviceChange(e.target.value)}
                        className="bg-gray-100 border border-gray-300 text-gray-800 text-xs rounded-xl px-2 py-1.5 max-w-[120px] truncate focus:outline-none"
                        title="Choose Camera"
                      >
                        {videoDevices.map((dev, idx) => (
                          <option key={dev.deviceId || idx} value={dev.deviceId}>
                            {dev.label || `Camera ${idx + 1}`}
                          </option>
                        ))}
                      </select>
                    )}

                    <button
                      type="button"
                      onClick={flipCamera}
                      title="Flip Camera"
                      className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-xl flex items-center gap-1 transition"
                    >
                      <FlipHorizontal className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Flip</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={toggleCamera}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    cameraActive
                      ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                      : 'bg-[#5227FF] hover:bg-[#431ce0] text-white shadow-md shadow-indigo-500/20'
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
            <div className="relative w-full aspect-[4/3] max-h-[300px] bg-slate-950 rounded-2xl overflow-hidden border-2 border-gray-900 flex items-center justify-center">
              {cameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                    autoPlay
                  />

                  {/* Status Indicator Badge */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-400 text-cyan-300 text-[10px] font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-xs">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span>
                      {loading || scanStatus === 'VERIFYING'
                        ? 'QR DETECTED • VERIFYING TICKET...'
                        : 'READY TO SCAN • LIVE QR ACTIVE'}
                    </span>
                  </div>

                  {/* Targeting Laser Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-52 h-52 border-2 border-cyan-400/80 rounded-2xl relative shadow-2xl">
                      <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-cyan-400" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-cyan-400" />
                      <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-cyan-400" />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-cyan-400" />
                      <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 space-y-2 text-slate-400">
                  <div className="w-12 h-12 mx-auto rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-200">Camera Scanner Inactive</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Click &quot;Activate Camera&quot; above to scan passes via webcam/mobile camera, or enter code below.
                  </p>
                </div>
              )}

              {cameraError && (
                <div className="absolute inset-x-4 bottom-4 p-3 rounded-xl bg-red-950/90 border border-red-700 text-red-200 text-xs">
                  {cameraError}
                </div>
              )}
            </div>

            {/* Barcode Scanner Gun / Fast Manual Code Entry */}
            <div className="pt-2">
              <label className="block font-display font-black text-sm text-[#090814] mb-2 uppercase tracking-wide">
                Barcode Gun / Manual Registration ID Entry
              </label>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleProcessCheckIn(manualId, 'MANUAL_ENTRY');
                }}
                className="flex gap-2"
              >
                <div className="relative flex-1">
                  <QrCode className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    placeholder="Scan with gun or type (e.g. CLR26-CLT-K834 or TKT-...)"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-gray-200 text-sm font-mono font-bold text-[#090814] focus:border-[#5227FF] focus:outline-none placeholder:text-gray-400 transition"
                    disabled={loading}
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !manualId.trim()}
                  className="px-6 py-3 rounded-2xl bg-[#090814] hover:bg-black text-white text-xs font-bold transition shadow-md shrink-0 disabled:opacity-40"
                >
                  {loading ? 'Verifying...' : 'VERIFY & CHECK IN'}
                </button>
              </form>
            </div>

            {/* Database Test Samples (Genuine Records Only) */}
            <div className="pt-3 border-t border-gray-100">
              <span className="text-[11px] font-semibold text-[#717188] block mb-2">
                Live Database Verification Tests:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleProcessCheckIn('CLR26-CLT-K834', 'MANUAL_ENTRY')}
                  className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-medium text-[#090814] border border-gray-200 transition"
                >
                  Verify Real Pass: CLR26-CLT-K834 (Venkata Mani Gopal)
                </button>
                <button
                  type="button"
                  onClick={() => handleProcessCheckIn('TKT-CLR26-CLT-K834', 'MANUAL_ENTRY')}
                  className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-medium text-pink-600 border border-gray-200 transition"
                >
                  Verify Ticket ID: TKT-CLR26-CLT-K834
                </button>
                <button
                  type="button"
                  onClick={() => handleProcessCheckIn('CLR26-INVALID-CODE', 'MANUAL_ENTRY')}
                  className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-medium text-red-600 border border-gray-200 transition"
                >
                  Test Unregistered Pass
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Real Central Database Results Showcase (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white border-2 border-gray-200 shadow-xl min-h-[460px] flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#5227FF]" />
                  <h3 className="font-display font-black text-sm text-[#090814] uppercase tracking-wider">
                    DATABASE VERIFICATION RECORD
                  </h3>
                </div>
                {result && (
                  <span className="text-[10px] font-mono text-gray-500">
                    {new Date().toLocaleTimeString()}
                  </span>
                )}
              </div>

              {/* Status Display */}
              {loading || scanStatus === 'VERIFYING' ? (
                <div className="py-20 text-center space-y-4 animate-pulse">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 border-2 border-[#5227FF]/30 flex items-center justify-center text-[#5227FF]">
                    <RefreshCw className="w-8 h-8 animate-spin" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-lg text-[#5227FF] uppercase tracking-wider">
                      VERIFYING TICKET...
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                      Querying central festival database and authenticating participant credentials...
                    </p>
                  </div>
                </div>
              ) : !result ? (
                <div className="py-20 text-center space-y-3 text-gray-400">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400">
                    <QrCode className="w-7 h-7" />
                  </div>
                  <div className="font-bold text-gray-700 text-sm">READY TO SCAN</div>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    Point camera at participant QR pass or enter ticket/registration ID to verify authentic database records.
                  </p>
                </div>
              ) : result.code === 'VALID' ? (
                /* VALID PARTICIPANT BANNER (GREEN) */
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-black text-base text-emerald-800 leading-tight">
                          VALID PARTICIPANT • CHECK-IN CONFIRMED
                        </div>
                        <div className="text-xs text-emerald-700 mt-0.5">{result.message}</div>
                      </div>
                    </div>
                  </div>

                  {/* REAL STORED DATABASE PARTICIPANT DETAILS */}
                  {result.participant && (
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2 text-xs">
                      <div className="flex justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-500">Participant Name:</span>
                        <span className="font-black text-[#090814] text-sm">{result.participant.participantName}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-500">College / Institution:</span>
                        <span className="font-semibold text-gray-800 text-right max-w-[210px] truncate">{result.participant.collegeName}</span>
                      </div>
                      {result.participant.department && (
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                          <span className="text-gray-500">Department &amp; Year:</span>
                          <span className="font-medium text-gray-800 text-right">
                            {result.participant.department} {result.participant.year ? `• ${result.participant.year}` : ''}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-500">Registered Event:</span>
                        <span className="font-bold text-[#5227FF] text-right">{result.event?.title || result.participant.eventTitle}</span>
                      </div>
                      {result.participant.category && (
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                          <span className="text-gray-500">Category:</span>
                          <span className="font-bold uppercase text-[10px] text-pink-600">
                            {result.participant.category}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-500">Registration ID:</span>
                        <span className="font-mono font-bold text-gray-900">{result.participant.id}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-500">Ticket ID:</span>
                        <span className="font-mono text-purple-700">{result.ticket?.id || result.participant.ticketId || `TKT-${result.participant.id}`}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-500">Registration Status:</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {result.participant.status || 'CONFIRMED'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-500">Ticket Status:</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                          {result.ticket?.status || 'USED'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-500">Check-in Status:</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
                          {result.participant.checkInStatus || 'CHECKED_IN'}
                        </span>
                      </div>
                      {result.participant.studentId && (
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                          <span className="text-gray-500">Student Roll / ID:</span>
                          <span className="font-mono text-gray-700">{result.participant.studentId}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-1">
                        <span className="text-gray-500">Verified Desk:</span>
                        <span className="font-semibold text-emerald-700">{result.checkIn?.gateName || 'Admin Central Desk'}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : result.code === 'ALREADY_CHECKED_IN' ? (
                /* ALREADY CHECKED IN BANNER (AMBER) */
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-black text-base text-amber-900 leading-tight">
                          ALREADY CHECKED IN • DUPLICATE ENTRY BLOCKED
                        </div>
                        <div className="text-xs text-amber-800 mt-0.5">{result.message}</div>
                      </div>
                    </div>
                  </div>

                  {result.participant && (
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2 text-xs">
                      <div className="flex justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-500">Participant Name:</span>
                        <span className="font-black text-[#090814]">{result.participant.participantName}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-500">College:</span>
                        <span className="font-medium text-gray-800 text-right">{result.participant.collegeName}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-500">Registered Event:</span>
                        <span className="font-bold text-[#5227FF]">{result.participant.eventTitle}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-500">Registration ID:</span>
                        <span className="font-mono text-gray-800">{result.participant.id}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-500">Ticket ID:</span>
                        <span className="font-mono text-purple-700">{result.ticket?.id || result.participant.ticketId}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-500">Initial Check-in Time:</span>
                        <span className="font-mono text-amber-800 font-bold">
                          {result.participant.checkedInAt
                            ? new Date(result.participant.checkedInAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })
                            : 'Earlier Today'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Checked In By:</span>
                        <span className="font-semibold text-gray-800">{result.participant.checkedInBy || 'Staff'}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : result.code === 'WRONG_EVENT' ? (
                /* WRONG EVENT BANNER (ORANGE) */
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-4 rounded-2xl bg-orange-50 border-2 border-orange-400 text-orange-950 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-orange-500 text-white shrink-0">
                        <AlertOctagon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-black text-base text-orange-900 leading-tight">
                          EVENT / TICKET MISMATCH
                        </div>
                        <div className="text-xs text-orange-800 mt-0.5">{result.message}</div>
                      </div>
                    </div>
                  </div>

                  {result.participant && (
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2 text-xs">
                      <div className="flex justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-500">Participant:</span>
                        <span className="font-bold text-[#090814]">{result.participant.participantName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Registered For:</span>
                        <span className="font-bold text-orange-700">{result.participant.eventTitle}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* INVALID QR / TICKET NOT FOUND BANNER (RED) */
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-400 text-red-950 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-red-600 text-white shrink-0">
                        <XCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-black text-base text-red-900 leading-tight">
                          INVALID QR / TICKET NOT FOUND
                        </div>
                        <div className="text-xs text-red-700 mt-0.5">
                          {result.message || 'No matching active festival credential found.'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* High-Throughput Auto-Reset & Scan Next Attendee */}
            {result && (
              <div className="mt-4 pt-3 border-t border-gray-200 space-y-2">
                {autoResetSeconds !== null && (
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1.5 font-semibold text-[#5227FF]">
                      <span className="w-2 h-2 rounded-full bg-[#5227FF] animate-ping" />
                      Auto-ready for next attendee in {autoResetSeconds}s...
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">Press Space / Enter</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={resetScanner}
                  className="w-full py-3 px-4 bg-[#5227FF] hover:bg-[#431ce0] text-white text-xs font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Scan Next Participant [Spacebar]</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
