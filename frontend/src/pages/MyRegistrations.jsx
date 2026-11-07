import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  XCircle,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Compass
} from 'lucide-react';
import api from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, upcoming, completed, cancelled

  // Cancel modal state
  const [selectedReg, setSelectedReg] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/registrations/my');
      if (res.data.success) {
        setRegistrations(res.data.registrations);
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
      toast.error('Failed to load your registrations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleOpenCancelModal = (reg) => {
    setSelectedReg(reg);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedReg) return;
    try {
      setCancelling(true);
      const res = await api.put(`/registrations/${selectedReg._id}/cancel`);
      if (res.data.success) {
        toast.success('Registration cancelled successfully. Seat restored.');
        // Update local state
        setRegistrations((prev) =>
          prev.map((r) =>
            r._id === selectedReg._id
              ? { ...r, registrationStatus: 'cancelled' }
              : r
          )
        );
        setIsCancelModalOpen(false);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel registration';
      toast.error(msg);
    } finally {
      setCancelling(false);
    }
  };

  // Filter registrations by activeTab
  const filteredRegistrations = registrations.filter((reg) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'cancelled') return reg.registrationStatus === 'cancelled';

    if (activeTab === 'upcoming') {
      if (reg.registrationStatus === 'cancelled') return false;
      const eventDate = reg.event ? new Date(reg.event.date) : new Date(0);
      return eventDate >= new Date();
    }

    if (activeTab === 'completed') {
      if (reg.registrationStatus === 'cancelled') return false;
      const eventDate = reg.event ? new Date(reg.event.date) : new Date(0);
      return eventDate < new Date();
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            User Dashboard
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            My Registrations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            View and manage your registered events.
          </p>
        </div>

        <Link
          to="/events"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/25 transition-all w-fit"
        >
          <Compass className="w-4 h-4" />
          <span>Explore More Events</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4 sm:space-x-8 text-sm font-semibold">
        {[
          { id: 'all', label: 'All Registrations' },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'completed', label: 'Completed' },
          { id: 'cancelled', label: 'Cancelled' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 relative transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" text="Loading registrations..." />
        </div>
      ) : filteredRegistrations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRegistrations.map((reg) => {
            const event = reg.event;
            if (!event) return null;

            const isCancelled = reg.registrationStatus === 'cancelled';
            const eventDate = new Date(event.date);
            const isPastEvent = eventDate < new Date();
            const canCancel = !isCancelled && !isPastEvent;

            const formattedEventDate = eventDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            const formattedRegDate = new Date(reg.registeredAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div
                key={reg._id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Event Image Banner */}
                <div className="relative h-44 w-full bg-slate-900">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* Status Badges */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-600 text-white shadow-sm">
                      {event.category}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    {isCancelled ? (
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-600 text-white shadow-sm flex items-center space-x-1">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancelled</span>
                      </span>
                    ) : isPastEvent ? (
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-600 text-white shadow-sm flex items-center space-x-1">
                        <span>Completed</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-600 text-white shadow-sm flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Registered</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg line-clamp-1">
                      {event.title}
                    </h3>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{formattedEventDate} • {event.startTime}</span>
                      </div>
                      <div className="flex items-center space-x-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    </div>
                  </div>

                  {/* Registration Metadata & Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Name: <strong>{reg.participantName}</strong></span>
                      <span>Registered: {formattedRegDate}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/events/${event._id}`}
                        className="flex-1 py-2 px-3 text-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center space-x-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Event Details</span>
                      </Link>

                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => handleOpenCancelModal(reg)}
                          className="py-2 px-3 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 mx-auto flex items-center justify-center">
            <Ticket className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              No Registrations Found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {activeTab === 'all'
                ? "You haven't registered for any events yet. Check out upcoming events and grab a spot!"
                : `No registrations found under "${activeTab}".`}
            </p>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/20 transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Browse Events</span>
          </Link>
        </div>
      )}

      {/* Confirmation Modal for Cancellation */}
      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Event Registration?"
        message={`Are you sure you want to cancel your registration for "${selectedReg?.event?.title}"?`}
        confirmText="Yes, Cancel"
        cancelText="Keep"
        isDestructive={true}
        isLoading={cancelling}
      />
    </div>
  );
};

export default MyRegistrations;
