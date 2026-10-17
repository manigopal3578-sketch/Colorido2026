'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/navigation';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { EventItem, RegistrationItem, TicketItem } from '@/lib/types';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import {
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  QrCode,
  Download,
  Printer,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';

// Official R.V.R. & J.C. College of Engineering B.Tech Programme / Branch list
const RVRJC_BRANCHES = [
  'Computer Science & Engineering (CSE)',
  'Computer Science & Engineering (AI & ML)',
  'Computer Science & Engineering (Data Science)',
  'Artificial Intelligence (AI)',
  'Artificial Intelligence & Data Science (AI & DS)',
  'Information Technology (IT)',
  'Electronics & Communication Engineering (ECE)',
  'Electrical & Electronics Engineering (EEE)',
  'Mechanical Engineering (ME)',
  'Civil Engineering (CE)',
  'Chemical Engineering (ChE)',
  'Quantum Computing',
];

const COMMON_EXTERNAL_BRANCHES = [
  ...RVRJC_BRANCHES,
  'Aerospace / Aeronautical Engineering',
  'Biotechnology / Biomedical Engineering',
  'Automobile Engineering',
  'Mining / Metallurgical Engineering',
  'Architecture & Planning (B.Arch)',
  'Master of Business Administration (MBA)',
  'Master of Computer Applications (MCA)',
  'Bachelor of Science (B.Sc / M.Sc)',
  'Bachelor of Commerce / Arts (B.Com / B.A)',
];

function RegisterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const preselectedEventId = searchParams.get('eventId') || '';
  const preselectedCategory = searchParams.get('category') || '';

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Category filter state: 'cultural' | 'sports'
  const [selectedCategory, setSelectedCategory] = useState<'cultural' | 'sports'>(
    preselectedCategory.toLowerCase() === 'sports' ? 'sports' : 'cultural'
  );

  // Form Fields
  const [selectedEventId, setSelectedEventId] = useState(preselectedEventId);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [collegeType, setCollegeType] = useState<'RVRJC' | 'OTHER'>('RVRJC');
  const [collegeName, setCollegeName] = useState('');
  const [collegeLocation, setCollegeLocation] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering (CSE)');
  const [otherDeptMode, setOtherDeptMode] = useState(false);
  const [customDepartment, setCustomDepartment] = useState('');
  const [year, setYear] = useState('3rd Year');
  const [studentId, setStudentId] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState<
    { name: string; email: string; phone: string; college: string; studentId: string }[]
  >([]);
  const [accommodationRequired, setAccommodationRequired] = useState(false);
  const [accommodationType, setAccommodationType] = useState<'BOYS_HOSTEL' | 'GIRLS_HOSTEL'>('BOYS_HOSTEL');
  const [accommodationDays, setAccommodationDays] = useState('28–29 December (2 Days)');
  const [accommodationNotes, setAccommodationNotes] = useState('');
  const [consent, setConsent] = useState(false);

  // Submission States
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState<{
    registration: RegistrationItem;
    ticket: TicketItem;
    qrDataUrl?: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/data/public')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          const available = json.events.filter(
            (e: EventItem) => e.status !== 'ARCHIVED' && e.status !== 'POSTPONED'
          );
          setEvents(available);

          // Handle preselection
          if (preselectedEventId) {
            const found = available.find((e: EventItem) => e.id === preselectedEventId);
            if (found) {
              setSelectedEventId(found.id);
              if (found.category === 'cultural' || found.category === 'sports') {
                setSelectedCategory(found.category);
              }
              return;
            }
          }

          const targetCategory = preselectedCategory.toLowerCase() === 'sports' ? 'sports' : 'cultural';
          setSelectedCategory(targetCategory);
          const firstInCat = available.find((e: EventItem) => e.category === targetCategory);
          if (firstInCat && !selectedEventId) {
            setSelectedEventId(firstInCat.id);
          } else if (available.length > 0 && !selectedEventId) {
            setSelectedEventId(available[0].id);
          }
        }
      })
      .finally(() => setLoadingEvents(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedEventId, preselectedCategory]);

  const handleCategoryChange = (category: 'cultural' | 'sports') => {
    setSelectedCategory(category);
    const categoryEvents = events.filter((e) => e.category === category);
    if (categoryEvents.length > 0) {
      if (!categoryEvents.some((e) => e.id === selectedEventId)) {
        setSelectedEventId(categoryEvents[0].id);
      }
    } else {
      setSelectedEventId('');
    }
  };

  const filteredEvents = events.filter((e) => e.category === selectedCategory);
  const selectedEvent = events.find((e) => e.id === selectedEventId);

  const handleAddTeamMember = () => {
    setTeamMembers([
      ...teamMembers,
      { name: '', email: '', phone: '', college: collegeName || 'R.V.R. & J.C. CE', studentId: '' },
    ]);
  };

  const handleRemoveTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleTeamMemberChange = (index: number, field: string, val: string) => {
    const updated = [...teamMembers];
    (updated[index] as any)[field] = val;
    setTeamMembers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!consent) {
      setErrorMsg('You must agree to the festival participation terms & code of conduct.');
      return;
    }

    if (!selectedEventId) {
      setErrorMsg('Please select an event to register for.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        eventId: selectedEventId,
        fullName,
        email,
        phone,
        collegeType,
        collegeName: collegeType === 'RVRJC' ? 'R.V.R. & J.C. College of Engineering' : collegeName,
        department,
        year,
        studentId,
        teamName: selectedEvent?.teamRequirement === 'TEAM' ? teamName : undefined,
        teamMembers: selectedEvent?.teamRequirement === 'TEAM' ? teamMembers : undefined,
        accommodationRequired,
        accommodationType: accommodationRequired ? accommodationType : undefined,
        accommodationDays: accommodationRequired ? accommodationDays : undefined,
        accommodationNotes: accommodationRequired ? accommodationNotes : undefined,
        consent,
      };

      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!json.success) {
        setErrorMsg(json.message || 'Registration failed');
        setSubmitting(false);
        return;
      }

      // Generate visual QR data URL encoding public verification URL
      let qrUrl = '';
      try {
        const verifyPayload = typeof window !== 'undefined'
          ? `${window.location.origin}/verify/${json.registration.id}`
          : `https://colorido.vercel.app/verify/${json.registration.id}`;
        qrUrl = await QRCode.toDataURL(verifyPayload, {
          width: 280,
          margin: 1,
          color: { dark: '#090814', light: '#FFFFFF' },
        });
      } catch (qrErr) {
        console.error('QR rendering error:', qrErr);
      }

      setSuccessData({
        registration: json.registration,
        ticket: json.ticket,
        qrDataUrl: qrUrl,
      });

      // Automatically scroll & focus viewport to registration confirmation section
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          const el = document.getElementById('registration-confirmation-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            el.focus();
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 50);
      }

      // Trigger celebration confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#5227FF', '#FF2E93', '#FF5E3A', '#00DCEB'],
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Server network failure');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Success Confirmation State */}
        {successData ? (
          <div
            id="registration-confirmation-section"
            tabIndex={-1}
            className="p-8 sm:p-12 rounded-3xl bg-[#FBFBFD] border-2 border-[#5227FF]/30 shadow-2xl space-y-8 animate-fadeIn outline-none"
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                REGISTRATION CONFIRMED
              </span>
              <h1 className="font-display font-black text-3xl sm:text-4xl text-[#090814] mt-3">
                WELCOME TO COLORIDO 2K26
              </h1>
              <p className="text-sm text-[#525266] mt-1 font-medium">
                Your official festival credentials have been verified and saved to the central database.
              </p>
            </div>

            {/* Official Digital Ticket Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-md flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-white bg-[#5227FF]">
                    OFFICIAL PASS
                  </span>
                  <span className="text-xs font-bold text-[#717188]">
                    ID: {successData.registration.id}
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-black text-2xl text-[#090814]">
                    {successData.registration.eventTitle}
                  </h3>
                  <p className="text-xs font-semibold text-[#525266] mt-0.5">
                    Participant: <strong>{successData.registration.participantName}</strong> ({successData.registration.studentId})
                  </p>
                  <p className="text-xs text-[#717188]">
                    {successData.registration.collegeName} • {successData.registration.department}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-medium text-[#525266] pt-2 border-t border-gray-100">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Date</span>
                    <span className="font-bold text-[#090814]">{successData.ticket.date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Venue</span>
                    <span className="font-bold text-[#090814]">{successData.ticket.venueName}</span>
                  </div>
                </div>

                {successData.registration.teamName && (
                  <div className="p-2.5 rounded-lg bg-[#F5F5FA] text-xs">
                    <span className="font-bold text-[#090814]">Team: {successData.registration.teamName}</span>
                    <span className="text-gray-500 ml-2">
                      ({(successData.registration.teamMembers?.length || 0) + 1} members)
                    </span>
                  </div>
                )}

                {successData.registration.accommodationRequired && (
                  <div className="p-2.5 rounded-lg bg-[#F5F3FF] border border-[#DDD6FE] text-xs">
                    <span className="font-bold text-[#5227FF]">🏠 Campus Accommodation Reserved:</span>
                    <span className="text-gray-700 ml-1.5 font-medium">
                      {successData.registration.accommodationType === 'GIRLS_HOSTEL' ? 'Girls Hostel (Block G)' : 'Boys Hostel (Block B)'} • {successData.registration.accommodationDays}
                    </span>
                  </div>
                )}
              </div>

              {/* Scannable QR Code */}
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm shrink-0">
                {successData.qrDataUrl ? (
                  <img
                    src={successData.qrDataUrl}
                    alt="Official Verification QR"
                    className="w-44 h-44 object-contain"
                  />
                ) : (
                  <QrCode className="w-44 h-44 text-gray-400" />
                )}
                <span className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-widest">
                  Scan at Campus Desk
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-xs font-bold text-[#090814] shadow-sm transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print Pass</span>
              </button>

              <a
                href={`/ticket/${successData.registration.id}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#5227FF] hover:bg-primary-hover text-white text-xs font-bold shadow-md transition-all"
              >
                <span>View Full Digital Ticket</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="/my-colorido"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#090814] hover:bg-black text-white text-xs font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <UserCheck className="w-4 h-4 text-[#00DCEB]" />
                <span>Go to My COLORIDO</span>
              </a>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <div className="p-6 sm:p-10 rounded-3xl bg-[#FBFBFD] border border-gray-200 shadow-xl space-y-8">
            <div className="text-center max-w-xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-bold uppercase tracking-widest text-[#5227FF] mb-3 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Official Registration</span>
              </div>
              <h1 className="font-display font-black text-3xl sm:text-5xl text-[#090814] tracking-tight mb-2">
                COLORIDO 2K26 REGISTRATION
              </h1>
              <p className="text-xs sm:text-sm text-[#525266] font-medium">
                Register for Cultural stages and Sports tournaments. Real-time verification with instant digital tickets.
              </p>
            </div>

            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-900 text-xs sm:text-sm font-semibold">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 1. Category-Aware Event Selection */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-[#090814]">
                      Select Championship Category *
                    </label>
                    <span className="text-[11px] font-bold text-[#5227FF]">
                      {selectedCategory === 'cultural' ? '🎭 Cultural Category Selected' : '🏆 Sports Category Selected'}
                    </span>
                  </div>

                  {/* Category Switcher Tabs */}
                  <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#F5F5FA] rounded-2xl border border-gray-200">
                    <button
                      type="button"
                      onClick={() => handleCategoryChange('cultural')}
                      className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                        selectedCategory === 'cultural'
                          ? 'bg-[#FF2E93] text-white shadow-md'
                          : 'text-[#525266] hover:text-[#090814] bg-white border border-gray-200/60'
                      }`}
                    >
                      <span>CULTURAL EVENTS</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          selectedCategory === 'cultural' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {events.filter((e) => e.category === 'cultural').length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCategoryChange('sports')}
                      className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                        selectedCategory === 'sports'
                          ? 'bg-[#FF5E3A] text-white shadow-md'
                          : 'text-[#525266] hover:text-[#090814] bg-white border border-gray-200/60'
                      }`}
                    >
                      <span>SPORTS EVENTS</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          selectedCategory === 'sports' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {events.filter((e) => e.category === 'sports').length}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Filtered Event Dropdown */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-[#090814] mb-2">
                    {selectedCategory === 'cultural' ? 'Choose Cultural Event' : 'Choose Sports Event'} *
                  </label>
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-[#090814] focus:border-[#5227FF] focus:ring-1 focus:ring-[#5227FF]"
                    required
                  >
                    <option value="">
                      -- Select {selectedCategory === 'cultural' ? 'Cultural' : 'Sports'} Championship --
                    </option>
                    {filteredEvents.map((evt) => (
                      <option key={evt.id} value={evt.id}>
                        {evt.title} ({evt.date})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedEvent && (
                  <div className="p-3.5 rounded-xl bg-white border border-gray-200 flex flex-wrap items-center justify-between text-xs text-[#525266] gap-2">
                    <span className="font-bold text-[#090814]">
                      Venue: {selectedEvent.venueName}
                    </span>
                    <span>
                      Type:{' '}
                      <strong className="text-[#5227FF]">
                        {selectedEvent.teamRequirement === 'TEAM'
                          ? `Squad (${selectedEvent.minTeamSize}-${selectedEvent.maxTeamSize} members)`
                          : 'Solo Entry'}
                      </strong>
                    </span>
                    <span>
                      Capacity: {selectedEvent.registeredCount} / {selectedEvent.capacity} Filled
                    </span>
                  </div>
                )}
              </div>

              {/* 2. College Institutional Type */}
              <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-4">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#090814]">
                  College Affiliation *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCollegeType('RVRJC');
                      if (!RVRJC_BRANCHES.includes(department)) {
                        setDepartment(RVRJC_BRANCHES[0]);
                      }
                      setOtherDeptMode(false);
                    }}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      collegeType === 'RVRJC'
                        ? 'border-[#5227FF] bg-primary-light/40 text-[#090814] font-bold shadow-sm'
                        : 'border-gray-200 text-[#525266] hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xs font-extrabold block text-[#5227FF]">1. HOST INSTITUTION</span>
                    <span className="text-sm font-bold block mt-0.5">R.V.R. & J.C. College of Engineering</span>
                    <span className="text-[11px] text-gray-500 block">Guntur, Andhra Pradesh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCollegeType('OTHER')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      collegeType === 'OTHER'
                        ? 'border-[#5227FF] bg-primary-light/40 text-[#090814] font-bold shadow-sm'
                        : 'border-gray-200 text-[#525266] hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xs font-extrabold block text-[#FF5E3A]">2. EXTERNAL COLLEGE</span>
                    <span className="text-sm font-bold block mt-0.5">Other Recognized College / University</span>
                    <span className="text-[11px] text-gray-500 block">National Collegiate Delegations</span>
                  </button>
                </div>

                {/* Conditional fields if OTHER college */}
                {collegeType === 'OTHER' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-[#525266] mb-1">
                        College / Institution Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Vignan University, KL University, CBIT..."
                        value={collegeName}
                        onChange={(e) => setCollegeName(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#525266] mb-1">
                        College City / State *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Vijayawada, Hyderabad, Chennai..."
                        value={collegeLocation}
                        onChange={(e) => setCollegeLocation(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Personal & Academic Particulars */}
              <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-4">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#090814]">
                  Participant Information
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#090814] mb-1">
                      Full Name <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your official full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium focus:border-[#5227FF] focus:ring-1 focus:ring-[#5227FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#090814] mb-1">
                      Student Roll No / College ID <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={collegeType === 'RVRJC' ? 'e.g. Y23CS042' : 'e.g. 211FA05021'}
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium focus:border-[#5227FF] focus:ring-1 focus:ring-[#5227FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#090814] mb-1">
                      College Email Address <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="student@college.edu or gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium focus:border-[#5227FF] focus:ring-1 focus:ring-[#5227FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#090814] mb-1">
                      Phone Number / WhatsApp <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98480 12345"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium focus:border-[#5227FF] focus:ring-1 focus:ring-[#5227FF]"
                    />
                  </div>

                  {/* Branch / Department Selection */}
                  <div>
                    <label className="block text-xs font-bold text-[#090814] mb-1">
                      Branch / Department <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>

                    {collegeType === 'RVRJC' ? (
                      /* RVRJC Official Branches Dropdown */
                      <select
                        required
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm font-medium text-[#090814] focus:border-[#5227FF] focus:ring-1 focus:ring-[#5227FF]"
                      >
                        <option value="">Select your branch / department</option>
                        {RVRJC_BRANCHES.map((branch) => (
                          <option key={branch} value={branch}>
                            {branch}
                          </option>
                        ))}
                      </select>
                    ) : (
                      /* External College Branch Selector */
                      <div className="space-y-2">
                        <select
                          required
                          value={otherDeptMode ? 'OTHER_CUSTOM' : department}
                          onChange={(e) => {
                            if (e.target.value === 'OTHER_CUSTOM') {
                              setOtherDeptMode(true);
                              setDepartment(customDepartment);
                            } else {
                              setOtherDeptMode(false);
                              setDepartment(e.target.value);
                            }
                          }}
                          className="w-full p-3 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm font-medium text-[#090814] focus:border-[#5227FF] focus:ring-1 focus:ring-[#5227FF]"
                        >
                          <option value="">Select your branch / department</option>
                          {COMMON_EXTERNAL_BRANCHES.map((branch) => (
                            <option key={branch} value={branch}>
                              {branch}
                            </option>
                          ))}
                          <option value="OTHER_CUSTOM">Other Programme / Type your branch...</option>
                        </select>

                        {otherDeptMode && (
                          <input
                            type="text"
                            required
                            placeholder="Enter your specific branch / programme name"
                            value={customDepartment}
                            onChange={(e) => {
                              setCustomDepartment(e.target.value);
                              setDepartment(e.target.value);
                            }}
                            className="w-full p-3 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium bg-[#FBFBFD] focus:border-[#5227FF]"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#090814] mb-1">
                      Current Academic Year <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm font-medium focus:border-[#5227FF]"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Postgraduate">Postgraduate</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 4. Team Lineup (If event is TEAM) */}
              {selectedEvent?.teamRequirement === 'TEAM' && (
                <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-[#090814]">
                        Squad / Team Configuration
                      </label>
                      <p className="text-[11px] text-[#717188]">
                        Required size: {selectedEvent.minTeamSize} to {selectedEvent.maxTeamSize} players (including captain).
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddTeamMember}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#5227FF] text-white text-xs font-bold hover:bg-primary-hover shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Teammate</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#090814] mb-1">
                      Official Team Name <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. RVR Warriors, Strikers FC, Vignan Titans..."
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium"
                    />
                  </div>

                  {teamMembers.map((member, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-[#FBFBFD] border border-gray-200 space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#5227FF]">
                          Teammate #{index + 2}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTeamMember(index)}
                          className="text-red-500 hover:text-red-700 text-xs font-semibold p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <input
                          type="text"
                          required
                          placeholder="Member Name"
                          value={member.name}
                          onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                          className="p-2.5 rounded-lg border border-gray-200"
                        />
                        <input
                          type="email"
                          required
                          placeholder="Member Email"
                          value={member.email}
                          onChange={(e) => handleTeamMemberChange(index, 'email', e.target.value)}
                          className="p-2.5 rounded-lg border border-gray-200"
                        />
                        <input
                          type="tel"
                          required
                          placeholder="Phone / WhatsApp"
                          value={member.phone}
                          onChange={(e) => handleTeamMemberChange(index, 'phone', e.target.value)}
                          className="p-2.5 rounded-lg border border-gray-200"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Student Roll No / ID"
                          value={member.studentId}
                          onChange={(e) => handleTeamMemberChange(index, 'studentId', e.target.value)}
                          className="p-2.5 rounded-lg border border-gray-200"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 5. Campus Accommodation Option */}
              <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 pr-4">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#090814] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#5227FF]" />
                      Campus Accommodation & Hospitality
                    </span>
                    <p className="text-[11px] text-[#717188]">
                      Free campus hostel stay & dining available for verified outstation delegates.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={accommodationRequired}
                      onChange={(e) => setAccommodationRequired(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5227FF]"></div>
                  </label>
                </div>

                {accommodationRequired && (
                  <div className="pt-3 border-t border-gray-100 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#525266] mb-1">
                          Hostel Allotment Category *
                        </label>
                        <select
                          value={accommodationType}
                          onChange={(e) => setAccommodationType(e.target.value as any)}
                          className="w-full p-3 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium bg-[#FBFBFD]"
                        >
                          <option value="BOYS_HOSTEL">RVRJC Boys Hostel (Campus Block B)</option>
                          <option value="GIRLS_HOSTEL">RVRJC Girls Hostel (Campus Block G)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#525266] mb-1">
                          Stay Duration *
                        </label>
                        <select
                          value={accommodationDays}
                          onChange={(e) => setAccommodationDays(e.target.value)}
                          className="w-full p-3 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium bg-[#FBFBFD]"
                        >
                          <option value="28–29 December (2 Days)">28–29 December (2 Days)</option>
                          <option value="27–29 December (3 Days / Early Check-in)">27–29 December (3 Days / Early Check-in)</option>
                          <option value="28–30 December (3 Days / Late Departure)">28–30 December (3 Days / Late Departure)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#525266] mb-1">
                        Special Requests / Travel Arrival Time (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Arriving at Guntur Junction on 27th Dec 8 PM, food preference..."
                        value={accommodationNotes}
                        onChange={(e) => setAccommodationNotes(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 text-xs sm:text-sm font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Terms & Consent */}
              <div className="p-4 rounded-xl bg-white border border-gray-200 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent-check"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="w-4 h-4 mt-1 rounded text-[#5227FF] focus:ring-[#5227FF] cursor-pointer"
                />
                <label htmlFor="consent-check" className="text-xs text-[#090814] font-medium leading-relaxed cursor-pointer">
                  I hereby certify that all particulars provided are accurate and that I am a bonafide student. I agree to abide by the collegiate code of conduct, sportsmanship guidelines, and rules stipulated by R.V.R. & J.C. College of Engineering for COLORIDO 2K26. <span className="text-red-500 font-bold ml-0.5">*</span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 rounded-2xl bg-[#090814] hover:bg-black text-white text-sm sm:text-base font-bold shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {submitting ? 'VALIDATING & CREATING PASS...' : 'SUBMIT REGISTRATION & GENERATE PASS'}
              </button>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFBFD] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#5227FF] border-t-transparent animate-spin" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
