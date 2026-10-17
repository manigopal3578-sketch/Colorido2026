'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, UserCheck, RefreshCw, Calendar, Sparkles, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onReplayIntro?: () => void;
  festivalStatus?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onReplayIntro, festivalStatus = 'UPCOMING' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const mainNavItems = [
    { label: 'Home', href: '/' },
    { label: 'Events', href: '/events' },
    { label: 'Sports', href: '/sports' },
    { label: 'Results', href: '/results' },
    { label: 'Schedule', href: '/schedule' },
    { label: 'About', href: '/#about' },
  ];

  const drawerNavItems = [
    { label: 'Home', href: '/' },
    { label: 'My Passport (Digital Pass & Tickets)', href: '/my-colorido' },
    { label: 'All 21 Events & Competitions', href: '/events' },
    { label: 'Cultural World (Dance, Music, Drama)', href: '/cultural' },
    { label: 'Sports Arena (Boys & Girls)', href: '/sports' },
    { label: 'Festival Schedule', href: '/schedule' },
    { label: 'Results & Laurels Podium', href: '/results' },
    { label: 'Campus Arenas & Venues', href: '/venues' },
    { label: 'About R.V.R. & J.C.', href: '/#about' },
    { label: 'Frequently Asked Questions', href: '/faq' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-2xs transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
          {/* Brand Identity */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <img
              src="/images/rvrjc-college-logo.png"
              alt="R.V.R. & J.C. College of Engineering Logo"
              className="w-8 h-8 sm:w-11 sm:h-11 object-contain drop-shadow-xs group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="font-display font-black text-sm sm:text-base lg:text-lg tracking-tight text-[#090814] leading-tight flex items-center gap-1">
                <span>COLORIDO</span>
                <span className="text-[#5227FF]">2K26</span>
              </span>
              <span className="text-[9px] sm:text-[11px] font-extrabold text-gray-500 uppercase tracking-wider hidden sm:block">
                R.V.R. & J.C. COLLEGE OF ENGINEERING
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links with Active Dot */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3.5 py-1.5 rounded-lg text-xs font-black tracking-wider transition-all ${
                    isActive
                      ? 'text-[#5227FF]'
                      : 'text-[#525266] hover:text-[#090814] hover:bg-gray-50'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavDot"
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#5227FF]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Elements */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">

            {/* My Passport / My Pass (Desktop only) */}
            <Link
              href="/my-colorido"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#525266] hover:text-[#090814] hover:bg-gray-100 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#5227FF]" />
              <span className="font-extrabold text-[11px] tracking-wider uppercase">MY PASSPORT</span>
            </Link>

            {/* Register Gradient Pill Button */}
            <Link
              href="/register"
              className="inline-flex items-center gap-1 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-[#5227FF] via-[#7B42F6] to-[#00DCEB] hover:opacity-95 text-white text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-sm hover:shadow-md transition-all active:scale-95 whitespace-nowrap"
            >
              <span>REGISTER</span>
              <ArrowRight className="w-3 h-3 hidden sm:inline" />
            </Link>

            {/* 3-Dot Menu Button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open Navigation Menu"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl border border-gray-200 hover:border-gray-300 text-[#090814] hover:bg-gray-100 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
              title="More Menu & All Links"
            >
              <div className="flex gap-1">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#090814]" />
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#5227FF]" />
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#FF2E93]" />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Overlay Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Slide-out Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl z-50 flex flex-col justify-between overflow-y-auto"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="/images/rvrjc-college-logo.png"
                    alt="RVRJC Logo"
                    className="w-10 h-10 object-contain"
                  />
                  <div>
                    <h3 className="font-display font-black text-lg text-[#090814]">
                      COLORIDO <span className="text-[#5227FF]">2K26</span>
                    </h3>
                    <p className="text-[11px] text-[#525266] uppercase tracking-wider font-bold">
                      R.V.R. & J.C. College of Engineering
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Nav Items */}
              <div className="p-6 space-y-2 flex-1">
                {/* Prominent Cinematic Intro Replay Action */}
                {/* Prominent Cinematic Intro Replay Action - Always Available Across All Pages */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (onReplayIntro) {
                      onReplayIntro();
                    } else {
                      window.location.href = '/?replay=true';
                    }
                  }}
                  className="w-full mb-3 flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#5227FF]/10 via-[#FF2E93]/10 to-[#00DCEB]/10 border border-[#5227FF]/30 hover:border-[#5227FF] hover:shadow-md transition-all group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5227FF] to-[#FF2E93] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                      <Play className="w-4 h-4 fill-white" />
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider text-[#090814] flex items-center gap-1.5">
                        <span>Replay Cinematic Intro</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#5227FF] text-white">HD</span>
                      </div>
                      <div className="text-[11px] text-[#525266] font-medium">
                        Watch official festival story & intro
                      </div>
                    </div>
                  </div>
                  <RefreshCw className="w-4 h-4 text-[#5227FF] group-hover:rotate-180 transition-transform duration-500" />
                </button>

                {drawerNavItems.map((item, idx) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.025 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F5F5FA] font-bold text-[#090814] text-sm group transition-colors"
                    >
                      <span>{item.label}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#5227FF] group-hover:translate-x-1 transition-all" />
                    </Link>
                  </motion.div>
                ))}

                <div className="pt-4 border-t border-gray-100">
                  <Link
                    href="/my-colorido"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#5227FF]/10 text-[#5227FF] font-black text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      <span>My COLORIDO (Participant Pass)</span>
                    </div>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-gray-100 bg-[#FBFBFD] space-y-3">
                {onReplayIntro && (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onReplayIntro();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-[#525266] hover:text-[#090814] bg-white border border-gray-200 rounded-xl transition-colors shadow-2xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Replay Cinematic Intro</span>
                  </button>
                )}

                <div className="text-center text-[11px] text-gray-500 font-medium">
                  28–29 December 2026 • R.V.R. & J.C. CE, Guntur, AP
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
