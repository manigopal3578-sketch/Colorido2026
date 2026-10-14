'use client';

import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Copy,
  Check,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';

export default function MediaLibraryPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('ALL');

  const mediaAssets = [
    {
      id: 'med-01',
      title: 'Silver Jubilee Auditorium Stage Lighting',
      category: 'CULTURAL',
      url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
      dimensions: '1920x1080',
    },
    {
      id: 'med-02',
      title: 'Classical Solo Dance Natya Tharanga Cover',
      category: 'CULTURAL',
      url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop',
      dimensions: '1600x900',
    },
    {
      id: 'med-03',
      title: 'Battle of the Bands Electric Stage',
      category: 'CULTURAL',
      url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=1200&auto=format&fit=crop',
      dimensions: '1920x1280',
    },
    {
      id: 'med-04',
      title: 'Turf Box Cricket Stadium Floodlights',
      category: 'SPORTS',
      url: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1200&auto=format&fit=crop',
      dimensions: '1920x1080',
    },
    {
      id: 'med-05',
      title: 'Basketball Smash Championship Court',
      category: 'SPORTS',
      url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1200&auto=format&fit=crop',
      dimensions: '1600x1066',
    },
    {
      id: 'med-06',
      title: 'RVRJC Campus Administrative Quadrangle',
      category: 'CAMPUS',
      url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format&fit=crop',
      dimensions: '1920x1200',
    },
    {
      id: 'med-07',
      title: 'Outdoor Open Air Theatre at Dusk',
      category: 'CAMPUS',
      url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1200&auto=format&fit=crop',
      dimensions: '1920x1080',
    },
    {
      id: 'med-08',
      title: 'COLORIDO 2K26 Festival Emblem & Monogram',
      category: 'BRAND',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
      dimensions: '1000x1000',
    },
  ];

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = mediaAssets.filter((m) => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'ALL' || m.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#5227FF] text-xs font-bold uppercase tracking-wider mb-1">
            <ImageIcon className="w-4 h-4" />
            <span>Digital Asset Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-[#090814] tracking-tight">
            Media & Asset Library ({filtered.length})
          </h1>
          <p className="text-[#525266] text-xs sm:text-sm mt-0.5 font-medium">
            Curated high-resolution imagery for Cultural stages, Sports grounds, and RVRJC venues.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search media assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-[#090814] placeholder-gray-400 focus:outline-none focus:border-[#5227FF] shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'CULTURAL', 'SPORTS', 'CAMPUS', 'BRAND'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                category === cat
                  ? 'bg-[#5227FF] text-white shadow-xs'
                  : 'text-[#525266] hover:text-[#090814] bg-white border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="h-44 relative overflow-hidden bg-gray-100">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-black/75 text-white backdrop-blur-xs border border-white/20">
                  {item.category}
                </span>
                <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded text-[9px] font-mono text-white bg-black/75 backdrop-blur-xs">
                  {item.dimensions}
                </span>
              </div>

              <div className="p-4 space-y-1">
                <h3 className="text-xs font-bold text-[#090814] line-clamp-1">{item.title}</h3>
                <p className="text-[10px] font-mono text-[#717188] truncate">{item.url}</p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => handleCopy(item.url, item.id)}
                className="text-xs font-bold text-[#5227FF] hover:underline flex items-center gap-1.5 transition-colors"
              >
                {copiedId === item.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>

              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 rounded-lg text-[#717188] hover:text-[#090814] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
