'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { API_BASE_URL } from '@/lib/constants';

interface SubEvent {
  id: string;
  title: string;
  date?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  dressCode?: string | null;
  isPublic: boolean;
}

interface WeddingPublicData {
  id: string;
  slug: string;
  siteTitle: string;
  coupleNames: string[];
  partnerOne: string;
  partnerTwo: string;
  weddingDate?: string | null;
  welcomeStory?: string | null;
  howWeMet?: string | null;
  venueName?: string | null;
  venueAddress?: string | null;
  venueCity?: string | null;
  venueCountry?: string | null;
  timezone: string;
  coordinates?: string | null;
  accommodationNotes?: string | null;
  transportNotes?: string | null;
  status: string;
  events: SubEvent[];
}

export default function PublicWeddingWebsitePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [wedding, setWedding] = useState<WeddingPublicData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchWedding = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/public/weddings/${slug}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || 'Wedding celebration not found or private.');
        }
        const data = await res.json();
        setWedding(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unable to load celebration details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWedding();
  }, [slug]);

  // Dynamic Monogram Crest calculation
  const monogram = useMemo(() => {
    if (!wedding) return 'M&M';
    const p1 = wedding.partnerOne ? wedding.partnerOne.trim().charAt(0).toUpperCase() : 'M';
    const p2 = wedding.partnerTwo ? wedding.partnerTwo.trim().charAt(0).toUpperCase() : 'M';
    return `${p1}&${p2}`;
  }, [wedding]);

  // Days Remaining Countdown
  const daysRemaining = useMemo(() => {
    if (!wedding?.weddingDate) return null;
    const parts = wedding.weddingDate.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const target = new Date(year, month, day);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const diffTime = target.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }
    const target = new Date(wedding.weddingDate);
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [wedding?.weddingDate]);

  // Formatted Wedding Date String
  const formattedDate = useMemo(() => {
    if (!wedding?.weddingDate) return 'Date to be announced';
    try {
      const parts = wedding.weddingDate.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        return d.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      }
      const d = new Date(wedding.weddingDate);
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return wedding.weddingDate;
    }
  }, [wedding?.weddingDate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6 text-[#1E1A18]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full border-2 border-[#C5A059] border-t-transparent animate-spin"></div>
          <span className="font-serif italic text-lg text-[#4A121A]">Opening Atelier Dossier...</span>
          <span className="text-xs uppercase tracking-widest text-[#B38E46] font-semibold">Make My Marriage</span>
        </div>
      </div>
    );
  }

  if (error || !wedding) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6 text-[#1E1A18]">
        <div className="max-w-md w-full rounded-3xl bg-[#FFFDF9] border border-[#C5A059]/30 p-8 shadow-xl text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#4A121A]/10 text-[#4A121A] flex items-center justify-center text-2xl font-serif">
            ❦
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1E1A18]">Celebration Not Found</h2>
          <p className="text-sm text-[#756D67] leading-relaxed">
            {error || 'This wedding website is not yet available or the custom URL is incorrect.'}
          </p>
          <Link
            href="/"
            className="mt-2 px-6 py-2.5 rounded-full bg-[#4A121A] text-[#FFFDF9] text-xs uppercase tracking-widest font-semibold hover:bg-[#360B12] transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E1A18] font-sans antialiased selection:bg-[#C5A059]/30 selection:text-[#4A121A]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#C5A059]/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#C5A059] bg-[#FFFDF9] flex items-center justify-center shadow-sm">
              <span className="font-serif italic font-bold text-[#4A121A] text-lg leading-none">
                {wedding.partnerOne.charAt(0) || 'M'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-base sm:text-lg font-semibold tracking-tight text-[#1E1A18] leading-none">
                {wedding.partnerOne} & {wedding.partnerTwo}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#B38E46] font-semibold mt-1">
                {wedding.venueCity ? `${wedding.venueCity} · ` : ''}{wedding.weddingDate ? wedding.weddingDate.slice(0, 4) : 'Celebration'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="#schedule"
              className="hidden sm:inline-flex text-xs uppercase tracking-widest font-semibold text-[#756D67] hover:text-[#4A121A] transition-colors"
            >
              Itinerary
            </Link>
            <Link
              href="#venue"
              className="hidden sm:inline-flex text-xs uppercase tracking-widest font-semibold text-[#756D67] hover:text-[#4A121A] transition-colors"
            >
              Villa & Map
            </Link>
            <Link
              href="/"
              className="px-4 py-2 rounded-full border border-[#C5A059]/30 bg-[#FFFDF9] hover:bg-[#F7F3EB] text-[11px] uppercase tracking-widest font-semibold text-[#4A121A] transition-colors shadow-sm"
            >
              Make My Marriage
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center flex flex-col items-center">
          {/* Monogram Crest */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-[#C5A059] bg-[#FFFDF9] flex items-center justify-center shadow-lg mb-8 relative">
            <span className="font-serif italic text-3xl sm:text-4xl text-[#4A121A] font-bold">
              {monogram}
            </span>
            <div className="absolute -inset-1.5 rounded-full border border-[#C5A059]/40 pointer-events-none"></div>
          </div>

          <span className="text-xs uppercase tracking-[0.25em] text-[#B38E46] font-bold mb-3">
            Together with their families
          </span>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#1E1A18] leading-[1.1] mb-6">
            {wedding.partnerOne}
            <span className="block sm:inline sm:mx-4 font-serif italic text-[#C5A059] font-normal">&</span>
            {wedding.partnerTwo}
          </h1>

          <p className="font-serif italic text-xl sm:text-2xl text-[#4A121A] mb-6 max-w-2xl leading-relaxed">
            {wedding.siteTitle}
          </p>

          {/* Wedding Date & Countdown Pill */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 px-6 py-3 rounded-full bg-[#FFFDF9] border border-[#C5A059]/30 shadow-md mb-10">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#1E1A18]">
              <span className="material-symbols-outlined text-[18px] text-[#C5A059]">calendar_today</span>
              <span>{formattedDate}</span>
            </div>
            {daysRemaining !== null && (
              <>
                <span className="text-[#C5A059]">·</span>
                <span className="text-xs sm:text-sm font-bold text-[#4A121A] tracking-wide">
                  {daysRemaining === 0 ? 'Celebrating Today!' : `${daysRemaining} Days to Go`}
                </span>
              </>
            )}
          </div>

          {/* Welcome Story */}
          {wedding.welcomeStory && (
            <div className="max-w-2xl bg-[#FFFDF9] p-6 sm:p-8 rounded-3xl border border-[#C5A059]/25 shadow-sm text-center">
              <span className="font-serif italic text-2xl text-[#C5A059] leading-none block mb-2">“</span>
              <p className="text-sm sm:text-base text-[#756D67] leading-relaxed font-serif italic">
                {wedding.welcomeStory}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Couple Narrative Section */}
      {wedding.howWeMet && (
        <section className="py-16 bg-[#FFFDF9] border-y border-[#C5A059]/20">
          <div className="max-w-3xl mx-auto px-4 sm:px-8 text-center flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#B38E46] mb-2">
              Our Journey
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1E1A18] mb-6">
              How We Met
            </h2>
            <div className="w-12 h-[2px] bg-[#C5A059] mb-8"></div>
            <p className="text-sm sm:text-base text-[#756D67] leading-relaxed text-justify sm:text-center">
              {wedding.howWeMet}
            </p>
          </div>
        </section>
      )}

      {/* Schedule / Sub-Events Timeline */}
      <section id="schedule" className="py-20 max-w-5xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#B38E46] mb-2 block">
            Curated Itinerary
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1E1A18]">
            Celebration Schedule
          </h2>
          <div className="w-12 h-[2px] bg-[#C5A059] mx-auto mt-4"></div>
        </div>

        {wedding.events && wedding.events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wedding.events.map((ev, idx) => (
              <div
                key={ev.id || idx}
                className="rounded-3xl bg-[#FFFDF9] border border-[#C5A059]/30 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#C5A059]/20 mb-4">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#B38E46]">
                      Event {idx + 1}
                    </span>
                    {ev.date && (
                      <span className="text-xs font-semibold text-[#1E1A18] bg-[#F7F3EB] px-3 py-1 rounded-full border border-[#C5A059]/20">
                        {ev.date}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[#1E1A18] mb-3">
                    {ev.title}
                  </h3>
                  {(ev.startTime || ev.endTime) && (
                    <div className="flex items-center gap-2 text-xs text-[#756D67] mb-2 font-medium">
                      <span className="material-symbols-outlined text-[16px] text-[#C5A059]">schedule</span>
                      <span>
                        {ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ''}
                      </span>
                    </div>
                  )}
                  {ev.location && (
                    <div className="flex items-center gap-2 text-xs text-[#756D67] mb-2 font-medium">
                      <span className="material-symbols-outlined text-[16px] text-[#C5A059]">location_on</span>
                      <span>{ev.location}</span>
                    </div>
                  )}
                </div>

                {ev.dressCode && (
                  <div className="mt-6 pt-4 border-t border-[#C5A059]/15 flex items-center justify-between text-xs">
                    <span className="text-[#756D67] uppercase tracking-wider text-[10px] font-bold">Attire:</span>
                    <span className="font-semibold text-[#4A121A]">{ev.dressCode}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#FFFDF9] rounded-3xl border border-[#C5A059]/20">
            <p className="text-sm text-[#756D67] italic font-serif">
              Full soirée schedule will be unveiled closer to the wedding date.
            </p>
          </div>
        )}
      </section>

      {/* Villa & Map Logistics */}
      <section id="venue" className="py-20 bg-[#F7F3EB] border-t border-[#C5A059]/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-12">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#B38E46] mb-2 block">
              Destination & Logistics
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#1E1A18]">
              The Villa & Destination
            </h2>
            <div className="w-12 h-[2px] bg-[#C5A059] mx-auto mt-4"></div>
          </div>

          <div className="rounded-3xl bg-[#FFFDF9] border border-[#C5A059]/30 p-8 shadow-md flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#C5A059]/20">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#1E1A18]">
                  {wedding.venueName || 'Celebration Venue'}
                </h3>
                <p className="text-sm text-[#756D67] mt-1">
                  {[wedding.venueAddress, wedding.venueCity, wedding.venueCountry].filter(Boolean).join(', ') || 'Address provided upon invitation'}
                </p>
              </div>

              {wedding.venueName && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    [wedding.venueName, wedding.venueAddress, wedding.venueCity].filter(Boolean).join(' ')
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#4A121A] hover:bg-[#360B12] text-[#FFFDF9] text-xs uppercase tracking-wider font-semibold transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">map</span>
                  <span>Open in Maps</span>
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-[#756D67]">
              {wedding.transportNotes && (
                <div className="p-4 rounded-2xl bg-[#F7F3EB] border border-[#C5A059]/20">
                  <h4 className="font-bold uppercase tracking-wider text-[#1E1A18] mb-2 text-[10px]">
                    Arrival & Transport
                  </h4>
                  <p className="leading-relaxed">{wedding.transportNotes}</p>
                </div>
              )}
              {wedding.accommodationNotes && (
                <div className="p-4 rounded-2xl bg-[#F7F3EB] border border-[#C5A059]/20">
                  <h4 className="font-bold uppercase tracking-wider text-[#1E1A18] mb-2 text-[10px]">
                    Accommodations
                  </h4>
                  <p className="leading-relaxed">{wedding.accommodationNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Atelier Footer */}
      <footer className="w-full bg-[#FAF7F2] border-t border-[#C5A059]/20 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#756D67]">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold italic text-sm text-[#1E1A18]">MMM</span>
            <span className="text-[#C5A059]">|</span>
            <span>{wedding.siteTitle} — Crafted with Make My Marriage</span>
          </div>
          <Link
            href="/"
            className="text-[10px] uppercase font-bold tracking-widest text-[#B38E46] hover:text-[#4A121A] transition-colors"
          >
            Create Your Wedding Website →
          </Link>
        </div>
      </footer>
    </div>
  );
}

