'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, MapPin, Mail, Phone, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-[#090814] overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-20px' }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand & Official College Crest (User Image 4) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3.5">
              <img
                src="/images/rvrjc-college-logo.png"
                alt="R.V.R. & J.C. College of Engineering Crest"
                className="w-14 h-14 object-contain shrink-0 drop-shadow-sm"
              />
              <div>
                <span className="font-display font-black text-2xl tracking-tight text-[#090814] block">
                  COLORIDO <span className="text-[#5227FF]">2K26</span>
                </span>
                <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                  R.V.R. & J.C. College of Engineering
                </span>
              </div>
            </div>

            <p className="text-xs text-[#525266] leading-relaxed max-w-sm font-medium">
              Autonomous engineering institution approved by AICTE, accredited by NAAC with A+ grade. Estd 1985. Guntur, Andhra Pradesh, India.
            </p>

            <div className="space-y-2 text-xs text-[#525266] pt-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#FF2E93] shrink-0 mt-0.5" />
                <span>Chandramoulipuram, Chowdavaram, Guntur - 522019, Andhra Pradesh</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#5227FF] shrink-0" />
                <a href="mailto:colorido@rvrjcce.ac.in" className="hover:underline font-mono">
                  colorido@rvrjcce.ac.in
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#FF5E3A] shrink-0" />
                <span className="font-mono">+91 863 2288201 / 2288254</span>
              </div>
            </div>
          </div>

          {/* Experience Links */}
          <div>
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-[#090814] mb-4">
              EXPERIENCE
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-[#525266]">
              <li>
                <Link href="/" className="hover:text-[#5227FF] transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link href="/cultural" className="hover:text-[#FF2E93] transition-colors">
                  Cultural World
                </Link>
              </li>
              <li>
                <Link href="/sports" className="hover:text-[#FF5E3A] transition-colors">
                  Sports Arena
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-[#5227FF] transition-colors">
                  Event Explorer
                </Link>
              </li>
              <li>
                <Link href="/#live-status" className="hover:text-red-600 transition-colors">
                  Live Status Pulse
                </Link>
              </li>
            </ul>
          </div>

          {/* Logistics & Timetable */}
          <div>
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-[#090814] mb-4">
              FESTIVAL INFO
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-[#525266]">
              <li>
                <Link href="/schedule" className="hover:text-[#5227FF] transition-colors">
                  2-Day Master Schedule
                </Link>
              </li>
              <li>
                <Link href="/venues" className="hover:text-[#5227FF] transition-colors">
                  Campus Venues & Arenas
                </Link>
              </li>
              <li>
                <Link href="/team" className="hover:text-[#5227FF] transition-colors">
                  Organizing Committee
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#5227FF] transition-colors">
                  About Colorido & RVRJC
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#5227FF] transition-colors">
                  FAQ & Assistance
                </Link>
              </li>
            </ul>
          </div>

          {/* Registration & Pass */}
          <div>
            <h4 className="font-display font-bold text-xs uppercase tracking-widest text-[#090814] mb-4">
              PARTICIPATION
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-[#525266]">
              <li>
                <Link href="/register" className="text-[#5227FF] font-bold hover:underline">
                  Online Registration
                </Link>
              </li>
              <li>
                <Link href="/my-colorido" className="hover:text-[#090814] transition-colors">
                  My COLORIDO Pass
                </Link>
              </li>
              <li>
                <Link href="/results" className="text-amber-600 font-bold hover:underline flex items-center gap-1">
                  <span>Results & Laurels</span>
                </Link>
              </li>
              <li>
                <Link href="/challenge" className="text-cyan-600 font-bold hover:underline flex items-center gap-1">
                  <span>Website Challenge</span>
                </Link>
              </li>
              <li>
                <span className="text-[11px] text-gray-500 block pt-2">
                  Festival: 28–29 Dec 2026
                </span>
              </li>
              <li>
                <span className="text-[11px] text-gray-500 block">
                  Tech Events: 9 Oct 2026 (Postponed)
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Footer Organizer & Staff Access */}
        <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#717188] text-center sm:text-left">
            © 2026 COLORIDO. R.V.R. & J.C. College of Engineering. All rights reserved.
          </p>

          {/* ORGANIZER & STAFF ACCESS BUTTONS (STRICTLY IN FOOTER AS MANDATED) */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5">
            <Link
              href="/entry"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] font-semibold text-gray-500 hover:text-emerald-700 hover:bg-emerald-50/50 hover:border-emerald-300 transition-all shadow-2xs"
            >
              <QrCode className="w-3 h-3 text-emerald-600" />
              <span>Entry Gate Station (Staff Only)</span>
            </Link>

            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-gray-200 text-[11px] font-bold text-[#525266] hover:text-black hover:bg-gray-50 hover:border-gray-400 transition-all shadow-xs"
            >
              <Lock className="w-3 h-3 text-[#5227FF]" />
              <span>ORGANIZER ACCESS</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </footer>
  );
};
