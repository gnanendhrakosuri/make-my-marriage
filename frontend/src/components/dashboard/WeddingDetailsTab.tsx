'use client';

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/constants';

interface WeddingDetailsTabProps {
  weddingId: string;
  onWeddingUpdated?: () => void;
}

export default function WeddingDetailsTab({ weddingId, onWeddingUpdated }: WeddingDetailsTabProps) {
  const [siteTitle, setSiteTitle] = useState('');
  const [partnerOne, setPartnerOne] = useState('');
  const [partnerTwo, setPartnerTwo] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [welcomeStory, setWelcomeStory] = useState('');
  const [urlSlug, setUrlSlug] = useState('');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [venueCity, setVenueCity] = useState('');
  const [venueCountry, setVenueCountry] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch wedding info
  useEffect(() => {
    async function fetchWedding() {
      if (!weddingId) return;
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/weddings/${weddingId}`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setSiteTitle(data.siteTitle || '');
          if (data.partnerOne) setPartnerOne(data.partnerOne);
          else if (data.coupleNames && data.coupleNames.length > 0) setPartnerOne(data.coupleNames[0]);
          if (data.partnerTwo) setPartnerTwo(data.partnerTwo);
          else if (data.coupleNames && data.coupleNames.length > 1) setPartnerTwo(data.coupleNames[1]);
          setWeddingDate(data.weddingDate ? data.weddingDate.split('T')[0] : '');
          setWelcomeStory(data.welcomeStory || '');
          setUrlSlug(data.slug || '');
          setVenueName(data.venueName || '');
          setVenueAddress(data.venueAddress || '');
          setVenueCity(data.venueCity || '');
          setVenueCountry(data.venueCountry || '');
        }
      } catch (err) {
        console.warn('Failed to load wedding details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchWedding();
  }, [weddingId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weddingId) return;
    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      const payload = {
        siteTitle: siteTitle.trim(),
        coupleNames: [partnerOne.trim(), partnerTwo.trim()].filter(Boolean),
        partnerOne: partnerOne.trim(),
        partnerTwo: partnerTwo.trim(),
        weddingDate: weddingDate ? new Date(weddingDate).toISOString() : undefined,
        welcomeStory: welcomeStory.trim(),
        slug: urlSlug.trim(),
        venueName: venueName.trim(),
        venueAddress: venueAddress.trim(),
        venueCity: venueCity.trim(),
        venueCountry: venueCountry.trim(),
      };

      const res = await fetch(`${API_BASE_URL}/api/v1/weddings/${weddingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to update wedding details');
      }

      setMessage('Wedding details successfully updated and synchronized.');
      if (onWeddingUpdated) onWeddingUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error updating wedding');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin mb-3"></div>
        <p className="font-label-sm text-xs text-stone-muted uppercase tracking-widest font-semibold">
          Loading Celebration Dossier...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-16">
      <div className="mb-8 border-b border-[#C5A059]/15 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7F3EB] border border-[#C5A059]/30 text-[#745b1a] text-xs uppercase tracking-widest font-semibold mb-3">
          <span className="material-symbols-outlined text-[16px] text-gold-champagne">favorite</span>
          <span>Matrimonial Dossier</span>
        </div>
        <h1 className="font-headline-md text-headline-md text-charcoal-ink tracking-tight">
          Wedding Details & Celebration Settings
        </h1>
        <p className="font-body-sm text-body-sm text-stone-muted mt-1 max-w-2xl leading-relaxed">
          Configure the core celebration details, venue address, personalized wedding URL slug, and invitation welcome notes.
        </p>
      </div>

      {message && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 font-medium">
          <span className="material-symbols-outlined text-[18px] text-red-600">error</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-6 max-w-4xl">
        <div className="rounded-2xl bg-ivory-surface p-6 sm:p-8 shadow-[0_2px_12px_-2px_rgba(74,18,26,0.04)] border border-[#C5A059]/20 flex flex-col gap-5">
          <h2 className="font-headline-sm text-xl text-charcoal-ink">Essential Matrimonial Details</h2>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-sm text-xs uppercase tracking-wider font-semibold text-charcoal-ink">
              Celebration Site Title *
            </label>
            <input
              type="text"
              required
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              placeholder="e.g. Sarah & Julian’s Italian Romance"
              className="w-full px-4 py-2.5 rounded-xl bg-ivory-highlight border border-[#C5A059]/30 font-body-sm text-sm text-charcoal-ink focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-xs uppercase tracking-wider font-semibold text-charcoal-ink">
                Partner 1 Full Name *
              </label>
              <input
                type="text"
                required
                value={partnerOne}
                onChange={(e) => setPartnerOne(e.target.value)}
                placeholder="e.g. Sarah Kensington"
                className="w-full px-4 py-2.5 rounded-xl bg-ivory-highlight border border-[#C5A059]/30 font-body-sm text-sm text-charcoal-ink focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-xs uppercase tracking-wider font-semibold text-charcoal-ink">
                Partner 2 Full Name *
              </label>
              <input
                type="text"
                required
                value={partnerTwo}
                onChange={(e) => setPartnerTwo(e.target.value)}
                placeholder="e.g. Julian Montgomery"
                className="w-full px-4 py-2.5 rounded-xl bg-ivory-highlight border border-[#C5A059]/30 font-body-sm text-sm text-charcoal-ink focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-xs uppercase tracking-wider font-semibold text-charcoal-ink">
                Celebration Date *
              </label>
              <input
                type="date"
                required
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-ivory-highlight border border-[#C5A059]/30 font-body-sm text-sm text-charcoal-ink focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-xs uppercase tracking-wider font-semibold text-charcoal-ink">
                Custom Website Slug (Vanity URL)
              </label>
              <div className="flex items-center">
                <span className="px-3.5 py-2.5 rounded-l-xl bg-surface-container border border-r-0 border-[#C5A059]/30 font-mono text-xs text-stone-muted">
                  /w/
                </span>
                <input
                  type="text"
                  value={urlSlug}
                  onChange={(e) => setUrlSlug(e.target.value)}
                  placeholder="sarah-julian"
                  className="w-full px-3.5 py-2.5 rounded-r-xl bg-ivory-highlight border border-[#C5A059]/30 font-body-sm text-sm text-charcoal-ink focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-sm text-xs uppercase tracking-wider font-semibold text-charcoal-ink">
              Welcome Story / Celebration Message
            </label>
            <textarea
              rows={3}
              value={welcomeStory}
              onChange={(e) => setWelcomeStory(e.target.value)}
              placeholder="We warmly invite our dearest family and lifelong friends to join us..."
              className="w-full px-4 py-2.5 rounded-xl bg-ivory-highlight border border-[#C5A059]/30 font-body-sm text-sm text-charcoal-ink focus:outline-none focus:ring-2 focus:ring-[#C5A059] resize-none"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-ivory-surface p-6 sm:p-8 shadow-[0_2px_12px_-2px_rgba(74,18,26,0.04)] border border-[#C5A059]/20 flex flex-col gap-5">
          <h2 className="font-headline-sm text-xl text-charcoal-ink">Venue & Destination Location</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-xs uppercase tracking-wider font-semibold text-charcoal-ink">
                Venue Name
              </label>
              <input
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="e.g. Villa d'Este Mosaic Gardens"
                className="w-full px-4 py-2.5 rounded-xl bg-ivory-highlight border border-[#C5A059]/30 font-body-sm text-sm text-charcoal-ink focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-xs uppercase tracking-wider font-semibold text-charcoal-ink">
                Street Address
              </label>
              <input
                type="text"
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                placeholder="e.g. Via Regina 40"
                className="w-full px-4 py-2.5 rounded-xl bg-ivory-highlight border border-[#C5A059]/30 font-body-sm text-sm text-charcoal-ink focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-xs uppercase tracking-wider font-semibold text-charcoal-ink">
                City / Region
              </label>
              <input
                type="text"
                value={venueCity}
                onChange={(e) => setVenueCity(e.target.value)}
                placeholder="e.g. Cernobbio, Lake Como"
                className="w-full px-4 py-2.5 rounded-xl bg-ivory-highlight border border-[#C5A059]/30 font-body-sm text-sm text-charcoal-ink focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-xs uppercase tracking-wider font-semibold text-charcoal-ink">
                Country
              </label>
              <input
                type="text"
                value={venueCountry}
                onChange={(e) => setVenueCountry(e.target.value)}
                placeholder="e.g. Italy"
                className="w-full px-4 py-2.5 rounded-xl bg-ivory-highlight border border-[#C5A059]/30 font-body-sm text-sm text-charcoal-ink focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-burgundy-velvet text-on-primary font-label-md text-label-md uppercase tracking-wider hover:bg-burgundy-hover transition-colors shadow-md disabled:opacity-50 font-semibold"
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
            ) : (
              <span className="material-symbols-outlined text-[18px]">save</span>
            )}
            <span>Save Celebration Dossier</span>
          </button>
        </div>
      </form>
    </div>
  );
}

