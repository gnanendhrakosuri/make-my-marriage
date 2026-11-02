'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/constants';

interface InvitationDetails {
  invitationId: string;
  guestName: string;
  guestEmail: string;
  hasAccount?: boolean;
  coupleNames: string[];
  weddingTitle: string;
  weddingDate?: string | null;
  venueName?: string | null;
  venueAddress?: string | null;
  currentResponse?: string | null;
  canRespond: boolean;
}

export default function GuestRsvpPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedResponse, setSelectedResponse] = useState<'yes' | 'no' | null>(null);
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const [destinationUrl, setDestinationUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchInvitation = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/public/invitations/${token}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || 'Invitation link is invalid or expired.');
        }
        const data = await res.json();
        setInvitation(data.data);
        if (data.data?.currentResponse) {
          setSelectedResponse(data.data.currentResponse);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unable to load invitation details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  // Countdown timer for auto-redirect when invitation is accepted
  useEffect(() => {
    if (redirectCountdown === null || !destinationUrl) return;

    if (redirectCountdown <= 0) {
      router.push(destinationUrl);
      return;
    }

    const timer = setTimeout(() => {
      setRedirectCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [redirectCountdown, destinationUrl, router]);

  const handleSubmitRsvp = async (responseType: 'yes' | 'no') => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/public/invitations/${token}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response: responseType,
          dietaryNotes: dietaryNotes.trim() || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to submit RSVP.');
      }

      const resData = await res.json();
      setSelectedResponse(responseType);

      if (responseType === 'yes') {
        const targetUrl = resData.data?.redirectUrl || (invitation?.hasAccount ? '/login' : '/signup');
        setDestinationUrl(targetUrl);
        setRedirectCountdown(3);
        setSuccessMessage(
          resData.data?.hasAccount
            ? 'Joyfully Confirmed! Since you already have an account, redirecting you to sign in to access the wedding portal...'
            : 'Joyfully Confirmed! Redirecting you to set up your attendee account...'
        );
      } else {
        setSuccessMessage('Thank you for letting us know. You will be dearly missed.');
        setRedirectCountdown(null);
        setDestinationUrl(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error submitting RSVP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const coupleNamesStr = invitation?.coupleNames?.join(' & ') || 'Our Couple';

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E1A18] selection:bg-[#E5D5B8] selection:text-[#4A121A] flex flex-col font-sans">
      {/* Top Bar */}
      <header className="w-full py-6 px-4 sm:px-8 border-b border-[#C5A059]/20 bg-[#FFFDF9]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full border border-[#C5A059]/40 flex items-center justify-center bg-white shadow-xs">
              <span className="font-serif text-sm font-semibold text-[#4A121A] italic">MMM</span>
            </div>
            <div className="flex flex-col">
              <span className="font-cinzel text-xs sm:text-sm tracking-[0.22em] text-[#1E1A18] font-semibold uppercase leading-tight">
                Make My Marriage
              </span>
              <span className="text-[8px] uppercase tracking-[0.28em] text-[#B38E46] font-medium">
                Haute Atelier
              </span>
            </div>
          </Link>
          <div className="text-[10px] uppercase tracking-widest text-[#756D67] font-semibold bg-[#F7F3EB] px-3 py-1 rounded-full border border-[#C5A059]/20">
            Guest Portal
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="max-w-xl w-full">
          {isLoading ? (
            <div className="p-12 rounded-3xl bg-[#FFFDF9] border border-[#C5A059]/30 shadow-xl text-center">
              <div className="w-10 h-10 rounded-full border-2 border-[#4A121A]/30 border-t-[#4A121A] animate-spin mx-auto mb-4"></div>
              <h3 className="font-serif text-xl text-[#1E1A18]">Validating Atelier Invitation...</h3>
              <p className="text-xs text-[#756D67] mt-1">Please wait while we retrieve your wedding details</p>
            </div>
          ) : error && !invitation ? (
            <div className="p-8 sm:p-12 rounded-3xl bg-[#FFFDF9] border border-red-200 shadow-xl text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 text-red-700 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[30px]">link_off</span>
              </div>
              <h3 className="font-serif text-2xl text-[#1E1A18] mb-2">Invitation Unavailable</h3>
              <p className="text-xs text-[#756D67] leading-relaxed max-w-md mx-auto mb-6">
                {error}
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4A121A] text-[#FFFDF9] text-xs font-semibold uppercase tracking-wider border border-[#C5A059]/40 shadow-xs"
              >
                <span>Return to Home</span>
              </Link>
            </div>
          ) : (
            <div className="rounded-3xl bg-[#FFFDF9] border border-[#E5D5B8] shadow-2xl overflow-hidden animate-fade-in">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-[#4A121A] to-[#6B1D27] p-8 sm:p-10 text-center text-[#FFFDF9] relative">
                <div className="w-12 h-12 rounded-full border border-[#E5C378]/60 bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <span className="font-serif text-xl font-bold text-[#E5C378] italic">M</span>
                </div>
                <span className="text-[10px] uppercase tracking-[0.28em] text-[#E5C378] font-semibold block mb-2">
                  Wedding Celebration & RSVP
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-white mb-2">
                  {coupleNamesStr}
                </h1>
                <p className="font-cinzel text-xs text-[#E5C378] uppercase tracking-wider">
                  {invitation?.weddingTitle}
                </p>
              </div>

              {/* Guest Greeting Card */}
              <div className="p-6 sm:p-10">
                <div className="text-center mb-8 pb-6 border-b border-[#C5A059]/15">
                  <span className="text-xs uppercase tracking-widest text-[#B38E46] font-semibold block mb-1">
                    Warmest Welcome
                  </span>
                  <h2 className="font-serif text-2xl text-[#1E1A18]">
                    Dear {invitation?.guestName}
                  </h2>
                  <p className="text-xs text-[#756D67] mt-2 max-w-md mx-auto leading-relaxed">
                    We are honored by your presence. Please let us know if you will be celebrating with us.
                  </p>
                </div>

                {/* Event Commemoration Box */}
                <div className="rounded-2xl bg-[#FAF7F2] border border-[#C5A059]/25 p-5 mb-8 text-center">
                  <div className="text-[10px] uppercase tracking-widest text-[#B38E46] font-bold mb-1">
                    Celebration Details
                  </div>
                  <div className="font-serif text-lg text-[#4A121A] font-semibold">
                    {invitation?.weddingDate || 'Celebration Date to Be Announced'}
                  </div>
                  <div className="text-xs text-[#756D67] mt-1">
                    {invitation?.venueName || 'Private Destination Sanctuary'}
                  </div>
                  {invitation?.venueAddress && (
                    <div className="text-[11px] text-[#756D67]/80 mt-0.5">
                      {invitation.venueAddress}
                    </div>
                  )}
                </div>

                {/* Confirmation Status Toast */}
                {successMessage && (
                  <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex flex-col gap-2.5 animate-fade-in shadow-xs">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0 mt-0.5">
                        verified
                      </span>
                      <div className="flex-1 font-medium leading-relaxed">{successMessage}</div>
                    </div>
                    {redirectCountdown !== null && destinationUrl && (
                      <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60 mt-1">
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          Redirecting in {redirectCountdown}s...
                        </span>
                        <Link
                          href={destinationUrl}
                          className="px-3 py-1 rounded-full bg-emerald-800 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-900 transition-colors"
                        >
                          Proceed Now &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* RSVP Choice Buttons */}
                <div className="mb-6">
                  <label className="block text-center text-xs uppercase tracking-wider font-semibold text-[#756D67] mb-4">
                    Will you be joining our celebration?
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Accept Button */}
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSubmitRsvp('yes')}
                      className={`py-3.5 px-4 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${
                        selectedResponse === 'yes'
                          ? 'bg-[#4A121A] text-[#FFFDF9] border-[#C5A059] shadow-md ring-4 ring-[#4A121A]/10'
                          : 'bg-[#FFFDF9] text-[#1E1A18] hover:bg-[#FAF7F2] border-[#C5A059]/30 hover:border-[#C5A059]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px] text-[#C5A059]">
                        check_circle
                      </span>
                      <span>Joyfully Accept</span>
                    </button>

                    {/* Decline Button */}
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSubmitRsvp('no')}
                      className={`py-3.5 px-4 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${
                        selectedResponse === 'no'
                          ? 'bg-stone-800 text-white border-stone-600 shadow-md ring-4 ring-stone-800/10'
                          : 'bg-[#FFFDF9] text-[#756D67] hover:bg-[#FAF7F2] border-[#C5A059]/30 hover:border-stone-400'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">cancel</span>
                      <span>Regretfully Decline</span>
                    </button>
                  </div>
                </div>

                {/* Dietary Notes */}
                <div className="mb-6">
                  <label className="block text-[11px] uppercase tracking-wider text-[#756D67] font-semibold mb-1">
                    Special Dietary Requirements or Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={dietaryNotes}
                    onChange={(e) => setDietaryNotes(e.target.value)}
                    placeholder="e.g. Vegetarian, Gluten-free, allergies..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF7F2] border border-[#C5A059]/30 focus:border-[#C5A059] focus:outline-none"
                  />
                </div>

                <div className="text-center pt-4 border-t border-[#C5A059]/15">
                  <p className="text-[11px] text-[#9E968F] leading-relaxed">
                    You may return to this bespoke link anytime before the commemoration date to update your RSVP.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
