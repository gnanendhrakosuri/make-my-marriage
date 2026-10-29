'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface SoireeEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  dressCode: string;
  isPublic: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function WeddingOnboardingPage() {
  // Stepper state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string>('');
  const [conciergeNote, setConciergeNote] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishSuccessModal, setPublishSuccessModal] = useState<boolean>(false);

  // Step 1: Wedding Details
  const [siteTitle, setSiteTitle] = useState('');
  const [partnerOne, setPartnerOne] = useState('');
  const [partnerTwo, setPartnerTwo] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [welcomeStory, setWelcomeStory] = useState('');
  const [urlSlug, setUrlSlug] = useState('');

  // Step 2: Couple Dossier
  const [partnerOneRole, setPartnerOneRole] = useState('');
  const [partnerOneEmail, setPartnerOneEmail] = useState('');
  const [partnerOneBio, setPartnerOneBio] = useState('');
  const [partnerTwoRole, setPartnerTwoRole] = useState('');
  const [partnerTwoEmail, setPartnerTwoEmail] = useState('');
  const [partnerTwoBio, setPartnerTwoBio] = useState('');
  const [howWeMet, setHowWeMet] = useState('');

  // Step 3: Soirée Events
  const [events, setEvents] = useState<SoireeEvent[]>([]);

  // Step 4: Villa & Map
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [venueCity, setVenueCity] = useState('');
  const [venueCountry, setVenueCountry] = useState('');
  const [timezone, setTimezone] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [accommodationNotes, setAccommodationNotes] = useState('');
  const [transportNotes, setTransportNotes] = useState('');

  // New Event Temporary Form in Step 3
  const [showAddEventModal, setShowAddEventModal] = useState<boolean>(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventStart, setNewEventStart] = useState('');
  const [newEventEnd, setNewEventEnd] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventDressCode, setNewEventDressCode] = useState('');

  // Load from localStorage on mount (draft takes priority, otherwise hydrate from logged in user)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mmm_onboarding_draft');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.siteTitle && data.siteTitle.trim()) setSiteTitle(data.siteTitle);
        if (data.partnerOne && data.partnerOne.trim()) setPartnerOne(data.partnerOne);
        if (data.partnerTwo && data.partnerTwo.trim()) setPartnerTwo(data.partnerTwo);
        if (data.weddingDate) setWeddingDate(data.weddingDate);
        if (data.welcomeStory) setWelcomeStory(data.welcomeStory);
        if (data.urlSlug && data.urlSlug.trim()) setUrlSlug(data.urlSlug);
        if (data.partnerOneRole) setPartnerOneRole(data.partnerOneRole);
        if (data.partnerOneEmail) setPartnerOneEmail(data.partnerOneEmail);
        if (data.partnerOneBio) setPartnerOneBio(data.partnerOneBio);
        if (data.partnerTwoRole) setPartnerTwoRole(data.partnerTwoRole);
        if (data.partnerTwoEmail) setPartnerTwoEmail(data.partnerTwoEmail);
        if (data.partnerTwoBio) setPartnerTwoBio(data.partnerTwoBio);
        if (data.howWeMet) setHowWeMet(data.howWeMet);
        if (data.events && Array.isArray(data.events)) setEvents(data.events);
        if (data.venueName) setVenueName(data.venueName);
        if (data.venueAddress) setVenueAddress(data.venueAddress);
        if (data.venueCity) setVenueCity(data.venueCity);
        if (data.venueCountry) setVenueCountry(data.venueCountry);
        if (data.timezone) setTimezone(data.timezone);
        if (data.coordinates) setCoordinates(data.coordinates);
        if (data.accommodationNotes) setAccommodationNotes(data.accommodationNotes);
        if (data.transportNotes) setTransportNotes(data.transportNotes);
      } else {
        const userStr = localStorage.getItem('mmm_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.name) setPartnerOne(user.name);
          if (user.partnerName) setPartnerTwo(user.partnerName);
          if (user.email) setPartnerOneEmail(user.email);
          if (user.weddingDate) setWeddingDate(user.weddingDate);
          if (user.name && user.partnerName) {
            setSiteTitle(`${user.name} & ${user.partnerName}’s Matrimonial Celebration`);
            const defaultSlug = `${user.name}-${user.partnerName}`
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '-')
              .replace(/-+/g, '-');
            setUrlSlug(defaultSlug);
          }
        }
      }
    } catch {
      // LocalStorage error fallback
    }
  }, []);

  // Compute Monogram Initials (memoized)
  const monogram = useMemo(() => {
    const p1 = partnerOne.trim().charAt(0).toUpperCase();
    const p2 = partnerTwo.trim().charAt(0).toUpperCase();
    return p1 && p2 ? `${p1}&${p2}` : p1 ? `${p1}&✦` : 'M&M';
  }, [partnerOne, partnerTwo]);

  // Compute Days Remaining to Wedding Date (memoized & timezone-safe)
  const daysRemaining = useMemo(() => {
    if (!weddingDate) return null;
    try {
      const parts = weddingDate.split('-');
      if (parts.length !== 3) return null;
      const target = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      if (isNaN(target.getTime())) return null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 ? diffDays : 0;
    } catch {
      return null;
    }
  }, [weddingDate]);

  // Clean slug
  const handleSlugChange = (raw: string) => {
    const cleaned = raw.toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/--+/g, '-');
    setUrlSlug(cleaned);
  };

  // Fallback clipboard copy
  const fallbackCopyText = (text: string) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2200);
    } catch {
      // Clipboard unavailable
    }
  };

  // Copy vanity URL
  const handleCopyUrl = () => {
    const full = `https://makemymarriage.com/${urlSlug || 'custom-address'}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(full).then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2200);
      }).catch(() => {
        fallbackCopyText(full);
      });
    } else {
      fallbackCopyText(full);
    }
  };

  // Save draft
  const handleSaveDraft = useCallback(() => {
    try {
      const payload = {
        siteTitle,
        partnerOne,
        partnerTwo,
        weddingDate,
        welcomeStory,
        urlSlug,
        partnerOneRole,
        partnerOneEmail,
        partnerOneBio,
        partnerTwoRole,
        partnerTwoEmail,
        partnerTwoBio,
        howWeMet,
        events,
        venueName,
        venueAddress,
        venueCity,
        venueCountry,
        timezone,
        coordinates,
        accommodationNotes,
        transportNotes,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('mmm_onboarding_draft', JSON.stringify(payload));
      setLastSavedTime('Just now');
      setSaveSuccessMessage('Progress successfully preserved in Atelier memory.');
      setTimeout(() => setSaveSuccessMessage(''), 3000);
    } catch {
      setSaveSuccessMessage('Saved to local session.');
      setTimeout(() => setSaveSuccessMessage(''), 3000);
    }
  }, [
    siteTitle,
    partnerOne,
    partnerTwo,
    weddingDate,
    welcomeStory,
    urlSlug,
    partnerOneRole,
    partnerOneEmail,
    partnerOneBio,
    partnerTwoRole,
    partnerTwoEmail,
    partnerTwoBio,
    howWeMet,
    events,
    venueName,
    venueAddress,
    venueCity,
    venueCountry,
    timezone,
    coordinates,
    accommodationNotes,
    transportNotes,
  ]);

  // Validation per step
  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!siteTitle.trim()) newErrors.siteTitle = 'Wedding website title is required.';
      if (!partnerOne.trim()) newErrors.partnerOne = 'Partner 1 full name is required.';
      if (!partnerTwo.trim()) newErrors.partnerTwo = 'Partner 2 full name is required.';
      if (!weddingDate) newErrors.weddingDate = 'Celebration date is required.';
      if (!urlSlug.trim()) newErrors.urlSlug = 'Custom URL slug is required.';
    }

    if (stepNumber === 2) {
      if (!partnerOneEmail.trim() || !EMAIL_REGEX.test(partnerOneEmail.trim())) {
        newErrors.partnerOneEmail = 'A valid email for Partner 1 is required.';
      }
      if (!partnerTwoEmail.trim() || !EMAIL_REGEX.test(partnerTwoEmail.trim())) {
        newErrors.partnerTwoEmail = 'A valid email for Partner 2 is required.';
      }
    }

    if (stepNumber === 3) {
      if (events.length === 0) {
        newErrors.events = 'Please add at least one celebration soirée or ceremony.';
      }
    }

    if (stepNumber === 4) {
      if (!venueName.trim()) newErrors.venueName = 'Venue name is required.';
      if (!venueCity.trim()) newErrors.venueCity = 'City or location is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Comprehensive validation across all steps
  const validateAllSteps = (): { isValid: boolean; firstInvalidStep: number; allErrors: Record<string, string> } => {
    const allErrors: Record<string, string> = {};
    let firstInvalidStep = 0;

    // Step 1
    if (!siteTitle.trim()) allErrors.siteTitle = 'Wedding website title is required.';
    if (!partnerOne.trim()) allErrors.partnerOne = 'Partner 1 full name is required.';
    if (!partnerTwo.trim()) allErrors.partnerTwo = 'Partner 2 full name is required.';
    if (!weddingDate) allErrors.weddingDate = 'Celebration date is required.';
    if (!urlSlug.trim()) allErrors.urlSlug = 'Custom URL slug is required.';
    if (Object.keys(allErrors).length > 0 && firstInvalidStep === 0) firstInvalidStep = 1;

    // Step 2
    if (!partnerOneEmail.trim() || !EMAIL_REGEX.test(partnerOneEmail.trim())) {
      allErrors.partnerOneEmail = 'A valid email for Partner 1 is required.';
    }
    if (!partnerTwoEmail.trim() || !EMAIL_REGEX.test(partnerTwoEmail.trim())) {
      allErrors.partnerTwoEmail = 'A valid email for Partner 2 is required.';
    }
    if ((allErrors.partnerOneEmail || allErrors.partnerTwoEmail) && firstInvalidStep === 0) firstInvalidStep = 2;

    // Step 3
    if (events.length === 0) {
      allErrors.events = 'Please add at least one celebration soirée or ceremony.';
      if (firstInvalidStep === 0) firstInvalidStep = 3;
    }

    // Step 4
    if (!venueName.trim()) allErrors.venueName = 'Venue name is required.';
    if (!venueCity.trim()) allErrors.venueCity = 'City or location is required.';
    if ((allErrors.venueName || allErrors.venueCity) && firstInvalidStep === 0) firstInvalidStep = 4;

    return {
      isValid: Object.keys(allErrors).length === 0,
      firstInvalidStep,
      allErrors,
    };
  };

  // Safe navigation between steps
  const handleStepNavigation = (targetStep: number) => {
    if (targetStep < currentStep) {
      setErrors({});
      setCurrentStep(targetStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (targetStep > currentStep) {
      if (validateStep(currentStep)) {
        setErrors({});
        if (targetStep > currentStep + 1) {
          const { firstInvalidStep, allErrors } = validateAllSteps();
          if (firstInvalidStep > 0 && firstInvalidStep < targetStep) {
            setErrors(allErrors);
            setCurrentStep(firstInvalidStep);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
        }
        setCurrentStep(targetStep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setErrors({});
      if (currentStep < 5) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setErrors({});
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Event handlers
  const handleRemoveEvent = (id: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    const item: SoireeEvent = {
      id: `event-${Date.now()}`,
      title: newEventTitle.trim(),
      date: newEventDate || weddingDate || new Date().toISOString().split('T')[0],
      startTime: newEventStart || '18:00',
      endTime: newEventEnd || '21:00',
      location: newEventLocation.trim() || venueName || 'Celebration Venue',
      dressCode: newEventDressCode.trim() || 'Festive Chic',
      isPublic: true,
    };
    setEvents((prev) => [...prev, item]);
    setNewEventTitle('');
    setNewEventDate('');
    setNewEventStart('');
    setNewEventEnd('');
    setNewEventLocation('');
    setNewEventDressCode('');
    setShowAddEventModal(false);
  };

  // Publish / Create Wedding with full verification
  const handlePublish = () => {
    const { isValid, firstInvalidStep, allErrors } = validateAllSteps();
    if (!isValid) {
      setErrors(allErrors);
      setCurrentStep(firstInvalidStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setPublishSuccessModal(true);
      handleSaveDraft();
      try {
        localStorage.setItem(
          'mmm_published_wedding',
          JSON.stringify({
            siteTitle,
            partnerOne,
            partnerTwo,
            weddingDate,
            urlSlug,
            venueName,
            venueCity,
            eventsCount: events.length,
            publishedAt: new Date().toISOString(),
          })
        );
      } catch {
        // localStorage fallback
      }
    }, 1200);
  };

  // Step definitions
  const stepTitles = [
    { num: '01', title: 'Wedding Details', desc: 'Core Dossier' },
    { num: '02', title: 'Couple Dossier', desc: 'Personal Profiles' },
    { num: '03', title: 'Soirée Events', desc: 'Curated Schedule' },
    { num: '04', title: 'Villa & Map', desc: 'Venue Coordinates' },
    { num: '05', title: 'Review & Publish', desc: 'Live Atelier Launch' },
  ];

  return (
    <div className="bg-[#FAF7F2] min-h-screen text-[#1E1A18] font-sans antialiased selection:bg-[#C5A059]/30 selection:text-[#4A121A]">
      {/* =========================================================================
          Top Fixed Haute Atelier Header
         ========================================================================= */}
      <header className="fixed top-0 w-full z-50 bg-[#FAF7F2]/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(74,18,26,0.03)] border-b border-[#C5A059]/20">
        <div className="h-20 w-full px-4 sm:px-8 lg:px-16 flex items-center justify-between">
          {/* Brand Mark & Title */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full border border-[#C5A059] bg-[#FFFDF9] flex items-center justify-center shadow-[0_2px_8px_-2px_rgba(74,18,26,0.04)] group-hover:scale-105 transition-transform">
                <span className="font-serif italic font-bold text-[#4A121A] text-xl leading-none">M</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-medium text-lg tracking-tight text-[#1E1A18] leading-none">
                  Make My Marriage
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-semibold mt-1">
                  Haute Atelier Matrimonial
                </span>
              </div>
            </Link>

            {/* Setup Wizard Status Pill */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7F3EB] border border-[#C5A059]/25">
              <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse"></span>
              <span className="text-xs font-semibold text-[#756D67] uppercase tracking-wider">
                Setup Wizard — Atelier Onboarding
              </span>
            </div>
          </div>

          {/* Atelier Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-[#F7F3EB]/80 p-1 rounded-full border border-[#C5A059]/20" aria-label="Atelier step tabs">
            {stepTitles.map((step, idx) => {
              const stepIndex = idx + 1;
              const isActive = stepIndex === currentStep;
              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => handleStepNavigation(stepIndex)}
                  aria-current={isActive ? 'step' : undefined}
                  className={`px-3.5 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
                    isActive
                      ? 'bg-[#4A121A] text-[#FFFDF9] shadow-sm'
                      : 'text-[#756D67] hover:text-[#1E1A18] hover:bg-[#FAF7F2]'
                  }`}
                >
                  {step.title}
                </button>
              );
            })}
          </nav>

          {/* Right Header Concierge Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="#concierge"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#745b1a] hover:text-[#581825] transition-colors uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-[18px]">room_service</span>
              <span>Concierge Desk</span>
            </Link>

            <div className="h-5 w-[1px] bg-[#C5A059]/30 hidden sm:block"></div>

            {/* Notifications Button */}
            <button
              type="button"
              aria-label="Concierge notifications"
              className="w-9 h-9 rounded-full bg-[#F7F3EB] hover:bg-[#FFFDF9] border border-[#C5A059]/30 flex items-center justify-center text-[#756D67] hover:text-[#1E1A18] transition-colors relative"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-[19px]">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#4A121A] border-2 border-[#FAF7F2]"></span>
            </button>

            {/* Concierge Profile Pill */}
            <div className="flex items-center gap-2 pl-1">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-semibold text-[#1E1A18] leading-tight">Elena Rostova</span>
                <span className="text-[10px] text-[#B38E46] uppercase font-medium">Lead Concierge</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#4A121A] text-[#FFFDF9] flex items-center justify-center text-xs font-bold ring-2 ring-[#C5A059]/30">
                ER
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          Main Onboarding Container
         ========================================================================= */}
      <main className="w-full pt-24 pb-20 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto">
        {/* Top Breadcrumb & Return Bar */}
        <div className="py-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#C5A059]/15 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#756D67] hover:text-[#4A121A] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Return to Manager Portal</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7F3EB] text-[#1E1A18] text-xs font-semibold shadow-sm border border-[#C5A059]/20">
            <span className="material-symbols-outlined text-[#C5A059] text-[16px]">auto_awesome</span>
            <span className="text-[#756D67]">Step {currentStep} of 5:</span>
            <span className="text-[#4A121A]">{stepTitles[currentStep - 1]?.title}</span>
          </div>
        </div>

        {/* Editorial Headline Section */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F1EBE0] text-[#745b1a] text-[10px] uppercase tracking-widest font-semibold mb-3 border border-[#C5A059]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]"></span>
            <span>Atelier Wedding Creator</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1E1A18] tracking-tight mb-2">
            Set Up Your Wedding Website
          </h1>
          <p className="text-[#756D67] text-base max-w-2xl leading-relaxed">
            Let’s get your bespoke wedding website ready to share with your guests. We’ll configure your couple’s
            essential details, commemorative date, sub-events, and bespoke vanity address.
          </p>
        </div>

        {/* =========================================================================
            Stepper Navigation Bar (5 Steps)
           ========================================================================= */}
        <div className="mb-10 p-4 rounded-2xl bg-[#F7F3EB] border border-[#C5A059]/20 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {stepTitles.map((step, idx) => {
              const stepIndex = idx + 1;
              const isActive = stepIndex === currentStep;
              const isPast = stepIndex < currentStep;

              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => handleStepNavigation(stepIndex)}
                  aria-current={isActive ? 'step' : undefined}
                  className={`flex items-center md:flex-col md:text-center gap-2.5 p-3 rounded-xl transition-all text-left ${
                    isActive
                      ? 'bg-[#FFFDF9] shadow-sm border border-[#C5A059]/40 ring-2 ring-[#C5A059]/20'
                      : isPast
                      ? 'bg-[#FAF7F2] hover:bg-[#FFFDF9] border border-[#C5A059]/15'
                      : 'bg-[#F1EBE0]/60 opacity-80'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-[#4A121A] text-[#FFFDF9] shadow-md shadow-[#4A121A]/20 ring-2 ring-[#C5A059]/50'
                        : isPast
                        ? 'bg-[#C5A059] text-[#FFFDF9]'
                        : 'bg-[#E5E2DD] text-[#756D67]'
                    }`}
                  >
                    {isPast ? <span className="material-symbols-outlined text-[16px]">check</span> : step.num}
                  </div>
                  <div className="flex flex-col text-left md:text-center">
                    <span
                      className={`text-xs uppercase tracking-wider font-bold ${
                        isActive ? 'text-[#4A121A]' : isPast ? 'text-[#1E1A18]' : 'text-[#756D67]'
                      }`}
                    >
                      {step.title}
                    </span>
                    <span className="text-[10px] text-[#B38E46]">
                      {isActive ? 'Active Phase' : isPast ? 'Completed' : 'Upcoming'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Micro Progress Bar */}
          <div className="mt-3 pt-3 border-t border-[#C5A059]/15 flex items-center justify-between text-xs text-[#756D67]">
            <span>Atelier Provisioning Progress</span>
            <span className="font-bold text-[#4A121A]">{currentStep * 20}% Completed</span>
          </div>
        </div>

        {/* Save feedback toast */}
        {saveSuccessMessage && (
          <div className="mb-6 p-4 rounded-xl bg-[#FFFDF9] border border-[#C5A059] text-xs font-semibold text-[#4A121A] flex items-center gap-2 shadow-sm animate-fade-in">
            <span className="material-symbols-outlined text-[#C5A059]">check_circle</span>
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        {/* Concierge feedback toast */}
        {conciergeNote && (
          <div className="mb-6 p-4 rounded-xl bg-[#FFFDF9] border border-[#C5A059] text-xs font-semibold text-[#4A121A] flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#C5A059]">support_agent</span>
              <span>{conciergeNote}</span>
            </div>
            <button
              type="button"
              onClick={() => setConciergeNote('')}
              className="text-[#756D67] hover:text-[#1E1A18] text-xs p-1"
              aria-label="Dismiss message"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* =========================================================================
            Two-Column Asymmetric Working Atelier
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* =======================================================================
              Left Column (7 Cols): Active Step Form Canvas
             ======================================================================= */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="rounded-2xl bg-[#FFFDF9] p-6 sm:p-10 shadow-sm border border-[#C5A059]/25 relative overflow-hidden">
              {/* Luxury Top Accent Gradient Line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#C5A059] via-[#E5C378] to-[#C5A059]"></div>

              {/* STEP 1: WEDDING DETAILS */}
              {currentStep === 1 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1 text-[#C5A059]">
                      <span className="material-symbols-outlined text-[20px]">menu_book</span>
                      <h2 className="font-serif text-2xl text-[#1E1A18] font-medium">Essential Celebration Dossier</h2>
                    </div>
                    <p className="text-sm text-[#756D67]">
                      Enter the cornerstone details of your matrimonial celebration. These will orchestrate your
                      invitations, monogram, and guest registry suite.
                    </p>
                  </div>

                  {/* Wedding Website Name */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase tracking-wider font-bold text-[#1E1A18]" htmlFor="siteTitle">
                        Wedding Website Name <span className="text-[#581825]">*</span>
                      </label>
                      <span className="text-[10px] text-[#756D67] uppercase">Guest Portal Banner</span>
                    </div>
                    <input
                      id="siteTitle"
                      type="text"
                      value={siteTitle}
                      onChange={(e) => setSiteTitle(e.target.value)}
                      placeholder="e.g. Sarah & Julian’s Italian Romance"
                      className={`w-full px-4 py-3 rounded-xl bg-[#F7F3EB] text-[#1E1A18] text-sm focus:bg-[#FFFDF9] focus:outline-none focus:ring-2 focus:ring-[#C5A059] border ${
                        errors.siteTitle ? 'border-red-400' : 'border-[#C5A059]/20'
                      }`}
                    />
                    {errors.siteTitle && <span className="text-xs text-red-600">{errors.siteTitle}</span>}
                    <span className="text-xs text-[#756D67] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-[#B38E46]">info</span>
                      Displayed in your invitation header, browser tabs, and digital save-the-dates.
                    </span>
                  </div>

                  {/* Couple Names (2 Columns) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase tracking-wider font-bold text-[#1E1A18]" htmlFor="partnerOne">
                        Partner 1 Full Name <span className="text-[#581825]">*</span>
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756D67] text-[18px] pointer-events-none z-10">
                          person
                        </span>
                        <input
                          id="partnerOne"
                          type="text"
                          value={partnerOne}
                          onChange={(e) => setPartnerOne(e.target.value)}
                          placeholder="e.g. Sarah Kensington"
                          className={`w-full !pl-11 pr-4 py-3 rounded-xl bg-[#F7F3EB] text-[#1E1A18] text-sm focus:bg-[#FFFDF9] focus:outline-none focus:ring-2 focus:ring-[#C5A059] border ${
                            errors.partnerOne ? 'border-red-400' : 'border-[#C5A059]/20'
                          }`}
                        />
                      </div>
                      {errors.partnerOne && <span className="text-xs text-red-600">{errors.partnerOne}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase tracking-wider font-bold text-[#1E1A18]" htmlFor="partnerTwo">
                        Partner 2 Full Name <span className="text-[#581825]">*</span>
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756D67] text-[18px] pointer-events-none z-10">
                          person
                        </span>
                        <input
                          id="partnerTwo"
                          type="text"
                          value={partnerTwo}
                          onChange={(e) => setPartnerTwo(e.target.value)}
                          placeholder="e.g. Julian Montgomery"
                          className={`w-full !pl-11 pr-4 py-3 rounded-xl bg-[#F7F3EB] text-[#1E1A18] text-sm focus:bg-[#FFFDF9] focus:outline-none focus:ring-2 focus:ring-[#C5A059] border ${
                            errors.partnerTwo ? 'border-red-400' : 'border-[#C5A059]/20'
                          }`}
                        />
                      </div>
                      {errors.partnerTwo && <span className="text-xs text-red-600">{errors.partnerTwo}</span>}
                    </div>
                  </div>

                  {/* Celebration Date & Countdown Micro-Plaque */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                    <div className="sm:col-span-7 flex flex-col gap-1.5">
                      <label className="text-xs uppercase tracking-wider font-bold text-[#1E1A18]" htmlFor="weddingDate">
                        Celebration Date <span className="text-[#581825]">*</span>
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B38E46] text-[18px] pointer-events-none z-10">
                          calendar_today
                        </span>
                        <input
                          id="weddingDate"
                          type="date"
                          value={weddingDate}
                          onChange={(e) => setWeddingDate(e.target.value)}
                          className={`w-full !pl-11 pr-4 py-3 rounded-xl bg-[#F7F3EB] text-[#1E1A18] text-sm focus:bg-[#FFFDF9] focus:outline-none focus:ring-2 focus:ring-[#C5A059] border ${
                            errors.weddingDate ? 'border-red-400' : 'border-[#C5A059]/20'
                          }`}
                        />
                      </div>
                      {errors.weddingDate && <span className="text-xs text-red-600">{errors.weddingDate}</span>}
                      <span className="text-xs text-[#756D67] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-[#C5A059]">hourglass_top</span>
                        Countdown automatically calibrates for wedding guests.
                      </span>
                    </div>

                    <div className="sm:col-span-5 p-3.5 rounded-xl bg-[#F1EBE0] border border-[#C5A059]/20 flex flex-col justify-center">
                      <span className="text-[10px] text-[#756D67] uppercase tracking-wider font-semibold mb-1">
                        Live Countdown
                      </span>
                      <div className="flex items-baseline gap-1.5 text-[#4A121A]">
                        <span className="font-serif text-2xl font-bold">{daysRemaining !== null ? daysRemaining : '—'}</span>
                        <span className="text-xs font-semibold">Days to Celebration</span>
                      </div>
                      <span className="text-[11px] text-[#756D67] mt-0.5">
                        {weddingDate ? `${weddingDate} • Destination Time` : 'Awaiting date selection'}
                      </span>
                    </div>
                  </div>

                  {/* Celebration Message / Vow Prelude */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase tracking-wider font-bold text-[#1E1A18]" htmlFor="welcomeStory">
                        Celebration Message or Vow Prelude
                      </label>
                      <span className="text-[11px] text-[#B38E46] font-medium">
                        {welcomeStory.length} / 500 characters
                      </span>
                    </div>
                    <textarea
                      id="welcomeStory"
                      rows={3}
                      maxLength={500}
                      value={welcomeStory}
                      onChange={(e) => setWelcomeStory(e.target.value)}
                      placeholder="We warmly invite our dearest family and lifelong friends..."
                      className="w-full px-4 py-3 rounded-xl bg-[#F7F3EB] text-[#1E1A18] text-sm focus:bg-[#FFFDF9] focus:outline-none focus:ring-2 focus:ring-[#C5A059] border border-[#C5A059]/20 resize-none"
                    ></textarea>
                    <span className="text-xs text-[#756D67]">
                      Featured on your primary homepage cover scroll and printable itinerary slips.
                    </span>
                  </div>

                  {/* Bespoke Vanity URL Slug Section */}
                  <div className="p-5 rounded-2xl bg-[#F7F3EB] border border-[#C5A059]/25 flex flex-col gap-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label htmlFor="urlSlug" className="text-xs uppercase tracking-wider font-bold text-[#1E1A18] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#C5A059] text-[18px]">diamond</span>
                        <span>Custom Atelier URL Slug <span className="text-[#581825]">*</span></span>
                      </label>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFFDF9] text-[#745b1a] text-xs font-semibold border border-[#C5A059]/25 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4A121A] animate-pulse"></span>
                        <span>URL Available</span>
                      </div>
                    </div>

                    <div className="flex items-center rounded-xl bg-[#FFFDF9] border border-[#C5A059]/30 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-[#C5A059]">
                      <span className="px-4 py-3 bg-[#E5E2DD]/40 text-[#756D67] text-xs select-none hidden sm:inline-block border-r border-[#C5A059]/20 font-medium">
                        makemymarriage.com/
                      </span>
                      <input
                        id="urlSlug"
                        type="text"
                        value={urlSlug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        placeholder="your-custom-slug"
                        className="flex-1 px-4 py-3 bg-transparent text-[#1E1A18] text-sm focus:outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleCopyUrl}
                        className="px-3.5 py-2 mr-2 rounded-lg bg-[#F1EBE0] hover:bg-[#C5A059]/20 text-[#756D67] hover:text-[#1E1A18] transition-colors text-xs font-semibold flex items-center gap-1"
                        title="Copy vanity link"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {copySuccess ? 'done' : 'content_copy'}
                        </span>
                        <span className="hidden sm:inline">{copySuccess ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>

                    {errors.urlSlug && <span className="text-xs text-red-600">{errors.urlSlug}</span>}

                    <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-[#FFFDF9] border border-[#C5A059]/20 text-xs">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="material-symbols-outlined text-[#B38E46] text-[16px] shrink-0">public</span>
                        <span className="truncate font-mono text-[#756D67]">
                          https://makemymarriage.com/
                          <strong className="text-[#4A121A] font-bold">{urlSlug || 'custom-address'}</strong>
                        </span>
                      </div>
                      <span className="uppercase text-[10px] tracking-wider text-[#756D67] font-semibold shrink-0 ml-2">
                        SSL Encrypted
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: COUPLE DOSSIER */}
              {currentStep === 2 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1 text-[#C5A059]">
                      <span className="material-symbols-outlined text-[20px]">favorite</span>
                      <h2 className="font-serif text-2xl text-[#1E1A18] font-medium">Couple Identity & Dossier</h2>
                    </div>
                    <p className="text-sm text-[#756D67]">
                      Curate personal profiles, contact channels, and the romantic narrative for both partners.
                    </p>
                  </div>

                  {/* Partner 1 Details */}
                  <div className="p-5 rounded-2xl bg-[#F7F3EB] border border-[#C5A059]/20 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider font-bold text-[#4A121A]">
                        Partner 1 — {partnerOne || 'Partner 1'}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider bg-[#FFFDF9] px-2 py-0.5 rounded border border-[#C5A059]/30 text-[#B38E46] font-semibold">
                        Primary Contact
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="partnerOneRole" className="text-xs font-semibold text-[#1E1A18]">Role / Title in Wedding</label>
                        <input
                          id="partnerOneRole"
                          type="text"
                          value={partnerOneRole}
                          onChange={(e) => setPartnerOneRole(e.target.value)}
                          placeholder="e.g. The Bride"
                          className="px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] text-sm border border-[#C5A059]/20 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="partnerOneEmail" className="text-xs font-semibold text-[#1E1A18]">
                          Contact Email <span className="text-[#581825]">*</span>
                        </label>
                        <input
                          id="partnerOneEmail"
                          type="email"
                          value={partnerOneEmail}
                          onChange={(e) => setPartnerOneEmail(e.target.value)}
                          placeholder="sarah@luxurymatrimony.com"
                          className="px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] text-sm border border-[#C5A059]/20 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                        />
                        {errors.partnerOneEmail && <span className="text-xs text-red-600">{errors.partnerOneEmail}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="partnerOneBio" className="text-xs font-semibold text-[#1E1A18]">Personal Biography or Excerpt</label>
                      <textarea
                        id="partnerOneBio"
                        rows={2}
                        value={partnerOneBio}
                        onChange={(e) => setPartnerOneBio(e.target.value)}
                        placeholder="Architect with an eye for romantic villas..."
                        className="px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] text-sm border border-[#C5A059]/20 focus:outline-none focus:ring-2 focus:ring-[#C5A059] resize-none"
                      />
                    </div>
                  </div>

                  {/* Partner 2 Details */}
                  <div className="p-5 rounded-2xl bg-[#F7F3EB] border border-[#C5A059]/20 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider font-bold text-[#4A121A]">
                        Partner 2 — {partnerTwo || 'Partner 2'}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider bg-[#FFFDF9] px-2 py-0.5 rounded border border-[#C5A059]/30 text-[#B38E46] font-semibold">
                        Co-Curator
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="partnerTwoRole" className="text-xs font-semibold text-[#1E1A18]">Role / Title in Wedding</label>
                        <input
                          id="partnerTwoRole"
                          type="text"
                          value={partnerTwoRole}
                          onChange={(e) => setPartnerTwoRole(e.target.value)}
                          placeholder="e.g. The Groom"
                          className="px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] text-sm border border-[#C5A059]/20 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="partnerTwoEmail" className="text-xs font-semibold text-[#1E1A18]">
                          Contact Email <span className="text-[#581825]">*</span>
                        </label>
                        <input
                          id="partnerTwoEmail"
                          type="email"
                          value={partnerTwoEmail}
                          onChange={(e) => setPartnerTwoEmail(e.target.value)}
                          placeholder="julian@atelierprive.com"
                          className="px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] text-sm border border-[#C5A059]/20 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                        />
                        {errors.partnerTwoEmail && <span className="text-xs text-red-600">{errors.partnerTwoEmail}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="partnerTwoBio" className="text-xs font-semibold text-[#1E1A18]">Personal Biography or Excerpt</label>
                      <textarea
                        id="partnerTwoBio"
                        rows={2}
                        value={partnerTwoBio}
                        onChange={(e) => setPartnerTwoBio(e.target.value)}
                        placeholder="Classical pianist and connoisseur..."
                        className="px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] text-sm border border-[#C5A059]/20 focus:outline-none focus:ring-2 focus:ring-[#C5A059] resize-none"
                      />
                    </div>
                  </div>

                  {/* How We Met Story */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="howWeMet" className="text-xs uppercase tracking-wider font-bold text-[#1E1A18]">
                      Our Journey & How We Met
                    </label>
                    <textarea
                      id="howWeMet"
                      rows={3}
                      value={howWeMet}
                      onChange={(e) => setHowWeMet(e.target.value)}
                      placeholder="Tell guests the captivating story of how you crossed paths..."
                      className="w-full px-4 py-3 rounded-xl bg-[#F7F3EB] text-[#1E1A18] text-sm focus:bg-[#FFFDF9] focus:outline-none focus:ring-2 focus:ring-[#C5A059] border border-[#C5A059]/20 resize-none"
                    />
                    <span className="text-xs text-[#756D67]">
                      This narrative is highlighted on your public guest website under the &quot;Our Romance&quot; tab.
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 3: SOIRÉE EVENTS */}
              {currentStep === 3 && (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1 text-[#C5A059]">
                        <span className="material-symbols-outlined text-[20px]">celebration</span>
                        <h2 className="font-serif text-2xl text-[#1E1A18] font-medium">Soirée Events & Schedule</h2>
                      </div>
                      <p className="text-sm text-[#756D67]">
                        Define sub-events across your multi-day celebration (Ceremony, Reception, Soirée).
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAddEventModal(true)}
                      className="px-4 py-2 rounded-full bg-[#4A121A] text-[#FFFDF9] hover:bg-[#360B12] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      <span>Add Sub-Event</span>
                    </button>
                  </div>

                  {errors.events && <span className="text-xs text-red-600">{errors.events}</span>}

                  {/* List of Events */}
                  <div className="flex flex-col gap-3">
                    {events.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-[#F7F3EB] border border-dashed border-[#C5A059]/40 flex flex-col items-center justify-center text-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-[#FFFDF9] border border-[#C5A059]/30 flex items-center justify-center text-[#4A121A] mb-1 shadow-xs">
                          <span className="material-symbols-outlined text-[24px]">celebration</span>
                        </div>
                        <h4 className="font-serif font-bold text-base text-[#1E1A18]">No Soirée Events Added Yet</h4>
                        <p className="text-xs text-[#756D67] max-w-sm">
                          Craft your multi-day celebration itinerary by adding ceremony, reception, welcome cocktails, or recovery brunch events.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowAddEventModal(true)}
                          className="mt-2 px-5 py-2.5 rounded-full bg-[#4A121A] text-[#FFFDF9] hover:bg-[#360B12] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <span className="material-symbols-outlined text-[16px]">add</span>
                          <span>Add Celebration Event</span>
                        </button>
                      </div>
                    ) : (
                      events.map((ev, idx) => (
                        <div
                          key={ev.id}
                          className="p-4 rounded-xl bg-[#F7F3EB] border border-[#C5A059]/25 hover:border-[#C5A059]/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#FFFDF9] border border-[#C5A059]/30 flex items-center justify-center text-xs font-bold text-[#4A121A] shrink-0 mt-0.5">
                              0{idx + 1}
                            </div>
                            <div className="flex flex-col">
                              <h4 className="font-serif font-bold text-sm text-[#1E1A18]">{ev.title}</h4>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#756D67] mt-1">
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px] text-[#B38E46]">calendar_month</span>
                                  {ev.date}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px] text-[#B38E46]">schedule</span>
                                  {ev.startTime} – {ev.endTime}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px] text-[#B38E46]">pin_drop</span>
                                  {ev.location}
                                </span>
                              </div>
                              <span className="text-[11px] text-[#745b1a] mt-1 font-medium">
                                Dress Code: {ev.dressCode}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                setEvents((prev) =>
                                  prev.map((e) => (e.id === ev.id ? { ...e, isPublic: !e.isPublic } : e))
                                )
                              }
                              className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border transition-colors ${
                                ev.isPublic
                                  ? 'bg-[#FFFDF9] text-[#745b1a] border-[#C5A059]/40'
                                  : 'bg-[#E5E2DD] text-[#756D67] border-transparent'
                              }`}
                            >
                              {ev.isPublic ? 'Public on Site' : 'VIP Private'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveEvent(ev.id)}
                              aria-label={`Remove event: ${ev.title}`}
                              className="w-7 h-7 rounded-full bg-[#FFFDF9] hover:bg-red-50 text-stone-muted hover:text-red-700 border border-[#C5A059]/20 flex items-center justify-center transition-colors"
                              title="Remove Event"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Event Inline Modal / Form */}
                  {showAddEventModal && (
                    <form
                      onSubmit={handleAddEvent}
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="modal-add-event-title"
                      className="p-5 rounded-2xl bg-[#FFFDF9] border-2 border-[#C5A059] shadow-md flex flex-col gap-4 animate-fade-in"
                    >
                      <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-2">
                        <span id="modal-add-event-title" className="text-xs uppercase font-bold text-[#4A121A] tracking-wider">
                          New Sub-Event Specification
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAddEventModal(false)}
                          aria-label="Close sub-event modal"
                          className="text-stone-muted hover:text-[#1E1A18]"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label htmlFor="newEventTitle" className="text-xs font-semibold text-[#1E1A18]">Event Name *</label>
                          <input
                            id="newEventTitle"
                            type="text"
                            required
                            value={newEventTitle}
                            onChange={(e) => setNewEventTitle(e.target.value)}
                            placeholder="e.g. Sangeet Celebration"
                            className="px-3 py-2 rounded-lg bg-[#F7F3EB] text-sm border border-[#C5A059]/20 focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label htmlFor="newEventDate" className="text-xs font-semibold text-[#1E1A18]">Date *</label>
                          <input
                            id="newEventDate"
                            type="date"
                            value={newEventDate}
                            onChange={(e) => setNewEventDate(e.target.value)}
                            className="px-3 py-2 rounded-lg bg-[#F7F3EB] text-sm border border-[#C5A059]/20 focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label htmlFor="newEventStart" className="text-xs font-semibold text-[#1E1A18]">Start Time</label>
                          <input
                            id="newEventStart"
                            type="time"
                            value={newEventStart}
                            onChange={(e) => setNewEventStart(e.target.value)}
                            className="px-3 py-2 rounded-lg bg-[#F7F3EB] text-sm border border-[#C5A059]/20"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label htmlFor="newEventEnd" className="text-xs font-semibold text-[#1E1A18]">End Time</label>
                          <input
                            id="newEventEnd"
                            type="time"
                            value={newEventEnd}
                            onChange={(e) => setNewEventEnd(e.target.value)}
                            className="px-3 py-2 rounded-lg bg-[#F7F3EB] text-sm border border-[#C5A059]/20"
                          />
                        </div>

                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label htmlFor="newEventLocation" className="text-xs font-semibold text-[#1E1A18]">Location / Hall</label>
                          <input
                            id="newEventLocation"
                            type="text"
                            value={newEventLocation}
                            onChange={(e) => setNewEventLocation(e.target.value)}
                            placeholder="e.g. Villa Cipressi Ballroom"
                            className="px-3 py-2 rounded-lg bg-[#F7F3EB] text-sm border border-[#C5A059]/20"
                          />
                        </div>

                        <div className="flex flex-col gap-1 sm:col-span-2">
                          <label htmlFor="newEventDressCode" className="text-xs font-semibold text-[#1E1A18]">Dress Code Note</label>
                          <input
                            id="newEventDressCode"
                            type="text"
                            value={newEventDressCode}
                            onChange={(e) => setNewEventDressCode(e.target.value)}
                            placeholder="e.g. Traditional Festive or Black Tie"
                            className="px-3 py-2 rounded-lg bg-[#F7F3EB] text-sm border border-[#C5A059]/20"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-[#C5A059]/20">
                        <button
                          type="button"
                          onClick={() => setShowAddEventModal(false)}
                          className="px-4 py-2 rounded-full bg-[#F7F3EB] text-xs font-semibold text-[#756D67] hover:text-[#1E1A18]"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-full bg-[#4A121A] text-[#FFFDF9] text-xs font-semibold uppercase tracking-wider hover:bg-[#360B12]"
                        >
                          Confirm & Add Event
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* STEP 4: VILLA & MAP */}
              {currentStep === 4 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1 text-[#C5A059]">
                      <span className="material-symbols-outlined text-[20px]">villa</span>
                      <h2 className="font-serif text-2xl text-[#1E1A18] font-medium">Villa, Venue & Coordinates</h2>
                    </div>
                    <p className="text-sm text-[#756D67]">
                      Specify the primary destination venue, travel coordinates, and guest arrival instructions.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label htmlFor="venueName" className="text-xs uppercase tracking-wider font-bold text-[#1E1A18]">
                        Venue / Estate Name <span className="text-[#581825]">*</span>
                      </label>
                      <input
                        id="venueName"
                        type="text"
                        value={venueName}
                        onChange={(e) => setVenueName(e.target.value)}
                        placeholder="Villa Balbianello"
                        className={`w-full px-4 py-3 rounded-xl bg-[#F7F3EB] text-sm border ${
                          errors.venueName ? 'border-red-400' : 'border-[#C5A059]/20'
                        } focus:outline-none focus:ring-2 focus:ring-[#C5A059]`}
                      />
                      {errors.venueName && <span className="text-xs text-red-600">{errors.venueName}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="venueAddress" className="text-xs uppercase tracking-wider font-bold text-[#1E1A18]">Street Address</label>
                      <input
                        id="venueAddress"
                        type="text"
                        value={venueAddress}
                        onChange={(e) => setVenueAddress(e.target.value)}
                        placeholder="Via Guido Monzino, 1"
                        className="px-4 py-3 rounded-xl bg-[#F7F3EB] text-sm border border-[#C5A059]/20 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="venueCity" className="text-xs uppercase tracking-wider font-bold text-[#1E1A18]">
                        City / Region <span className="text-[#581825]">*</span>
                      </label>
                      <input
                        id="venueCity"
                        type="text"
                        value={venueCity}
                        onChange={(e) => setVenueCity(e.target.value)}
                        placeholder="Lenno, Lake Como"
                        className={`px-4 py-3 rounded-xl bg-[#F7F3EB] text-sm border ${
                          errors.venueCity ? 'border-red-400' : 'border-[#C5A059]/20'
                        } focus:outline-none focus:ring-2 focus:ring-[#C5A059]`}
                      />
                      {errors.venueCity && <span className="text-xs text-red-600">{errors.venueCity}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="venueCountry" className="text-xs uppercase tracking-wider font-bold text-[#1E1A18]">Country</label>
                      <input
                        id="venueCountry"
                        type="text"
                        value={venueCountry}
                        onChange={(e) => setVenueCountry(e.target.value)}
                        placeholder="Italy"
                        className="px-4 py-3 rounded-xl bg-[#F7F3EB] text-sm border border-[#C5A059]/20 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="timezone" className="text-xs uppercase tracking-wider font-bold text-[#1E1A18]">Timezone</label>
                      <input
                        id="timezone"
                        type="text"
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        placeholder="Europe/Rome (CET)"
                        className="px-4 py-3 rounded-xl bg-[#F7F3EB] text-sm border border-[#C5A059]/20 focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label htmlFor="coordinates" className="text-xs uppercase tracking-wider font-bold text-[#1E1A18]">GPS Coordinates</label>
                      <input
                        id="coordinates"
                        type="text"
                        value={coordinates}
                        onChange={(e) => setCoordinates(e.target.value)}
                        placeholder="45.9658° N, 9.2023° E"
                        className="px-4 py-3 rounded-xl bg-[#F7F3EB] text-sm border border-[#C5A059]/20 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="transportNotes" className="text-xs uppercase tracking-wider font-bold text-[#1E1A18]">
                      Guest Arrival & Transportation Logistics
                    </label>
                    <textarea
                      id="transportNotes"
                      rows={2}
                      value={transportNotes}
                      onChange={(e) => setTransportNotes(e.target.value)}
                      placeholder="e.g. Private water taxi transfers departing from Menaggio docks..."
                      className="px-4 py-3 rounded-xl bg-[#F7F3EB] text-sm border border-[#C5A059]/20 resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="accommodationNotes" className="text-xs uppercase tracking-wider font-bold text-[#1E1A18]">
                      Accommodation & Hotel Block Notes
                    </label>
                    <textarea
                      id="accommodationNotes"
                      rows={2}
                      value={accommodationNotes}
                      onChange={(e) => setAccommodationNotes(e.target.value)}
                      placeholder="e.g. Reserved guest rooms at Grand Hotel Tremezzo..."
                      className="px-4 py-3 rounded-xl bg-[#F7F3EB] text-sm border border-[#C5A059]/20 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 5: REVIEW & PUBLISH */}
              {currentStep === 5 && (
                <div className="flex flex-col gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1 text-[#C5A059]">
                      <span className="material-symbols-outlined text-[20px]">fact_check</span>
                      <h2 className="font-serif text-2xl text-[#1E1A18] font-medium">Review & Launch Wedding</h2>
                    </div>
                    <p className="text-sm text-[#756D67]">
                      Carefully verify your celebratory dossier. Once published, your bespoke website URL will become
                      active for guests.
                    </p>
                  </div>

                  {/* Summary Review Cards */}
                  <div className="flex flex-col gap-4">
                    {/* Step 1 Summary */}
                    <div className="p-4 rounded-xl bg-[#F7F3EB] border border-[#C5A059]/20 flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="font-bold uppercase tracking-wider text-[#4A121A]">1. Celebration Details</span>
                        <span className="text-sm font-serif font-bold text-[#1E1A18]">{siteTitle || 'Untitled Celebration'}</span>
                        <span className="text-[#756D67]">
                          Couple: {partnerOne || 'Partner 1'} & {partnerTwo || 'Partner 2'}
                        </span>
                        <span className="text-[#756D67]">
                          Date: {weddingDate || 'Not specified'} {daysRemaining !== null ? `(${daysRemaining} days remaining)` : ''}
                        </span>
                        <span className="font-mono text-[#745b1a]">makemymarriage.com/{urlSlug || 'custom-address'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs uppercase tracking-wider font-semibold text-[#4A121A] hover:underline shrink-0"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Step 2 Summary */}
                    <div className="p-4 rounded-xl bg-[#F7F3EB] border border-[#C5A059]/20 flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="font-bold uppercase tracking-wider text-[#4A121A]">2. Couple Dossier</span>
                        <span className="text-[#1E1A18]">
                          {partnerOne || 'Partner 1'} ({partnerOneRole || 'Partner 1'}) • {partnerOneEmail || 'No email provided'}
                        </span>
                        <span className="text-[#1E1A18]">
                          {partnerTwo || 'Partner 2'} ({partnerTwoRole || 'Partner 2'}) • {partnerTwoEmail || 'No email provided'}
                        </span>
                        {howWeMet ? (
                          <p className="text-[#756D67] italic line-clamp-1 mt-1">&quot;{howWeMet}&quot;</p>
                        ) : (
                          <p className="text-[#756D67] italic line-clamp-1 mt-1">No meeting narrative provided.</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-xs uppercase tracking-wider font-semibold text-[#4A121A] hover:underline shrink-0"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Step 3 Summary */}
                    <div className="p-4 rounded-xl bg-[#F7F3EB] border border-[#C5A059]/20 flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="font-bold uppercase tracking-wider text-[#4A121A]">
                          3. Soirée Events ({events.length} Planned)
                        </span>
                        <div className="flex flex-col gap-1 mt-1">
                          {events.length === 0 ? (
                            <span className="text-[#756D67] italic">No events configured yet.</span>
                          ) : (
                            events.map((ev) => (
                              <div key={ev.id} className="text-[#1E1A18] flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]"></span>
                                <span className="font-semibold">{ev.title}</span>
                                <span className="text-[#756D67]">({ev.date} at {ev.startTime})</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="text-xs uppercase tracking-wider font-semibold text-[#4A121A] hover:underline shrink-0"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Step 4 Summary */}
                    <div className="p-4 rounded-xl bg-[#F7F3EB] border border-[#C5A059]/20 flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="font-bold uppercase tracking-wider text-[#4A121A]">4. Villa & Logistics</span>
                        <span className="font-serif font-bold text-sm text-[#1E1A18]">{venueName || 'Venue not specified'}</span>
                        <span className="text-[#756D67]">
                          {[venueAddress, venueCity, venueCountry].filter(Boolean).join(', ') || 'Address not specified'}
                        </span>
                        <span className="text-[#745b1a]">Timezone: {timezone || 'Not specified'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(4)}
                        className="text-xs uppercase tracking-wider font-semibold text-[#4A121A] hover:underline shrink-0"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Backend Integration Notice */}
                  <div className="p-4 rounded-xl bg-[#FFFDF9] border border-[#C5A059]/30 text-xs text-[#756D67] flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[#B38E46] text-[18px] shrink-0 mt-0.5">verified</span>
                    <div>
                      <span className="font-semibold text-[#1E1A18] block">Atelier Ready for Creation</span>
                      Submitting compiles your celebration parameters according to the specification schema. Live backend
                      persistence will automatically sync once the administrative endpoint is activated.
                    </div>
                  </div>
                </div>
              )}

              {/* Validation Error Banner */}
              {Object.keys(errors).length > 0 && (
                <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 animate-fade-in">
                  <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0">error</span>
                  <div>
                    <span className="font-bold block">Please complete the required details before continuing:</span>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      {Object.values(errors).map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Form Navigation Action Footer */}
              <div className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#C5A059]/20">
                <div className="flex items-center gap-2 text-[#756D67] text-xs">
                  <span className="material-symbols-outlined text-[#C5A059] text-[16px]">lock</span>
                  <span>Auto-saved {lastSavedTime} • 256-bit TLS encrypted</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="flex-1 sm:flex-initial px-5 py-3 rounded-full bg-[#F7F3EB] hover:bg-[#FFFDF9] text-[#1E1A18] text-xs font-semibold uppercase tracking-wider transition-all border border-[#C5A059]/20"
                    >
                      Back
                    </button>
                  )}

                  <button
                    id="saveDraftBtn"
                    type="button"
                    onClick={handleSaveDraft}
                    className="flex-1 sm:flex-initial px-5 py-3 rounded-full bg-[#F7F3EB] hover:bg-[#FFFDF9] text-[#1E1A18] text-xs font-semibold uppercase tracking-wider transition-all border border-[#C5A059]/20 flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">bookmark_border</span>
                    <span>Save Draft</span>
                  </button>

                  {currentStep < 5 ? (
                    <button
                      id="continueStepBtn"
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 sm:flex-initial px-7 py-3 rounded-full bg-[#4A121A] hover:bg-[#360B12] text-[#FFFDF9] text-xs font-semibold uppercase tracking-wider transition-all shadow-md shadow-[#4A121A]/20 flex items-center justify-center gap-1.5 group"
                    >
                      <span>Continue to {stepTitles[currentStep]?.title}</span>
                      <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
                        arrow_forward
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isPublishing}
                      onClick={handlePublish}
                      className="flex-1 sm:flex-initial px-8 py-3 rounded-full bg-[#4A121A] hover:bg-[#360B12] text-[#FFFDF9] text-xs font-semibold uppercase tracking-wider transition-all shadow-md shadow-[#4A121A]/25 flex items-center justify-center gap-2"
                    >
                      {isPublishing ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          <span>Publishing Atelier...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">publish</span>
                          <span>Publish Wedding Website</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* =======================================================================
              Right Column (5 Cols, Sticky): Live Companion Preview & Concierge Guide
             ======================================================================= */}
          <div className="lg:col-span-5 flex flex-col gap-6 sticky top-28">
            {/* Live Website Card Preview ("Guest View") */}
            <div className="rounded-2xl bg-[#FFFDF9] p-6 shadow-sm border border-[#C5A059]/25 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#C5A059]/20">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059] animate-pulse"></span>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-[#1E1A18]">
                    Live Website Card Preview
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#F7F3EB] text-[#756D67] text-[10px] uppercase font-bold tracking-widest border border-[#C5A059]/20">
                  Guest View
                </span>
              </div>

              {/* Invitation Hero Mockup Canvas */}
              <div className="rounded-xl overflow-hidden shadow-md bg-[#FAF7F2] border border-[#C5A059]/20 relative group">
                {/* Background Visual with Haute Matrimonial Photography */}
                <div className="h-64 sm:h-72 w-full relative overflow-hidden bg-[#221C1D]">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuARnpmGOcvBVswI2v1CTGArr3tsK6cxZxsBm3OuQV30lONaHL1z1z7s5U1fxCkoUf4T5TIb9d3yL_wH7MSfXwX36a7GSqE_SPROEsBlvnSBqwflLqDoVuvSxh75TWAE7_hly7tGozIRQt7CYPTSU3gkwFZen86t_PZJqRXpZSAHv8UqMVh6QtvWMjcRr-6NvxZVuMGsJfFWi5rPVjMe93XcsyecVrdJZ7zaaEwyYFo"
                    alt="Editorial luxury wedding couple at Lake Como"
                    fill
                    sizes="(max-width: 1024px) 100vw, 420px"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1E1A18]/90 via-[#1E1A18]/40 to-transparent"></div>

                  {/* Top Monogram Crest Pill */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#FFFDF9]/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-[#C5A059]/30">
                    <span className="font-serif italic font-bold text-[#4A121A] text-sm leading-none">
                      {monogram}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#C5A059]"></span>
                    <span className="text-[10px] uppercase tracking-wider text-[#756D67] font-semibold">
                      {venueCity ? venueCity.split(',')[0].trim() : 'Destination'}
                    </span>
                  </div>

                  {/* Floating Live Date Pill */}
                  <div className="absolute top-4 right-4 bg-[#4A121A]/85 text-[#FFFDF9] px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider backdrop-blur-sm border border-[#C5A059]/40">
                    {weddingDate || 'Date TBD'}
                  </div>

                  {/* Reactive Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-[#FFFDF9] flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-widest text-[#E5C378] font-bold">
                      {siteTitle || 'Bespoke Matrimonial Celebration'}
                    </span>
                    <h4 id="previewCoupleNames" className="font-serif text-xl sm:text-2xl text-[#FFFDF9] tracking-tight leading-snug drop-shadow-sm">
                      {partnerOne || 'Partner 1'} & {partnerTwo || 'Partner 2'}
                    </h4>
                    <p id="previewTagline" className="text-xs text-[#EFEAE0] line-clamp-2 mt-0.5 opacity-90">
                      {welcomeStory || 'We warmly invite our dearest family and lifelong friends to celebrate...'}
                    </p>
                  </div>
                </div>

                {/* Mock Guest View Footer Strip */}
                <div className="p-3.5 bg-[#FFFDF9] flex items-center justify-between text-[#1E1A18] border-t border-[#C5A059]/20">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-[#756D67] font-semibold">
                      RSVP Portal Status
                    </span>
                    <span className="text-xs text-[#745b1a] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#745b1a]"></span>
                      Ready to Publish
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#4A121A] text-[#FFFDF9] text-[10px] uppercase tracking-wider font-bold">
                    Enter Suite
                  </span>
                </div>
              </div>

              {/* Live Preview Responsive Attributes */}
              <div className="flex items-center justify-between text-[#756D67] text-xs px-1">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#C5A059]">devices</span>
                  Responsive on mobile, tablet & desktop
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#B38E46] font-bold">
                  Theme: Calico Gold
                </span>
              </div>
            </div>

            {/* Concierge Curatorship Tip Box */}
            <div className="rounded-2xl bg-[#F7F3EB] p-6 shadow-sm border border-[#C5A059]/20 flex flex-col gap-3 relative overflow-hidden">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#C5A059]/20 text-[#4A121A] flex items-center justify-center shrink-0 shadow-xs border border-[#C5A059]/30">
                  <span className="material-symbols-outlined text-[20px]">key</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#B38E46] uppercase tracking-widest font-bold">
                    Manager Tip • Atelier Curatorship
                  </span>
                  <h4 className="font-serif text-base text-[#1E1A18] font-medium mt-0.5">
                    Privacy & Secret Passcodes
                  </h4>
                </div>
              </div>

              <p className="text-xs text-[#756D67] leading-relaxed">
                You can calibrate privacy protocols, four-digit guest security tokens, and multi-lingual RSVP
                accommodations at any time via your Concierge Desk.
              </p>

              <div className="pt-1 flex items-center gap-2">
                <Link
                  href="#privacy"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#745b1a] hover:text-[#4A121A] transition-colors uppercase tracking-wider"
                >
                  <span>Explore Privacy Charter</span>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                </Link>
              </div>
            </div>

            {/* Direct Concierge Help Desk Callout */}
            <div className="rounded-2xl bg-[#FFFDF9] p-5 shadow-sm border border-[#C5A059]/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#C5A059]/30 flex items-center justify-center text-[#4A121A]">
                    <span className="material-symbols-outlined text-[20px]">support_agent</span>
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-2 ring-[#FFFDF9]"></span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#1E1A18]">Elena Rostova</span>
                  <span className="text-[11px] text-[#756D67]">Lead Matrimonial Concierge</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setConciergeNote('Elena Rostova is on standby for your atelier. Direct inquiries to concierge@makemymarriage.com or desk chat.');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-3.5 py-1.5 rounded-full bg-[#F1EBE0] hover:bg-[#C5A059]/20 text-[#1E1A18] text-[10px] uppercase tracking-wider font-bold transition-colors border border-[#C5A059]/20"
              >
                Ask Elena
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* =========================================================================
          Publication Success Modal
         ========================================================================= */}
      {publishSuccessModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-publish-success-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1A18]/60 backdrop-blur-sm p-4 animate-fade-in"
        >
          <div className="w-full max-w-lg rounded-3xl bg-[#FFFDF9] border-2 border-[#C5A059] p-8 shadow-2xl flex flex-col gap-5 text-center relative">
            <div className="w-16 h-16 rounded-full bg-[#FAF7F2] border-2 border-[#C5A059] flex items-center justify-center mx-auto text-[#4A121A] shadow-md">
              <span className="material-symbols-outlined text-3xl">celebration</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#B38E46]">
                Haute Atelier Matrimonial
              </span>
              <h3 id="modal-publish-success-title" className="font-serif text-2xl sm:text-3xl font-bold text-[#1E1A18] mt-1">
                Your Wedding Atelier is Created!
              </h3>
              <p className="text-xs sm:text-sm text-[#756D67] mt-2 leading-relaxed">
                <strong>{siteTitle}</strong> has been provisioned. Your bespoke URL slug is reserved and ready to be
                shared with guests.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F3EB] border border-[#C5A059]/20 text-xs font-mono text-[#4A121A] select-all break-all">
              https://makemymarriage.com/{urlSlug}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPublishSuccessModal(false)}
                className="flex-1 px-5 py-3 rounded-full bg-[#F7F3EB] hover:bg-[#FAF7F2] text-xs font-semibold uppercase tracking-wider border border-[#C5A059]/20"
              >
                Continue Editing
              </button>
              <Link
                href="/"
                className="flex-1 px-5 py-3 rounded-full bg-[#4A121A] hover:bg-[#360B12] text-[#FFFDF9] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1 shadow-md"
              >
                <span>Go to Portal</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          Atelier Footer
         ========================================================================= */}
      <footer className="w-full bg-[#F7F3EB] border-t border-[#C5A059]/20 py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#756D67]">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold italic text-sm text-[#1E1A18]">MMM</span>
            <span className="text-[#C5A059]">|</span>
            <span>© 2025 Make My Marriage — Haute Atelier Matrimonial. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-[10px] uppercase font-bold tracking-wider">
            <Link href="#concierge" className="hover:text-[#4A121A] transition-colors">
              Concierge Support
            </Link>
            <Link href="#guidelines" className="hover:text-[#4A121A] transition-colors">
              Atelier Guidelines
            </Link>
            <Link href="#privacy" className="hover:text-[#4A121A] transition-colors">
              Privacy Charter
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
