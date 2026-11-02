'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/lib/constants';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorBannerVisible, setErrorBannerVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    router.push('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBannerVisible(false);

    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMessage('Please enter your email address.');
      setErrorBannerVisible(true);
      return;
    }

    if (!EMAIL_REGEX.test(trimmed)) {
      setErrorMessage('Please enter a valid email address.');
      setErrorBannerVisible(true);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/password-reset/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json();

      setIsLoading(false);
      setSubmitted(true);
      setSuccessMessage(
        data.message ||
          'If an account exists with this email address, you will receive a link to reset your password.'
      );
    } catch {
      setIsLoading(false);
      setErrorMessage('Unable to connect to the recovery service. Please verify the backend is running.');
      setErrorBannerVisible(true);
    }
  };

  return (
    <div className="portal-split-wrapper bg-brand-surface selection:bg-brand-goldLight selection:text-brand-burgundy overflow-x-hidden min-h-screen">
      {/* Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        {/* LEFT PANEL: Password Recovery Form */}
        <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-10 md:p-12 lg:p-16 bg-brand-surface relative z-10">
          {/* Top Bar: Brand & Back Navigation */}
          <div className="flex items-center justify-between mb-8 lg:mb-12">
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

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-brand-surfaceAlt/60 border border-brand-borderGoldLight text-xs text-brand-burgundy font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="max-w-[130px] truncate">{user?.name || user?.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="inline-flex items-center gap-1.5 text-xs text-brand-burgundy font-semibold hover:bg-brand-burgundy hover:text-white transition-all py-1.5 px-3.5 rounded-full border border-brand-burgundy/30 hover:border-brand-burgundy shadow-xs"
                    title="Sign out"
                  >
                    {isLoggingOut ? (
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    )}
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-brand-burgundy transition-colors py-1.5 px-3 rounded-full hover:bg-brand-surfaceAlt/60 border border-transparent hover:border-brand-borderGoldLight"
                >
                  <svg className="w-3.5 h-3.5 text-stone-400 group-hover:text-brand-burgundy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to Login</span>
                </Link>
              )}
            </div>
          </div>

          {/* Form Content */}
          <div className="max-w-md w-full mx-auto my-auto py-6">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-goldLight/70 border border-brand-borderGold text-brand-goldDark text-xs uppercase tracking-wider font-medium mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-gold"></span>
                <span>Account Recovery</span>
              </div>
              <h1 className="font-serif-luxury text-3xl sm:text-4xl text-brand-charcoal tracking-tight">
                Forgot Password?
              </h1>
              <p className="font-sans text-sm text-stone-500 mt-2 leading-relaxed">
                Enter the email address associated with your Atelier account. We will dispatch a secure, time-limited link to reset your password.
              </p>
            </div>

            {/* Error Banner */}
            {errorBannerVisible && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-3 animate-fade-in shadow-xs">
                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {/* Success State */}
            {submitted ? (
              <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#C5A059]/40 shadow-sm flex flex-col gap-4 animate-fade-in text-center">
                <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border border-[#C5A059] flex items-center justify-center mx-auto text-[#4A121A] shadow-xs">
                  <span className="material-symbols-outlined text-2xl">mark_email_read</span>
                </div>
                <div>
                  <h3 className="font-serif-luxury text-xl font-bold text-[#1E1A18]">
                    Recovery Link Dispatched
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                    {successMessage}
                  </p>
                </div>
                <div className="p-3 bg-[#F7F3EB] rounded-xl text-xs text-stone-500 font-sans border border-[#C5A059]/20">
                  Please check your inbox (and spam folder). The link will expire in <strong>15 minutes</strong> for security reasons.
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href="/login"
                    className="w-full py-3 rounded-xl bg-brand-burgundy text-[#FFFDF9] text-xs uppercase tracking-wider font-bold hover:bg-[#360B12] transition-colors shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span>Return to Atelier Sign In</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setEmail('');
                    }}
                    className="text-xs text-stone-500 hover:text-brand-burgundy font-medium py-1.5"
                  >
                    Send to a different email
                  </button>
                </div>
              </div>
            ) : (
              /* Request Form */
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="recoveryEmail" className="block text-xs font-semibold tracking-wide text-brand-charcoal uppercase mb-1.5">
                    Email Address <span className="text-brand-burgundy">*</span>
                  </label>
                  <div className="relative custom-ring rounded-xl border border-stone-200 bg-white transition-all">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 z-10">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      id="recoveryEmail"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full !pl-11 pr-4 py-3 bg-transparent text-sm text-brand-charcoal placeholder-stone-400 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  id="sendRecoveryBtn"
                  className="w-full py-3.5 rounded-xl bg-brand-burgundy text-[#FFFDF9] text-xs uppercase tracking-wider font-bold hover:bg-[#360B12] transition-all shadow-md shadow-[#4A121A]/20 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Processing Request...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Recovery Link</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-brand-burgundy transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    <span>Remember your password? Sign in</span>
                  </Link>
                </div>
              </form>
            )}
          </div>

          {/* Bottom Security Footer */}
          <div className="mt-8 pt-4 border-t border-[#C5A059]/20 flex items-center justify-between text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-[#C5A059]">lock</span>
              256-bit TLS encrypted session
            </span>
            <span className="text-[10px] uppercase tracking-wider text-brand-gold font-semibold">
              Make My Marriage
            </span>
          </div>
        </div>

        {/* RIGHT PANEL: Editorial Visual Showcase */}
        <div className="hidden lg:block lg:col-span-6 relative bg-[#221C1D] overflow-hidden">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuARnpmGOcvBVswI2v1CTGArr3tsK6cxZxsBm3OuQV30lONaHL1z1z7s5U1fxCkoUf4T5TIb9d3yL_wH7MSfXwX36a7GSqE_SPROEsBlvnSBqwflLqDoVuvSxh75TWAE7_hly7tGozIRQt7CYPTSU3gkwFZen86t_PZJqRXpZSAHv8UqMVh6QtvWMjcRr-6NvxZVuMGsJfFWi5rPVjMe93XcsyecVrdJZ7zaaEwyYFo"
            alt="Editorial luxury wedding celebration"
            fill
            sizes="50vw"
            priority
            className="object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E1A18]/95 via-[#1E1A18]/40 to-transparent"></div>
          <div className="absolute bottom-12 left-12 right-12 text-[#FFFDF9]">
            <span className="text-[10px] uppercase tracking-widest text-[#E5C378] font-bold block mb-2">
              Security &amp; Privacy First
            </span>
            <h2 className="font-serif-luxury text-3xl font-medium tracking-tight mb-2">
              Confidential Matrimonial Portals
            </h2>
            <p className="text-xs text-[#EFEAE0]/80 leading-relaxed max-w-lg">
              Every guest list, RSVP confirmation, and media asset is strictly isolated and guarded with cryptographic tokens and encrypted storage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
