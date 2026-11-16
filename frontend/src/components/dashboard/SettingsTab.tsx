'use client';

import React, { useState } from 'react';

interface SettingsTabProps {
  weddingId: string;
}

export default function SettingsTab({ weddingId }: SettingsTabProps) {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="flex flex-col w-full pb-16 max-w-4xl">
      <div className="mb-8 border-b border-[#C5A059]/15 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7F3EB] border border-[#C5A059]/30 text-[#745b1a] text-xs uppercase tracking-widest font-semibold mb-3">
          <span className="material-symbols-outlined text-[16px] text-gold-champagne">settings</span>
          <span>Concierge Preferences</span>
        </div>
        <h1 className="font-headline-md text-headline-md text-charcoal-ink tracking-tight">
          Atelier Settings & Preferences
        </h1>
        <p className="font-body-sm text-body-sm text-stone-muted mt-1 max-w-2xl leading-relaxed">
          Manage wedding identifier credentials, automated RSVP notifications, and platform preferences.
        </p>
      </div>

      {isSaved && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
          <span>Settings saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="rounded-2xl bg-ivory-surface p-6 sm:p-8 shadow-[0_2px_12px_-2px_rgba(74,18,26,0.04)] border border-[#C5A059]/20 flex flex-col gap-5">
          <h2 className="font-headline-sm text-xl text-charcoal-ink">System Credentials & Identifiers</h2>

          <div className="flex flex-col gap-1.5">
            <label className="font-label-sm text-xs uppercase tracking-wider font-semibold text-charcoal-ink">
              Wedding Identifier (Dossier ID)
            </label>
            <input
              type="text"
              disabled
              value={weddingId}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container font-mono text-xs text-stone-muted cursor-not-allowed border border-[#C5A059]/15"
            />
            <span className="text-[11px] text-stone-muted">
              Used by system administrators and concierge personnel for secure data isolation.
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-ivory-surface p-6 sm:p-8 shadow-[0_2px_12px_-2px_rgba(74,18,26,0.04)] border border-[#C5A059]/20 flex flex-col gap-5">
          <h2 className="font-headline-sm text-xl text-charcoal-ink">Notifications & Alerts</h2>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="rounded border-[#C5A059]/40 text-burgundy-velvet focus:ring-[#C5A059] w-4 h-4"
            />
            <div className="flex flex-col">
              <span className="font-body-sm text-sm font-semibold text-charcoal-ink">
                RSVP Response Email Alerts
              </span>
              <span className="font-body-sm text-xs text-stone-muted">
                Receive instant concierge notifications whenever a guest responds or submits dietary requirements.
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={(e) => setSmsAlerts(e.target.checked)}
              className="rounded border-[#C5A059]/40 text-burgundy-velvet focus:ring-[#C5A059] w-4 h-4"
            />
            <div className="flex flex-col">
              <span className="font-body-sm text-sm font-semibold text-charcoal-ink">
                Concierge SMS Dispatch (Tier II)
              </span>
              <span className="font-body-sm text-xs text-stone-muted">
                Send real-time SMS broadcasts alongside email invitations.
              </span>
            </div>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-burgundy-velvet text-on-primary font-label-md text-label-md uppercase tracking-wider hover:bg-burgundy-hover transition-colors shadow-md font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
            <span>Update Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}

