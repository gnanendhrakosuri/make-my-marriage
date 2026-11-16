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
  invitationStatus: string;
  rsvpStatus?: string | null;
  lastRemindedAt?: string | null;
  reminderCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface GuestManagementTabProps {
  onGuestsUpdated?: (guests: Guest[]) => void;
  onNavigateToInvitations?: () => void;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function GuestManagementTab({
  onGuestsUpdated,
  onNavigateToInvitations,
}: GuestManagementTabProps) {
  const { user } = useAuth();

  const weddingId = useMemo(() => {
    return user?.weddingId || '670000000000000000000001';
  }, [user]);

  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'guest' | 'manager' | 'admin'>('all');

  // Modal State for adding a guest
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestRole, setGuestRole] = useState<'guest' | 'manager' | 'admin'>('guest');
  const [isSubmittingGuest, setIsSubmittingGuest] = useState(false);
  const [modalError, setModalError] = useState('');

  // Modal State for editing a guest (name, phone, role)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<'guest' | 'manager' | 'admin'>('guest');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editModalError, setEditModalError] = useState('');

  // Delete Guest State
  const [deletingGuestId, setDeletingGuestId] = useState<string | null>(null);

  // Toast / Status Message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4500);
  }, []);

  // Fetch guests list
  const fetchGuests = useCallback(async () => {
    if (!weddingId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/weddings/${weddingId}/guests`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const loaded = Array.isArray(data) ? data : data.guests || [];
        setGuests(loaded);
      }
    } catch {
      showToast('Unable to load guest directory.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [weddingId, showToast]);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  // Derived statistics for Guest Management
  const stats = useMemo(() => {
    const total = guests.length;
    const managers = guests.filter((g) => g.role === 'manager' || g.role === 'admin').length;
    const attendees = guests.filter((g) => g.role === 'guest').length;
    const withPhone = guests.filter((g) => g.phone && g.phone.trim().length > 0).length;
    return { total, managers, attendees, withPhone };
  }, [guests]);

  // Filtered guest directory
  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        g.name.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        (g.phone && g.phone.toLowerCase().includes(q));

      if (!matchesSearch) return false;
      if (roleFilter !== 'all' && g.role !== roleFilter) return false;

      return true;
    });
  }, [guests, searchQuery, roleFilter]);

  // Add Guest Handler
  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weddingId) return;
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
      const nextGuests = [newGuest, ...guests];
      setGuests(nextGuests);
      if (onGuestsUpdated) {
        setTimeout(() => onGuestsUpdated(nextGuests), 0);
      }
      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');
      setGuestRole('guest');
      setIsAddModalOpen(false);
      showToast(`Added ${newGuest.name} to the wedding guest roster (${newGuest.role.toUpperCase()}).`);
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Error adding guest');
    } finally {
      setIsSubmittingGuest(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (guest: Guest) => {
    setEditingGuest(guest);
    setEditName(guest.name || '');
    setEditPhone(guest.phone || '');
    setEditRole(guest.role || 'guest');
    setEditModalError('');
  };

  // Update Guest Profile
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
          name: editName.trim() || undefined,
          phone: editPhone.trim() || null,
          role: editRole,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to update guest details');
      }

      const updatedGuest: Guest = await res.json();
      const nextGuests = guests.map((g) => (g.id === updatedGuest.id ? updatedGuest : g));
      setGuests(nextGuests);
      if (onGuestsUpdated) {
        setTimeout(() => onGuestsUpdated(nextGuests), 0);
      }
      setEditingGuest(null);
      showToast(`Updated directory record for ${updatedGuest.name}.`);
    } catch (err: unknown) {
      setEditModalError(err instanceof Error ? err.message : 'Error updating guest');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Delete Guest
  const handleDeleteGuest = async (guest: Guest) => {
    if (!confirm(`Are you sure you want to remove ${guest.name} from the wedding guest list? All associated invitations and RSVP data will also be deleted.`)) return;

    setDeletingGuestId(guest.id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/weddings/${weddingId}/guests/${guest.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to remove guest');
      }

      const nextGuests = guests.filter((g) => g.id !== guest.id);
      setGuests(nextGuests);
      if (onGuestsUpdated) {
        setTimeout(() => onGuestsUpdated(nextGuests), 0);
      }
      showToast(`Removed ${guest.name} from the guest directory.`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error removing guest', 'error');
    } finally {
      setDeletingGuestId(null);
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
            {toastType === 'success' ? 'group' : 'error'}
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-[#C5A059]/15 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7F3EB] border border-[#C5A059]/30 text-[#745b1a] text-xs uppercase tracking-widest font-semibold mb-3">
            <span className="material-symbols-outlined text-[16px] text-[#C5A059]">contacts</span>
            <span>Attendee Directory & Role Governance</span>
          </div>
          <h1 className="font-headline-md text-headline-md text-[#1E1A18] tracking-tight">
            Guest Management Dossier
          </h1>
          <p className="font-body-sm text-body-sm text-[#756D67] mt-1 max-w-2xl leading-relaxed">
            Curate your distinguished wedding roster, manage attendee contact profiles (phone & email), assign concierge management privileges, and organize your guest party.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onNavigateToInvitations && (
            <button
              type="button"
              onClick={onNavigateToInvitations}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#FAF7F2] hover:bg-[#F1EBE0] text-[#4A121A] font-label-md text-label-md font-semibold uppercase tracking-wider border border-[#C5A059]/30 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px] text-[#C5A059]">mark_email_read</span>
              <span>Open Invitations & RSVP</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#4A121A] to-[#6B1D27] text-[#FFFDF9] font-label-md text-label-md font-semibold uppercase tracking-wider border border-[#C5A059]/40 hover:shadow-md transition-all ring-4 ring-[#4A121A]/10"
          >
            <span className="material-symbols-outlined text-[18px] text-[#E5C378]">person_add</span>
            <span>Add New Guest</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid - Focused on Guest Directory Roster */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-ivory-surface border border-[#C5A059]/20 shadow-xs">
          <span className="font-label-sm text-[10px] uppercase tracking-widest text-[#756D67] font-semibold">Total Guests Registered</span>
          <div className="font-headline-md text-3xl font-semibold text-[#1E1A18] mt-1">{stats.total}</div>
          <span className="font-label-sm text-[11px] text-[#B38E46] mt-1 block">Full guest directory count</span>
        </div>

        <div className="p-5 rounded-2xl bg-ivory-surface border border-[#C5A059]/20 shadow-xs">
          <span className="font-label-sm text-[10px] uppercase tracking-widest text-emerald-700 font-semibold">Distinguished Guests</span>
          <div className="font-headline-md text-3xl font-semibold text-emerald-800 mt-1">{stats.attendees}</div>
          <span className="font-label-sm text-[11px] text-stone-500 mt-1 block">Standard attendee party</span>
        </div>

        <div className="p-5 rounded-2xl bg-ivory-surface border border-[#C5A059]/20 shadow-xs">
          <span className="font-label-sm text-[10px] uppercase tracking-widest text-amber-700 font-semibold">Concierge & Managers</span>
          <div className="font-headline-md text-3xl font-semibold text-amber-800 mt-1">{stats.managers}</div>
          <span className="font-label-sm text-[11px] text-stone-500 mt-1 block">Elevated management privileges</span>
        </div>

        <div className="p-5 rounded-2xl bg-ivory-surface border border-[#C5A059]/20 shadow-xs">
          <span className="font-label-sm text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Contact Completeness</span>
          <div className="font-headline-md text-3xl font-semibold text-stone-700 mt-1">
            {stats.total > 0 ? Math.round((stats.withPhone / stats.total) * 100) : 0}%
          </div>
          <span className="font-label-sm text-[11px] text-stone-400 mt-1 block">
            {stats.withPhone} of {stats.total} phone numbers saved
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
            placeholder="Search roster by name, email, phone..."
            className="w-full pl-10 pr-4 py-2 font-body-sm text-xs rounded-xl bg-[#FAF7F2] border border-[#C5A059]/20 focus:border-[#C5A059] focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'all', label: 'All Roles' },
              { id: 'guest', label: 'Guests Only' },
              { id: 'manager', label: 'Managers' },
              { id: 'admin', label: 'Admins' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-full font-label-sm text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                roleFilter === tab.id
                  ? 'bg-[#4A121A] text-[#FFFDF9] shadow-xs'
                  : 'bg-[#FAF7F2] text-[#756D67] hover:text-[#4A121A] border border-[#C5A059]/15'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Guest Directory Roster Table */}
      <div className="rounded-2xl bg-ivory-surface border border-[#C5A059]/20 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#4A121A]/30 border-t-[#4A121A] animate-spin mb-3"></div>
            <p className="font-label-sm text-xs text-[#756D67] uppercase tracking-widest font-semibold">
              Opening Atelier Guest Directory...
            </p>
          </div>
        ) : filteredGuests.length === 0 ? (
          <div className="py-20 px-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#F7F3EB] border border-[#C5A059]/30 flex items-center justify-center mx-auto mb-4 text-[#C5A059]">
              <span className="material-symbols-outlined text-[28px]">group</span>
            </div>
            <h3 className="font-headline-sm text-xl text-[#1E1A18] mb-1">No Guests Found</h3>
            <p className="font-body-sm text-xs text-[#756D67] max-w-sm mx-auto mb-5 leading-relaxed">
              {searchQuery || roleFilter !== 'all'
                ? 'No guest matches your selected search criteria.'
                : 'Your guest roster is currently empty. Add your distinguished guests to begin managing attendee party records.'}
            </p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4A121A] text-[#FFFDF9] font-label-md text-xs font-semibold uppercase tracking-wider border border-[#C5A059]/40 shadow-xs"
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
                  <th className="py-4 px-6 font-semibold">Guest Name</th>
                  <th className="py-4 px-6 font-semibold">Email Contact</th>
                  <th className="py-4 px-6 font-semibold">Phone Number</th>
                  <th className="py-4 px-6 font-semibold">Account Role</th>
                  <th className="py-4 px-6 font-semibold">Added On</th>
                  <th className="py-4 px-6 font-semibold text-right">Roster Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C5A059]/10">
                {filteredGuests.map((guest) => {
                  const isDeleting = deletingGuestId === guest.id;
                  const dateStr = guest.createdAt
                    ? new Date(guest.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—';

                  return (
                    <tr key={guest.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-4 px-6 font-medium text-[#1E1A18]">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-[#F7F3EB] border border-[#C5A059]/30 text-[#4A121A] flex items-center justify-center font-bold text-xs">
                            {guest.name.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <span className="font-semibold text-sm block leading-tight">{guest.name}</span>
                            <span className="text-[10px] text-stone-400">ID: {guest.id.slice(-6)}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-[#756D67]">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span className="material-symbols-outlined text-[14px] text-stone-400">mail</span>
                          <span>{guest.email}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-[#756D67]">
                        {guest.phone ? (
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <span className="material-symbols-outlined text-[14px] text-stone-400">call</span>
                            <span>{guest.phone}</span>
                          </div>
                        ) : (
                          <span className="text-stone-400 italic">No phone entered</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        {guest.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 font-label-sm text-[10px] font-semibold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[12px] text-amber-700">shield</span>
                            Admin
                          </span>
                        ) : guest.role === 'manager' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#4A121A]/10 text-[#4A121A] border border-[#4A121A]/30 font-label-sm text-[10px] font-semibold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[12px] text-[#4A121A]">manage_accounts</span>
                            Manager
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-label-sm text-[10px] font-semibold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[12px] text-stone-500">person</span>
                            Guest
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-stone-500 text-[11px]">
                        {dateStr}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(guest)}
                            title="Edit guest profile and role"
                            className="p-2 rounded-lg text-stone-500 hover:text-[#4A121A] hover:bg-[#F7F3EB] transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteGuest(guest)}
                            disabled={isDeleting}
                            title="Remove guest from directory"
                            className="p-2 rounded-lg text-stone-400 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
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

      {/* Add Guest Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-[#FFFDF9] p-6 shadow-2xl border border-[#C5A059]/30 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 border-b border-[#C5A059]/20 pb-3">
              <div className="flex items-center gap-2 text-[#4A121A]">
                <span className="material-symbols-outlined text-[20px] text-[#C5A059]">person_add</span>
                <h3 className="font-headline-sm text-lg text-[#1E1A18]">Add Distinguished Guest</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleAddGuest} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#1E1A18] uppercase tracking-wider mb-1.5">
                  Guest Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g., Lord Alistair Harrington"
                  className="w-full px-3.5 py-2 font-body-sm text-xs rounded-xl bg-[#FAF7F2] border border-[#C5A059]/30 focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1E1A18] uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="e.g., alistair@harrington-estate.co.uk"
                  className="w-full px-3.5 py-2 font-body-sm text-xs rounded-xl bg-[#FAF7F2] border border-[#C5A059]/30 focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1E1A18] uppercase tracking-wider mb-1.5">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="e.g., +44 7911 123456"
                  className="w-full px-3.5 py-2 font-body-sm text-xs rounded-xl bg-[#FAF7F2] border border-[#C5A059]/30 focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1E1A18] uppercase tracking-wider mb-1.5">
                  Account Role &amp; Privileges
                </label>
                <select
                  value={guestRole}
                  onChange={(e) => setGuestRole(e.target.value as 'guest' | 'manager' | 'admin')}
                  className="w-full px-3.5 py-2 font-body-sm text-xs rounded-xl bg-[#FAF7F2] border border-[#C5A059]/30 focus:border-[#C5A059] focus:outline-none"
                >
                  <option value="guest">Guest — Private website &amp; RSVP access</option>
                  <option value="manager">Manager — Full concierge wedding management</option>
                  <option value="admin">Admin — Master system administration</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-full font-label-md text-xs font-semibold text-stone-500 hover:text-stone-800 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingGuest}
                  className="px-5 py-2 rounded-full bg-[#4A121A] text-[#FFFDF9] font-label-md text-xs font-semibold uppercase tracking-wider border border-[#C5A059]/40 hover:bg-[#6B1D27] transition-all disabled:opacity-50"
                >
                  {isSubmittingGuest ? 'Saving...' : 'Add to Roster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Guest Profile Modal */}
      {editingGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-[#FFFDF9] p-6 shadow-2xl border border-[#C5A059]/30 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 border-b border-[#C5A059]/20 pb-3">
              <div className="flex items-center gap-2 text-[#4A121A]">
                <span className="material-symbols-outlined text-[20px] text-[#C5A059]">edit_note</span>
                <h3 className="font-headline-sm text-lg text-[#1E1A18]">Edit Guest Record</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingGuest(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {editModalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
                {editModalError}
              </div>
            )}

            <form onSubmit={handleUpdateGuest} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#1E1A18] uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 font-body-sm text-xs rounded-xl bg-[#FAF7F2] border border-[#C5A059]/30 focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1E1A18] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={editingGuest.email}
                  className="w-full px-3.5 py-2 font-body-sm text-xs rounded-xl bg-stone-100 text-stone-500 border border-stone-200 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1E1A18] uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+44 7911 123456"
                  className="w-full px-3.5 py-2 font-body-sm text-xs rounded-xl bg-[#FAF7F2] border border-[#C5A059]/30 focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#1E1A18] uppercase tracking-wider mb-1.5">
                  Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as 'guest' | 'manager' | 'admin')}
                  className="w-full px-3.5 py-2 font-body-sm text-xs rounded-xl bg-[#FAF7F2] border border-[#C5A059]/30 focus:border-[#C5A059] focus:outline-none"
                >
                  <option value="guest">Guest</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingGuest(null)}
                  className="px-4 py-2 rounded-full font-label-md text-xs font-semibold text-stone-500 hover:text-stone-800 uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-5 py-2 rounded-full bg-[#4A121A] text-[#FFFDF9] font-label-md text-xs font-semibold uppercase tracking-wider border border-[#C5A059]/40 hover:bg-[#6B1D27] transition-all disabled:opacity-50"
                >
                  {isSubmittingEdit ? 'Saving...' : 'Update Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
