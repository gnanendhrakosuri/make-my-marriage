'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/lib/constants';

interface Guest {
  id: string;
  weddingId: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'guest' | 'manager' | 'admin';
  invitationStatus: string; // 'pending' | 'sent' | 'delivered' | 'revoked'
  rsvpStatus?: string | null; // 'yes' | 'no' | null
  lastRemindedAt?: string | null;
  reminderCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface InvitationItem {
  id: string;
  weddingId: string;
  guestId: string;
  guestName?: string | null;
  guestEmail?: string | null;
  status: string;
  sentAt?: string | null;
  expiresAt?: string | null;
  revokedAt?: string | null;
  createdAt: string;
}

interface InvitationsRsvpTabProps {
  onDataChanged?: () => void;
}

export default function InvitationsRsvpTab({ onDataChanged }: InvitationsRsvpTabProps) {
  const { user } = useAuth();

  const weddingId = useMemo(() => {
    return user?.weddingId || '670000000000000000000001';
  }, [user]);

  const [guests, setGuests] = useState<Guest[]>([]);
  const [invitations, setInvitations] = useState<InvitationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'attending' | 'declined' | 'pending'>('all');

  // Reminders modal state
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderTargetGuest, setReminderTargetGuest] = useState<Guest | null>(null);
  const [reminderType, setReminderType] = useState<'rsvp_reminder' | 'event_reminder'>('rsvp_reminder');
  const [reminderEventName, setReminderEventName] = useState('Ceremony & Reception');
  const [reminderCustomMessage, setReminderCustomMessage] = useState('');
  const [isSubmittingReminder, setIsSubmittingReminder] = useState(false);
  const [reminderModalError, setReminderModalError] = useState('');

