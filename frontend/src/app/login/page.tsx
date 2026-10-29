'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/constants';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorBannerVisible, setErrorBannerVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoBannerVisible, setInfoBannerVisible] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [grantedMessage, setGrantedMessage] = useState(false);

  const fillCredential = (type: 'manager' | 'admin') => {
    setErrorBannerVisible(false);
    setInfoBannerVisible(false);
    if (type === 'manager') {
      setEmail('elena.rostova@makemymarriage.com');
      setPassword('HauteConcierge2025!');
    } else {
      setEmail('admin.atelier@makemymarriage.com');
      setPassword('SuperSecretPrivilege#99');
    }
  };

  const testInvalidState = () => {
    setEmail('invalid.guest@personalmail.com');
    setErrorMessage('Access restricted: Please sign in with a valid registered Atelier account.');
    setErrorBannerVisible(true);
    setInfoBannerVisible(false);
  };

  const handleForgotPassword = () => {
    setErrorBannerVisible(false);
    setInfoMessage('Password reset instructions have been dispatched to your linked recovery email.');
    setInfoBannerVisible(true);
  };

  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoBannerVisible(false);

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      setErrorBannerVisible(true);
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      setErrorBannerVisible(true);
      return;
    }

    setErrorBannerVisible(false);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim(),
          password,
          rememberMe,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.detail || 'Invalid email or password.');
        setErrorBannerVisible(true);
        setIsLoading(false);
        return;
      }

      if (data?.data?.user) {
        try {
          localStorage.setItem('mmm_user', JSON.stringify(data.data.user));
          if (data.data.token) {
            localStorage.setItem('mmm_token', data.data.token);
          }
        } catch {
          // localStorage may be disabled or restricted
        }
      }

      setIsLoading(false);
      setGrantedMessage(true);
      setTimeout(() => {
        router.push('/onboarding');
      }, 1200);
    } catch {
      setErrorMessage('Unable to connect to the authentication server. Please verify the backend service is running.');
      setErrorBannerVisible(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="portal-split-wrapper bg-brand-surface selection:bg-brand-goldLight selection:text-brand-burgundy overflow-x-hidden">
      
      {/* LEFT PANEL: Luxury Authentication Experience */}
      <div className="portal-split-left flex flex-col justify-between p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 bg-brand-surface relative z-10 overflow-y-auto">
        
        {/* Top Bar: Logo & Navigation Backlink */}
        <div className="flex items-center justify-between mb-8 lg:mb-10">
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

        {/* Main Sign In Form Area */}
        <div className="max-w-[440px] w-full mx-auto my-auto py-2">
          
          {/* Header & Role Selector */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-surfaceAlt border border-brand-borderGold text-brand-burgundy text-[11px] font-medium tracking-wider uppercase mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-gold"></span>
              Private Concierge Access
            </div>
            <h1 className="font-serif-luxury text-3xl sm:text-4xl text-brand-charcoal font-normal tracking-tight leading-tight">
              Welcome to the <span className="italic font-serif text-brand-gold">Atelier</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-2 font-normal leading-relaxed">
              Enter your credentials to coordinate matrimonial celebrations, curate guest dossiers, and manage platform services.
            </p>

            {/* Unified Access Badge */}
            <div className="mt-5 p-3 bg-brand-surfaceAlt/80 border border-brand-borderGoldLight rounded-xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-charcoal">
                <svg className="w-4 h-4 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Unified Atelier Access</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-stone-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>MANAGERS &amp; ADMINS</span>
              </div>
            </div>
          </div>

          {/* Live Validation Alert Banner */}
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

          {/* Informational Notification Banner */}
          {infoBannerVisible && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-left transition-all">
              <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-amber-900">{infoMessage}</p>
              </div>
              <button
                type="button"
                onClick={() => setInfoBannerVisible(false)}
                className="text-stone-400 hover:text-stone-600 text-sm leading-none"
              >
                ×
              </button>
            </div>
          )}

          {/* Access Granted Notification Banner */}
          {grantedMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-left transition-all">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-emerald-900">
                  Access granted! Welcome back to Make My Marriage Atelier Privé. Redirecting to home page...
                </p>
              </div>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSignIn} className="space-y-4 sm:space-y-4.5" noValidate>
            
            {/* Email Address Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="emailInput" className="block text-xs font-semibold tracking-wide text-brand-charcoal uppercase">
                  Email Address <span className="text-brand-burgundy">*</span>
                </label>
                <span className="text-[11px] text-brand-gold font-medium">
                  Atelier member or concierge
                </span>
              </div>
              <div className="relative custom-ring rounded-xl border border-stone-200 bg-white transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 z-10">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="emailInput"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full !pl-11 pr-4 py-3 bg-transparent text-sm text-brand-charcoal placeholder-stone-400 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            {/* Password Input with Show/Hide */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="passwordInput" className="block text-xs font-semibold tracking-wide text-brand-charcoal uppercase">
                  Password <span className="text-brand-burgundy">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-brand-gold hover:text-brand-burgundy transition-colors font-medium hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative custom-ring rounded-xl border border-stone-200 bg-white transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 z-10">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={isPasswordVisible ? 'text' : 'password'}
                  id="passwordInput"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your secure password"
                  className="w-full !pl-11 pr-11 py-3 bg-transparent text-sm text-brand-charcoal placeholder-stone-400 rounded-xl focus:outline-none"
                />
                <button
                  type="button"
                  id="togglePasswordBtn"
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
            </div>

            {/* Remember Me & Security Badge */}
            <div className="flex items-center justify-between pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 text-brand-burgundy focus:ring-brand-gold focus:ring-offset-0 cursor-pointer accent-brand-burgundy"
                />
                <span className="text-xs text-stone-600 font-medium">Keep me signed in for 30 days</span>
              </label>

              <div className="flex items-center gap-1 text-[11px] text-stone-400">
                <svg className="w-3.5 h-3.5 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>256-bit TLS</span>
              </div>
            </div>

            {/* Prominent Sign In CTA */}
            <div className="pt-2">
              <button
                type="submit"
                id="submitBtn"
                disabled={isLoading}
                className={`btn-press w-full py-3.5 px-6 rounded-xl text-white text-sm font-semibold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 group ${
                  grantedMessage
                    ? 'bg-emerald-800 shadow-emerald-800/15'
                    : 'bg-brand-burgundy hover:bg-brand-burgundyHover shadow-brand-burgundy/15'
                } ${isLoading ? 'opacity-90 cursor-not-allowed' : ''}`}
              >
                <span>
                  {isLoading
                    ? 'Authenticating Atelier Access...'
                    : grantedMessage
                    ? 'Access Granted — Redirecting to Home Page...'
                    : 'Sign In to Atelier'}
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

            {/* Quick Test Credentials Preset Bar (Designer / QA Aid) */}
            <div className="pt-3 border-t border-brand-borderGoldLight">
              <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5">
                <span className="font-medium text-stone-400 uppercase tracking-wider text-[10px]">Quick Demo Presets:</span>
                <button
                  type="button"
                  onClick={testInvalidState}
                  className="text-brand-burgundy hover:underline text-[11px] font-medium"
                >
                  Test Error State
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillCredential('manager')}
                  className="py-1.5 px-2.5 rounded-lg bg-white border border-stone-200 hover:border-brand-gold text-[11px] text-stone-600 text-left transition-colors flex items-center justify-between group"
                >
                  <span className="truncate font-medium">Elena (Lead Concierge)</span>
                  <span className="text-brand-gold text-[10px] group-hover:translate-x-0.5 transition-transform">Fill →</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillCredential('admin')}
                  className="py-1.5 px-2.5 rounded-lg bg-white border border-stone-200 hover:border-brand-gold text-[11px] text-stone-600 text-left transition-colors flex items-center justify-between group"
                >
                  <span className="truncate font-medium">Platform Super Admin</span>
                  <span className="text-brand-gold text-[10px] group-hover:translate-x-0.5 transition-transform">Fill →</span>
                </button>
              </div>
            </div>

          </form>

          {/* Don't have an account / Create Account Action */}
          <div className="mt-4 pt-3.5 border-t border-brand-borderGoldLight text-center">
            <p className="text-xs text-stone-600 mb-2">
              Don&apos;t have an Atelier account yet?
            </p>
            <Link
              href="/signup"
              id="createAccountBtn"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-brand-borderGold text-brand-burgundy hover:bg-brand-surfaceAlt/80 hover:border-brand-gold text-xs font-semibold tracking-wide transition-all duration-200 shadow-xs"
            >
              <span>Create an Atelier Account</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Help / Support Footer Note */}
          <div className="mt-3 text-center">
            <p className="text-xs text-stone-500">
              Need concierge authorization or account recovery?{' '}
              <a href="mailto:concierge@makemymarriage.com" className="text-brand-burgundy font-medium hover:underline">
                Contact Atelier Desk
              </a>
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

      {/* RIGHT PANEL: Haute Couture Editorial Wedding Visual & Proof Showcase */}
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
            <span>Atelier Concierge Network Online</span>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1 text-xs text-white/80 bg-stone-900/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            <span className="font-cinzel text-brand-goldLight text-[11px]">Villa d&apos;Este, Lake Como</span>
          </div>
        </div>

        {/* Center / Lower Card: Quiet Luxury Milestone Card & Quote */}
        <div className="relative z-10 max-w-lg mt-auto pt-16">
          
          {/* Live Celebration Dossier Preview Widget */}
          <div className="p-5 rounded-2xl bg-white/90 backdrop-blur-lg border border-white/40 shadow-2xl mb-6 text-brand-charcoal ring-1 ring-black/5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-brand-burgundy text-white flex items-center justify-center font-serif text-xs font-bold">
                  S&amp;J
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-charcoal">Sarah &amp; Julian&apos;s Lake Como Dossier</p>
                  <p className="text-[10px] text-stone-500">Villa d&apos;Este, Italy • October 24, 2025</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live Website
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-brand-surface border border-brand-borderGoldLight">
                <span className="block text-[10px] uppercase text-stone-400 font-semibold tracking-wider">Confirmed</span>
                <span className="font-serif-luxury text-base font-bold text-brand-burgundy">184 / 210</span>
              </div>
              <div className="p-2 rounded-lg bg-brand-surface border border-brand-borderGoldLight">
                <span className="block text-[10px] uppercase text-stone-400 font-semibold tracking-wider">Days to Vows</span>
                <span className="font-serif-luxury text-base font-bold text-brand-gold">142 Days</span>
              </div>
              <div className="p-2 rounded-lg bg-brand-surface border border-brand-borderGoldLight">
                <span className="block text-[10px] uppercase text-stone-400 font-semibold tracking-wider">RSVP Quota</span>
                <span className="font-serif-luxury text-base font-bold text-emerald-700">88%</span>
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
