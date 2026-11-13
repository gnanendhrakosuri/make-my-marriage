'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/lib/constants';

interface WeddingEvent {
  id: string;
  title: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  dressCode?: string;
  isPublic?: boolean;
  statusBadge?: string;
  statusClass?: string;
  guestCount?: string;
  isPrimary?: boolean;
}

interface WeddingData {
  id: string;
  slug: string;
  siteTitle: string;
  coupleNames: string[];
  partnerOne?: string;
  partnerTwo?: string;
  weddingDate?: string;
  welcomeStory?: string;
  venueName?: string;
  venueAddress?: string;
  venueCity?: string;
  venueCountry?: string;
  events?: WeddingEvent[];
}

interface GuestItem {
  id: string;
  name: string;
  email: string;
  role: string;
  invitationStatus: string;
  rsvpStatus?: string | null;
}

interface TaskItem {
  id: string;
  title: string;
  description: string;
  tag: string;
  tagClass: string;
  completed: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Layout UI State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showConciergeModal, setShowConciergeModal] = useState(false);
  const [publishMessage, setPublishMessage] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Event Creation & Edit Modal State
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<WeddingEvent | null>(null);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('2025-10-24');
  const [newEventStartTime, setNewEventStartTime] = useState('18:00');
  const [newEventEndTime, setNewEventEndTime] = useState('21:00');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventDressCode, setNewEventDressCode] = useState('Couture Cocktail');
  const [newEventGuestCount, setNewEventGuestCount] = useState('All Invited Guests');
  const [newEventIsPrimary, setNewEventIsPrimary] = useState(false);

  // Local Events state (initialized with the Google Stitch couture Lake Como itinerary)
  const [events, setEvents] = useState<WeddingEvent[]>([
    {
      id: 'event-1',
      title: 'Welcome Sunset Aperitifs & Live Jazz',
      date: 'Oct 23',
      startTime: '18:30',
      location: 'Terrazza Bellagio',
      statusBadge: 'Confirmed',
      statusClass: 'bg-tertiary-fixed/40 text-on-tertiary-container',
      guestCount: '140 guests confirmed • Host: Villa Sommelier Marco',
      isPrimary: false,
    },
    {
      id: 'event-2',
      title: 'The Solemn Ceremony & Vows Exchange',
      date: 'Oct 24',
      startTime: '16:30',
      location: "Villa d'Este Mosaic Gardens",
      statusBadge: 'Main Event',
      statusClass: 'bg-primary-fixed/50 text-on-primary-fixed',
      guestCount: '210 guests • Officiant: Father Matteo • String Quartet',
      isPrimary: true,
    },
    {
      id: 'event-3',
      title: 'Black-Tie Gala Dinner & Afterparty',
      date: 'Oct 24',
      startTime: '19:30',
      location: 'The Grand Salone Regina',
      statusBadge: 'Catering Ready',
      statusClass: 'bg-tertiary-fixed/40 text-on-tertiary-container',
      guestCount: '5-course tasting menu • Midnight fireworks over Como',
      isPrimary: false,
    },
    {
      id: 'event-4',
      title: 'Farewell Recovery Brunch & Lake Cruise',
      date: 'Oct 25',
      startTime: '11:30',
      location: 'Riva Private Boat Dock',
      statusBadge: 'Transit Finalizing',
      statusClass: 'bg-surface-container text-stone-muted',
      guestCount: 'Four vintage Riva wooden boats reserved • 110 guests',
      isPrimary: false,
    },
  ]);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  // Wedding & Backend State
  const weddingId = useMemo(() => {
    return user?.weddingId || '670000000000000000000001';
  }, [user]);

  const [wedding, setWedding] = useState<WeddingData | null>(null);
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [, setIsLoading] = useState(true);

  // Task Management State
  const [isTaskInputOpen, setIsTaskInputOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: 'task-1',
      title: 'Finalize floral centerpiece mockups with Atelier Fleur Milano',
      description: 'Arrangements for 22 banquet tables, fragrant garden roses & olive branches',
      tag: 'Urgent • Due Tomorrow',
      tagClass: 'bg-secondary-fixed text-on-secondary-fixed',
      completed: false,
    },
    {
      id: 'task-2',
      title: 'Confirm chartered Riva vintage motorboats for Sunday Farewell Cruise',
      description: 'Contract deposit sign-off & guest embarkation passenger manifest',
      tag: 'Due in 3 Days',
      tagClass: 'bg-tertiary-fixed text-on-tertiary-container',
      completed: false,
    },
    {
      id: 'task-3',
      title: 'Final wine tasting selection & vintage pairing review',
      description: 'Sarah & Julian approved Barolo Riserva 2016; awaiting Franciacorta signoff',
      tag: 'Awaiting Couple',
      tagClass: 'bg-ivory-surface text-stone-muted',
      completed: false,
    },
    {
      id: 'task-4',
      title: "Reconcile dietary restrictions dossier for Villa d&apos;Este Executive Chef",
      description: '14 celiac guests, 8 strict vegan profiles, 2 severe shellfish allergies',
      tag: 'In Progress',
      tagClass: 'bg-primary-fixed/40 text-primary',
      completed: false,
    },
  ]);

  // Countdown timer state
  const [countdown, setCountdown] = useState({
    days: 142,
    hours: 14,
    minutes: 32,
    seconds: 45,
  });

  // Calculate live countdown to wedding date
  useEffect(() => {
    const targetDate = wedding?.weddingDate
      ? new Date(wedding.weddingDate).getTime()
      : new Date('2025-10-24T16:30:00Z').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown({ days, hours, minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [wedding]);

  // Fetch wedding details and guests from backend API
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        if (weddingId) {
          const [wedRes, guestsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/v1/weddings/${weddingId}`, { credentials: 'include' }),
            fetch(`${API_BASE_URL}/api/v1/weddings/${weddingId}/guests`, { credentials: 'include' }),
          ]);

          if (wedRes.ok) {
            const wedData = await wedRes.json();
            setWedding(wedData);
            if (wedData.events && wedData.events.length > 0) {
              setEvents((prev) => {
                const fetched: WeddingEvent[] = wedData.events.map((e: WeddingEvent, idx: number) => ({
                  id: e.id || `event-${idx}`,
                  title: e.title,
                  date: e.date || 'TBD',
                  startTime: e.startTime || 'TBD',
                  endTime: e.endTime,
                  location: e.location || 'Lake Como',
                  dressCode: e.dressCode,
                  statusBadge: 'Scheduled',
                  statusClass: 'bg-tertiary-fixed/40 text-on-tertiary-container',
                  guestCount: e.dressCode ? `Dress Code: ${e.dressCode}` : 'All Invited Guests',
                  isPrimary: idx === 1 || e.title.toLowerCase().includes('ceremony'),
                }));
                // Combine custom events with design defaults
                const existingIds = new Set(fetched.map((f) => f.title.toLowerCase()));
                const keptDefaults = prev.filter((p) => !existingIds.has(p.title.toLowerCase()));
                return [...fetched, ...keptDefaults];
              });
            }
          }
          if (guestsRes.ok) {
            const guestData = await guestsRes.json();
            setGuests(guestData.guests || []);
          }
        }
      } catch (err) {
        console.warn('Backend data load fallback to design defaults:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [weddingId]);

  // Toggle task completion
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  // Add task handler
  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      description: 'Custom task registered directly to the active wedding dossier',
      tag: 'New Item',
      tagClass: 'bg-primary-fixed/40 text-primary',
      completed: false,
    };
    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setIsTaskInputOpen(false);
    showToast('Task added to the dossier.');
  };

  // Open Add Event Modal
  const openAddEventModal = () => {
    setEditingEvent(null);
    setNewEventTitle('');
    setNewEventDate('2025-10-24');
    setNewEventStartTime('18:00');
    setNewEventEndTime('21:00');
    setNewEventLocation('');
    setNewEventDressCode('Couture Cocktail');
    setNewEventGuestCount('All Invited Guests');
    setNewEventIsPrimary(false);
    setShowAddEventModal(true);
  };

  // Open Edit Event Modal
  const openEditEventModal = (event: WeddingEvent) => {
    setEditingEvent(event);
    setNewEventTitle(event.title);
    setNewEventDate(event.date || '2025-10-24');
    setNewEventStartTime(event.startTime || '18:00');
    setNewEventEndTime(event.endTime || '21:00');
    setNewEventLocation(event.location || '');
    setNewEventDressCode(event.dressCode || 'Couture Cocktail');
    setNewEventGuestCount(event.guestCount || 'All Invited Guests');
    setNewEventIsPrimary(!!event.isPrimary);
    setShowAddEventModal(true);
  };

  // Delete event handler
  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (!confirm(`Are you sure you wish to remove "${eventTitle}" from the wedding itinerary?`)) {
      return;
    }
    setDeletingEventId(eventId);
    try {
      if (weddingId && !eventId.startsWith('event-')) {
        await fetch(`${API_BASE_URL}/api/v1/weddings/${weddingId}/events/${eventId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
      }
    } catch (err) {
      console.warn('Backend delete sync note:', err);
    } finally {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setDeletingEventId(null);
      showToast(`Event "${eventTitle}" removed from itinerary.`);
    }
  };

  // Save Event (Add or Update)
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    setIsSubmittingEvent(true);
    const eventPayload = {
      title: newEventTitle.trim(),
      date: newEventDate,
      startTime: newEventStartTime,
      endTime: newEventEndTime,
      location: newEventLocation.trim() || "Villa d'Este, Lake Como",
      dressCode: newEventDressCode,
      statusBadge: newEventIsPrimary ? 'Main Event' : 'Confirmed',
      statusClass: newEventIsPrimary
        ? 'bg-primary-fixed/50 text-on-primary-fixed'
        : 'bg-tertiary-fixed/40 text-on-tertiary-container',
      guestCount: newEventGuestCount.trim() || 'All Invited Guests',
      isPrimary: newEventIsPrimary,
    };

    if (editingEvent) {
      // UPDATE EXISTING EVENT
      try {
        if (weddingId && !editingEvent.id.startsWith('event-')) {
          await fetch(`${API_BASE_URL}/api/v1/weddings/${weddingId}/events/${editingEvent.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              title: eventPayload.title,
              date: eventPayload.date,
              startTime: eventPayload.startTime,
              endTime: eventPayload.endTime,
              location: eventPayload.location,
              dressCode: eventPayload.dressCode,
              isPublic: true,
            }),
          });
        }
      } catch (err) {
        console.warn('Backend update note:', err);
      } finally {
        setEvents((prev) =>
          prev.map((ev) =>
            ev.id === editingEvent.id ? { ...ev, ...eventPayload } : ev
          )
        );
        setIsSubmittingEvent(false);
        setShowAddEventModal(false);
        setEditingEvent(null);
        showToast(`Event "${eventPayload.title}" updated successfully.`);
      }
    } else {
      // CREATE NEW EVENT
      const newEventObj: WeddingEvent = {
        id: `event-${Date.now()}`,
        ...eventPayload,
      };

      try {
        if (weddingId) {
          const res = await fetch(`${API_BASE_URL}/api/v1/weddings/${weddingId}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              title: eventPayload.title,
              date: eventPayload.date,
              startTime: eventPayload.startTime,
              endTime: eventPayload.endTime,
              location: eventPayload.location,
              dressCode: eventPayload.dressCode,
              isPublic: true,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.id) newEventObj.id = data.id;
          }
        }
      } catch (err) {
        console.warn('Backend sync note:', err);
      } finally {
        setEvents((prev) => [newEventObj, ...prev]);
        setIsSubmittingEvent(false);
        setShowAddEventModal(false);
        showToast(`Celebration event "${newEventObj.title}" added to itinerary.`);
      }
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.push('/login');
    } catch {
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Computed values
  const partnerOne = wedding?.partnerOne || wedding?.coupleNames?.[0] || 'Sarah';
  const partnerTwo = wedding?.partnerTwo || wedding?.coupleNames?.[1] || 'Julian';
  const weddingVenueDisplay = wedding?.venueName
    ? `${wedding.venueName}, ${wedding.venueCity || ''}`
    : "Villa d&apos;Este, Lake Como, Italy";
  const weddingDateDisplay = wedding?.weddingDate
    ? new Date(wedding.weddingDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'October 24, 2025';

  const liveWebsiteUrl = wedding?.slug ? `/w/${wedding.slug}` : '/w/sarah-julian';
  const userName = user?.name || 'Elena Rostova';
  const userRoleDisplay = user?.role === 'admin' ? 'Master Concierge' : 'Lead Concierge';

  const guestStats = useMemo(() => {
    const total = guests.length > 0 ? guests.length : 210;
    const confirmed = guests.length > 0
      ? guests.filter((g) => g.rsvpStatus === 'yes').length
      : 184;
    const pending = guests.length > 0
      ? guests.filter((g) => g.invitationStatus === 'pending' || !g.rsvpStatus).length
      : 18;
    const declined = guests.length > 0
      ? guests.filter((g) => g.rsvpStatus === 'no').length
      : 8;
    return { total, confirmed, pending, declined };
  }, [guests]);

  // Filtered Events based on search query
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const q = searchQuery.toLowerCase();
    return events.filter(
      (ev) =>
        ev.title.toLowerCase().includes(q) ||
        (ev.location && ev.location.toLowerCase().includes(q)) ||
        (ev.guestCount && ev.guestCount.toLowerCase().includes(q)) ||
        (ev.dressCode && ev.dressCode.toLowerCase().includes(q))
    );
  }, [events, searchQuery]);

  // Filtered Tasks based on search query
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tag.toLowerCase().includes(q)
    );
  }, [tasks, searchQuery]);


  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-xs font-semibold tracking-wide border transition-all bg-charcoal-ink text-ivory-highlight border-[#C5A059]/40 ring-4 ring-[#4A121A]/10">
          <span className="material-symbols-outlined text-[18px] text-gold-champagne">
            mark_email_read
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Publish Guest Update Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-ink/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-ivory-surface p-6 sm:p-8 shadow-[0_16px_40px_rgba(30,26,24,0.2)] border border-[#C5A059]/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-primary font-label-sm uppercase tracking-widest font-semibold">
                <span className="material-symbols-outlined text-[18px]">campaign</span>
                <span>Broadcast Dispatch</span>
              </div>
              <button
                onClick={() => setShowPublishModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-muted hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-charcoal-ink mb-2">
              Publish Concierge Bulletin
            </h3>
            <p className="font-body-sm text-body-sm text-stone-muted mb-4 leading-relaxed">
              Broadcast an immediate digital itinerary or transit update directly to all {guestStats.total} invited guests via their personalized Atelier digital portals.
            </p>
            <textarea
              rows={4}
              value={publishMessage}
              onChange={(e) => setPublishMessage(e.target.value)}
              placeholder="e.g., Lake Como water taxi schedules updated: boarding at Terrazza Bellagio starts 15 minutes ahead of sunset aperitifs..."
              className="w-full p-3.5 rounded-xl bg-ivory-highlight border border-[#C5A059]/30 font-body-sm text-charcoal-ink placeholder:text-stone-muted focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
            />
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowPublishModal(false)}
                className="px-5 py-2 rounded-full font-label-md text-stone-muted hover:text-charcoal-ink uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                disabled={isPublishing || !publishMessage.trim()}
                onClick={() => {
                  setIsPublishing(true);
                  setTimeout(() => {
                    setIsPublishing(false);
                    setShowPublishModal(false);
                    setPublishMessage('');
                    showToast('Guest bulletin broadcasted successfully.');
                  }, 800);
                }}
                className="px-6 py-2.5 rounded-full bg-burgundy-velvet text-on-primary font-label-md uppercase tracking-wider hover:bg-burgundy-hover transition-colors disabled:opacity-50"
              >
                {isPublishing ? 'Transmitting...' : 'Send Broadcast'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Concierge Desk Direct Line Modal */}
      {showConciergeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-ink/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-charcoal-ink text-ivory-highlight p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-[#C5A059]/40 text-center">
            <div className="w-14 h-14 rounded-full bg-gold-champagne/20 flex items-center justify-center mx-auto mb-4 text-gold-champagne">
              <span className="material-symbols-outlined text-[28px]">diamond</span>
            </div>
            <span className="font-label-sm text-gold-champagne uppercase tracking-widest block mb-1">
              Atelier Privé • Dedicated Director
            </span>
            <h3 className="font-headline-sm text-headline-sm text-ivory-highlight mb-2">
              Milan & Lake Como Operations Desk
            </h3>
            <p className="font-body-sm text-stone-muted mb-6 leading-relaxed">
              Direct line to Signora Alessandra Conti, Senior Wedding Director for {partnerOne} & {partnerTwo}.
            </p>
            <div className="p-4 rounded-xl bg-ivory-surface/10 border border-[#C5A059]/20 mb-6 space-y-2 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-muted">Direct Line:</span>
                <span className="text-gold-champagne font-mono font-medium">+39 02 8904 2200</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-muted">Emergency Dispatch:</span>
                <span className="text-ivory-highlight font-mono">+39 348 119 4022</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-muted">Lake Como Water Patrol:</span>
                <span className="text-green-400 font-semibold">Active & Standby</span>
              </div>
            </div>
            <button
              onClick={() => {
                setShowConciergeModal(false);
                showToast('Concierge desk notification dispatched to Milan ops.');
              }}
              className="w-full py-3 rounded-full bg-gold-champagne text-on-primary-container font-label-md uppercase tracking-wider hover:bg-gold-light transition-colors font-semibold"
            >
              Close & Dispatch Alert
            </button>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-ink/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-ivory-surface p-6 sm:p-8 shadow-[0_16px_40px_rgba(30,26,24,0.2)] border border-[#C5A059]/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-primary font-label-sm uppercase tracking-widest font-semibold">
                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                <span>Itinerary Orchestration</span>
              </div>
              <button
                onClick={() => setShowAddEventModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-muted hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <h3 className="font-headline-sm text-headline-sm text-charcoal-ink mb-1.5">
              {editingEvent ? "Edit Celebration Event" : "Add Celebration Event"}
            </h3>
            <p className="font-body-sm text-body-sm text-stone-muted mb-5 leading-relaxed">
              {editingEvent
                ? "Modify event schedule, salon location, or hospitality details in the dossier."
                : "Register a new sub-event (e.g. Mehndi, Welcome Cocktails, Rehearsal Dinner) to Sarah & Julian's master dossier."}
            </p>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block font-label-sm text-label-sm uppercase tracking-wider text-charcoal-ink font-semibold mb-1.5">
                  Event Title *
                </label>
                <input
                  required
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g., Riva Sunset Cruise & Welcome Aperitifs"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-highlight border border-[#C5A059]/30 font-body-sm text-charcoal-ink placeholder:text-stone-muted focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-label-sm text-label-sm uppercase tracking-wider text-charcoal-ink font-semibold mb-1.5">
                    Date
                  </label>
                  <input
                    type="text"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    placeholder="YYYY-MM-DD"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-highlight border border-[#C5A059]/30 font-body-sm text-charcoal-ink focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm uppercase tracking-wider text-charcoal-ink font-semibold mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={newEventStartTime}
                    onChange={(e) => setNewEventStartTime(e.target.value)}
                    placeholder="18:30"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-highlight border border-[#C5A059]/30 font-body-sm text-charcoal-ink focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm uppercase tracking-wider text-charcoal-ink font-semibold mb-1.5">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={newEventEndTime}
                    onChange={(e) => setNewEventEndTime(e.target.value)}
                    placeholder="22:00"
                    className="w-full px-3 py-2 rounded-xl bg-ivory-highlight border border-[#C5A059]/30 font-body-sm text-charcoal-ink focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-label-sm text-label-sm uppercase tracking-wider text-charcoal-ink font-semibold mb-1.5">
                    Location / Salon
                  </label>
                  <input
                    type="text"
                    value={newEventLocation}
                    onChange={(e) => setNewEventLocation(e.target.value)}
                    placeholder="e.g., Terrazza Bellagio"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-highlight border border-[#C5A059]/30 font-body-sm text-charcoal-ink placeholder:text-stone-muted focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm uppercase tracking-wider text-charcoal-ink font-semibold mb-1.5">
                    Dress Code
                  </label>
                  <input
                    type="text"
                    value={newEventDressCode}
                    onChange={(e) => setNewEventDressCode(e.target.value)}
                    placeholder="e.g., Black Tie / Summer Formal"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-highlight border border-[#C5A059]/30 font-body-sm text-charcoal-ink placeholder:text-stone-muted focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-sm text-label-sm uppercase tracking-wider text-charcoal-ink font-semibold mb-1.5">
                  Host &amp; Hospitality Notes
                </label>
                <input
                  type="text"
                  value={newEventGuestCount}
                  onChange={(e) => setNewEventGuestCount(e.target.value)}
                  placeholder="e.g., 140 guests confirmed • Private Sommelier pairing"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ivory-highlight border border-[#C5A059]/30 font-body-sm text-charcoal-ink placeholder:text-stone-muted focus:outline-none focus:ring-2 focus:ring-[#C5A059]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="primaryEventCheckbox"
                  type="checkbox"
                  checked={newEventIsPrimary}
                  onChange={(e) => setNewEventIsPrimary(e.target.checked)}
                  className="rounded border-[#C5A059]/40 text-burgundy-velvet focus:ring-[#C5A059]"
                />
                <label htmlFor="primaryEventCheckbox" className="font-body-sm text-body-sm text-charcoal-ink cursor-pointer">
                  Mark as Primary Wedding Milestone (Featured Ceremony styling)
                </label>
              </div>

              <div className="mt-6 pt-3 flex items-center justify-end gap-3 border-t border-[#C5A059]/15">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="px-5 py-2 rounded-full font-label-md text-stone-muted hover:text-charcoal-ink uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEvent || !newEventTitle.trim()}
                  className="px-6 py-2.5 rounded-full bg-burgundy-velvet text-on-primary font-label-md uppercase tracking-wider hover:bg-burgundy-hover transition-colors disabled:opacity-50 font-semibold"
                >
                  {isSubmittingEvent
                    ? "Saving..."
                    : editingEvent
                    ? "Save Changes"
                    : "Add Event to Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

<aside
  className={`fixed left-0 top-0 h-full w-72 bg-ivory-surface z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(74,18,26,0.04)] transition-all duration-300 ${
    sidebarCollapsed ? "-translate-x-full lg:translate-x-0 lg:w-20" : "translate-x-0"
  }`}
>
  {/* Collapsed mini-sidebar on large screens */}
  {sidebarCollapsed && (
    <div className="hidden lg:flex flex-col items-center py-6 h-full justify-between">
      <div className="flex flex-col items-center gap-6">
        <div className="w-10 h-10 rounded-full bg-ivory-highlight flex items-center justify-center shadow-xs">
          <span className="font-headline-sm text-sm italic text-primary leading-none">MMM</span>
        </div>
        <Link href="/dashboard" className="p-2.5 rounded-lg bg-burgundy-velvet text-on-primary">
          <span className="material-symbols-outlined text-[20px]">space_dashboard</span>
        </Link>
        <Link href="/dashboard/guests" className="p-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container">
          <span className="material-symbols-outlined text-[20px]">group</span>
        </Link>
        <Link href="/onboarding" className="p-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container">
          <span className="material-symbols-outlined text-[20px]">favorite</span>
        </Link>
      </div>
      <button
        onClick={() => setSidebarCollapsed(false)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
      >
        <span className="material-symbols-outlined text-[20px]">last_page</span>
      </button>
    </div>
  )}

  {/* Full width sidebar content */}
  <div className={`flex flex-col ${sidebarCollapsed ? "lg:hidden" : ""}`}>
    {/* Brand Header */}
    <div className="h-20 px-6 flex items-center gap-3">
      <div className="w-11 h-11 rounded-full bg-ivory-highlight flex items-center justify-center p-0.5 shadow-[0_2px_8px_-2px_rgba(74,18,26,0.04)]">
        <div className="w-full h-full rounded-full flex items-center justify-center bg-ivory-base">
          <span className="font-headline-sm text-headline-sm italic text-primary leading-none tracking-tighter">
            MMM
          </span>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="font-headline-sm text-headline-sm tracking-wide text-charcoal-ink font-normal leading-tight">
          Make My Marriage
        </span>
        <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary">
          Atelier Privé
        </span>
      </div>
    </div>

    {/* Navigation Links */}
    <nav className="px-4 py-2 space-y-1">
      <Link
        aria-current="page"
        className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all bg-burgundy-velvet text-on-primary font-medium shadow-[0_4px_12px_-2px_rgba(74,18,26,0.15)]"
        data-path="dashboard"
        href="/dashboard"
      >
        <span className="material-symbols-outlined text-[20px]">space_dashboard</span>
        <span className="font-body-sm text-body-sm tracking-normal">Dashboard</span>
      </Link>
      <Link
        className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"
        data-path="wedding-details"
        href="/onboarding"
      >
        <span className="material-symbols-outlined text-[20px]">favorite</span>
        <span className="font-body-sm text-body-sm tracking-normal">Wedding Details</span>
      </Link>
      <a
        className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"
        data-path="event-planner"
        href="#itinerary-section"
      >
        <span className="material-symbols-outlined text-[20px]">calendar_month</span>
        <span className="font-body-sm text-body-sm tracking-normal">Event Planner</span>
      </a>
      <Link
        className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"
        data-path="guest-management"
        href="/dashboard/guests"
      >
        <span className="material-symbols-outlined text-[20px]">group</span>
        <span className="font-body-sm text-body-sm tracking-normal">Guest Management</span>
      </Link>
      <Link
        className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"
        data-path="invitations-and-rsvp"
        href="/dashboard/guests"
      >
        <span className="material-symbols-outlined text-[20px]">mark_email_read</span>
        <span className="font-body-sm text-body-sm tracking-normal">Invitations & RSVP</span>
      </Link>
      <a
        className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"
        data-path="task-planner"
        href="#tasks-section"
      >
        <span className="material-symbols-outlined text-[20px]">checklist_rtl</span>
        <span className="font-body-sm text-body-sm tracking-normal">Task Planner</span>
      </a>
      <button
        onClick={() => showToast("Expense Tracker is scheduled for Atelier Tier II release.")}
        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all text-left"
        data-path="expense-tracker"
        type="button"
      >
        <span className="material-symbols-outlined text-[20px]">payments</span>
        <span className="font-body-sm text-body-sm tracking-normal">Expense Tracker</span>
      </button>
      <button
        onClick={() => showToast("Photo Gallery module loaded.")}
        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all text-left"
        data-path="photo-gallery"
        type="button"
      >
        <span className="material-symbols-outlined text-[20px]">photo_library</span>
        <span className="font-body-sm text-body-sm tracking-normal">Photo Gallery</span>
      </button>
      <Link
        className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"
        data-path="settings"
        href="/onboarding"
      >
        <span className="material-symbols-outlined text-[20px]">settings</span>
        <span className="font-body-sm text-body-sm tracking-normal">Settings</span>
      </Link>
    </nav>
  </div>

  {/* Active Wedding Info Card & Footer Actions */}
  <div className={`p-4 flex flex-col gap-3 ${sidebarCollapsed ? "lg:hidden" : ""}`}>
    <div className="p-3.5 rounded-xl bg-ivory-highlight shadow-[0_2px_8px_-2px_rgba(74,18,26,0.04)]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-headline-sm text-headline-sm text-charcoal-ink font-normal">
          {wedding?.coupleNames?.join(" & ") || "Sarah & Julian"}
        </span>
        <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
      </div>
      <p className="font-body-sm text-body-sm text-stone-muted">
        {weddingDateDisplay} • {wedding?.venueCity || "Lake Como"}
      </p>
      <div className="mt-3 pt-2 flex items-center justify-between text-stone-muted border-t border-[#C5A059]/15">
        <Link
          href="/onboarding"
          className="font-label-sm text-label-sm uppercase tracking-wider text-primary hover:text-burgundy-velvet transition-colors"
        >
          Switch Wedding
        </Link>
        <span className="font-label-sm text-label-sm text-on-surface-variant">•</span>
        <button
          onClick={() => setShowConciergeModal(true)}
          className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant hover:text-charcoal-ink transition-colors"
          type="button"
        >
          Concierge Support
        </button>
      </div>
    </div>

    <div className="flex items-center justify-between px-2 pt-1">
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="flex items-center gap-2 text-on-surface-variant hover:text-burgundy-velvet transition-colors disabled:opacity-50"
        type="button"
      >
        <span className="material-symbols-outlined text-[18px]">logout</span>
        <span className="font-label-md text-label-md uppercase tracking-wider">
          {isLoggingOut ? "Signing Out..." : "Sign Out"}
        </span>
      </button>
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
        type="button"
      >
        <span className="material-symbols-outlined text-[18px]">
          {sidebarCollapsed ? "last_page" : "first_page"}
        </span>
      </button>
    </div>
  </div>
</aside>

<header className={`fixed top-0 right-0 h-20 bg-surface/85 backdrop-blur-xl z-40 flex items-center justify-between px-4 sm:px-8 shadow-[0_1px_8px_rgba(74,18,26,0.03)] transition-all duration-300 ${sidebarCollapsed ? "left-0 lg:left-20" : "left-0 lg:left-72"}`}>
<button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="lg:hidden mr-3 p-2 rounded-lg text-charcoal-ink hover:bg-surface-container" type="button"><span className="material-symbols-outlined text-[24px]">menu</span></button><div className="w-96"><div className="relative flex items-center"><span className="material-symbols-outlined absolute left-3.5 text-stone-muted text-[20px]">search</span><input className="w-full pl-11 pr-4 py-2 rounded-full bg-ivory-surface font-body-sm text-body-sm text-charcoal-ink placeholder:text-stone-muted focus:outline-none focus:bg-ivory-highlight shadow-[0_1px_3px_rgba(30,26,24,0.03)] transition-all" placeholder="Search guests, vendors, tasks..." type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div></div><div className="flex items-center gap-6"><div className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-ivory-surface shadow-[0_1px_3px_rgba(30,26,24,0.03)]"><span className="w-2 h-2 rounded-full bg-gold-champagne"></span><span className="font-label-md text-label-md text-charcoal-ink">Status: Live Website</span><span className="text-stone-muted">•</span><span className="font-label-md text-label-md text-primary font-semibold">{countdown.days} Days To Go</span></div><div className="relative">
  <button onClick={() => setShowNotifications(!showNotifications)} className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-ivory-surface hover:text-on-surface transition-colors" type="button">
    <span className="material-symbols-outlined text-[22px]">notifications</span>
  </button>
  <span className="absolute top-2 right-2 w-2 h-2 bg-burgundy-velvet rounded-full animate-pulse"></span>
  {showNotifications && (
    <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-ivory-highlight p-4 shadow-[0_8px_30px_rgba(74,18,26,0.12)] border border-[#C5A059]/30 z-50">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#C5A059]/20">
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">Atelier Notifications</span>
        <span className="font-label-sm text-label-sm text-stone-muted">2 New</span>
      </div>
      <div className="space-y-2.5">
        <div className="p-2.5 rounded-xl bg-ivory-surface text-left">
          <p className="font-body-sm text-body-sm text-charcoal-ink font-medium leading-tight">Lord & Lady Harrington confirmed RSVP</p>
          <span className="font-label-sm text-label-sm text-stone-muted mt-1 block">2 minutes ago • Truffle Risotto</span>
        </div>
        <div className="p-2.5 rounded-xl bg-ivory-surface text-left">
          <p className="font-body-sm text-body-sm text-charcoal-ink font-medium leading-tight">Villa d&apos;Este Sommelier signed off cellar list</p>
          <span className="font-label-sm text-label-sm text-stone-muted mt-1 block">1 hour ago • Barolo Riserva 2016</span>
        </div>
      </div>
    </div>
  )}
</div><div className="flex items-center gap-3 pl-3"><div className="flex flex-col text-right"><span className="font-body-sm text-body-sm font-semibold text-charcoal-ink leading-tight">{userName}</span><span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">{userRoleDisplay}</span></div><div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"><span className="material-symbols-outlined text-on-primary text-[18px]">person</span></div></div></div></header>

<main className={`w-full pt-24 px-4 sm:px-8 bg-surface min-h-screen transition-all duration-300 ${sidebarCollapsed ? "pl-4 lg:pl-28" : "pl-4 lg:pl-80"}`}>
<div className="max-w-[1560px] mx-auto w-full pb-16"><div className="flex flex-col w-full pb-16">
{/**/}
<section className="relative w-full rounded-2xl bg-ivory-surface p-8 lg:p-10 shadow-[0_4px_24px_-4px_rgba(74,18,26,0.05)] overflow-hidden">
<div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-tertiary-fixed/20 blur-3xl pointer-events-none"></div>
<div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-secondary-fixed/20 blur-3xl pointer-events-none"></div>
<div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
{/**/}
<div className="flex flex-col max-w-2xl">
<div className="flex items-center gap-3 mb-3">
<span className="px-3.5 py-1 rounded-full bg-ivory-highlight font-label-sm text-label-sm uppercase tracking-widest text-primary shadow-[0_1px_3px_rgba(30,26,24,0.04)]">
            {weddingVenueDisplay} • {weddingDateDisplay}
          </span>
<span className="inline-flex items-center gap-1.5 font-label-sm text-label-sm text-gold-champagne font-semibold uppercase tracking-wider">
<span className="w-1.5 h-1.5 rounded-full bg-gold-champagne animate-ping"></span>
            Live Atelier
          </span>
</div>
<h1 className="font-headline-lg text-headline-lg text-charcoal-ink tracking-tight mb-2">
          {partnerOne} <span className="italic font-normal text-gold-champagne">&</span> {partnerTwo}
        </h1>
<p className="font-body-md text-body-md text-stone-muted leading-relaxed">
          Welcome back, {userName}. The bespoke celebration dossier is synchronized with {wedding?.venueName || "Villa d&apos;Este"} hospitality desk and Lake Como Riva transit.
        </p>
{/**/}
<div className="flex flex-wrap items-center gap-3 mt-6">
<button onClick={() => setShowPublishModal(true)} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-burgundy-velvet text-on-primary font-label-md text-label-md uppercase tracking-wider shadow-[0_4px_16px_rgba(74,18,26,0.22)] hover:bg-burgundy-hover transition-all" type="button">
<span>Publish Guest Update</span>
<span className="material-symbols-outlined text-[16px]">campaign</span>
</button>
<Link href={liveWebsiteUrl} target="_blank" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ivory-highlight text-charcoal-ink font-label-md text-label-md uppercase tracking-wider shadow-[0_2px_8px_-2px_rgba(74,18,26,0.06)] hover:bg-surface-container transition-all">
<span>View Live Website</span>
<span className="material-symbols-outlined text-[16px] text-primary">arrow_outward</span>
</Link>
</div>
</div>
{/**/}
<div className="flex flex-col sm:flex-row items-center gap-3 self-start xl:self-center p-5 rounded-xl bg-ivory-highlight shadow-[0_3px_12px_-2px_rgba(74,18,26,0.04)]">
<div className="flex items-center gap-2 text-primary font-label-sm text-label-sm uppercase tracking-widest sm:[writing-mode:vertical-rl] sm:rotate-180 sm:pr-2">
<span className="material-symbols-outlined text-[16px]">search_off</span>
<span>Time To Vows</span>
</div>
<div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
{/**/}
<div className="flex flex-col items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-surface-container-lowest shadow-[0_2px_6px_rgba(30,26,24,0.03)] p-2">
<span className="font-display-lg text-display-lg leading-none text-charcoal-ink font-normal" >{countdown.days}</span>
<span className="font-label-sm text-label-sm text-stone-muted uppercase tracking-wider mt-1.5">Days</span>
</div>
{/**/}
<div className="flex flex-col items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-surface-container-lowest shadow-[0_2px_6px_rgba(30,26,24,0.03)] p-2">
<span className="font-display-lg text-display-lg leading-none text-charcoal-ink font-normal" >{countdown.hours}</span>
<span className="font-label-sm text-label-sm text-stone-muted uppercase tracking-wider mt-1.5">Hours</span>
</div>
{/**/}
<div className="flex flex-col items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-surface-container-lowest shadow-[0_2px_6px_rgba(30,26,24,0.03)] p-2">
<span className="font-display-lg text-display-lg leading-none text-primary font-normal" >{countdown.minutes}</span>
<span className="font-label-sm text-label-sm text-primary uppercase tracking-wider mt-1.5">Minutes</span>
</div>
</div>
</div>
</div>
</section>
{/**/}
<section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">
{/**/}
<div className="flex flex-col justify-between p-5 rounded-2xl bg-ivory-surface shadow-[0_2px_8px_-2px_rgba(74,18,26,0.04)]">
<div>
<div className="flex items-center justify-between mb-3">
<span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">Attendance</span>
<span className="px-2 py-0.5 rounded-full bg-ivory-highlight font-label-sm text-label-sm text-charcoal-ink">88% Quota</span>
</div>
<div className="flex items-baseline gap-2">
<span className="font-headline-md text-headline-md text-charcoal-ink font-medium">184</span>
<span className="font-body-sm text-body-sm text-stone-muted">/ 210 Guests</span>
</div>
<p className="font-body-sm text-body-sm text-stone-muted mt-0.5">18 pending responses • 8 regrets</p>
</div>
{/**/}
<div className="mt-4 pt-3">
<div className="flex h-2 w-full rounded-full overflow-hidden bg-surface-container">
<div className="bg-primary h-full" style={{ width: "%" }}></div>
<div className="bg-gold-champagne h-full" style={{ width: "%" }}></div>
<div className="bg-secondary-container h-full" style={{ width: "%" }}></div>
</div>
<div className="flex items-center justify-between text-stone-muted font-label-sm text-label-sm mt-2">
<span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span> 112 Risotto</span>
<span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-gold-champagne"></span> 64 Bass</span>
<span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span> 8 Vegan</span>
</div>
</div>
</div>
{/**/}
<div className="flex flex-col justify-between p-5 rounded-2xl bg-ivory-surface shadow-[0_2px_8px_-2px_rgba(74,18,26,0.04)]">
<div>
<div className="flex items-center justify-between mb-3">
<span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">Couture Budget</span>
<span className="px-2 py-0.5 rounded-full bg-tertiary-fixed/40 font-label-sm text-label-sm text-on-tertiary-container font-semibold">On Track</span>
</div>
<div className="flex items-baseline gap-2">
<span className="font-headline-md text-headline-md text-charcoal-ink font-medium">€148,500</span>
<span className="font-body-sm text-body-sm text-stone-muted">/ €180k</span>
</div>
<p className="font-body-sm text-body-sm text-stone-muted mt-0.5">€31,500 unallocated buffer balance</p>
</div>
<div className="mt-4 pt-3 flex items-center justify-between">
<div className="flex flex-col">
<span className="font-label-sm text-label-sm uppercase tracking-wider text-stone-muted">Committed</span>
<span className="font-headline-sm text-headline-sm text-primary">82.5%</span>
</div>
{/**/}
<svg className="w-24 h-8 text-primary overflow-visible" fill="none" viewBox="0 0 100 30">
<path d="M0 25 C20 22, 30 18, 50 15 C70 12, 85 8, 100 4" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5"></path>
<circle cx="100" cy="4" fill="#4A121A" r="3.5" />
</svg>
</div>
</div>
{/**/}
<div className="flex flex-col justify-between p-5 rounded-2xl bg-ivory-surface shadow-[0_2px_8px_-2px_rgba(74,18,26,0.04)]">
<div>
<div className="flex items-center justify-between mb-3">
<span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">Milestones</span>
<span className="px-2 py-0.5 rounded-full bg-ivory-highlight font-label-sm text-label-sm text-burgundy-velvet font-semibold">4 Due This Week</span>
</div>
<div className="flex items-baseline gap-2">
<span className="font-headline-md text-headline-md text-charcoal-ink font-medium">42</span>
<span className="font-body-sm text-body-sm text-stone-muted">/ 56 Curated Tasks</span>
</div>
<p className="font-body-sm text-body-sm text-stone-muted mt-0.5">75% milestone deliverables completed</p>
</div>
<div className="mt-4 pt-3">
<div className="w-full bg-surface-container rounded-full h-2">
<div className="bg-burgundy-velvet h-2 rounded-full" style={{ width: "%" }}></div>
</div>
<div className="flex items-center justify-between font-label-sm text-label-sm text-stone-muted mt-2">
<span>Phase 3: Production</span>
<span className="text-charcoal-ink font-semibold">14 to go</span>
</div>
</div>
</div>
{/**/}
<div className="flex flex-col justify-between p-5 rounded-2xl bg-ivory-surface shadow-[0_2px_8px_-2px_rgba(74,18,26,0.04)]">
<div>
<div className="flex items-center justify-between mb-3">
<span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">Stationery Dispatch</span>
<span className="px-2 py-0.5 rounded-full bg-ivory-highlight font-label-sm text-label-sm text-charcoal-ink">98% Open Rate</span>
</div>
<div className="flex items-baseline gap-2">
<span className="font-headline-md text-headline-md text-charcoal-ink font-medium">210 / 210</span>
<span className="font-body-sm text-body-sm text-stone-muted">Dispatched</span>
</div>
<p className="font-body-sm text-body-sm text-stone-muted mt-0.5">Calligraphy email & WhatsApp suite</p>
</div>
<div className="mt-4 pt-3 flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="w-7 h-7 rounded-full bg-tertiary-fixed/50 flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[16px]">send</span>
</span>
<span className="font-body-sm text-body-sm text-charcoal-ink">206 Opened</span>
</div>
<div className="flex items-center gap-1 text-primary">
<span className="material-symbols-outlined text-[16px]">check_circle</span>
<span className="font-label-sm text-label-sm uppercase tracking-wider">Zero Bounced</span>
</div>
</div>
</div>
</section>
{/**/}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
{/**/}
<div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
{/**/}
<div className="flex flex-col p-6 lg:p-7 rounded-2xl bg-ivory-surface shadow-[0_2px_12px_-2px_rgba(74,18,26,0.04)]">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">The Weekend Suite</span>
<h2 id="itinerary-section" className="font-headline-md text-headline-md text-charcoal-ink mt-0.5">Multi-Day Wedding Itinerary</h2>
</div>
<div className="flex items-center gap-2">
<button onClick={openAddEventModal} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-burgundy-velvet text-on-primary font-label-md text-label-md uppercase tracking-wider hover:bg-burgundy-hover transition-all shadow-[0_2px_8px_rgba(74,18,26,0.2)]">
<span className="material-symbols-outlined text-[16px]">add</span>
<span>Add Event</span>
</button>
<Link href="/onboarding" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-ivory-highlight text-primary font-label-md text-label-md uppercase tracking-wider hover:bg-surface-container transition-all">
<span className="material-symbols-outlined text-[16px]">tune</span>
<span>Full Schedule</span>
</Link>
</div>
</div>
{/**/}
<div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-3 before:w-0.5 before:bg-gold-champagne/40">

{filteredEvents.length === 0 ? (
  <div className="p-8 text-center rounded-xl bg-ivory-highlight border border-[#C5A059]/20">
    <span className="material-symbols-outlined text-[32px] text-stone-muted mb-2">event_busy</span>
    <p className="font-headline-sm text-sm text-charcoal-ink font-semibold">No celebration events found</p>
    <p className="font-body-sm text-xs text-stone-muted mt-1">
      {searchQuery ? `No events match "${searchQuery}".` : "Add the first event to begin orchestrating your wedding weekend."}
    </p>
    <button
      onClick={openAddEventModal}
      className="mt-4 px-4 py-1.5 rounded-full bg-burgundy-velvet text-on-primary font-label-sm text-label-sm uppercase tracking-wider hover:bg-burgundy-hover transition-colors"
      type="button"
    >
      Add Event Now
    </button>
  </div>
) : (
  filteredEvents.map((ev) => (
  <div
    key={ev.id}
    className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl transition-all hover:shadow-md ${
      ev.isPrimary
        ? "bg-surface-container-lowest shadow-[0_2px_8px_-1px_rgba(74,18,26,0.06)]"
        : "bg-ivory-highlight shadow-[0_1px_4px_rgba(30,26,24,0.03)]"
    }`}
  >
    <span
      className={`absolute -left-[27px] top-4 w-3.5 h-3.5 rounded-full ring-4 ring-ivory-surface ${
        ev.isPrimary ? "bg-burgundy-velvet" : "bg-gold-champagne"
      }`}
    ></span>
    <div className="flex flex-col min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <span
          className={`px-2 py-0.5 rounded font-label-sm text-label-sm uppercase font-semibold ${
            ev.isPrimary ? "bg-burgundy-velvet text-on-primary" : "bg-surface-container text-primary"
          }`}
        >
          {ev.date} • {ev.startTime}
        </span>
        <span className="font-body-sm text-body-sm text-stone-muted">{ev.location}</span>
      </div>
      <h3 className="font-headline-sm text-headline-sm text-charcoal-ink truncate">{ev.title}</h3>
      <p className="font-body-sm text-body-sm text-stone-muted mt-0.5">{ev.guestCount}</p>
    </div>
    <div className="flex items-center gap-3 shrink-0">
      <span
        className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm uppercase tracking-wider font-semibold ${
          ev.statusClass || "bg-tertiary-fixed/40 text-on-tertiary-container"
        }`}
      >
        {ev.statusBadge || "Confirmed"}
      </span>
      <button
        onClick={() => openEditEventModal(ev)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-stone-muted hover:text-charcoal-ink hover:bg-surface-container transition-colors"
        type="button"
        title="Edit event details"
      >
        <span className="material-symbols-outlined text-[18px]">edit</span>
      </button>
      <button
        onClick={() => handleDeleteEvent(ev.id, ev.title)}
        disabled={deletingEventId === ev.id}
        className="w-8 h-8 rounded-full flex items-center justify-center text-stone-muted hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
        type="button"
        title="Remove event from itinerary"
      >
        <span className="material-symbols-outlined text-[18px]">delete</span>
      </button>
    </div>
  </div>
  ))
)}
</div>
</div>
{/**/}
<div className="flex flex-col p-6 lg:p-7 rounded-2xl bg-ivory-surface shadow-[0_2px_12px_-2px_rgba(74,18,26,0.04)]">
<div className="flex items-center justify-between mb-5">
<div>
<span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">Action Items</span>
<h2 id="tasks-section" className="font-headline-md text-headline-md text-charcoal-ink mt-0.5">Priority Tasks Due This Week</h2>
</div>
<button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-burgundy-velvet text-on-primary font-label-md text-label-md uppercase tracking-wider hover:bg-burgundy-hover transition-colors" onClick={() => setIsTaskInputOpen(!isTaskInputOpen)} type="button">
<span className="material-symbols-outlined text-[16px]">add</span>
<span>Add Task</span>
</button>
</div>
{/**/}
{isTaskInputOpen && (
  <div className="mb-4 p-3 rounded-xl bg-ivory-highlight flex items-center gap-3 shadow-[0_1px_4px_rgba(30,26,24,0.04)]">
    <input
      value={newTaskTitle}
      onChange={(e) => setNewTaskTitle(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
      className="w-full bg-transparent font-body-sm text-body-sm text-charcoal-ink placeholder:text-stone-muted focus:outline-none"
      placeholder="Enter new wedding task description..."
      type="text"
      autoFocus
    />
    <button
      onClick={handleAddTask}
      className="px-4 py-1.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm uppercase tracking-wider hover:bg-burgundy-velvet transition-colors"
      type="button"
    >
      Save
    </button>
  </div>
)}
{/**/}
<div className="space-y-3" id="task-dossier">
  {filteredTasks.length === 0 ? (
  <div className="p-6 text-center rounded-xl bg-ivory-highlight border border-[#C5A059]/20">
    <p className="font-body-sm text-stone-muted text-xs">
      {searchQuery ? `No tasks match "${searchQuery}".` : "No pending tasks in this category."}
    </p>
  </div>
) : (
  filteredTasks.map((task) => (
    <div
      key={task.id}
      className="group flex items-start justify-between gap-4 p-4 rounded-xl bg-ivory-highlight hover:bg-surface-container transition-all"
    >
      <div className="flex items-start gap-3">
        <label className="relative flex items-center justify-center w-5 h-5 mt-0.5 cursor-pointer">
          <input
            checked={task.completed}
            onChange={() => handleToggleTask(task.id)}
            className="peer sr-only"
            type="checkbox"
          />
          <span className="w-5 h-5 rounded-full bg-surface-container peer-checked:bg-burgundy-velvet flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-on-primary text-[14px] opacity-0 peer-checked:opacity-100">
              check
            </span>
          </span>
        </label>
        <div className="flex flex-col">
          <span
            className={`font-body-md text-body-md text-charcoal-ink font-medium leading-tight ${
              task.completed ? "line-through opacity-60" : ""
            }`}
          >
            {task.title}
          </span>
          <span className="font-body-sm text-body-sm text-stone-muted mt-1">
            {task.description}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`px-2.5 py-0.5 rounded-full font-label-sm text-label-sm uppercase tracking-wider font-semibold ${task.tagClass}`}>
          {task.tag}
        </span>
      </div>
    </div>
  ))
)}
</div>
</div>
</div>
{/**/}
<div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
{/**/}
<div className="flex flex-col p-6 rounded-2xl bg-ivory-surface shadow-[0_2px_12px_-2px_rgba(74,18,26,0.04)]">
<div className="flex items-center justify-between mb-4">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-gold-champagne animate-pulse"></span>
<span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">Live Feed</span>
</div>
<Link href="/dashboard/guests" className="font-label-sm text-label-sm uppercase tracking-wider text-primary hover:text-burgundy-velvet transition-colors font-medium">View All {guestStats.total}</Link>
</div>
<h2 className="font-headline-sm text-headline-sm text-charcoal-ink mb-4">Recent RSVP Activity</h2>
<div className="space-y-3.5">
{/**/}
<div className="flex items-center justify-between p-3 rounded-xl bg-ivory-highlight shadow-[0_1px_3px_rgba(30,26,24,0.03)]">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center font-headline-sm text-headline-sm italic text-primary">
                H
              </div>
<div className="flex flex-col">
<span className="font-body-sm text-body-sm text-charcoal-ink font-medium leading-tight">Lord & Lady Harrington (+1)</span>
<span className="font-label-sm text-label-sm text-stone-muted mt-0.5">Truffle Risotto • 2 min ago</span>
</div>
</div>
<span className="w-6 h-6 rounded-full bg-tertiary-fixed/60 flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[14px]">check</span>
</span>
</div>
{/**/}
<div className="flex items-center justify-between p-3 rounded-xl bg-ivory-highlight shadow-[0_1px_3px_rgba(30,26,24,0.03)]">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center font-headline-sm text-headline-sm italic text-primary">
                R
              </div>
<div className="flex flex-col">
<span className="font-body-sm text-body-sm text-charcoal-ink font-medium leading-tight">Matteo & Sofia Rossi</span>
<span className="font-label-sm text-label-sm text-stone-muted mt-0.5">Note: Gluten-Free • 1 hr ago</span>
</div>
</div>
<span className="w-6 h-6 rounded-full bg-tertiary-fixed/60 flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[14px]">check</span>
</span>
</div>
{/**/}
<div className="flex items-center justify-between p-3 rounded-xl bg-ivory-highlight shadow-[0_1px_3px_rgba(30,26,24,0.03)]">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center font-headline-sm text-headline-sm italic text-stone-muted">
                V
              </div>
<div className="flex flex-col">
<span className="font-body-sm text-body-sm text-charcoal-ink font-medium leading-tight">Marcus Vance</span>
<span className="font-label-sm text-label-sm text-stone-muted mt-0.5">Declined with regrets • 3 hrs ago</span>
</div>
</div>
<span className="w-6 h-6 rounded-full bg-secondary-fixed/70 flex items-center justify-center text-secondary">
<span className="material-symbols-outlined text-[14px]">close</span>
</span>
</div>
</div>
</div>
{/**/}
<div className="flex flex-col p-6 rounded-2xl bg-ivory-surface shadow-[0_2px_12px_-2px_rgba(74,18,26,0.04)]">
<span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold mb-1">Actions</span>
<h2 className="font-headline-sm text-headline-sm text-charcoal-ink mb-4">Concierge Shortcuts</h2>
<div className="grid grid-cols-2 gap-3">
{/**/}
<button onClick={() => router.push("/dashboard/guests")} className="group flex flex-col items-start p-3.5 rounded-xl bg-ivory-highlight hover:bg-surface-container transition-all text-left shadow-[0_1px_3px_rgba(30,26,24,0.02)]" type="button">
<div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors mb-2.5">
<span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
</div>
<span className="font-body-sm text-body-sm text-charcoal-ink font-semibold leading-tight">Send RSVP Reminder</span>
<span className="font-label-sm text-label-sm text-stone-muted mt-1">18 pending guests</span>
</button>
{/**/}
<button onClick={() => showToast("Seating chart designer will be available in the upcoming Atelier release.")} className="group flex flex-col items-start p-3.5 rounded-xl bg-ivory-highlight hover:bg-surface-container transition-all text-left shadow-[0_1px_3px_rgba(30,26,24,0.02)]" type="button">
<div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors mb-2.5">
<span className="material-symbols-outlined text-[18px]">table_restaurant</span>
</div>
<span className="font-body-sm text-body-sm text-charcoal-ink font-semibold leading-tight">Seating Chart</span>
<span className="font-label-sm text-label-sm text-stone-muted mt-1">22 tables mapped</span>
</button>
{/**/}
<button onClick={() => showToast("Gallery media upload pipeline opened.")} className="group flex flex-col items-start p-3.5 rounded-xl bg-ivory-highlight hover:bg-surface-container transition-all text-left shadow-[0_1px_3px_rgba(30,26,24,0.02)]" type="button">
<div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors mb-2.5">
<span className="material-symbols-outlined text-[18px]">cloud_upload</span>
</div>
<span className="font-body-sm text-body-sm text-charcoal-ink font-semibold leading-tight">Upload Gallery</span>
<span className="font-label-sm text-label-sm text-stone-muted mt-1">Moodboards & proofs</span>
</button>
{/**/}
<button onClick={() => { window.print(); showToast("Exporting vendor run-sheet dossier..."); }} className="group flex flex-col items-start p-3.5 rounded-xl bg-ivory-highlight hover:bg-surface-container transition-all text-left shadow-[0_1px_3px_rgba(30,26,24,0.02)]" type="button">
<div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors mb-2.5">
<span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
</div>
<span className="font-body-sm text-body-sm text-charcoal-ink font-semibold leading-tight">Vendor Run-Sheet</span>
<span className="font-label-sm text-label-sm text-stone-muted mt-1">Export dossier PDF</span>
</button>
</div>
</div>
{/**/}
<div className="relative overflow-hidden p-6 rounded-2xl bg-charcoal-ink text-ivory-highlight shadow-[0_6px_24px_rgba(30,26,24,0.14)]">
<div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gold-champagne/10 blur-xl pointer-events-none"></div>
<div className="flex items-center gap-2 mb-3 text-gold-champagne font-label-sm text-label-sm uppercase tracking-widest">
<span className="material-symbols-outlined text-[16px]">diamond</span>
<span>Atelier Privé Concierge</span>
</div>
<h3 className="font-headline-sm text-headline-sm leading-snug mb-2">
          Need bespoke assistance for {partnerOne} & {partnerTwo}?
        </h3>
<p className="font-body-sm text-body-sm text-surface-container-highest/80 leading-relaxed mb-5">
          Your direct private wedding director is on standby in Milan for immediate on-site vendor escalations, custom boat charters, and Lake Como permissions.
        </p>
<div className="flex items-center justify-between pt-2">
<button onClick={() => setShowConciergeModal(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold-champagne text-on-primary-container font-label-md text-label-md uppercase tracking-wider hover:bg-gold-light transition-colors" type="button">
<span className="material-symbols-outlined text-[16px]">call</span>
<span>Call Concierge Desk</span>
</button>
<span className="font-label-sm text-label-sm text-gold-champagne">Direct Line: Active</span>
</div>
</div>
</div>
</div>
</div>
</div>
</main>
    </div>
  );
}