  // Dispatch invitation loading states
  const [dispatchingGuestId, setDispatchingGuestId] = useState<string | null>(null);
  const [isBatchDispatching, setIsBatchDispatching] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4500);
  }, []);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!weddingId) return;
    setIsLoading(true);
    try {
      const [guestsRes, invRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/weddings/${weddingId}/guests`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/v1/weddings/${weddingId}/invitations`, { credentials: 'include' }),
      ]);

      if (guestsRes.ok) {
        const guestsData = await guestsRes.json();
        setGuests(Array.isArray(guestsData) ? guestsData : guestsData.guests || []);
      }

      if (invRes.ok) {
        const invData = await invRes.json();
        setInvitations(Array.isArray(invData) ? invData : invData.invitations || []);
      }
    } catch {
      showToast('Unable to connect to invitation services.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [weddingId, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived metrics
  const stats = useMemo(() => {
    const total = guests.length;
    const dispatched = guests.filter((g) => g.invitationStatus === 'sent' || g.invitationStatus === 'delivered').length;
    const attending = guests.filter((g) => g.rsvpStatus === 'yes').length;
    const declined = guests.filter((g) => g.rsvpStatus === 'no').length;
    const pendingRsvp = guests.filter((g) => (g.invitationStatus === 'sent' || g.invitationStatus === 'delivered') && !g.rsvpStatus).length;
    const awaitingDispatch = guests.filter((g) => g.invitationStatus === 'pending' || !g.invitationStatus).length;
    const responseRate = dispatched > 0 ? Math.round(((attending + declined) / dispatched) * 100) : 0;

    return { total, dispatched, attending, declined, pendingRsvp, awaitingDispatch, responseRate };
  }, [guests]);

  // Filtered invitations list
  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        g.name.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        (g.phone && g.phone.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (statusFilter === 'all') return true;
      if (statusFilter === 'sent') return g.invitationStatus === 'sent' || g.invitationStatus === 'delivered';
      if (statusFilter === 'attending') return g.rsvpStatus === 'yes';
      if (statusFilter === 'declined') return g.rsvpStatus === 'no';
      if (statusFilter === 'pending') return (g.invitationStatus === 'sent' || g.invitationStatus === 'delivered') && !g.rsvpStatus;

      return true;
    });
  }, [guests, searchQuery, statusFilter]);

  // Dispatch digital invitation to a single guest
  const handleDispatch = async (guest: Guest) => {
    setDispatchingGuestId(guest.id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/weddings/${weddingId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ guestId: guest.id }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to dispatch invitation');
      }

      showToast(`Digital wedding invitation dispatched to ${guest.name} (${guest.email}).`);
      await fetchData();
      if (onDataChanged) onDataChanged();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error sending invitation', 'error');
    } finally {
      setDispatchingGuestId(null);
    }
  };

  // Re-send existing invitation link
  const handleResend = async (invitationId: string, guestName: string) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/weddings/${weddingId}/invitations/${invitationId}/resend`,
        { method: 'POST', credentials: 'include' }
      );
      if (!res.ok) throw new Error('Failed to re-issue invitation');
      showToast(`Re-issued cryptographic invite token and sent fresh email to ${guestName}.`);
      await fetchData();
      if (onDataChanged) onDataChanged();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error resending invitation', 'error');
    }
  };

  // Revoke invitation token
  const handleRevoke = async (invitationId: string, guestName: string) => {
    if (!confirm(`Are you sure you wish to revoke ${guestName}'s invitation access? They will no longer be able to RSVP or view private details.`)) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/weddings/${weddingId}/invitations/${invitationId}/revoke`,
        { method: 'POST', credentials: 'include' }
      );
      if (!res.ok) throw new Error('Failed to revoke invitation');
      showToast(`Revoked invitation access for ${guestName}.`);
      await fetchData();
      if (onDataChanged) onDataChanged();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error revoking invitation', 'error');
    }
  };

  // Dispatch to all uninvited guests
  const handleBatchDispatch = async () => {
    const uninvited = guests.filter((g) => g.invitationStatus === 'pending' || !g.invitationStatus);
    if (uninvited.length === 0) {
      showToast('All guests have already received invitations.', 'error');
      return;
    }

    if (!confirm(`Dispatch personalized digital invitations to all ${uninvited.length} pending guests now via Resend?`)) return;

    setIsBatchDispatching(true);
    let successCount = 0;
    for (const g of uninvited) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/weddings/${weddingId}/invitations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ guestId: g.id }),
        });
        if (res.ok) successCount++;
      } catch {
        // continue with next
      }
    }
    setIsBatchDispatching(false);
    showToast(`Batch dispatch completed: ${successCount} invitations transmitted.`);
    await fetchData();
    if (onDataChanged) onDataChanged();
  };

  // Reminder open modal
  const handleOpenReminderModal = (guest: Guest) => {
    setReminderTargetGuest(guest);
    setReminderType('rsvp_reminder');
    setReminderCustomMessage(
      'We are finalizing our guest arrangements and catering provisions. Please kindly take a moment to confirm your attendance.'
    );
    setReminderModalError('');
    setIsReminderModalOpen(true);
  };

  const handleOpenBatchReminderModal = () => {
    const unresponded = guests.filter((g) => (g.invitationStatus === 'sent' || g.invitationStatus === 'delivered') && !g.rsvpStatus);
    if (unresponded.length === 0) {
      showToast('No guests with pending RSVP responses to remind.', 'error');
      return;
    }
    setReminderTargetGuest(null);
    setReminderType('rsvp_reminder');
    setReminderCustomMessage(
      'We are curating our final seating and soirée catering. Please kindly confirm your attendance.'
    );
    setReminderModalError('');
    setIsReminderModalOpen(true);
  };

  // Submit reminder
  const handleSendReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    setReminderModalError('');
    setIsSubmittingReminder(true);

    try {
      const payload: {
        category: 'rsvp_reminder' | 'event_reminder';
        guestIds?: string[];
        eventName?: string;
        customMessage?: string;
      } = {
        category: reminderType,
        eventName: reminderType === 'event_reminder' ? reminderEventName : undefined,
        customMessage: reminderCustomMessage.trim() || undefined,
      };

      if (reminderTargetGuest) {
        payload.guestIds = [reminderTargetGuest.id];
      }

      const res = await fetch(`${API_BASE_URL}/api/v1/weddings/${weddingId}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to dispatch reminders');
      }

      const result = await res.json();
      setIsReminderModalOpen(false);
      showToast(result.message || 'Reminders dispatched successfully.');
      await fetchData();
      if (onDataChanged) onDataChanged();
    } catch (err: unknown) {
      setReminderModalError(err instanceof Error ? err.message : 'Error sending reminders');
    } finally {
      setIsSubmittingReminder(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-xs font-semibold tracking-wide border transition-all ${
            toastType === 'success'
              ? 'bg-[#4A121A] text-[#FFFDF9] border-[#C5A059]/40 ring-4 ring-[#4A121A]/10'
              : 'bg-red-800 text-white border-red-500'
          }`}
        >
          <span className="material-symbols-outlined text-[18px] text-[#C5A059]">
            {toastType === 'success' ? 'mark_email_read' : 'error'}
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-[#C5A059]/15 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7F3EB] border border-[#C5A059]/30 text-[#745b1a] text-xs uppercase tracking-widest font-semibold mb-3">
            <span className="material-symbols-outlined text-[16px] text-[#C5A059]">forward_to_inbox</span>
            <span>Digital Stationery & RSVP Dispatch</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-[#1E1A18] tracking-tight">
            Invitations & RSVP Pipeline
          </h1>
          <p className="font-body-sm text-body-sm text-[#756D67] mt-1 max-w-2xl leading-relaxed">
            Dispatch bespoke Haute Atelier wedding invitations via Resend, monitor cryptographic token delivery, track real-time Yes/No RSVP responses, and broadcast courteous reminder suites.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleOpenBatchReminderModal}
            disabled={stats.pendingRsvp === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#FAF7F2] hover:bg-[#F1EBE0] text-[#4A121A] font-label-md text-label-md font-semibold uppercase tracking-wider border border-[#C5A059]/30 transition-all shadow-xs disabled:opacity-50"
            title="Send reminder emails to all guests who haven't submitted their RSVP"
          >
            <span className="material-symbols-outlined text-[18px] text-[#C5A059]">notifications_active</span>
            <span>Nudge Pending RSVPs ({stats.pendingRsvp})</span>
          </button>

          <button
            type="button"
            onClick={handleBatchDispatch}
            disabled={isBatchDispatching || stats.awaitingDispatch === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#4A121A] to-[#6B1D27] text-[#FFFDF9] font-label-md text-label-md font-semibold uppercase tracking-wider border border-[#C5A059]/40 hover:shadow-md transition-all ring-4 ring-[#4A121A]/10 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px] text-[#E5C378]">send</span>
            <span>{isBatchDispatching ? 'Transmitting...' : `Dispatch All Invites (${stats.awaitingDispatch})`}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid - Focused on RSVP and Dispatch */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-ivory-surface border border-[#C5A059]/20 shadow-xs">
          <span className="font-label-sm text-[10px] uppercase tracking-widest text-[#756D67] font-semibold">Total Dispatched</span>
          <div className="font-headline-md text-3xl font-semibold text-[#1E1A18] mt-1">{stats.dispatched}</div>
          <span className="font-label-sm text-[11px] text-[#B38E46] mt-1 block">Live tokens issued via Resend</span>
        </div>

        <div className="p-5 rounded-2xl bg-ivory-surface border border-[#C5A059]/20 shadow-xs">
          <span className="font-label-sm text-[10px] uppercase tracking-widest text-emerald-700 font-semibold">Attending (RSVP Yes)</span>
          <div className="font-headline-md text-3xl font-semibold text-emerald-800 mt-1">{stats.attending}</div>
          <span className="font-label-sm text-[11px] text-stone-500 mt-1 block">Confirmed seats & catering</span>
        </div>

        <div className="p-5 rounded-2xl bg-ivory-surface border border-[#C5A059]/20 shadow-xs">
          <span className="font-label-sm text-[10px] uppercase tracking-widest text-amber-700 font-semibold">Pending Response</span>
          <div className="font-headline-md text-3xl font-semibold text-amber-800 mt-1">{stats.pendingRsvp}</div>
          <span className="font-label-sm text-[11px] text-stone-500 mt-1 block">Awaiting confirmation link</span>
        </div>

        <div className="p-5 rounded-2xl bg-ivory-surface border border-[#C5A059]/20 shadow-xs">
          <span className="font-label-sm text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Response Rate</span>
          <div className="font-headline-md text-3xl font-semibold text-[#4A121A] mt-1">{stats.responseRate}%</div>
          <span className="font-label-sm text-[11px] text-stone-400 mt-1 block">
            {stats.declined} declined with regrets
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-ivory-surface border border-[#C5A059]/20 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by recipient or email..."
            className="w-full pl-10 pr-4 py-2 font-body-sm text-xs rounded-xl bg-[#FAF7F2] border border-[#C5A059]/20 focus:border-[#C5A059] focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'all', label: 'All Dispatches' },
              { id: 'attending', label: 'RSVP Confirmed' },
              { id: 'pending', label: 'Awaiting RSVP' },
              { id: 'declined', label: 'Regrets / Declined' },
              { id: 'sent', label: 'Tokens Active' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-full font-label-sm text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-[#4A121A] text-[#FFFDF9] shadow-xs'
                  : 'bg-[#FAF7F2] text-[#756D67] hover:text-[#4A121A] border border-[#C5A059]/15'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invitations Table */}
      <div className="rounded-2xl bg-ivory-surface border border-[#C5A059]/20 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#4A121A]/30 border-t-[#4A121A] animate-spin mb-3"></div>
            <p className="font-label-sm text-xs text-[#756D67] uppercase tracking-widest font-semibold">
              Loading Invitation Registry & RSVP Logs...
            </p>
          </div>
        ) : filteredGuests.length === 0 ? (
          <div className="py-20 px-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#F7F3EB] border border-[#C5A059]/30 flex items-center justify-center mx-auto mb-4 text-[#C5A059]">
              <span className="material-symbols-outlined text-[28px]">mark_email_read</span>
            </div>
            <h3 className="font-headline-sm text-xl text-[#1E1A18] mb-1">No Invitations Found</h3>
            <p className="font-body-sm text-xs text-[#756D67] max-w-sm mx-auto mb-5 leading-relaxed">
              {searchQuery || statusFilter !== 'all'
                ? 'No invitations match your selected filters.'
                : 'No guests have been dispatched invitations yet. Select "Dispatch All Invites" to transmit your stationery.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#C5A059]/20 text-[#756D67] uppercase tracking-wider text-[10px]">
                  <th className="py-4 px-6 font-semibold">Recipient</th>
                  <th className="py-4 px-6 font-semibold">Email Dispatch Destination</th>
                  <th className="py-4 px-6 font-semibold">Invitation Token Status</th>
                  <th className="py-4 px-6 font-semibold">RSVP Attendance Response</th>
                  <th className="py-4 px-6 font-semibold">Reminders Sent</th>
                  <th className="py-4 px-6 font-semibold text-right">Invitation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5A059]/10">
                {filteredGuests.map((guest) => {
                  const activeInv = invitations.find((i) => i.guestId === guest.id && !i.revokedAt);
                  const isDispatched = guest.invitationStatus === 'sent' || guest.invitationStatus === 'delivered';
                  const isRevoked = guest.invitationStatus === 'revoked';
                  const isSending = dispatchingGuestId === guest.id;

                  return (
                    <tr key={guest.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-4 px-6 font-medium text-[#1E1A18]">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-[#F7F3EB] border border-[#C5A059]/30 text-[#4A121A] flex items-center justify-center font-bold text-[11px]">
                            {guest.name.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <span className="font-semibold block">{guest.name}</span>
                            <span className="text-[10px] text-stone-400 capitalize">{guest.role}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-[#756D67]">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span className="material-symbols-outlined text-[14px] text-stone-400">mail</span>
                          <span>{guest.email}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {isRevoked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-500 font-label-sm text-[10px] font-semibold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                            Revoked
                          </span>
                        ) : isDispatched ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-label-sm text-[10px] font-semibold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            Live via Resend
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 font-label-sm text-[10px] font-semibold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                            Not Yet Dispatched
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        {guest.rsvpStatus === 'yes' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-semibold text-[11px]">
                            <span className="material-symbols-outlined text-[14px] text-emerald-700">check_circle</span>
                            Attending Celebration
                          </span>
                        ) : guest.rsvpStatus === 'no' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 font-medium text-[11px]">
                            <span className="material-symbols-outlined text-[14px] text-stone-500">cancel</span>
                            Declined with Regrets
                          </span>
                        ) : isDispatched ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium text-[11px]">
                            <span className="material-symbols-outlined text-[14px] text-amber-600">hourglass_top</span>
                            Awaiting Guest Confirmation
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[11px]">—</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-[#756D67]">
                        {guest.reminderCount && guest.reminderCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#C5A059]/20 font-mono text-[10px]">
                            <span className="material-symbols-outlined text-[12px] text-[#C5A059]">mark_email_unread</span>
                            {guest.reminderCount} reminder{guest.reminderCount > 1 ? 's' : ''} sent
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[11px]">None</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isDispatched && !isRevoked ? (
                            <button
                              type="button"
                              onClick={() => handleDispatch(guest)}
                              disabled={isSending}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#4A121A] text-[#FFFDF9] font-label-sm text-[10px] font-semibold uppercase tracking-wider hover:bg-[#6B1D27] transition-all shadow-xs disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-[14px]">send</span>
                              <span>{isSending ? 'Sending...' : 'Dispatch'}</span>
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenReminderModal(guest)}
                                title="Send bespoke reminder email"
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 hover:text-[#4A121A] hover:bg-[#F7F3EB] transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">notifications_active</span>
                              </button>

                              {activeInv && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleResend(activeInv.id, guest.name)}
                                    title="Re-send fresh digital invitation email"
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleRevoke(activeInv.id, guest.name)}
                                    title="Revoke invitation token"
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">do_not_disturb_on</span>
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reminder Dispatch Modal */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-[#FFFDF9] p-6 shadow-2xl border border-[#C5A059]/30 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 border-b border-[#C5A059]/20 pb-3">
              <div className="flex items-center gap-2 text-[#4A121A]">
                <span className="material-symbols-outlined text-[20px] text-[#C5A059]">mark_email_unread</span>
                <h3 className="font-headline-sm text-lg text-[#1E1A18]">
                  {reminderTargetGuest ? `Send Reminder: ${reminderTargetGuest.name}` : 'Dispatch RSVP Reminders (Batch)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReminderModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {reminderModalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
                {reminderModalError}
              </div>
            )}

            <form onSubmit={handleSendReminder} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#1E1A18] uppercase tracking-wider mb-2">
                  Reminder Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReminderType('rsvp_reminder')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all ${
                      reminderType === 'rsvp_reminder'
                        ? 'bg-[#4A121A] text-white border-[#4A121A]'
                        : 'bg-[#FAF7F2] text-[#756D67] border-[#C5A059]/20 hover:border-[#C5A059]'
                    }`}
                  >
                    RSVP Response Nudge
                  </button>
                  <button
                    type="button"
                    onClick={() => setReminderType('event_reminder')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all ${
                      reminderType === 'event_reminder'
                        ? 'bg-[#4A121A] text-white border-[#4A121A]'
                        : 'bg-[#FAF7F2] text-[#756D67] border-[#C5A059]/20 hover:border-[#C5A059]'
                    }`}
                  >
                    Upcoming Soirée Event
                  </button>
                </div>
              </div>

              {reminderType === 'event_reminder' && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#1E1A18] uppercase tracking-wider mb-1.5">
                    Celebration Event
                  </label>
                  <select
                    value={reminderEventName}
                    onChange={(e) => setReminderEventName(e.target.value)}
                    className="w-full px-3.5 py-2 font-body-sm text-xs rounded-xl bg-[#FAF7F2] border border-[#C5A059]/30 focus:border-[#C5A059] focus:outline-none"
                  >
                    <option value="Ceremony & Reception">Ceremony & Reception</option>
                    <option value="Sangeet Night">Sangeet Night</option>
                    <option value="Mehendi Soirée">Mehendi Soirée</option>
                    <option value="Haldi Ceremony">Haldi Ceremony</option>
                    <option value="Cocktail & Welcome Dinner">Cocktail & Welcome Dinner</option>
                    <option value="Farewell Recovery Brunch">Farewell Recovery Brunch</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-[#1E1A18] uppercase tracking-wider mb-1.5">
                  Personalized Courteous Message
                </label>
                <textarea
                  rows={3}
                  value={reminderCustomMessage}
                  onChange={(e) => setReminderCustomMessage(e.target.value)}
                  placeholder="Include a warm, polite note regarding wedding arrangements..."
                  className="w-full p-3 font-body-sm text-xs rounded-xl bg-[#FAF7F2] border border-[#C5A059]/30 focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsReminderModalOpen(false)}
                  className="px-4 py-2 rounded-full font-label-md text-xs font-semibold text-stone-500 hover:text-stone-800 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReminder}
                  className="px-5 py-2 rounded-full bg-[#4A121A] text-[#FFFDF9] font-label-md text-xs font-semibold uppercase tracking-wider border border-[#C5A059]/40 hover:bg-[#6B1D27] transition-all disabled:opacity-50"
                >
                  {isSubmittingReminder ? 'Transmitting...' : 'Send Reminder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

