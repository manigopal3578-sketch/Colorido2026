'use client';

import React, { useState } from 'react';
import { CoordinatorItem } from '@/lib/types';
import { Mail, Phone, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface OrganizingTeamProps {
  coordinators: CoordinatorItem[];
}

export const OrganizingTeam: React.FC<OrganizingTeamProps> = ({ coordinators }) => {
  const [filter, setFilter] = useState<'ALL' | 'FACULTY' | 'STUDENT'>('ALL');

  if (!coordinators || coordinators.length === 0) return null;

  const filteredTeam = coordinators.filter(
    (c) => filter === 'ALL' || c.type === filter
  );

  return (
    <section id="team" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#FBFBFD] border-b border-border overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-bold uppercase tracking-widest text-[#5227FF] mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Festival Leadership</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-[#090814] tracking-tight mb-2">
            ORGANIZING COMMITTEE
          </h2>
          <p className="text-sm sm:text-base text-[#525266] font-medium">
            Dedicated faculty conveners and student leadership orchestrating COLORIDO 2K26.
          </p>

          {/* Role Filter */}
          <div className="inline-flex p-1 mt-6 bg-white border border-gray-200 rounded-xl">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'ALL' ? 'bg-[#090814] text-white' : 'text-[#525266]'
              }`}
            >
              All Leadership ({coordinators.length})
            </button>
            <button
              onClick={() => setFilter('FACULTY')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'FACULTY' ? 'bg-[#5227FF] text-white' : 'text-[#525266]'
              }`}
            >
              Faculty Conveners ({coordinators.filter((c) => c.type === 'FACULTY').length})
            </button>
            <button
              onClick={() => setFilter('STUDENT')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'STUDENT' ? 'bg-[#FF2E93] text-white' : 'text-[#525266]'
              }`}
            >
              Student Leads ({coordinators.filter((c) => c.type === 'STUDENT').length})
            </button>
          </div>
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeam.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.45, delay: (idx % 6) * 0.08 }}
              className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all flex flex-col justify-between"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-inner border border-gray-100">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider inline-block mb-1 text-white ${
                      member.category === 'CULTURAL'
                        ? 'bg-[#FF2E93]'
                        : member.category === 'SPORTS'
                        ? 'bg-[#FF5E3A]'
                        : 'bg-[#5227FF]'
                    }`}
                  >
                    {member.category} • {member.type}
                  </span>
                  <h4 className="font-display font-bold text-lg text-[#090814] leading-snug">
                    {member.name}
                  </h4>
                  <p className="text-xs font-semibold text-[#717188]">{member.role}</p>
                </div>
              </div>

              <p className="text-xs text-[#525266] leading-relaxed mb-4 line-clamp-3">
                {member.bio}
              </p>

              <div className="pt-3 border-t border-gray-100 space-y-1 text-xs text-[#525266]">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#5227FF]" />
                  <a href={`mailto:${member.email}`} className="hover:underline truncate">
                    {member.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#FF2E93]" />
                  <span>{member.phone}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
