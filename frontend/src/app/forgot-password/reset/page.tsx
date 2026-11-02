'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/lib/constants';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const token = searchParams.get('token') || '';

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorBannerVisible, setErrorBannerVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    router.push('/login');
  };

  useEffect(() => {
    if (!token) {
      setErrorMessage('Missing password recovery token. Please request a new password recovery link.');
      setErrorBannerVisible(true);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBannerVisible(false);

    if (!token) {
      setErrorMessage('Invalid recovery token. Please request a new recovery link.');
      setErrorBannerVisible(true);
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      setErrorBannerVisible(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both entries.');
      setErrorBannerVisible(true);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/password-reset/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token.trim(),
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.detail || 'Password reset failed. The link may be expired or already used.');
        setErrorBannerVisible(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch {
      setIsLoading(false);
      setErrorMessage('Unable to connect to the recovery service. Please try again later.');
      setErrorBannerVisible(true);
    }
  };

  return (
    <div className="portal-split-wrapper bg-brand-surface selection:bg-brand-goldLight selection:text-brand-burgundy overflow-x-hidden min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        {/* LEFT PANEL: Password Reset Form */}
        <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-10 md:p-12 lg:p-16 bg-brand-surface relative z-10">
          {/* Top Bar */}
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

          {/* Center Form */}
          <div className="max-w-md w-full mx-auto my-auto py-6">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-goldLight/70 border border-brand-borderGold text-brand-goldDark text-xs uppercase tracking-wider font-medium mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-gold"></span>
                <span>Security Protocol</span>
              </div>
              <h1 className="font-serif-luxury text-3xl sm:text-4xl text-brand-charcoal tracking-tight">
                Create New Password
              </h1>
              <p className="font-sans text-sm text-stone-500 mt-2 leading-relaxed">
                Choose a strong new password for your Atelier account. It must be at least 8 characters long.
              </p>
            </div>

            {/* Error Banner */}
            {errorBannerVisible && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-3 animate-fade-in shadow-xs">
                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1 font-medium leading-relaxed">
                  {errorMessage}
                  {!token && (
                    <div className="mt-2">
                      <Link href="/forgot-password" className="font-bold underline text-red-800">
                        Request a new recovery link
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Success State */}
            {isSuccess ? (
              <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#C5A059]/40 shadow-sm flex flex-col gap-4 animate-fade-in text-center">
                <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border border-[#C5A059] flex items-center justify-center mx-auto text-[#4A121A] shadow-xs">
                  <span className="material-symbols-outlined text-2xl">check_circle</span>
                </div>
                <div>
                  <h3 className="font-serif-luxury text-xl font-bold text-[#1E1A18]">
                    Password Updated Successfully!
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                    Your password has been changed. You will now be redirected to the sign-in screen to authenticate with your new credentials.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/login"
                    className="w-full py-3 rounded-xl bg-brand-burgundy text-[#FFFDF9] text-xs uppercase tracking-wider font-bold hover:bg-[#360B12] transition-colors shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span>Proceed to Sign In Now</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* Password Form */
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div>
                  <label htmlFor="newPasswordInput" className="block text-xs font-semibold tracking-wide text-brand-charcoal uppercase mb-1.5">
                    New Password <span className="text-brand-burgundy">*</span>
                  </label>
                  <div className="relative custom-ring rounded-xl border border-stone-200 bg-white transition-all">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 z-10">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={isPasswordVisible ? 'text' : 'password'}
                      id="newPasswordInput"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full !pl-11 pr-11 py-3 bg-transparent text-sm text-brand-charcoal placeholder-stone-400 rounded-xl focus:outline-none"
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
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPasswordInput" className="block text-xs font-semibold tracking-wide text-brand-charcoal uppercase mb-1.5">
                    Confirm New Password <span className="text-brand-burgundy">*</span>
                  </label>
                  <div className="relative custom-ring rounded-xl border border-stone-200 bg-white transition-all">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 z-10">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={isConfirmVisible ? 'text' : 'password'}
                      id="confirmPasswordInput"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      className="w-full !pl-11 pr-11 py-3 bg-transparent text-sm text-brand-charcoal placeholder-stone-400 rounded-xl focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setIsConfirmVisible(!isConfirmVisible)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-brand-charcoal focus:outline-none"
                      aria-label="Toggle confirm password visibility"
                    >
                      {isConfirmVisible ? (
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

                <button
                  type="submit"
                  disabled={isLoading}
                  id="updatePasswordBtn"
                  className="w-full py-3.5 rounded-xl bg-brand-burgundy text-[#FFFDF9] text-xs uppercase tracking-wider font-bold hover:bg-[#360B12] transition-all shadow-md shadow-[#4A121A]/20 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Update Password</span>
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-brand-burgundy transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    <span>Cancel and return to sign in</span>
                  </Link>
                </div>
              </form>
            )}
          </div>

          {/* Bottom Security Footer */}
          <div className="mt-8 pt-4 border-t border-[#C5A059]/20 flex items-center justify-between text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-[#C5A059]">lock</span>
              PBKDF2-HMAC-SHA256 Cryptography
            </span>
            <span className="text-[10px] uppercase tracking-wider text-brand-gold font-semibold">
              Make My Marriage
            </span>
          </div>
        </div>

        {/* RIGHT PANEL: Visual Showcase */}
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
              Haute Atelier Privé
            </span>
            <h2 className="font-serif-luxury text-3xl font-medium tracking-tight mb-2">
              Account Security Guarantee
            </h2>
            <p className="text-xs text-[#EFEAE0]/80 leading-relaxed max-w-lg">
              All credentials are cryptographically protected using OWASP-compliant key derivation with 600,000 iterations and dedicated salt per account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-sm text-[#4A121A] font-serif">
          Loading Atelier Security Portal...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
