'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Play } from 'lucide-react';

interface CinematicIntroProps {
  onComplete: () => void;
  forceShow?: boolean;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete, forceShow = false }) => {
  const [stage, setStage] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const handleFinish = useCallback(() => {
    sessionStorage.setItem('colorido_has_seen_intro_2k26', 'true');
    setIsVisible(false);
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    // Check session storage if not forced
    if (!forceShow) {
      const hasSeen = sessionStorage.getItem('colorido_has_seen_intro_2k26');
      if (hasSeen === 'true') {
        setIsVisible(false);
        onComplete();
        return;
      }
    } else {
      setIsVisible(true);
      setStage(0);
    }

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion && !forceShow) {
      setIsVisible(false);
      onComplete();
      return;
    }

    // Timeline Progression (0s to 7.8s)
    const timers = [
      setTimeout(() => setStage(1), 800),   // 0.8s: Cultural world
      setTimeout(() => setStage(2), 2000),  // 2.0s: Sports world
      setTimeout(() => setStage(3), 3200),  // 3.2s: Intersection
      setTimeout(() => setStage(4), 4500),  // 4.5s: Convergence
      setTimeout(() => setStage(5), 5600),  // 5.6s: Colorido 2K26 lockup
      setTimeout(() => setStage(6), 7200),  // 7.2s: Final tagline lockup
      setTimeout(() => handleFinish(), 8200), // 8.2s: Exit
    ];

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [forceShow, handleFinish, onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-white text-[#090814] overflow-hidden select-none"
      >
        {/* Skip Intro Button */}
        <button
          onClick={handleFinish}
          className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#525266] bg-white/80 backdrop-blur-md rounded-full border border-gray-200 hover:text-black hover:border-black transition-all shadow-sm"
        >
          <span>Skip Experience</span>
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Stage 0: 0.0 - 0.8s: Subtle initial color stroke */}
        {stage === 0 && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            className="w-32 h-[3px] bg-gradient-to-r from-[#FF2E93] via-[#5227FF] to-[#FF5E3A] rounded-full"
          />
        )}

        {/* Stage 1: 0.8 - 2.0s: CULTURAL WORLD (#FF2E93) */}
        {stage === 1 && (
          <motion.div
            key="stage-cultural"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center text-center px-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-[#FFEBF4] text-[#FF2E93] text-xs font-bold uppercase tracking-widest"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>World 01 — Cultural</span>
            </motion.div>
            <h2 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-[#090814] mb-3">
              EXPRESSION & RHYTHM
            </h2>
            <p className="text-base sm:text-lg text-[#525266] max-w-md font-medium">
              Classical grandeur. Electrifying beats. The pulse of creative fire.
            </p>
            {/* Visual ambient ribbon */}
            <div className="absolute w-[500px] h-[500px] rounded-full bg-[#FF2E93]/10 blur-[100px] -z-10 animate-pulse-slow" />
          </motion.div>
        )}

        {/* Stage 2: 2.0 - 3.2s: SPORTS WORLD (#FF5E3A) */}
        {stage === 2 && (
          <motion.div
            key="stage-sports"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center text-center px-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-[#FFF0EB] text-[#FF5E3A] text-xs font-bold uppercase tracking-widest"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>World 02 — Sports</span>
            </motion.div>
            <h2 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-[#090814] mb-3">
              SPEED & VICTORY
            </h2>
            <p className="text-base sm:text-lg text-[#525266] max-w-md font-medium">
              Athletic discipline. Fierce teamwork. Unstoppable collegiate passion.
            </p>
            <div className="absolute w-[500px] h-[500px] rounded-full bg-[#FF5E3A]/10 blur-[100px] -z-10 animate-pulse-slow" />
          </motion.div>
        )}

        {/* Stage 3 & 4: 3.2 - 5.6s: Convergence of Both Worlds */}
        {(stage === 3 || stage === 4) && (
          <motion.div
            key="stage-convergence"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex flex-col items-center text-center px-6"
          >
            <div className="flex items-center gap-4 sm:gap-8 mb-6">
              <span className="text-2xl sm:text-4xl font-extrabold text-[#FF2E93] tracking-widest font-display">
                CULTURAL
              </span>
              <div className="w-3 h-3 rounded-full bg-[#5227FF] animate-ping" />
              <span className="text-2xl sm:text-4xl font-extrabold text-[#FF5E3A] tracking-widest font-display">
                SPORTS
              </span>
            </div>
            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-[#525266]"
            >
              Two Worlds. One Legendary Experience.
            </motion.p>
            <div className="absolute -left-20 w-80 h-80 rounded-full bg-[#FF2E93]/15 blur-[90px] -z-10" />
            <div className="absolute -right-20 w-80 h-80 rounded-full bg-[#FF5E3A]/15 blur-[90px] -z-10" />
          </motion.div>
        )}

        {/* Stage 5 & 6: 5.6s+: COLORIDO 2K26 Official Wordmark Lockup */}
        {(stage === 5 || stage === 6) && (
          <motion.div
            key="stage-lockup"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center text-center px-6"
          >
            {/* Official College Crest */}
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              src="/images/rvrjc-college-logo.png"
              alt="R.V.R. & J.C. College of Engineering"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain mb-3 drop-shadow-md"
            />

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.35em] text-[#525266] mb-3"
            >
              R.V.R. & J.C. COLLEGE OF ENGINEERING PRESENTS
            </motion.div>

            {/* COLORIDO 2K26 Brand Artwork */}
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="w-full max-w-2xl mb-4"
            >
              <img
                src="/images/colorido-2k26-brand-logo.png"
                alt="COLORIDO 2K26"
                className="w-full h-auto object-contain mx-auto"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-black tracking-widest text-[#090814]"
            >
              <span className="text-[#FF2E93]">CREATE</span>
              <span className="text-gray-300">•</span>
              <span className="text-[#FF5E3A]">COMPETE</span>
              <span className="text-gray-300">•</span>
              <span className="text-[#5227FF]">EXPRESS</span>
              <span className="text-gray-300">•</span>
              <span className="text-[#00DCEB]">CONNECT</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 text-xs text-[#717188] uppercase tracking-[0.25em]"
            >
              28–29 DECEMBER 2026 • GUNTUR, AP
            </motion.p>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
