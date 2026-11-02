'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function GuestManagementPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Wedding context ID (from user profile or fallback default for demo)
  const weddingId = useMemo(() => {
    return user?.weddingId || '670000000000000000000001';
  }, [user]);

  // Guests & Invitations state
  const [guests, setGuests] = useState<Guest[]>([]);
  const [invitations, setInvitations] = useState<InvitationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State for adding a guest
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestRole, setGuestRole] = useState<'guest' | 'manager' | 'admin'>('guest');
  const [isSubmittingGuest, setIsSubmittingGuest] = useState(false);
  const [modalError, setModalError] = useState('');

  // Modal State for editing a guest (role and phone)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<'guest' | 'manager' | 'admin'>('guest');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editModalError, setEditModalError] = useState('');

  // Toast / Status Message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Modal State for custom reminder (single guest or batch)
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderTargetGuest, setReminderTargetGuest] = useState<Guest | null>(null);
  const [reminderType, setReminderType] = useState<'rsvp_reminder' | 'event_reminder'>('rsvp_reminder');
  const [reminderEventName, setReminderEventName] = useState('Ceremony & Reception');
  const [reminderCustomMessage, setReminderCustomMessage] = useState('');
  const [isSubmittingReminder, setIsSubmittingReminder] = useState(false);
  const [reminderModalError, setReminderModalError] = useState('');

  // Action loading trackers
  const [sendingGuestId, setSendingGuestId] = useState<string | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4500);
  }, []);

  // Fetch guests and invitations
  const fetchData = useCallback(async () => {
    if (!weddingId) return;
    setIsLoading(true);
    try {
      // 1. Fetch Guests
      const guestsRes = await fetch(`${API_BASE_URL}/api/v1/weddings/${weddingId}/guests`, {
        credentials: 'include',
      });
      if (guestsRes.ok) {
        const guestsData: Guest[] = await guestsRes.json();
        setGuests(guestsData);
      }

      // 2. Fetch Invitations
      const invRes = await fetch(`${API_BASE_URL}/api/v1/weddings/${weddingId}/invitations`, {
        credentials: 'include',
      });
      if (invRes.ok) {
        const invData: InvitationItem[] = await invRes.json();
        setInvitations(invData);
      }
    } catch {
      showToast('Unable to load guest roster. Ensure backend service is active.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [weddingId, showToast]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      fetchData();
    }
  }, [authLoading, isAuthenticated, router, fetchData]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    router.push('/');
  };

  // Add Guest Handler
  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    const trimmedName = guestName.trim();
    const trimmedEmail = guestEmail.trim().toLowerCase();
    const trimmedPhone = guestPhone.trim();

    if (!trimmedName) {
      setModalError('Please enter guest full name.');
      return;
    }
    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      setModalError('Please provide a valid recipient email address.');
      return;
    }

    setIsSubmittingGuest(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/weddings/${weddingId}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          phone: trimmedPhone || null,
          role: guestRole,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to add guest');
      }

      const newGuest: Guest = await res.json();
      setGuests((prev) => [newGuest, ...prev]);
      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');
      setGuestRole('guest');
      setIsAddModalOpen(false);
      showToast(`Added ${newGuest.name} to the guest dossier (${newGuest.role.toUpperCase()}).`);
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Error adding guest');
    } finally {
      setIsSubmittingGuest(false);
    }
  };

  // Open Edit Modal for Guest
  const handleOpenEditModal = (guest: Guest) => {
    setEditingGuest(guest);
    setEditPhone(guest.phone || '');
    setEditRole(guest.role || 'guest');
    setEditModalError('');
  };

  // Update Guest Handler
  const handleUpdateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuest || !weddingId) return;
    setEditModalError('');

    setIsSubmittingEdit(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/weddings/${weddingId}/guests/${editingGuest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          phone: editPhone.trim() || null,
          role: editRole,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to update guest details');
      }

      const updatedGuest: Guest = await res.json();
      setGuests((prev) => prev.map((g) => (g.id === updatedGuest.id ? updatedGuest : g)));
      setEditingGuest(null);
      showToast(`Updated profile & role for ${updatedGuest.name}.`);
    } catch (err: unknown) {
      setEditModalError(err instanceof Error ? err.message : 'Error updating guest');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Send Invitation Handler
  const handleSendInvitation = async (guest: Guest) => {
    setSendingGuestId(guest.id);
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

      await res.json();
      showToast(`Digital invitation sent to ${guest.name} (${guest.email}) via Resend.`);

      // Update guest status locally
      setGuests((prev) =>
        prev.map((g) => (g.id === guest.id ? { ...g, invitationStatus: 'sent' } : g))
      );
      fetchData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error sending invitation', 'error');
    } finally {
      setSendingGuestId(null);
    }
  };

  // Resend Invitation Handler
  const handleResend = async (invitationId: string, guestName: string) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/weddings/${weddingId}/invitations/${invitationId}/resend`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );
      if (!res.ok) throw new Error('Failed to re-issue invitation');
      showToast(`Re-issued and sent fresh invitation link to ${guestName}.`);
      fetchData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error resending invitation', 'error');
    }
  };

  // Revoke Invitation Handler
  const handleRevoke = async (invitationId: string, guestName: string) => {
    if (!confirm(`Are you sure you wish to revoke ${guestName}'s invitation access?`)) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/weddings/${weddingId}/invitations/${invitationId}/revoke`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );
      if (!res.ok) throw new Error('Failed to revoke invitation');
      showToast(`Revoked invitation access for ${guestName}.`);
      fetchData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error revoking invitation', 'error');
    }
  };

  // Open reminder modal for single guest
  const handleOpenReminderModal = (guest: Guest) => {
    setReminderTargetGuest(guest);
    setReminderType('rsvp_reminder');
    setReminderCustomMessage(
      'We are finalizing our guest arrangements and catering provisions. Please kindly take a moment to confirm your attendance.'
    );
    setReminderModalError('');
    setIsReminderModalOpen(true);
  };

  // Open reminder modal for all unresponded guests (batch)
  const handleOpenBatchReminderModal = () => {
    const unrespondedGuests = guests.filter((g) => g.invitationStatus === 'sent' || g.invitationStatus === 'delivered');
    if (unrespondedGuests.length === 0) {
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

  // Submit Reminder Handler (either single guest or batch)
  const handleSendReminderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReminderModalError('');

    let targetIds: string[] = [];
    if (reminderTargetGuest) {
      targetIds = [reminderTargetGuest.id];
    } else {
      const eligible = guests.filter((g) => g.invitationStatus === 'sent' || g.invitationStatus === 'delivered');
      targetIds = eligible.map((g) => g.id);
    }

    if (targetIds.length === 0) {
      setReminderModalError('No eligible recipients found.');
      return;
    }

    setIsSubmittingReminder(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/weddings/${weddingId}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          guestIds: targetIds,
          type: reminderType,
          eventName: reminderType === 'event_reminder' ? reminderEventName : undefined,
          message: reminderCustomMessage.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to dispatch reminders');
      }

      const data = await res.json();
      showToast(data.message || 'Reminder email dispatched successfully.');
      setIsReminderModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      setReminderModalError(err instanceof Error ? err.message : 'Error sending reminders');
    } finally {
      setIsSubmittingReminder(false);
    }
  };

  // Filtered Guests
  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const matchesSearch =
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || g.invitationStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [guests, searchQuery, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = guests.length;
    const sent = guests.filter((g) => g.invitationStatus === 'sent' || g.invitationStatus === 'delivered').length;
    const pending = guests.filter((g) => g.invitationStatus === 'pending').length;
    const revoked = guests.filter((g) => g.invitationStatus === 'revoked').length;
    return { total, sent, pending, revoked };
  }, [guests]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-brand-surface flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-burgundy/30 border-t-brand-burgundy animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E1A18] selection:bg-[#E5D5B8] selection:text-[#4A121A] flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-xs font-semibold tracking-wide border transition-all animate-bounce-subtle ${
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

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#C5A059]/20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          {/* Brand Crest */}
          <Link href="/" className="inline-flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-full border border-[#C5A059]/40 flex items-center justify-center bg-white shadow-sm ring-4 ring-[#C5A059]/10 transition-transform group-hover:scale-105">
              <span className="font-serif text-base font-semibold text-[#4A121A] italic">MMM</span>
            </div>
            <div className="flex flex-col">
              <span className="font-cinzel text-sm sm:text-base tracking-[0.22em] text-[#1E1A18] font-semibold uppercase leading-tight">
                Make My Marriage
              </span>
              <span className="text-[9px] uppercase tracking-[0.28em] text-[#B38E46] font-medium">
                Concierge Invitations
              </span>
            </div>
          </Link>

          {/* Header Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/onboarding"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAF7F2] hover:bg-[#F1EBE0] text-[#756D67] hover:text-[#4A121A] text-xs font-semibold uppercase tracking-wider border border-[#C5A059]/20 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px] text-[#C5A059]">tune</span>
              <span>Wedding Setup</span>
            </Link>

            {/* User Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#C5A059]/20 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="max-w-[120px] truncate text-[#4A121A] font-medium">
                {user?.name || user?.email?.split('@')[0]}
              </span>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#4A121A] hover:bg-[#6B1D27] text-[#FFFDF9] text-xs font-semibold uppercase tracking-wider border border-[#C5A059]/40 transition-all shadow-xs disabled:opacity-60"
              title="Sign out of Atelier session"
            >
              {isLoggingOut ? (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
              ) : (
                <span className="material-symbols-outlined text-[16px]">logout</span>
              )}
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 flex-1 w-full">
        {/* Editorial Headline & Action Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-[#C5A059]/15 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7F3EB] border border-[#C5A059]/30 text-[#745b1a] text-xs uppercase tracking-widest font-semibold mb-3">
              <span className="material-symbols-outlined text-[16px] text-[#C5A059]">mark_email_unread</span>
              <span>Resend Email Dispatcher</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1E1A18] tracking-tight">
              Guest Management & Digital Invitations
            </h1>
            <p className="text-sm text-[#756D67] mt-1 max-w-2xl leading-relaxed">
              Curate your distinguished guest roster, dispatch personalized Haute Atelier wedding invitations via Resend, and track real-time delivery status and RSVP links.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Single Unified Send Reminders Button (Opens modal to review and send to all) */}
            <button
              type="button"
              onClick={handleOpenBatchReminderModal}
              disabled={stats.sent === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#FAF7F2] hover:bg-[#F1EBE0] text-[#4A121A] text-xs font-semibold uppercase tracking-wider border border-[#C5A059]/30 transition-all shadow-xs disabled:opacity-50"
              title="Send reminder emails to all guests awaiting RSVP response"
            >
              <span className="material-symbols-outlined text-[18px] text-[#C5A059]">notifications_active</span>
              <span>Send Reminders ({stats.sent})</span>
            </button>

            {/* Add Guest Button */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#4A121A] to-[#6B1D27] text-[#FFFDF9] text-xs font-semibold uppercase tracking-wider border border-[#C5A059]/40 hover:shadow-md transition-all ring-4 ring-[#4A121A]/10"
            >
              <span className="material-symbols-outlined text-[18px] text-[#E5C378]">person_add</span>
              <span>Add Distinguished Guest</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#C5A059]/20 shadow-xs">
            <span className="text-[10px] uppercase tracking-widest text-[#756D67] font-semibold">Total Roster</span>
            <div className="font-serif text-3xl font-semibold text-[#1E1A18] mt-1">{stats.total}</div>
            <span className="text-[11px] text-[#B38E46] mt-1 block">Registered attendees</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#C5A059]/20 shadow-xs">
            <span className="text-[10px] uppercase tracking-widest text-emerald-700 font-semibold">Invitations Dispatched</span>
            <div className="font-serif text-3xl font-semibold text-emerald-800 mt-1">{stats.sent}</div>
            <span className="text-[11px] text-stone-500 mt-1 block">Sent via Resend</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#C5A059]/20 shadow-xs">
            <span className="text-[10px] uppercase tracking-widest text-amber-700 font-semibold">Awaiting Dispatch</span>
            <div className="font-serif text-3xl font-semibold text-amber-800 mt-1">{stats.pending}</div>
            <span className="text-[11px] text-stone-500 mt-1 block">Ready for invitation email</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#C5A059]/20 shadow-xs">
            <span className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Revoked / Inactive</span>
            <div className="font-serif text-3xl font-semibold text-stone-600 mt-1">{stats.revoked}</div>
            <span className="text-[11px] text-stone-400 mt-1 block">Invalidated tokens</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#C5A059]/20 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by guest name or email..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#FAF7F2] border border-[#C5A059]/20 focus:border-[#C5A059] focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['all', 'pending', 'sent', 'revoked'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-[#4A121A] text-[#FFFDF9] shadow-xs'
                    : 'bg-[#FAF7F2] text-[#756D67] hover:text-[#4A121A] border border-[#C5A059]/15'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Guests Table */}
        <div className="rounded-2xl bg-[#FFFDF9] border border-[#C5A059]/20 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 rounded-full border-2 border-[#4A121A]/30 border-t-[#4A121A] animate-spin mb-3"></div>
              <p className="text-xs text-[#756D67] uppercase tracking-widest font-semibold">
                Accessing Atelier Guest Dossier...
              </p>
            </div>
          ) : filteredGuests.length === 0 ? (
            <div className="py-20 px-4 text-center">
              <div className="w-14 h-14 rounded-full bg-[#F7F3EB] border border-[#C5A059]/30 flex items-center justify-center mx-auto mb-4 text-[#C5A059]">
                <span className="material-symbols-outlined text-[28px]">group</span>
              </div>
              <h3 className="font-serif text-xl text-[#1E1A18] mb-1">No Guests Found</h3>
              <p className="text-xs text-[#756D67] max-w-sm mx-auto mb-5 leading-relaxed">
                {searchQuery || statusFilter !== 'all'
                  ? 'No guest matches your current search filters.'
                  : 'Your guest list is currently empty. Add your distinguished attendees to dispatch invitation links.'}
              </p>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4A121A] text-[#FFFDF9] text-xs font-semibold uppercase tracking-wider border border-[#C5A059]/40 shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                <span>Add First Guest</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#C5A059]/20 text-[#756D67] uppercase tracking-wider text-[10px]">
                    <th className="py-4 px-6 font-semibold">Guest</th>
                    <th className="py-4 px-6 font-semibold">Contact / Email</th>
                    <th className="py-4 px-6 font-semibold">Phone</th>
                    <th className="py-4 px-6 font-semibold">Role</th>
                    <th className="py-4 px-6 font-semibold">Invitation Status</th>
                    <th className="py-4 px-6 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C5A059]/10">
                  {filteredGuests.map((guest) => {
                    const activeInv = invitations.find((i) => i.guestId === guest.id && !i.revokedAt);
                    const isSending = sendingGuestId === guest.id;

                    return (
                      <tr key={guest.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                        {/* Guest Name & Avatar */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#4A121A] text-[#FFFDF9] flex items-center justify-center font-bold text-[11px] shadow-xs">
                              {guest.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-[#1E1A18] text-sm">{guest.name}</span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-4 px-6 text-[#574F4A] font-mono text-[11px]">
                          {guest.email}
                        </td>

                        {/* Phone */}
                        <td className="py-4 px-6 text-[#756D67]">
                          {guest.phone || '—'}
                        </td>

                        {/* Role Badge */}
                        <td className="py-4 px-6">
                          {guest.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF0D9] text-[#7E570A] border border-[#E5C378]/60 font-semibold text-[10px] uppercase tracking-wider">
                              <span className="material-symbols-outlined text-[13px] text-[#C5A059]">shield_person</span>
                              <span>Admin</span>
                            </span>
                          ) : guest.role === 'manager' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#5C1824]/10 text-[#5C1824] border border-[#5C1824]/30 font-semibold text-[10px] uppercase tracking-wider">
                              <span className="material-symbols-outlined text-[13px]">manage_accounts</span>
                              <span>Manager</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#756D67] border border-[#C5A059]/20 font-semibold text-[10px] uppercase tracking-wider">
                              <span className="material-symbols-outlined text-[13px] text-stone-400">person</span>
                              <span>Guest</span>
                            </span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1 items-start">
                            {guest.invitationStatus === 'sent' || guest.invitationStatus === 'delivered' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[10px] uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span>Dispatched</span>
                              </span>
                            ) : guest.invitationStatus === 'revoked' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-600 border border-stone-300 font-semibold text-[10px] uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                                <span>Revoked</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-[10px] uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                <span>Pending Send</span>
                              </span>
                            )}

                            {guest.rsvpStatus === 'yes' && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold">
                                <span className="material-symbols-outlined text-[13px]">check_circle</span>
                                <span>Attending</span>
                              </span>
                            )}
                            {guest.rsvpStatus === 'no' && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-stone-500 font-semibold">
                                <span className="material-symbols-outlined text-[13px]">cancel</span>
                                <span>Declined</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Edit Role & Phone Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(guest)}
                              className="p-1.5 rounded-full text-[#756D67] hover:text-[#4A121A] hover:bg-[#FAF7F2] border border-transparent hover:border-[#C5A059]/30 transition-colors"
                              title="Edit guest profile & role"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>

                            {guest.invitationStatus === 'sent' || guest.invitationStatus === 'delivered' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenReminderModal(guest)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#FAF0D9]/70 hover:bg-[#FAF0D9] text-[#7E570A] border border-[#E5C378]/50 text-[10px] font-semibold uppercase tracking-wider transition-colors shadow-2xs"
                                  title="Send custom or RSVP reminder email to this guest"
                                >
                                  <span className="material-symbols-outlined text-[13px] text-[#C5A059]">notifications_active</span>
                                  <span>Remind</span>
                                </button>
                                {activeInv && (
                                  <button
                                    type="button"
                                    onClick={() => handleResend(activeInv.id, guest.name)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FAF7F2] hover:bg-[#F1EBE0] text-[#4A121A] border border-[#C5A059]/30 text-[10px] font-semibold uppercase tracking-wider transition-colors shadow-2xs"
                                    title="Send another invitation email"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">forward_to_inbox</span>
                                    <span>Resend</span>
                                  </button>
                                )}
                                {activeInv && (
                                  <button
                                    type="button"
                                    onClick={() => handleRevoke(activeInv.id, guest.name)}
                                    className="p-1.5 rounded-full text-stone-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                                    title="Revoke access link"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">link_off</span>
                                  </button>
                                )}
                              </>
                            ) : (
                              <button
                                type="button"
                                disabled={isSending}
                                onClick={() => handleSendInvitation(guest)}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#4A121A] to-[#6B1D27] text-[#FFFDF9] text-[11px] font-semibold uppercase tracking-wider border border-[#C5A059]/40 hover:shadow-xs transition-all disabled:opacity-60"
                              >
                                {isSending ? (
                                  <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                  <span className="material-symbols-outlined text-[15px] text-[#E5C378]">send</span>
                                )}
                                <span>Send Invitation</span>
                              </button>
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
      </main>

      {/* Add Guest Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="max-w-md w-full bg-[#FFFDF9] rounded-2xl border border-[#C5A059]/30 shadow-2xl p-6 sm:p-8 relative">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#C5A059]/15">
              <div>
                <h3 className="font-serif text-2xl text-[#1E1A18]">Register Guest</h3>
                <p className="text-xs text-[#756D67] mt-1">Add attendee to wedding invitation directory</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full text-stone-400 hover:text-stone-700 hover:bg-[#FAF7F2] flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-red-500">error</span>
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleAddGuest} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#756D67] font-semibold mb-1">
                  Guest Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Lord Julian Sterling"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF7F2] border border-[#C5A059]/30 focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#756D67] font-semibold mb-1">
                  Email Address (For Resend Invitation) *
                </label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="e.g. julian.sterling@example.com"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF7F2] border border-[#C5A059]/30 focus:border-[#C5A059] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#756D67] font-semibold mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="e.g. +44 7911 123456"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF7F2] border border-[#C5A059]/30 focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#756D67] font-semibold mb-1.5">
                  Assigned Role & Privileges
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['guest', 'manager', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setGuestRole(r)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border text-center ${
                        guestRole === r
                          ? 'bg-[#4A121A] text-[#FFFDF9] border-[#4A121A] shadow-xs'
                          : 'bg-[#FAF7F2] text-[#756D67] border-[#C5A059]/20 hover:border-[#C5A059]/50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[#756D67] mt-1.5 leading-relaxed">
                  {guestRole === 'admin'
                    ? 'Admins have full curation control over wedding details, invitations, and guest list.'
                    : guestRole === 'manager'
                    ? 'Managers can manage guest lists and oversee seating without financial/ownership settings.'
                    : 'Standard wedding guest with access to personalized digital invite & RSVP.'}
                </p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#C5A059]/15">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#756D67] font-semibold hover:text-[#1E1A18]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingGuest}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4A121A] text-[#FFFDF9] text-xs font-semibold uppercase tracking-wider border border-[#C5A059]/40 shadow-xs hover:bg-[#6B1D27] disabled:opacity-60 transition-all"
                >
                  {isSubmittingGuest ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px] text-[#E5C378]">save</span>
                  )}
                  <span>Save Guest</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Guest Profile & Role Modal */}
      {editingGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="max-w-md w-full bg-[#FFFDF9] rounded-2xl border border-[#C5A059]/30 shadow-2xl p-6 sm:p-8 relative">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#C5A059]/15">
              <div>
                <h3 className="font-serif text-2xl text-[#1E1A18]">Edit Guest Details</h3>
                <p className="text-xs text-[#756D67] mt-1">Update phone number and elevate/modify roles</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingGuest(null)}
                className="w-8 h-8 rounded-full text-stone-400 hover:text-stone-700 hover:bg-[#FAF7F2] flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {editModalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-red-500">error</span>
                <span>{editModalError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateGuest} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#756D67] font-semibold mb-1">
                  Guest Name (Identifier)
                </label>
                <input
                  type="text"
                  disabled
                  value={editingGuest.name}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF7F2]/60 border border-[#C5A059]/15 text-[#574F4A] cursor-not-allowed font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#756D67] font-semibold mb-1">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={editingGuest.email}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF7F2]/60 border border-[#C5A059]/15 text-[#574F4A] cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#756D67] font-semibold mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="e.g. +44 7911 123456"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF7F2] border border-[#C5A059]/30 focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#756D67] font-semibold mb-1.5">
                  Assigned Role & Privileges
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['guest', 'manager', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setEditRole(r)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border text-center ${
                        editRole === r
                          ? 'bg-[#4A121A] text-[#FFFDF9] border-[#4A121A] shadow-xs'
                          : 'bg-[#FAF7F2] text-[#756D67] border-[#C5A059]/20 hover:border-[#C5A059]/50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[#756D67] mt-1.5 leading-relaxed">
                  Changing roles will automatically synchronize access permissions if this guest has registered or registers their account.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#C5A059]/15">
                <button
                  type="button"
                  onClick={() => setEditingGuest(null)}
                  className="px-4 py-2 text-xs text-[#756D67] font-semibold hover:text-[#1E1A18]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4A121A] text-[#FFFDF9] text-xs font-semibold uppercase tracking-wider border border-[#C5A059]/40 shadow-xs hover:bg-[#6B1D27] disabled:opacity-60 transition-all"
                >
                  {isSubmittingEdit ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px] text-[#E5C378]">check</span>
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispatch Reminder Modal (Single or Batch) */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="max-w-md w-full bg-[#FFFDF9] rounded-2xl border border-[#C5A059]/30 shadow-2xl p-6 sm:p-8 relative">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#C5A059]/15">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F7F3EB] border border-[#C5A059]/30 text-[#745b1a] text-[10px] uppercase tracking-wider font-semibold mb-2">
                  <span className="material-symbols-outlined text-[14px] text-[#C5A059]">notifications_active</span>
                  <span>{reminderTargetGuest ? 'Individual Reminder' : 'Batch Reminders'}</span>
                </div>
                <h3 className="font-serif text-2xl text-[#1E1A18]">
                  {reminderTargetGuest ? `Remind ${reminderTargetGuest.name}` : 'Dispatch RSVP Reminders'}
                </h3>
                <p className="text-xs text-[#756D67] mt-1">
                  {reminderTargetGuest
                    ? `Recipient: ${reminderTargetGuest.email}`
                    : `Dispatches to all ${stats.sent} attendees awaiting their RSVP response.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReminderModalOpen(false)}
                className="w-8 h-8 rounded-full text-stone-400 hover:text-stone-700 hover:bg-[#FAF7F2] flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {reminderModalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-red-500">error</span>
                <span>{reminderModalError}</span>
              </div>
            )}

            <form onSubmit={handleSendReminderSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#756D67] font-semibold mb-1.5">
                  Reminder Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReminderType('rsvp_reminder');
                      setReminderCustomMessage(
                        'We are finalizing our guest arrangements and catering provisions. Please kindly take a moment to confirm your attendance.'
                      );
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border text-center ${
                      reminderType === 'rsvp_reminder'
                        ? 'bg-[#4A121A] text-[#FFFDF9] border-[#4A121A] shadow-xs'
                        : 'bg-[#FAF7F2] text-[#756D67] border-[#C5A059]/20 hover:border-[#C5A059]/50'
                    }`}
                  >
                    RSVP Response
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReminderType('event_reminder');
                      setReminderCustomMessage(
                        `We are looking forward to celebrating the ${reminderEventName} with you! Please view the portal for venue directions and schedule timings.`
                      );
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border text-center ${
                      reminderType === 'event_reminder'
                        ? 'bg-[#4A121A] text-[#FFFDF9] border-[#4A121A] shadow-xs'
                        : 'bg-[#FAF7F2] text-[#756D67] border-[#C5A059]/20 hover:border-[#C5A059]/50'
                    }`}
                  >
                    Upcoming Event
                  </button>
                </div>
              </div>

              {/* Event Selector Dropdown when Upcoming Event is selected */}
              {reminderType === 'event_reminder' && (
                <div className="animate-fade-in p-3 rounded-xl bg-[#F7F3EB] border border-[#C5A059]/30">
                  <label className="block text-[11px] uppercase tracking-wider text-[#745b1a] font-semibold mb-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-[#C5A059]">event</span>
                    <span>Select Specific Celebration / Event *</span>
                  </label>
                  <select
                    value={reminderEventName}
                    onChange={(e) => {
                      const selected = e.target.value;
                      setReminderEventName(selected);
                      setReminderCustomMessage(
                        `We are looking forward to celebrating the ${selected} with you! Please view the portal for venue directions and schedule timings.`
                      );
                    }}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FFFDF9] border border-[#C5A059]/30 text-[#1E1A18] font-medium focus:border-[#C5A059] focus:outline-none"
                  >
                    <option value="Ceremony & Reception">Ceremony & Reception</option>
                    <option value="Sangeet Night">Sangeet Night</option>
                    <option value="Mehendi Soirée">Mehendi Soirée</option>
                    <option value="Haldi Ceremony">Haldi Ceremony</option>
                    <option value="Cocktail & Welcome Dinner">Cocktail & Welcome Dinner</option>
                    <option value="Farewell Brunch">Farewell Brunch</option>
                  </select>
                  <p className="text-[10px] text-[#756D67] mt-1.5">
                    The reminder subject and greeting will specifically mention <strong>{reminderEventName}</strong>.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#756D67] font-semibold mb-1">
                  Custom Courteous Note (Optional)
                </label>
                <textarea
                  rows={3}
                  value={reminderCustomMessage}
                  onChange={(e) => setReminderCustomMessage(e.target.value)}
                  placeholder="Enter a custom message to be included in the reminder email..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#FAF7F2] border border-[#C5A059]/30 focus:border-[#C5A059] focus:outline-none resize-none leading-relaxed"
                />
                <p className="text-[10px] text-[#756D67] mt-1">
                  The email will include the official Haute Atelier wedding portal link and RSVP button.
                </p>
              </div>

              {reminderTargetGuest && reminderTargetGuest.reminderCount !== undefined && reminderTargetGuest.reminderCount > 0 && (
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-amber-600">info</span>
                  <span>
                    This guest was previously sent <strong>{reminderTargetGuest.reminderCount} reminder(s)</strong>.
                  </span>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#C5A059]/15">
                <button
                  type="button"
                  onClick={() => setIsReminderModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#756D67] font-semibold hover:text-[#1E1A18]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReminder}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4A121A] text-[#FFFDF9] text-xs font-semibold uppercase tracking-wider border border-[#C5A059]/40 shadow-xs hover:bg-[#6B1D27] disabled:opacity-60 transition-all"
                >
                  {isSubmittingReminder ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px] text-[#E5C378]">send</span>
                  )}
                  <span>
                    {reminderTargetGuest ? 'Dispatch Reminder' : `Dispatch to All (${stats.sent})`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
