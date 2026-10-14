'use client';

import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Upload, X, Link as LinkIcon, Check } from 'lucide-react';

interface AdminPhotoPickerProps {
  photoUrl: string;
  onChange: (url: string) => void;
  label?: string;
}

export const AdminPhotoPicker: React.FC<AdminPhotoPickerProps> = ({
  photoUrl,
  onChange,
  label = 'Official Profile Photo',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tempUrl, setTempUrl] = useState('');
  const [processing, setProcessing] = useState(false);

  // Resize and compress client-side to ensure lightweight data URL (< 100KB)
  const processImageFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    setProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 800;
        let w = img.width;
        let h = img.height;

        if (w > MAX_DIM || h > MAX_DIM) {
          if (w > h) {
            h = Math.round((h * MAX_DIM) / w);
            w = MAX_DIM;
          } else {
            w = Math.round((w * MAX_DIM) / h);
            h = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onChange(compressedDataUrl);
        }
        setProcessing(false);
      };
      img.onerror = () => setProcessing(false);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => setProcessing(false);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleApplyUrl = () => {
    if (tempUrl.trim()) {
      onChange(tempUrl.trim());
      setTempUrl('');
      setShowUrlInput(false);
    }
  };

  const handleClearPhoto = () => {
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#090814] block">
          {label}
        </label>
        {photoUrl && (
          <button
            type="button"
            onClick={handleClearPhoto}
            className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>Remove</span>
          </button>
        )}
      </div>

      {/* Hidden File & Camera Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="user"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Primary Photo Section */}
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-center gap-4">
        {/* Preview Avatar */}
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-200 border-2 border-white shadow-md shrink-0 flex items-center justify-center">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt="Photo Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-400 flex flex-col items-center justify-center">
              <ImageIcon className="w-8 h-8" />
              <span className="text-[9px] font-bold uppercase mt-0.5">No Photo</span>
            </div>
          )}

          {processing && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex-1 space-y-2 text-center sm:text-left w-full">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            {/* Primary Action: ADD PHOTO / CHANGE PHOTO */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={processing}
              className="px-4 py-2 rounded-xl bg-[#5227FF] hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{photoUrl ? 'CHANGE PHOTO' : 'ADD PHOTO'}</span>
            </button>

            {/* Quick Camera Capture Button */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={processing}
              className="px-3 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 text-[#090814] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Camera className="w-3.5 h-3.5 text-[#5227FF]" />
              <span>Camera</span>
            </button>
          </div>

          <p className="text-[11px] text-[#717188]">
            Choose from Gallery, Files, or take a Camera photo. Preserved automatically.
          </p>

          {/* Optional manual URL toggle for compatibility */}
          <div>
            {!showUrlInput ? (
              <button
                type="button"
                onClick={() => setShowUrlInput(true)}
                className="text-[10px] font-bold text-[#5227FF] hover:underline inline-flex items-center gap-1 mt-1"
              >
                <LinkIcon className="w-2.5 h-2.5" />
                <span>Or use web photo URL</span>
              </button>
            ) : (
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-3 py-1.5 rounded-lg bg-[#090814] text-white text-xs font-bold flex items-center gap-1 shrink-0"
                >
                  <Check className="w-3 h-3" />
                  <span>Apply</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(false)}
                  className="text-gray-400 hover:text-black text-xs px-1"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
