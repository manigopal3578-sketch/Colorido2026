'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { TicketItem, RegistrationItem } from '@/lib/types';
import QRCode from 'qrcode';
import {
  Printer,
  Download,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export default function TicketPage() {
  const params = useParams();
  const id = params?.id as string;

  const [ticket, setTicket] = useState<TicketItem | null>(null);
  const [registration, setRegistration] = useState<RegistrationItem | null>(null);
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/registrations?regId=${id}`)
      .then((res) => res.json())
      .then(async (json) => {
        if (json.success && json.ticket) {
          setTicket(json.ticket);
          setRegistration(json.registration);

          try {
            // Encode public verification URL so Google Lens / mobile cameras open the verified ticket page,
            // while the Admin scanner decodes the URL and executes fast check-in.
            const verifyPayload = typeof window !== 'undefined'
              ? `${window.location.origin}/verify/${json.registration.id}`
              : `https://colorido.vercel.app/verify/${json.registration.id}`;
            const url = await QRCode.toDataURL(verifyPayload, {
              width: 320,
              margin: 1,
              color: { dark: '#090814', light: '#FFFFFF' },
            });
            setQrUrl(url);
          } catch (e) {
            console.error(e);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-xs font-bold uppercase tracking-widest text-[#525266] animate-pulse">
          Loading ticket credentials...
        </p>
      </div>
    );
  }

  if (!ticket || !registration) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="font-display font-black text-2xl text-[#090814] mb-2">
            TICKET NOT FOUND
          </h2>
          <p className="text-xs text-[#525266] mb-6">
            No active digital pass found matching registration code: {id}
          </p>
          <Link
            href="/my-colorido"
            className="px-6 py-2.5 rounded-xl bg-[#090814] text-white text-xs font-bold"
          >
            Go to My COLORIDO
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isCheckedIn = registration.checkInStatus === 'CHECKED_IN';
  const isCultural = ticket.category === 'cultural';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
        {/* Navigation Bar */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/my-colorido"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#525266] hover:text-[#090814]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>My COLORIDO Dashboard</span>
          </Link>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-xs font-bold text-[#090814] shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Pass</span>
          </button>
        </div>

        {/* Digital Ticket Container */}
        <div className="rounded-3xl bg-[#FBFBFD] border-2 border-gray-300 shadow-2xl overflow-hidden print:border-none print:shadow-none">
          {/* Ticket Header */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-[#090814] via-[#1A182E] to-[#090814] text-white flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#00DCEB]">
                  OFFICIAL FESTIVAL ENTRY PASS
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-xs text-gray-300 font-bold">{ticket.date}</span>
              </div>
              <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight">
                COLORIDO <span className="text-[#5227FF]">2K26</span>
              </h1>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                R.V.R. & J.C. College of Engineering, Guntur
              </p>
            </div>

            <div className="text-right">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                  isCheckedIn ? 'bg-green-500 text-white' : 'bg-[#5227FF] text-white'
                }`}
              >
                {isCheckedIn ? 'CHECKED IN' : 'VALID PASS'}
              </span>
              <p className="text-[10px] text-gray-400 font-mono mt-1">{registration.id}</p>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Event & Participant Info */}
            <div className="md:col-span-7 space-y-5">
              <div>
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-white inline-block mb-1.5 ${
                    isCultural ? 'bg-[#FF2E93]' : 'bg-[#FF5E3A]'
                  }`}
                >
                  {ticket.category.toUpperCase()}
                </span>
                <h2 className="font-display font-black text-2xl text-[#090814] leading-tight">
                  {ticket.eventTitle}
                </h2>
              </div>

              <div className="p-4 rounded-xl bg-white border border-gray-200 space-y-2">
                <div className="text-xs text-[#525266]">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Participant</span>
                  <strong className="text-sm text-[#090814]">{ticket.participantName}</strong> ({registration.studentId})
                </div>
                <div className="text-xs text-[#525266]">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Institution</span>
                  <span className="font-semibold text-[#090814]">{ticket.collegeName}</span>
                </div>
                <div className="text-xs text-[#525266]">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Department & Year</span>
                  <span>{registration.department} • {registration.year}</span>
                </div>
                {ticket.teamName && (
                  <div className="text-xs text-[#525266] pt-1 border-t border-gray-100">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Team</span>
                    <strong className="text-[#5227FF]">{ticket.teamName}</strong>
                  </div>
                )}
              </div>

              {/* Logistics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white border border-gray-200">
                  <span className="flex items-center gap-1 text-gray-400 text-[10px] uppercase font-bold mb-1">
                    <Clock className="w-3.5 h-3.5 text-[#5227FF]" /> Schedule
                  </span>
                  <span className="font-bold text-[#090814]">{ticket.time}</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-gray-200">
                  <span className="flex items-center gap-1 text-gray-400 text-[10px] uppercase font-bold mb-1">
                    <MapPin className="w-3.5 h-3.5 text-[#FF2E93]" /> Venue
                  </span>
                  <span className="font-bold text-[#090814] truncate block">{ticket.venueName}</span>
                </div>
              </div>
            </div>

            {/* Scannable Verification QR */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-200 shadow-sm text-center">
              {qrUrl ? (
                <img src={qrUrl} alt="Ticket Verification QR" className="w-52 h-52 object-contain" />
              ) : (
                <div className="w-52 h-52 bg-gray-100 animate-pulse rounded-lg" />
              )}
              <div className="mt-3">
                <span className="text-[11px] font-black uppercase tracking-widest text-[#090814] block">
                  OFFICIAL DIGITAL VERIFICATION
                </span>
                <span className="text-[10px] text-[#717188] block">
                  Scan at campus check-in desk for entry
                </span>
              </div>
            </div>
          </div>

          {/* Ticket Footer Security Note */}
          <div className="p-4 bg-[#F5F5FA] border-t border-gray-200 text-center text-[11px] text-[#525266] font-medium flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#5227FF]" />
            <span>Digital signature verified. Non-transferable collegiate credential.</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
