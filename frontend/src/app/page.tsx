'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  const [activeTab, setActiveTab] = React.useState('home');
  const [currentTheme, setCurrentTheme] = React.useState<'chateau' | 'amalfi' | 'blacktie'>('chateau');
  const [activeSubTab, setActiveSubTab] = React.useState<'story' | 'schedule' | 'travel' | 'registry'>('story');
  const [rsvpName, setRsvpName] = React.useState('Julian Montgomery');
  const [rsvpParty, setRsvpParty] = React.useState('2 Guests (Julian & Sophia)');
  const [rsvpSubmitted, setRsvpSubmitted] = React.useState(false);

  const themeData = {
    chateau: {
      bg: '#FAF7F2',
      url: 'sarah-and-james.makemymarriage.com',
      title: 'Sarah & James',
      subtitle: 'Celebrating in Provence, France',
      invitation: 'Together with our families, we invite you to celebrate our union.',
      venue: 'Château de Tourreau, Sarrians • Saturday, the twenty-fourth of October, two thousand twenty-five.',
      countdown: '148',
      defaultGuestName: 'Julian Montgomery',
      defaultGuestParty: '2 Guests (Julian & Sophia)'
    },
    amalfi: {
      bg: '#F7F3EB',
      url: 'camilla-and-lucas.makemymarriage.com',
      title: 'Camilla & Lucas',
      subtitle: 'Ravello • Cliffside Villa Cimbrone',
      invitation: 'With great joy, join us where the Mediterranean cliffs meet the sun.',
      venue: 'Villa Cimbrone Gardens, Amalfi Coast • Saturday, June 14, 2025 at sunset.',
      countdown: '76',
      defaultGuestName: 'Beatriz Cavalcanti',
      defaultGuestParty: '2 Guests (Beatriz & Marco)'
    },
    blacktie: {
      bg: '#FFFDF9',
      url: 'victoria-and-henry.makemymarriage.com',
      title: 'Victoria & Henry',
      subtitle: 'The Plaza Hotel, Fifth Avenue, New York',
      invitation: 'Request the honour of your presence at their black-tie matrimonial gala.',
      venue: 'Grand Ballroom, The Plaza New York • New Year’s Eve, thirty-first of December.',
      countdown: '215',
      defaultGuestName: 'Arthur Kensington',
      defaultGuestParty: '1 Guest (Arthur Kensington)'
    }
  };

  const subTabDetails = {
    story: { icon: 'auto_stories', text: 'Viewing Section: Our Romance & Proposal in Paris' },
    schedule: { icon: 'schedule', text: 'Viewing Section: Welcome Soirée, Vows & Recovery Brunch' },
    travel: { icon: 'hotel', text: 'Viewing Section: Reserved Chateau Suites & VIP Chauffeur' },
    registry: { icon: 'redeem', text: 'Viewing Section: Curated Venetian Crystal & Honeyfund' }
  };

  const handleThemeChange = (themeKey: 'chateau' | 'amalfi' | 'blacktie') => {
    setCurrentTheme(themeKey);
    setRsvpSubmitted(false);
    setRsvpName(themeData[themeKey].defaultGuestName);
    setRsvpParty(themeData[themeKey].defaultGuestParty);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setActiveTab(targetId);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const activeThemeInfo = themeData[currentTheme];
  const activeSubTabInfo = subTabDetails[activeSubTab];

  return (
    <div className="bg-ivory-base text-charcoal-ink font-body-md selection:bg-gold-champagne/30 selection:text-burgundy-velvet min-h-screen">
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#C5A059]/20 shadow-[0_2px_12px_rgba(30,26,24,0.03)]">
        <div className="h-20 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-space-sm cursor-pointer" onClick={(e) => handleNavClick(e as unknown as React.MouseEvent<HTMLAnchorElement>, 'home')}>
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#FFFDF9] via-[#FAF7F2] to-[#EFEAE0] ring-1 ring-[#C5A059]/60 shadow-[0_4px_16px_rgba(197,160,89,0.22)] flex items-center justify-center shrink-0 group transition-all duration-500 hover:scale-105 hover:shadow-[0_6px_20px_rgba(197,160,89,0.35)]">
              <svg className="w-9 h-9 text-[#B38E46] transition-transform duration-700 group-hover:rotate-6" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <defs>
                  <linearGradient id="crestGoldGrad" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#E5C378"></stop>
                    <stop offset="50%" stopColor="#C5A059"></stop>
                    <stop offset="100%" stopColor="#B38E46"></stop>
                  </linearGradient>
                </defs>
                <circle cx="24" cy="24" r="21.5" stroke="url(#crestGoldGrad)" strokeDasharray="2 1.5" strokeWidth="0.75" opacity="0.85"></circle>
                <circle cx="24" cy="24" r="19" stroke="url(#crestGoldGrad)" strokeWidth="1"></circle>
                <circle cx="24" cy="24" r="16.5" stroke="url(#crestGoldGrad)" strokeWidth="0.5" strokeOpacity="0.6"></circle>
                <path d="M24 6.5 L24.7 8.2 L26.4 8.9 L24.7 9.6 L24 11.3 L23.3 9.6 L21.6 8.9 L23.3 8.2 Z" fill="url(#crestGoldGrad)"></path>
                <path d="M11 25.5 C10.5 20.5 13 15 17 12 C16 14.5 16.5 17.5 18.5 19 C17 19.5 15.5 21 15 23 C14 22 13 22.5 12.5 24" stroke="url(#crestGoldGrad)" strokeLinecap="round" strokeWidth="0.8" fill="none"></path>
                <path d="M37 25.5 C37.5 20.5 35 15 31 12 C32 14.5 31.5 17.5 29.5 19 C31 19.5 32.5 21 33 23 C34 22 35 22.5 35.5 24" stroke="url(#crestGoldGrad)" strokeLinecap="round" strokeWidth="0.8" fill="none"></path>
                <path d="M14 34 C17 37 21 38.5 24 38.5 C27 38.5 31 37 34 34" stroke="url(#crestGoldGrad)" strokeLinecap="round" strokeWidth="0.9" fill="none"></path>
                <text x="24" y="29.5" textAnchor="middle" fontFamily="'Playfair Display', serif" fontSize="14" fontWeight="600" fontStyle="italic" fill="url(#crestGoldGrad)" stroke="none">M</text>
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-headline-sm text-headline-sm tracking-tight text-charcoal-ink font-serif leading-none">Make My Marriage</span>
              <span className="font-label-sm text-[9px] uppercase tracking-[0.25em] text-[#B38E46] font-semibold mt-1">Haute Atelier Matrimonial</span>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-space-lg" id="main-nav-bar" aria-label="Main Navigation">
            <a onClick={(e) => handleNavClick(e, "home")} className={"nav-tab-link group relative py-2 font-label-lg text-label-lg uppercase tracking-wider transition-colors duration-200 " + (activeTab === "home" ? "text-charcoal-ink font-semibold" : "text-stone-muted font-normal hover:text-charcoal-ink")} data-path="home" href="#home" aria-current={activeTab === "home" ? "page" : undefined}>
              <span className="relative z-10">Home</span>
              <span className={`nav-indicator absolute bottom-0 h-[2px] bg-gradient-to-r from-[#C5A059] via-[#E5C378] to-[#C5A059] rounded-full transition-all duration-300 ${activeTab === "home" ? "opacity-100 left-0 right-0" : "opacity-0 left-1/2 right-1/2"}`}></span>
            </a>
            <a onClick={(e) => handleNavClick(e, "features")} className={"nav-tab-link group relative py-2 font-label-lg text-label-lg uppercase tracking-wider transition-colors duration-200 " + (activeTab === "features" ? "text-charcoal-ink font-semibold" : "text-stone-muted font-normal hover:text-charcoal-ink")} data-path="features" href="#features" aria-current={activeTab === "features" ? "page" : undefined}>
              <span className="relative z-10">Features</span>
              <span className={`nav-indicator absolute bottom-0 h-[2px] bg-gradient-to-r from-[#C5A059] via-[#E5C378] to-[#C5A059] rounded-full transition-all duration-300 group-hover:left-2 group-hover:right-2 ${activeTab === "features" ? "opacity-100 left-0 right-0" : "opacity-0 left-1/2 right-1/2"}`}></span>
            </a>
            <a onClick={(e) => handleNavClick(e, "templates")} className={"nav-tab-link group relative py-2 font-label-lg text-label-lg uppercase tracking-wider transition-colors duration-200 " + (activeTab === "templates" ? "text-charcoal-ink font-semibold" : "text-stone-muted font-normal hover:text-charcoal-ink")} data-path="templates" href="#templates" aria-current={activeTab === "templates" ? "page" : undefined}>
              <span className="relative z-10">Templates</span>
              <span className={`nav-indicator absolute bottom-0 h-[2px] bg-gradient-to-r from-[#C5A059] via-[#E5C378] to-[#C5A059] rounded-full transition-all duration-300 group-hover:left-2 group-hover:right-2 ${activeTab === "templates" ? "opacity-100 left-0 right-0" : "opacity-0 left-1/2 right-1/2"}`}></span>
            </a>
            <a onClick={(e) => handleNavClick(e, "real-stories")} className={"nav-tab-link group relative py-2 font-label-lg text-label-lg uppercase tracking-wider transition-colors duration-200 " + (activeTab === "real-stories" ? "text-charcoal-ink font-semibold" : "text-stone-muted font-normal hover:text-charcoal-ink")} data-path="real-stories" href="#real-stories" aria-current={activeTab === "real-stories" ? "page" : undefined}>
              <span className="relative z-10">Real Stories</span>
              <span className={`nav-indicator absolute bottom-0 h-[2px] bg-gradient-to-r from-[#C5A059] via-[#E5C378] to-[#C5A059] rounded-full transition-all duration-300 group-hover:left-2 group-hover:right-2 ${activeTab === "real-stories" ? "opacity-100 left-0 right-0" : "opacity-0 left-1/2 right-1/2"}`}></span>
            </a>
          </nav>
          <div className="flex items-center gap-space-sm sm:gap-space-md">
            <Link className="font-label-lg text-label-lg uppercase tracking-wider text-stone-muted hover:text-charcoal-ink transition-colors px-2 py-1" data-path="login" href="/login">Login</Link>
            <Link className="hidden md:inline-flex font-label-lg text-label-lg uppercase tracking-wider text-brand-gold hover:text-brand-burgundy transition-colors font-medium px-2 py-1" data-path="signup" href="/signup">Sign Up</Link>
            <Link className="inline-flex items-center justify-center px-5 sm:px-6 py-2.5 rounded-full bg-burgundy-velvet text-[#FFFDF9] font-label-md text-label-md uppercase tracking-wider hover:bg-burgundy-hover transition-all duration-300 shadow-[0_4px_16px_rgba(74,18,26,0.25)] border border-[#C5A059]/30" data-path="get-started" href="/signup">Create Account</Link>
            <Link href="/login" className="w-8 h-8 rounded-full bg-burgundy-velvet ring-1 ring-[#C5A059]/40 flex items-center justify-center shadow-sm hover:scale-105 transition-transform" aria-label="Portal Account">
              <span className="material-symbols-outlined text-[#FAF7F2] text-[18px]">person</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full pt-20 bg-[#FAF7F2]">
        <div className="flex flex-col w-full">
          <section id="home" className="relative w-full overflow-hidden px-6 lg:px-12 pt-10 pb-24 md:pb-32 bg-[#FAF7F2]">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[720px] bg-[#C5A059]/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
            <div className="absolute top-1/3 -right-48 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#FFFDF9] border border-[#C5A059]/40 shadow-[0_2px_12px_rgba(197,160,89,0.12)] mb-8 transition-transform duration-300 hover:scale-[1.02]">
                <span className="material-symbols-outlined text-[14px] text-[#C5A059]">diamond</span>
                <span className="font-label-sm text-label-sm uppercase tracking-[0.18em] text-charcoal-ink font-semibold">The New Standard in Wedding Websites</span>
              </div>
              <h1 className="font-headline-lg md:font-display-lg text-headline-lg md:text-display-lg text-charcoal-ink max-w-4xl tracking-tight leading-[1.18] mb-6">
                Your Love Story, <span className="italic font-normal font-display-lg text-[#B38E46]">Beautifully</span> Shared
              </h1>
              <p className="font-body-lg text-body-lg text-stone-muted max-w-2xl leading-relaxed mb-10">
                Create a bespoke, couture wedding website that effortlessly informs your guests, gathers RSVPs, and curates moments—crafted with the timeless elegance your celebration deserves.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
                <Link className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-burgundy-velvet text-[#FFFDF9] font-label-lg text-label-lg uppercase tracking-wider hover:bg-burgundy-hover transition-all duration-300 shadow-[0_8px_24px_rgba(74,18,26,0.28)] border border-[#C5A059]/30" href="/signup">
                  <span>Get Started Complimentary</span>
                  <span className="material-symbols-outlined text-[18px] text-[#E5C378] transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
                </Link>
                <a className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-[#FFFDF9] text-charcoal-ink border border-[#C5A059]/50 font-label-lg text-label-lg uppercase tracking-wider hover:bg-[#F7F3EB] hover:text-burgundy-velvet transition-all duration-300 shadow-[0_2px_12px_rgba(30,26,24,0.04)]" href="#templates">
                  <span>Explore Live Demo</span>
                </a>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-16 text-stone-muted">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-[#EFEAE0] ring-2 ring-[#FAF7F2] flex items-center justify-center font-label-sm text-charcoal-ink font-bold shadow-sm">EA</div>
                  <div className="w-8 h-8 rounded-full bg-[#E5C378] ring-2 ring-[#FAF7F2] flex items-center justify-center font-label-sm text-charcoal-ink font-bold shadow-sm">SJ</div>
                  <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#C5A059] ring-2 ring-[#FAF7F2] flex items-center justify-center font-label-sm text-burgundy-velvet font-bold shadow-sm">MK</div>
                  <div className="w-8 h-8 rounded-full bg-[#E6E0D4] ring-2 ring-[#FAF7F2] flex items-center justify-center font-label-sm text-charcoal-ink font-bold shadow-sm">LV</div>
                </div>
                <div className="flex items-center gap-1 text-[#C5A059]">
                  <span className="material-symbols-outlined text-[16px] [font-variation-settings:'FILL'_1]">star</span>
                  <span className="material-symbols-outlined text-[16px] [font-variation-settings:'FILL'_1]">star</span>
                  <span className="material-symbols-outlined text-[16px] [font-variation-settings:'FILL'_1]">star</span>
                  <span className="material-symbols-outlined text-[16px] [font-variation-settings:'FILL'_1]">star</span>
                  <span className="material-symbols-outlined text-[16px] [font-variation-settings:'FILL'_1]">star</span>
                </div>
                <span className="font-body-sm text-body-sm text-stone-muted tracking-normal">
                  Trusted by over <strong className="text-charcoal-ink font-semibold">14,000</strong> discerning couples &amp; luxury planners worldwide
                </span>
              </div>
              <div className="relative w-full max-w-5xl mx-auto">
                <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-t-[140px] sm:rounded-t-[220px] rounded-b-2xl overflow-hidden shadow-[0_24px_60px_rgba(30,26,24,0.12)] ring-1 ring-[#C5A059]/30 bg-[#EFEAE0]">
                  <Image
                    className="object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
                    alt="Editorial wedding photograph of a joyous bride and groom laughing together outdoors on stone balustrade stairs in an Italian villa estate"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5YLWwsuj-Fk-zJ7qMDmX7H3xls7W3Jco9E_LETeFmmrvLEeItW8o2eeun-hU8oHjY3Oo8U6nRRZe79i4b-3ePD-M83_Vk8bbeAHiJbOMaD9vw2cZAWHOuGPGSn5c09Ga2iUkGqKtr-S9JlAsGKc0lQ-_j2_K09p-Qtp9-Ds0hI9uDuuvRkOwoTDEEQjwcTt3YUKGotH0wPvQdwzgSVuZ64Q-o9650IMDYDKeuTpf102Zy6r2q1sH4"
                    fill
                    sizes="(max-width: 1280px) 100vw, 1200px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-ink/30 via-transparent to-transparent pointer-events-none"></div>
                </div>
                <div className="absolute -bottom-6 -left-3 sm:bottom-10 sm:-left-8 z-20 p-4 sm:p-5 rounded-2xl bg-[#FFFDF9]/95 backdrop-blur-md shadow-[0_16px_36px_rgba(30,26,24,0.1)] border border-[#C5A059]/30 max-w-[260px] sm:max-w-xs text-left animate-fade-in">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#C5A059]/50 flex items-center justify-center shrink-0 text-[#C5A059]">
                      <span className="material-symbols-outlined text-[18px]">location_on</span>
                    </div>
                    <div>
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-[#B38E46] block font-semibold">Celebration Locale</span>
                      <p className="font-headline-sm text-[16px] leading-tight text-charcoal-ink mt-0.5">Villa d&apos;Este, Lake Como</p>
                      <p className="font-body-sm text-body-sm text-stone-muted mt-1 flex items-center gap-1.5">
                        <span>October 24, 2025</span>
                        <span className="inline-block w-1 h-1 rounded-full bg-[#C5A059]"></span>
                        <span>4:30 PM CET</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-6 -right-3 sm:top-12 sm:-right-8 z-20 p-4 sm:p-5 rounded-2xl bg-[#FFFDF9]/95 backdrop-blur-md shadow-[0_16px_36px_rgba(30,26,24,0.1)] border border-[#C5A059]/30 max-w-[260px] sm:max-w-xs text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-burgundy-velvet/10 border border-burgundy-velvet/20 flex items-center justify-center shrink-0 text-burgundy-velvet">
                      <span className="material-symbols-outlined text-[18px] [font-variation-settings:'FILL'_1]">check_circle</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-label-sm text-label-sm uppercase tracking-wider text-burgundy-velvet font-semibold block">RSVP Confirmed</span>
                        <span className="font-label-sm text-[10px] text-stone-muted">Just now</span>
                      </div>
                      <p className="font-headline-sm text-[15px] leading-tight text-charcoal-ink mt-0.5">Julian &amp; Sophia +1</p>
                      <p className="font-body-sm text-body-sm text-stone-muted mt-1">
                        Selected: <span className="text-charcoal-ink font-medium">Truffle Risotto (Vegan)</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="w-full flex items-center justify-center py-4 bg-[#FAF7F2]">
            <div className="flex items-center gap-4 max-w-sm w-full px-6">
              <div className="h-px bg-[#C5A059]/30 flex-1"></div>
              <div className="w-7 h-7 rounded-full bg-[#F7F3EB] border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059] font-headline-sm text-[12px]">
                ✦
              </div>
              <div className="h-px bg-[#C5A059]/30 flex-1"></div>
            </div>
          </div>

          <section id="features" className="w-full px-6 lg:px-12 py-24 bg-[#F7F3EB] border-y border-[#C5A059]/20">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                <div>
                  <span className="font-label-md text-label-md uppercase tracking-[0.2em] text-[#B38E46] block mb-3 font-semibold">Atelier Standards</span>
                  <h2 className="font-headline-lg text-headline-lg text-charcoal-ink max-w-xl">
                    Bespoke Features Crafted for Discerning Celebrations
                  </h2>
                </div>
                <p className="font-body-md text-body-md text-stone-muted max-w-md">
                  Every detail engineered to blend the quiet luxury of bespoke couture paper with the effortless fluency of modern digital concierges.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="group p-8 rounded-2xl bg-[#FFFDF9] border border-[#C5A059]/25 shadow-[0_4px_20px_rgba(30,26,24,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(197,160,89,0.12)] hover:border-[#C5A059]/60 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#C5A059]/30 flex items-center justify-center text-[#B38E46] mb-6 group-hover:bg-burgundy-velvet group-hover:text-[#FFFDF9] group-hover:border-transparent transition-all duration-300 shadow-sm">
                      <span className="material-symbols-outlined text-[22px]">web_stories</span>
                    </div>
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#B38E46] block mb-2 font-semibold">01 / Couture Canvas</span>
                    <h3 className="font-headline-sm text-headline-sm text-charcoal-ink mb-3">Custom Wedding Website</h3>
                    <p className="font-body-sm text-body-sm text-stone-muted leading-relaxed">
                      Effortless drag-and-drop designer with custom typography pairings, monogram seal integration, and bespoke color curation tailored to your event palette.
                    </p>
                  </div>
                  <div className="pt-6 mt-6 flex items-center justify-between text-[#B38E46] group-hover:text-burgundy-velvet transition-colors border-t border-[#C5A059]/15">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Explore Studio</span>
                    <span className="material-symbols-outlined text-[16px] transition-transform duration-300 group-hover:translate-x-1">north_east</span>
                  </div>
                </div>

                <div className="group p-8 rounded-2xl bg-[#FFFDF9] border border-[#C5A059]/25 shadow-[0_4px_20px_rgba(30,26,24,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(197,160,89,0.12)] hover:border-[#C5A059]/60 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#C5A059]/30 flex items-center justify-center text-[#B38E46] mb-6 group-hover:bg-burgundy-velvet group-hover:text-[#FFFDF9] group-hover:border-transparent transition-all duration-300 shadow-sm">
                      <span className="material-symbols-outlined text-[22px]">mail</span>
                    </div>
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#B38E46] block mb-2 font-semibold">02 / Papeterie Digitale</span>
                    <h3 className="font-headline-sm text-headline-sm text-charcoal-ink mb-3">Digital Stationery Suites</h3>
                    <p className="font-body-sm text-body-sm text-stone-muted leading-relaxed">
                      Enchant guests with animated wax seals, hand-deckled paper edges, and gold foil typography dispatchable instantaneously via WhatsApp and encrypted email.
                    </p>
                  </div>
                  <div className="pt-6 mt-6 flex items-center justify-between text-[#B38E46] group-hover:text-burgundy-velvet transition-colors border-t border-[#C5A059]/15">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">View Suites</span>
                    <span className="material-symbols-outlined text-[16px] transition-transform duration-300 group-hover:translate-x-1">north_east</span>
                  </div>
                </div>

                <div className="group p-8 rounded-2xl bg-[#FFFDF9] border border-[#C5A059]/25 shadow-[0_4px_20px_rgba(30,26,24,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(197,160,89,0.12)] hover:border-[#C5A059]/60 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#C5A059]/30 flex items-center justify-center text-[#B38E46] mb-6 group-hover:bg-burgundy-velvet group-hover:text-[#FFFDF9] group-hover:border-transparent transition-all duration-300 shadow-sm">
                      <span className="material-symbols-outlined text-[22px]">how_to_reg</span>
                    </div>
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#B38E46] block mb-2 font-semibold">03 / Concierge Intake</span>
                    <h3 className="font-headline-sm text-headline-sm text-charcoal-ink mb-3">Intelligent Guest RSVP</h3>
                    <p className="font-body-sm text-body-sm text-stone-muted leading-relaxed">
                      Seamless dietary preference collection, bespoke plus-one allocations, song request curation, and automated reminders handled with subtle etiquette.
                    </p>
                  </div>
                  <div className="pt-6 mt-6 flex items-center justify-between text-[#B38E46] group-hover:text-burgundy-velvet transition-colors border-t border-[#C5A059]/15">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Guest Management</span>
                    <span className="material-symbols-outlined text-[16px] transition-transform duration-300 group-hover:translate-x-1">north_east</span>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl md:col-span-2 lg:col-span-2 min-h-[300px] shadow-[0_8px_24px_rgba(30,26,24,0.06)] border border-[#C5A059]/30 group">
                  <Image
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    alt="Overhead flat lay of luxury artisanal wedding invitation suite on travertine stone slab, handcrafted torn-edge deckled paper, dusty rose velvet ribbon, antique brass spoon, gold foil calligraphy"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQju7IWelA3KV2cvaf-CYj920rBwD0zFVaiVSPKFb6eZKrfyyptnZjpNeHV2u-DsX6dFHks0fX3mkT_SydwRhbKaRq_4JEKsSVyxAdgFwTQ9OvOrsi2EuLn5aGNuWEZa4jrJmqfIneIUREeR56ZRLmQvunVlNP5hDAi13sqKc8CI1lgsa1TRy2cEXizEptL8QaL_rgM3PoFKs4K51vvxjVwOkWUzDl0pnauuz_W3LY3ZTiq4Sm7-y6"
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-ink/90 via-charcoal-ink/40 to-transparent flex flex-col justify-end p-8 text-[#FAF7F2]">
                    <span className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-[#E5C378] block mb-2 font-semibold">Tactile Meets Digital</span>
                    <h4 className="font-headline-sm text-headline-sm text-[#FAF7F2] mb-2">Cohesive Aesthetic Continuity</h4>
                    <p className="font-body-sm text-body-sm text-[#EFEAE0] max-w-lg">
                      Match your printed calligraphy save-the-dates directly with your digital guest hub for an indelible initial presentation.
                    </p>
                  </div>
                </div>

                <div className="group p-8 rounded-2xl bg-[#FFFDF9] border border-[#C5A059]/25 shadow-[0_4px_20px_rgba(30,26,24,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(197,160,89,0.12)] hover:border-[#C5A059]/60 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#C5A059]/30 flex items-center justify-center text-[#B38E46] mb-6 group-hover:bg-burgundy-velvet group-hover:text-[#FFFDF9] group-hover:border-transparent transition-all duration-300 shadow-sm">
                      <span className="material-symbols-outlined text-[22px]">calendar_month</span>
                    </div>
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#B38E46] block mb-2 font-semibold">04 / Itinerary Suite</span>
                    <h3 className="font-headline-sm text-headline-sm text-charcoal-ink mb-3">Multi-Day Schedules</h3>
                    <p className="font-body-sm text-body-sm text-stone-muted leading-relaxed">
                      Interactive timeline mapping Welcome Aperitifs, Formal Rehearsals, Black-Tie Reception, and Sunday Recovery Brunch with instant one-tap Apple &amp; Google Calendar sync.
                    </p>
                  </div>
                  <div className="pt-6 mt-6 flex items-center justify-between text-[#B38E46] group-hover:text-burgundy-velvet transition-colors border-t border-[#C5A059]/15">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Timeline Engine</span>
                    <span className="material-symbols-outlined text-[16px] transition-transform duration-300 group-hover:translate-x-1">north_east</span>
                  </div>
                </div>

                <div className="group p-8 rounded-2xl bg-[#FFFDF9] border border-[#C5A059]/25 shadow-[0_4px_20px_rgba(30,26,24,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(197,160,89,0.12)] hover:border-[#C5A059]/60 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#C5A059]/30 flex items-center justify-center text-[#B38E46] mb-6 group-hover:bg-burgundy-velvet group-hover:text-[#FFFDF9] group-hover:border-transparent transition-all duration-300 shadow-sm">
                      <span className="material-symbols-outlined text-[22px]">qr_code_2</span>
                    </div>
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#B38E46] block mb-2 font-semibold">05 / Seamless Access</span>
                    <h3 className="font-headline-sm text-headline-sm text-charcoal-ink mb-3">Location &amp; Smart QR</h3>
                    <p className="font-body-sm text-body-sm text-stone-muted leading-relaxed">
                      Curated hotel room block portals, luxury travel concierge guides, and customized embossed QR codes printed on physical paper for direct guest check-in.
                    </p>
                  </div>
                  <div className="pt-6 mt-6 flex items-center justify-between text-[#B38E46] group-hover:text-burgundy-velvet transition-colors border-t border-[#C5A059]/15">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Access Guides</span>
                    <span className="material-symbols-outlined text-[16px] transition-transform duration-300 group-hover:translate-x-1">north_east</span>
                  </div>
                </div>

                <div className="group p-8 rounded-2xl bg-[#FFFDF9] border border-[#C5A059]/25 shadow-[0_4px_20px_rgba(30,26,24,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(197,160,89,0.12)] hover:border-[#C5A059]/60 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#C5A059]/30 flex items-center justify-center text-[#B38E46] mb-6 group-hover:bg-burgundy-velvet group-hover:text-[#FFFDF9] group-hover:border-transparent transition-all duration-300 shadow-sm">
                      <span className="material-symbols-outlined text-[22px]">photo_library</span>
                    </div>
                    <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#B38E46] block mb-2 font-semibold">06 / Living Archive</span>
                    <h3 className="font-headline-sm text-headline-sm text-charcoal-ink mb-3">Private Photo Vault</h3>
                    <p className="font-body-sm text-body-sm text-stone-muted leading-relaxed">
                      Live guest reception photo uploads with optional AI facial tagging, guestbook voice recordings, and unlimited full-resolution uncompressed master file archiving.
                    </p>
                  </div>
                  <div className="pt-6 mt-6 flex items-center justify-between text-[#B38E46] group-hover:text-burgundy-velvet transition-colors border-t border-[#C5A059]/15">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Vault Archive</span>
                    <span className="material-symbols-outlined text-[16px] transition-transform duration-300 group-hover:translate-x-1">north_east</span>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl md:col-span-2 lg:col-span-1 min-h-[300px] shadow-[0_8px_24px_rgba(30,26,24,0.06)] border border-[#C5A059]/30 group">
                  <Image
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    alt="Lavish candlelit wedding reception banquet table with crystal chandeliers overhead and floral centerpieces"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0wTh2gAjo4ELm_KBJuJNNuxTUWRXse0jAedltPKmzpEcHBOOvT_gOrdjqlrB-_EhdHzh24xFg2FgGQPZ0oXWZAfwEIuarXShYuPUN06onaXRjKJ1CElOpkTtDTgGAqqxTd-sS-MLF_OXo7lx8uOa0PVnh7fGawHpXgJECNH0AUkGNwzG9oF0u6C7moiw6jM93d-0fdnjuCyUw4aETarEW0KyU2811osohiKjYFsxZir82BZOt8ojU"
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-ink/90 via-charcoal-ink/40 to-transparent flex flex-col justify-end p-8 text-[#FAF7F2]">
                    <span className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-[#E5C378] block mb-2 font-semibold">The Moment</span>
                    <h4 className="font-headline-sm text-headline-sm text-[#FAF7F2] mb-1">Unfiltered Memories</h4>
                    <p className="font-body-sm text-body-sm text-[#EFEAE0]">
                      Capture every vantage point as your closest circle celebrates through the evening.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="w-full px-6 lg:px-12 py-24 md:py-32 bg-[#FAF7F2]" id="templates">
            <div className="max-w-6xl mx-auto flex flex-col items-center">
              <span className="font-label-md text-label-md uppercase tracking-[0.2em] text-[#B38E46] block mb-3 font-semibold">Flawless Presentation</span>
              <h2 className="font-headline-lg text-headline-lg text-charcoal-ink text-center mb-4">
                An Experience Your Guests Will Adore
              </h2>
              <p className="font-body-md text-body-md text-stone-muted text-center max-w-xl mb-10">
                Designed to feel like a bespoke digital invitation suite on every screen, tablet, and mobile device.
              </p>

              <div className="inline-flex p-1.5 rounded-full bg-[#EFEAE0] border border-[#C5A059]/30 mb-12 shadow-inner gap-1.5" role="tablist" aria-label="Wedding Theme Selection">
                <button
                  className={`theme-tab-btn relative px-6 py-2.5 rounded-full font-label-md text-label-md uppercase tracking-wider transition-all duration-300 font-semibold ${currentTheme === 'chateau' ? 'bg-burgundy-velvet text-[#FFFDF9] border border-[#C5A059]/40 shadow-[0_4px_16px_rgba(74,18,26,0.22)]' : 'bg-[#FAF7F2]/80 text-stone-muted border border-transparent hover:text-charcoal-ink hover:bg-[#FAF7F2]'}`}
                  id="tab-chateau"
                  type="button"
                  role="tab"
                  aria-selected={currentTheme === 'chateau'}
                  onClick={() => handleThemeChange('chateau')}
                >
                  Classic Chateau
                </button>
                <button
                  className={`theme-tab-btn relative px-6 py-2.5 rounded-full font-label-md text-label-md uppercase tracking-wider transition-all duration-300 font-semibold ${currentTheme === 'amalfi' ? 'bg-burgundy-velvet text-[#FFFDF9] border border-[#C5A059]/40 shadow-[0_4px_16px_rgba(74,18,26,0.22)]' : 'bg-[#FAF7F2]/80 text-stone-muted border border-transparent hover:text-charcoal-ink hover:bg-[#FAF7F2]'}`}
                  id="tab-amalfi"
                  type="button"
                  role="tab"
                  aria-selected={currentTheme === 'amalfi'}
                  onClick={() => handleThemeChange('amalfi')}
                >
                  Minimalist Amalfi
                </button>
                <button
                  className={`theme-tab-btn relative px-6 py-2.5 rounded-full font-label-md text-label-md uppercase tracking-wider transition-all duration-300 font-semibold ${currentTheme === 'blacktie' ? 'bg-burgundy-velvet text-[#FFFDF9] border border-[#C5A059]/40 shadow-[0_4px_16px_rgba(74,18,26,0.22)]' : 'bg-[#FAF7F2]/80 text-stone-muted border border-transparent hover:text-charcoal-ink hover:bg-[#FAF7F2]'}`}
                  id="tab-blacktie"
                  type="button"
                  role="tab"
                  aria-selected={currentTheme === 'blacktie'}
                  onClick={() => handleThemeChange('blacktie')}
                >
                  Contemporary Black-Tie
                </button>
              </div>

              <div className="w-full relative rounded-3xl bg-[#F7F3EB] border border-[#C5A059]/35 p-4 sm:p-8 shadow-[0_24px_70px_rgba(30,26,24,0.08)]">
                <div className="w-full bg-[#FFFDF9] rounded-t-2xl px-6 py-4 flex items-center justify-between border-b border-[#C5A059]/20">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#C5A059]/40 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-[#C5A059]/70 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-burgundy-velvet/40 inline-block"></span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF7F2] border border-[#C5A059]/30 text-charcoal-ink font-label-sm text-[11px] tracking-wide">
                    <span className="material-symbols-outlined text-[13px] text-[#C5A059]">lock</span>
                    <span className="font-mono transition-colors duration-300" id="mockup-url">{activeThemeInfo.url}</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-muted">
                    <button type="button" aria-label="Share template link" className="flex items-center justify-center p-1 rounded-full hover:text-charcoal-ink transition-colors">
                      <span className="material-symbols-outlined text-[18px]">share</span>
                    </button>
                    <button type="button" aria-label="Bookmark template" className="flex items-center justify-center p-1 rounded-full hover:text-charcoal-ink transition-colors">
                      <span className="material-symbols-outlined text-[18px]">bookmark</span>
                    </button>
                  </div>
                </div>

                <div className="w-full rounded-b-2xl p-6 sm:p-12 transition-all duration-500 text-charcoal-ink border-t-0" style={{ backgroundColor: activeThemeInfo.bg }} id="mockup-viewport">
                  <div className="flex flex-col sm:flex-row items-center justify-between pb-8 mb-8 border-b border-[#C5A059]/20 gap-4">
                    <div className="font-headline-sm text-headline-sm text-charcoal-ink font-serif tracking-wide transition-all duration-300" id="mockup-title">
                      {activeThemeInfo.title}
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 font-label-sm text-[11px] uppercase tracking-[0.16em]">
                      <button
                        className={`preview-sub-tab px-3 py-1 rounded-full transition-all duration-200 border-b-2 ${activeSubTab === 'story' ? 'text-charcoal-ink font-bold border-[#C5A059] bg-[#FFFDF9]/60' : 'text-stone-muted hover:text-charcoal-ink border-transparent'}`}
                        type="button"
                        onClick={() => setActiveSubTab('story')}
                      >
                        Our Story
                      </button>
                      <button
                        className={`preview-sub-tab px-3 py-1 rounded-full transition-all duration-200 border-b-2 ${activeSubTab === 'schedule' ? 'text-charcoal-ink font-bold border-[#C5A059] bg-[#FFFDF9]/60' : 'text-stone-muted hover:text-charcoal-ink border-transparent'}`}
                        type="button"
                        onClick={() => setActiveSubTab('schedule')}
                      >
                        Schedule
                      </button>
                      <button
                        className={`preview-sub-tab px-3 py-1 rounded-full transition-all duration-200 border-b-2 ${activeSubTab === 'travel' ? 'text-charcoal-ink font-bold border-[#C5A059] bg-[#FFFDF9]/60' : 'text-stone-muted hover:text-charcoal-ink border-transparent'}`}
                        type="button"
                        onClick={() => setActiveSubTab('travel')}
                      >
                        Travel &amp; Stay
                      </button>
                      <button
                        className={`preview-sub-tab px-3 py-1 rounded-full transition-all duration-200 border-b-2 ${activeSubTab === 'registry' ? 'text-charcoal-ink font-bold border-[#C5A059] bg-[#FFFDF9]/60' : 'text-stone-muted hover:text-charcoal-ink border-transparent'}`}
                        type="button"
                        onClick={() => setActiveSubTab('registry')}
                      >
                        Gift Registry
                      </button>
                      <button
                        className="px-3.5 py-1 rounded-full bg-burgundy-velvet text-[#FFFDF9] font-medium shadow-sm hover:bg-burgundy-hover transition-colors"
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('mockup-rsvp-input');
                          if (input) input.focus();
                        }}
                      >
                        RSVP
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10">
                    <div className="lg:col-span-7 space-y-4 text-left">
                      <span className="font-label-md text-label-md uppercase tracking-[0.25em] text-[#B38E46] font-semibold transition-all duration-300 block" id="mockup-subtitle">
                        {activeThemeInfo.subtitle}
                      </span>
                      <h3 className="font-headline-lg text-[32px] sm:text-headline-lg text-charcoal-ink leading-tight transition-all duration-300" id="mockup-invitation-text">
                        {activeThemeInfo.invitation}
                      </h3>
                      <p className="font-body-sm text-body-sm text-stone-muted max-w-md transition-all duration-300" id="mockup-venue-text">
                        {activeThemeInfo.venue}
                      </p>

                      <div className="p-3 rounded-xl bg-[#FFFDF9]/80 border border-[#C5A059]/20 text-stone-muted font-body-sm text-[12px] flex items-center gap-2 transition-all duration-300" id="mockup-tab-indicator">
                        <span className="material-symbols-outlined text-[15px] text-[#C5A059]" id="mockup-tab-indicator-icon">{activeSubTabInfo.icon}</span>
                        <span id="mockup-tab-indicator-text">{activeSubTabInfo.text}</span>
                      </div>

                      <div className="pt-2 flex items-center gap-4">
                        <div className="px-4 py-3 rounded-xl bg-[#FFFDF9] border border-[#C5A059]/30 shadow-sm text-center min-w-[70px]">
                          <span className="font-headline-sm text-charcoal-ink block leading-none" id="mockup-countdown-days">{activeThemeInfo.countdown}</span>
                          <span className="font-label-sm text-[10px] uppercase tracking-wider text-stone-muted mt-1 block">Days</span>
                        </div>
                        <div className="px-4 py-3 rounded-xl bg-[#FFFDF9] border border-[#C5A059]/30 shadow-sm text-center min-w-[70px]">
                          <span className="font-headline-sm text-charcoal-ink block leading-none">14</span>
                          <span className="font-label-sm text-[10px] uppercase tracking-wider text-stone-muted mt-1 block">Hours</span>
                        </div>
                        <div className="px-4 py-3 rounded-xl bg-[#FFFDF9] border border-[#C5A059]/30 shadow-sm text-center min-w-[70px]">
                          <span className="font-headline-sm text-charcoal-ink block leading-none">32</span>
                          <span className="font-label-sm text-[10px] uppercase tracking-wider text-stone-muted mt-1 block">Minutes</span>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-5 bg-[#FFFDF9] border border-[#C5A059]/30 rounded-2xl p-6 shadow-[0_8px_24px_rgba(30,26,24,0.04)] text-left">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-label-sm text-[11px] uppercase tracking-wider text-[#B38E46] font-semibold">Interactive RSVP Teaser</span>
                        <span className="inline-flex w-2 h-2 rounded-full bg-[#C5A059] animate-pulse"></span>
                      </div>
                      <h5 className="font-headline-sm text-[18px] text-charcoal-ink mb-3" id="mockup-rsvp-title">
                        {rsvpSubmitted ? "RSVP Received With Pleasure!" : "Will you join our celebration?"}
                      </h5>
                      {rsvpSubmitted ? (
                        <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#C5A059]/30 text-center space-y-2 mb-4 animate-fade-in">
                          <span className="material-symbols-outlined text-[28px] text-burgundy-velvet [font-variation-settings:'FILL'_1]">check_circle</span>
                          <p className="font-headline-sm text-[15px] text-charcoal-ink">Thank you, {rsvpName}!</p>
                          <p className="font-body-sm text-body-sm text-stone-muted">Your party of {rsvpParty} has been logged in the guestbook preview.</p>
                          <button
                            type="button"
                            onClick={() => setRsvpSubmitted(false)}
                            className="mt-2 inline-flex items-center text-[12px] font-label-sm uppercase tracking-wider text-[#B38E46] hover:text-burgundy-velvet font-semibold underline underline-offset-4"
                          >
                            Update response
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-3 mb-5">
                            <div>
                              <label htmlFor="mockup-rsvp-input" className="font-label-sm text-[11px] uppercase text-stone-muted block mb-1">Your Name</label>
                              <input
                                className="w-full px-3.5 py-2 text-sm rounded bg-[#FAF7F2] border border-[#C5A059]/20 text-charcoal-ink focus:outline-none focus:ring-1 focus:ring-[#C5A059] font-body-sm transition-all"
                                id="mockup-rsvp-input"
                                type="text"
                                value={rsvpName}
                                onChange={(e) => setRsvpName(e.target.value)}
                              />
                            </div>
                            <div>
                              <label htmlFor="mockup-rsvp-guest" className="font-label-sm text-[11px] uppercase text-stone-muted block mb-1">Party Size &amp; Guest</label>
                              <input
                                className="w-full px-3.5 py-2 text-sm rounded bg-[#FAF7F2] border border-[#C5A059]/20 text-charcoal-ink focus:outline-none focus:ring-1 focus:ring-[#C5A059] font-body-sm transition-all"
                                id="mockup-rsvp-guest"
                                type="text"
                                value={rsvpParty}
                                onChange={(e) => setRsvpParty(e.target.value)}
                              />
                            </div>
                          </div>
                          <button
                            className="w-full py-2.5 rounded-full bg-burgundy-velvet text-[#FFFDF9] font-label-md text-label-md uppercase tracking-wider hover:bg-burgundy-hover transition-colors shadow-sm"
                            id="mockup-rsvp-button"
                            type="button"
                            onClick={() => setRsvpSubmitted(true)}
                          >
                            Accept with Pleasure
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="real-stories" className="w-full px-6 lg:px-12 py-20 bg-[#F7F3EB] border-t border-[#C5A059]/20">
            <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#C5A059]/40 flex items-center justify-center text-[#B38E46] mb-6 shadow-sm">
                <span className="material-symbols-outlined text-[26px]">format_quote</span>
              </div>
              <blockquote className="font-headline-md md:font-headline-lg text-headline-md md:text-headline-lg text-charcoal-ink tracking-tight leading-snug mb-8">
                &ldquo;Make My Marriage felt like an extension of our Vogue-featured wedding. Our guests couldn&apos;t stop raving about how seamless and gorgeous the RSVP experience was.&rdquo;
              </blockquote>
              <div className="flex flex-col items-center">
                <span className="font-headline-sm text-headline-sm text-charcoal-ink">Elena &amp; Alexandre</span>
                <span className="font-label-sm text-label-sm uppercase tracking-[0.16em] text-[#B38E46] font-semibold mt-1">Villa Balbianello, Lake Como</span>
              </div>
            </div>
          </section>

          <section className="relative w-full px-6 lg:px-12 py-24 md:py-32 bg-burgundy-velvet text-[#FFFDF9] overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C5A059]/20 via-burgundy-accent to-burgundy-velvet pointer-events-none"></div>
            <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#D4AF37]/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-[#FFFDF9]/10 ring-1 ring-[#C5A059]/50 backdrop-blur-md flex items-center justify-center text-[#E5C378] text-headline-sm mb-6 border-0">
                ✦
              </div>
              <h2 className="font-headline-lg md:font-display-lg text-headline-lg md:text-display-lg text-[#FFFDF9] mb-6 max-w-3xl leading-[1.12]">
                Begin Crafting Your Forever Story Today
              </h2>
              <p className="font-body-lg text-body-lg text-[#FAF7F2]/80 max-w-xl mb-10 leading-relaxed">
                No coding or design skills required. Publish your bespoke, couture wedding experience in under 20 minutes.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
                <Link className="px-10 py-5 rounded-full bg-[#FAF7F2] text-burgundy-velvet font-label-lg text-label-lg uppercase tracking-wider hover:bg-[#FFFDF9] hover:text-burgundy-hover transition-all duration-300 shadow-[0_16px_36px_rgba(0,0,0,0.3)] border border-[#C5A059] flex items-center gap-3 font-semibold" href="/signup">
                  <span>Get Started for Free</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
              <div className="flex items-center gap-4 text-[#E5C378] font-label-sm text-label-sm uppercase tracking-widest">
                <span>No credit card required</span>
                <span>•</span>
                <span>Instant live preview</span>
                <span>•</span>
                <span>Complimentary concierge setup</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="w-full bg-[#F7F3EB] text-charcoal-ink border-t border-[#C5A059]/25">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-space-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-start">
            <div className="md:col-span-4 space-y-space-sm">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-full bg-[#FAF7F2] ring-1 ring-[#C5A059]/40 flex items-center justify-center text-charcoal-ink font-headline-sm text-headline-sm shadow-sm">M</div>
                <span className="font-headline-md text-headline-md text-charcoal-ink">Make My Marriage</span>
              </div>
              <p className="font-body-sm text-body-sm text-stone-muted max-w-sm">Curated bridal concierge, luxury matrimonial planning, and bespoke stationery suites crafted for monumental celebrations.</p>
            </div>
            <div className="md:col-span-2 space-y-space-xs">
              <span className="font-label-md text-label-md uppercase text-[#B38E46] tracking-widest block font-semibold">Navigation</span>
              <ul className="space-y-space-xs font-body-sm text-body-sm text-stone-muted">
                <li><a className="hover:text-charcoal-ink transition-colors" data-path="home" href="#home" onClick={(e) => handleNavClick(e, 'home')}>Home</a></li>
                <li><a className="hover:text-charcoal-ink transition-colors" data-path="features" href="#features" onClick={(e) => handleNavClick(e, 'features')}>Features</a></li>
                <li><a className="hover:text-charcoal-ink transition-colors" data-path="templates" href="#templates" onClick={(e) => handleNavClick(e, 'templates')}>Templates</a></li>
                <li><a className="hover:text-charcoal-ink transition-colors" data-path="real-stories" href="#real-stories" onClick={(e) => handleNavClick(e, 'real-stories')}>Real Stories</a></li>
              </ul>
            </div>
            <div className="md:col-span-3 space-y-space-xs">
              <span className="font-label-md text-label-md uppercase text-[#B38E46] tracking-widest block font-semibold">Atelier</span>
              <ul className="space-y-space-xs font-body-sm text-body-sm text-stone-muted">
                <li><a className="hover:text-charcoal-ink transition-colors" href="#features">Bespoke Concierge</a></li>
                <li><a className="hover:text-charcoal-ink transition-colors" href="#features">Couture Stationery</a></li>
                <li><a className="hover:text-charcoal-ink transition-colors" href="#features">Private Estate Discovery</a></li>
                <li><a className="hover:text-charcoal-ink transition-colors" href="#features">Artisan Registry</a></li>
              </ul>
            </div>
            <div className="md:col-span-3 space-y-space-sm">
              <span className="font-label-md text-label-md uppercase text-[#B38E46] tracking-widest block font-semibold">The Monogram Suite</span>
              <div className="p-space-md rounded bg-[#FFFDF9] border border-[#C5A059]/30 shadow-[0_2px_8px_rgba(30,26,24,0.03)]">
                <span className="font-headline-sm text-headline-sm text-charcoal-ink block">M · M</span>
                <span className="font-body-sm text-body-sm text-stone-muted block mt-1">Archival distinction for high-society matrimony.</span>
              </div>
            </div>
          </div>
          <div className="mt-space-xl pt-space-md border-t border-[#C5A059]/20 flex flex-col md:flex-row items-center justify-between gap-space-sm font-label-sm text-label-sm uppercase tracking-widest text-stone-muted">
            <span>© 2025 Make My Marriage Atelier. All rights reserved.</span>
            <div className="flex items-center gap-space-md">
              <a className="hover:text-charcoal-ink transition-colors" href="#">Privacy Policy</a>
              <a className="hover:text-charcoal-ink transition-colors" href="#">Terms of Service</a>
              <a className="hover:text-charcoal-ink transition-colors" href="#">Concierge Desk</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
