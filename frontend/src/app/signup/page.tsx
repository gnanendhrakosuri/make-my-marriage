'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/constants';

export default function SignUpPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<'couple' | 'planner'>('couple');
  const [fullName, setFullName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errorBannerVisible, setErrorBannerVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const handleAccountTypeSwitch = (type: 'couple' | 'planner') => {
    setAccountType(type);
    setErrorBannerVisible(false);
  };

  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      setErrorBannerVisible(true);
      return;
    }

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      setErrorBannerVisible(true);
      return;
    }

    const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);
    if (!password || password.length < 8 || !hasNumberOrSymbol) {
      setErrorMessage('Password must be at least 8 characters long and include numbers or symbols.');
      setErrorBannerVisible(true);
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Please agree to the Terms of Service & Atelier Privacy Policy.');
      setErrorBannerVisible(true);
      return;
    }

    setErrorBannerVisible(false);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          accountType,
          name: fullName.trim(),
          partnerName: partnerName.trim() || null,
          email: email.trim(),
          phone: phone.trim() || null,
          weddingDate: weddingDate || null,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.detail || 'An unexpected error occurred during account creation.');
        setErrorBannerVisible(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setSuccessMessage(true);
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch {
      setErrorMessage('Unable to connect to the authentication server. Please verify the backend service is running.');
      setErrorBannerVisible(true);
      setIsLoading(false);
    }
  };

  const fillDemoCouple = () => {
    setAccountType('couple');
    setFullName('Genevieve Laurent');
    setPartnerName('Henri de Montmirail');
    setEmail('genevieve@luxuryweddings.fr');
    setPhone('+33 6 42 18 90 22');
    setWeddingDate('2026-09-19');
    setPassword('CoutureCelebration2026!');
    setErrorBannerVisible(false);
  };

  return (
    <div className="portal-split-wrapper bg-brand-surface selection:bg-brand-goldLight selection:text-brand-burgundy overflow-x-hidden">
      
      {/* LEFT PANEL: Account Registration Experience */}
      <div className="portal-split-left flex flex-col justify-between p-6 sm:p-8 md:p-10 lg:p-14 xl:p-16 bg-brand-surface relative z-10 overflow-y-auto">
        
        {/* Top Bar: Logo & Navigation Backlink */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="inline-flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-full border border-brand-gold/40 flex items-center justify-center bg-white shadow-sm ring-4 ring-brand-gold/10 transition-transform group-hover:scale-105">
              <span className="font-serif-luxury text-base font-semibold text-brand-burgundy tracking-tight">MMM</span>
            </div>
            <div className="flex flex-col">
              <span className="font-cinzel text-sm sm:text-base tracking-[0.22em] text-brand-charcoal font-semibold uppercase leading-tight">
                Make My Marriage
              </span>
              <span className="text-[9px] uppercase tracking-[0.28em] text-brand-gold font-medium">
                Haute Atelier Matrimonial
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-brand-burgundy transition-colors py-1.5 px-3 rounded-full hover:bg-brand-surfaceAlt/60 border border-transparent hover:border-brand-borderGoldLight"
          >
            <svg className="w-3.5 h-3.5 text-stone-400 group-hover:text-brand-burgundy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium tracking-wide">Back to Platform</span>
          </Link>
        </div>

        {/* Main Sign Up Form Area */}
        <div className="max-w-[460px] w-full mx-auto my-auto py-2">
          
          {/* Header & Role Selector */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-surfaceAlt border border-brand-borderGold text-brand-burgundy text-[11px] font-medium tracking-wider uppercase mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-gold"></span>
              Begin Your Journey
            </div>
            <h1 className="font-serif-luxury text-3xl sm:text-4xl text-brand-charcoal font-normal tracking-tight leading-tight">
              Create Your <span className="italic font-serif text-brand-gold">Account</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-2 font-normal leading-relaxed">
              Join Make My Marriage to design a bespoke wedding website, orchestrate RSVPs, and curate eternal moments.
            </p>

            {/* Account Type Toggle Selector */}
            <div className="mt-5 p-1 bg-brand-surfaceAlt/80 border border-brand-borderGoldLight rounded-xl flex items-center gap-1 shadow-xs">
              <button
                type="button"
                onClick={() => handleAccountTypeSwitch('couple')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 ${
                  accountType === 'couple'
                    ? 'bg-white text-brand-burgundy shadow-xs border border-brand-borderGold/30'
                    : 'text-stone-500 hover:text-brand-charcoal'
                }`}
              >
                <svg className={`w-3.5 h-3.5 ${accountType === 'couple' ? 'text-brand-gold' : 'text-stone-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Marrying Couple
              </button>
              <button
                type="button"
                onClick={() => handleAccountTypeSwitch('planner')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 ${
                  accountType === 'planner'
                    ? 'bg-white text-brand-burgundy shadow-xs border border-brand-borderGold/30'
                    : 'text-stone-500 hover:text-brand-charcoal'
                }`}
              >
                <svg className={`w-3.5 h-3.5 ${accountType === 'planner' ? 'text-brand-gold' : 'text-stone-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Wedding Planner / Atelier
              </button>
            </div>
          </div>

          {/* Validation Alert Banner */}
          {errorBannerVisible && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#FDF2F2] border border-[#F5C2C7] flex items-start gap-3 text-left transition-all">
              <div className="w-5 h-5 rounded-full bg-[#E02424]/10 text-[#C81E1E] flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-[#9B1C1C]">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setErrorBannerVisible(false)}
                className="text-stone-400 hover:text-stone-600 text-sm leading-none"
              >
                ×
              </button>
            </div>
          )}

          {/* Success Notification Banner */}
          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-left transition-all">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-emerald-900">
                  Welcome to Make My Marriage Atelier! Your account has been created successfully. Redirecting to sign in...
                </p>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSignUp} className="space-y-4" noValidate>
            
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="fullNameInput" className="block text-xs font-semibold tracking-wide text-brand-charcoal uppercase mb-1.5">
                  {accountType === 'couple' ? 'Your Name' : 'Lead Planner'} <span className="text-brand-burgundy">*</span>
                </label>
                <div className="relative custom-ring rounded-xl border border-stone-200 bg-white transition-all">
                  <input
                    type="text"
                    id="fullNameInput"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={accountType === 'couple' ? 'e.g. Genevieve Laurent' : 'e.g. Marcus Vance'}
                    className="w-full px-3.5 py-2.5 bg-transparent text-sm text-brand-charcoal placeholder-stone-400 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="partnerNameInput" className="block text-xs font-semibold tracking-wide text-brand-charcoal uppercase mb-1.5">
                  {accountType === 'couple' ? 'Partner Name' : 'Agency Name'}
                </label>
                <div className="relative custom-ring rounded-xl border border-stone-200 bg-white transition-all">
                  <input
                    type="text"
                    id="partnerNameInput"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder={accountType === 'couple' ? 'e.g. Henri de Montmirail' : 'e.g. Vance Haute Weddings'}
                    className="w-full px-3.5 py-2.5 bg-transparent text-sm text-brand-charcoal placeholder-stone-400 rounded-xl focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="signupEmailInput" className="block text-xs font-semibold tracking-wide text-brand-charcoal uppercase mb-1.5">
                Email Address <span className="text-brand-burgundy">*</span>
              </label>
              <div className="relative custom-ring rounded-xl border border-stone-200 bg-white transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="signupEmailInput"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm text-brand-charcoal placeholder-stone-400 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            {/* Phone & Wedding Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="signupPhoneInput" className="block text-xs font-semibold tracking-wide text-brand-charcoal uppercase mb-1.5">
                  Phone (Optional)
                </label>
                <div className="relative custom-ring rounded-xl border border-stone-200 bg-white transition-all">
                  <input
                    type="tel"
                    id="signupPhoneInput"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2.5 bg-transparent text-sm text-brand-charcoal placeholder-stone-400 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="weddingDateInput" className="block text-xs font-semibold tracking-wide text-brand-charcoal uppercase mb-1.5">
                  Celebration Date
                </label>
                <div className="relative custom-ring rounded-xl border border-stone-200 bg-white transition-all">
                  <input
                    type="date"
                    id="weddingDateInput"
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-transparent text-sm text-brand-charcoal placeholder-stone-400 rounded-xl focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="signupPasswordInput" className="block text-xs font-semibold tracking-wide text-brand-charcoal uppercase mb-1.5">
                Password <span className="text-brand-burgundy">*</span>
              </label>
              <div className="relative custom-ring rounded-xl border border-stone-200 bg-white transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={isPasswordVisible ? 'text' : 'password'}
                  id="signupPasswordInput"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-10 pr-11 py-2.5 bg-transparent text-sm text-brand-charcoal placeholder-stone-400 rounded-xl focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-brand-charcoal focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {isPasswordVisible ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-stone-400 mt-1">Must be at least 8 characters with numbers or symbols.</p>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-stone-300 text-brand-burgundy focus:ring-brand-gold focus:ring-offset-0 cursor-pointer accent-brand-burgundy"
              />
              <label htmlFor="agreeTerms" className="text-xs text-stone-600 font-normal leading-snug cursor-pointer select-none">
                I agree to the <Link href="/" className="text-brand-burgundy underline hover:text-brand-gold">Terms of Service</Link> and{' '}
                <Link href="/" className="text-brand-burgundy underline hover:text-brand-gold">Privacy Policy</Link>, and consent to receiving wedding planning concierge communications.
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="signupSubmitBtn"
                disabled={isLoading}
                className={`btn-press w-full py-3.5 px-6 rounded-xl text-white text-sm font-semibold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 group ${
                  successMessage
                    ? 'bg-emerald-800 shadow-emerald-800/15'
                    : 'bg-brand-burgundy hover:bg-brand-burgundyHover shadow-brand-burgundy/15'
                } ${isLoading ? 'opacity-90 cursor-not-allowed' : ''}`}
              >
                <span>
                  {isLoading
                    ? 'Creating Atelier Account...'
                    : successMessage
                    ? 'Account Created — Redirecting to Sign In...'
                    : 'Create Account & Begin'}
                </span>
                {!isLoading && (
                  <svg className="w-4 h-4 text-brand-goldLight transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                )}
                {isLoading && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                )}
              </button>
            </div>

            {/* Quick Demo Pre-fill for Testing */}
            <div className="pt-2 border-t border-brand-borderGoldLight flex items-center justify-between">
              <span className="text-[11px] text-stone-400">Quick Test:</span>
              <button
                type="button"
                onClick={fillDemoCouple}
                className="text-[11px] text-brand-burgundy hover:underline font-medium"
              >
                Auto-fill Sample Couple Details →
              </button>
            </div>

          </form>

          {/* Already have an account / Login Link */}
          <div className="mt-5 text-center p-3 rounded-xl bg-brand-surfaceAlt/60 border border-brand-borderGoldLight">
            <p className="text-xs text-stone-600">
              Already have an Atelier account?{' '}
              <Link
                href="/login"
                className="text-brand-burgundy font-semibold hover:text-brand-burgundyHover hover:underline inline-flex items-center gap-1 ml-0.5"
              >
                <span>Sign in here</span>
                <span aria-hidden="true">→</span>
              </Link>
            </p>
          </div>

        </div>

        {/* Bottom Platform Footer Signoff */}
        <div className="pt-6 border-t border-brand-borderGoldLight flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-400">
          <div>
            <span>© 2025 Make My Marriage Atelier Privé. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-brand-charcoal transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/" className="hover:text-brand-charcoal transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link href="/" className="hover:text-brand-charcoal transition-colors">Concierge Desk</Link>
          </div>
        </div>

      </div>

      {/* RIGHT PANEL: Haute Couture Editorial Visual & Membership Privileges */}
      <div className="portal-split-right relative min-h-screen bg-stone-900 overflow-hidden justify-between p-8 sm:p-10 lg:p-12 xl:p-16">
        
        {/* Background Luxury Photography with Editorial Overlay */}
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWwAFdC3HceIgJ_UxvC938Jin2lR5wh2QVEVC6fKEq3br1tKmgGoyiMnYOiYLyuClP4aA8mLGAkuAoi5fsRw30DHaICuooQIJUEhMbsI_I9B5df7oBWmIFD75uuM53DLu9nqKDxADTt9grPLObMkg6hTepeCbj-o8WW0a_Vubgdnx0tdN3-jcLjEvjq0l5QB8C4h9NWUlZsiZfGSmmI6230RuSFJjC7ChGmhknbLKwBSZr-Vl8YybG"
          alt="Make My Marriage Haute Couture Wedding Villa Loggia"
          fill
          priority
          sizes="(min-width: 900px) 50vw, 100vw"
          className="object-cover object-center filter brightness-[0.92] contrast-[1.03] scale-100 transition-transform duration-1000 ease-out hover:scale-105"
        />

        {/* Atmospheric Cinematic Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-900/30 to-stone-950/50 pointer-events-none"></div>
        <div className="absolute inset-0 bg-brand-burgundy/15 mix-blend-multiply pointer-events-none"></div>

        {/* Top Badge / Real-time Status Floating Pill */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-stone-900/70 backdrop-blur-md border border-white/20 text-white text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Concierge Atelier Privileges</span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1 text-xs text-white/80 bg-stone-900/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            <span className="font-cinzel text-brand-goldLight text-[11px]">Villa d&apos;Este, Lake Como</span>
          </div>
        </div>

        {/* Center / Lower Card: Privileges Showcase & Editorial Quote */}
        <div className="relative z-10 max-w-lg mt-auto pt-16">
          
          {/* Live Included Features Highlight */}
          <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-lg border border-white/40 shadow-2xl mb-6 text-brand-charcoal ring-1 ring-black/5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-brand-burgundy text-white flex items-center justify-center font-serif text-xs font-bold">
                  ✦
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-charcoal">All-Inclusive Atelier Privileges</p>
                  <p className="text-[10px] text-stone-500">Every account includes luxury bespoke features</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                Complimentary
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-brand-surface border border-brand-borderGoldLight">
                <span className="block text-[10px] uppercase text-stone-400 font-semibold tracking-wider">Themes</span>
                <span className="font-serif-luxury text-sm font-bold text-brand-burgundy">3 Couture</span>
              </div>
              <div className="p-2 rounded-lg bg-brand-surface border border-brand-borderGoldLight">
                <span className="block text-[10px] uppercase text-stone-400 font-semibold tracking-wider">RSVP Suite</span>
                <span className="font-serif-luxury text-sm font-bold text-brand-gold">Real-time</span>
              </div>
              <div className="p-2 rounded-lg bg-brand-surface border border-brand-borderGoldLight">
                <span className="block text-[10px] uppercase text-stone-400 font-semibold tracking-wider">Guests</span>
                <span className="font-serif-luxury text-sm font-bold text-emerald-700">Unlimited</span>
              </div>
            </div>
          </div>

          {/* Editorial Testimonial Headline */}
          <div className="space-y-3">
            <p className="font-serif-luxury italic text-2xl sm:text-3xl text-white font-normal leading-snug drop-shadow-md">
              “Crafting celebrations that linger in the memory of generations.”
            </p>
            <div className="flex items-center gap-3 text-white/80 text-xs">
              <div className="h-[1px] w-8 bg-brand-gold"></div>
              <span className="tracking-widest uppercase font-cinzel text-brand-goldLight text-[11px]">Make My Marriage Atelier Privé</span>
              <span className="text-white/40">•</span>
              <span className="text-white/70">Over 14,000 Bespoke Celebrations</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
