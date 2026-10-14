'use client';

import React, { useState, useRef } from 'react';
import {
  Crop,
  Download,
  Sparkles,
  Trophy,
  Upload,
  RefreshCw,
  Share2,
} from 'lucide-react';

export default function FrameStudioPage() {
  const [selectedFrame, setSelectedFrame] = useState<'CULTURAL' | 'SPORTS' | 'DELEGATE'>('CULTURAL');
  const [userName, setUserName] = useState('K. Sneha Reddy');
  const [college, setCollege] = useState('R.V.R. & J.C. College of Engineering');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getBorderColor = () => {
    if (selectedFrame === 'CULTURAL') return '#FF2E93';
    if (selectedFrame === 'SPORTS') return '#FF5E3A';
    return '#5227FF';
  };

  const getTagline = () => {
    if (selectedFrame === 'CULTURAL') return 'CULTURAL PERFORMER';
    if (selectedFrame === 'SPORTS') return 'SPORTS CONTENDER';
    return 'OFFICIAL DELEGATE';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#5227FF] text-xs font-bold uppercase tracking-wider mb-1">
          <Crop className="w-4 h-4" />
          <span>Social Media Viral Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-[#090814] tracking-tight">
          Social Frame & Badge Studio
        </h1>
        <p className="text-[#525266] text-xs sm:text-sm mt-0.5 font-medium">
          Generate high-res social media badges for WhatsApp, Instagram, and LinkedIn with official COLORIDO 2K26 branding.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls */}
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-6 space-y-5 shadow-xs">
          <h2 className="text-base font-black text-[#090814] font-display">Customize Delegate Badge</h2>

          {/* Frame Theme Selection */}
          <div>
            <label className="text-xs font-bold text-[#525266] block mb-2">Select Badge Theme</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSelectedFrame('CULTURAL')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  selectedFrame === 'CULTURAL'
                    ? 'border-[#FF2E93] bg-[#FF2E93]/10 text-[#FF2E93] font-bold shadow-xs'
                    : 'border-gray-200 bg-gray-50 text-[#525266] hover:text-[#090814]'
                }`}
              >
                <Sparkles className="w-4 h-4 mx-auto mb-1 text-[#FF2E93]" />
                <span className="text-[11px] block">Cultural</span>
              </button>
              <button
                onClick={() => setSelectedFrame('SPORTS')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  selectedFrame === 'SPORTS'
                    ? 'border-[#FF5E3A] bg-[#FF5E3A]/10 text-[#FF5E3A] font-bold shadow-xs'
                    : 'border-gray-200 bg-gray-50 text-[#525266] hover:text-[#090814]'
                }`}
              >
                <Trophy className="w-4 h-4 mx-auto mb-1 text-[#FF5E3A]" />
                <span className="text-[11px] block">Sports</span>
              </button>
              <button
                onClick={() => setSelectedFrame('DELEGATE')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  selectedFrame === 'DELEGATE'
                    ? 'border-[#5227FF] bg-[#5227FF]/10 text-[#5227FF] font-bold shadow-xs'
                    : 'border-gray-200 bg-gray-50 text-[#525266] hover:text-[#090814]'
                }`}
              >
                <Crop className="w-4 h-4 mx-auto mb-1 text-[#5227FF]" />
                <span className="text-[11px] block">All-Access</span>
              </button>
            </div>
          </div>

          {/* Participant Details */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-[#525266] block mb-1">Delegate Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#525266] block mb-1">College / Institution</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
              />
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="text-xs font-bold text-[#525266] block mb-1">Upload Photo</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-[#090814] flex items-center justify-center gap-2 transition-colors"
            >
              <Upload className="w-4 h-4 text-[#5227FF]" />
              <span>Choose Image from Device</span>
            </button>
          </div>
        </div>

        {/* Live Preview Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div
            id="badge-preview-container"
            className="w-[360px] h-[480px] bg-[#090814] rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl border-4"
            style={{ borderColor: getBorderColor() }}
          >
            {/* Top Brand Tag */}
            <div className="flex items-center justify-between relative z-10">
              <div>
                <span className="text-[10px] font-black tracking-widest text-[#00DCEB] uppercase block">
                  R.V.R. & J.C. COLLEGE OF ENGINEERING
                </span>
                <span className="text-xl font-black font-display text-white tracking-tight">
                  COLORIDO <span className="text-[#FFC857]">2K26</span>
                </span>
              </div>
              <span
                className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-white"
                style={{ backgroundColor: getBorderColor() }}
              >
                {getTagline()}
              </span>
            </div>

            {/* Photo Center */}
            <div className="relative z-10 flex flex-col items-center my-auto">
              <div
                className="w-44 h-44 rounded-full overflow-hidden p-1 shadow-2xl relative"
                style={{ background: `linear-gradient(135deg, ${getBorderColor()}, #00DCEB)` }}
              >
                <img
                  src={photoUrl}
                  alt={userName}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              <div className="text-center mt-4 space-y-0.5">
                <h3 className="text-lg font-black text-white font-display tracking-tight">{userName}</h3>
                <p className="text-[11px] text-gray-300 font-medium truncate max-w-[280px]">{college}</p>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-white">
              <div>
                <span className="text-[10px] font-mono text-gray-400 block">DATES</span>
                <span className="text-xs font-bold text-[#FFC857]">28–29 DEC 2026</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-gray-400 block">CAMPUS</span>
                <span className="text-xs font-bold text-white">Guntur, AP</span>
              </div>
            </div>

            {/* Subtle Gradient Glow */}
            <div
              className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full filter blur-3xl opacity-30 pointer-events-none"
              style={{ backgroundColor: getBorderColor() }}
            />
          </div>

          <p className="text-xs text-gray-400 mt-4 text-center">
            Ready to share across WhatsApp status, Instagram stories, and campus groups.
          </p>
        </div>
      </div>
    </div>
  );
}
