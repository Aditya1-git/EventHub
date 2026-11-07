import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Mail,
  ShieldCheck,
  Share2,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CountdownTimer from '../components/CountdownTimer';
import RegistrationModal from '../components/RegistrationModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  // Fetch event details and check if user already registered
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/events/${id}`);
        if (res.data.success) {
          setEvent(res.data.event);

          // If logged in, check user's registrations to see if already registered
          if (isAuthenticated) {
            try {
              const myRegs = await api.get('/registrations/my?status=confirmed');
              if (myRegs.data.success) {
                const found = myRegs.data.registrations.some(
                  (r) => r.event?._id === id || r.event === id
                );
                setIsRegistered(found);
              }
            } catch (err) {
              // Ignore my-registrations check error
            }
          }
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError(err.response?.data?.message || 'Event not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id, isAuthenticated]);

  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      toast('Please log in or create an account to register for this event.', {
        icon: '🔒'
      });
      navigate('/login', { state: { from: location } });
      return;
    }
    setIsModalOpen(true);
  };

  const handleRegistrationSuccess = (newReg, updatedAvailableSeats) => {
    setIsRegistered(true);
    if (updatedAvailableSeats !== undefined) {
      setEvent((prev) => ({ ...prev, availableSeats: updatedAvailableSeats }));
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.shortDescription,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading event details..." />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 mx-auto flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Event Not Found
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          {error || "The event you are looking for doesn't exist or has been removed."}
        </p>
        <Link
          to="/events"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </Link>
      </div>
    );
  }

  const formattedEventDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedDeadline = new Date(event.registrationDeadline).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const isSoldOut = event.availableSeats <= 0;
  const isPastDeadline = new Date() > new Date(event.registrationDeadline);
  const isCancelled = event.status === 'cancelled';
  const isCompleted = event.status === 'completed';
  const canRegister = !isSoldOut && !isPastDeadline && !isCancelled && !isCompleted && !isRegistered;

  const occupancyPercent = Math.min(
    100,
    Math.round(((event.totalSeats - event.availableSeats) / event.totalSeats) * 100)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Back button */}
      <Link
        to="/events"
        className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events</span>
      </Link>

      {/* Main Grid: Left Details & Right Booking Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Banner, Details, Organizer */}
        <div className="lg:col-span-8 space-y-8">
          {/* Large Hero Banner */}
          <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-video max-h-[460px] w-full bg-slate-900 border border-slate-200 dark:border-slate-800">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

            {/* Badges on Banner */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="px-3.5 py-1 text-xs font-bold rounded-full bg-indigo-600 text-white shadow-md">
                {event.category}
              </span>
              {event.isFeatured && (
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-500 text-white shadow-md flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Featured Event</span>
                </span>
              )}
            </div>

            {/* Banner bottom info */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs sm:text-sm">
              <span className="font-semibold bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                {formattedEventDate}
              </span>
              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-black/40 backdrop-blur-md hover:bg-black/60 border border-white/10 text-white transition-colors"
                title="Share Event"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Event Header Titles */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {event.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {event.shortDescription}
            </p>
          </div>

          {/* Event Metadata Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-start space-x-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Date & Schedule</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{formattedEventDate}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{event.startTime} - {event.endTime}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-start space-x-3.5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Location & Venue</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">{event.venue}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">In-person attendance</p>
              </div>
            </div>
          </div>

          {/* Full Description */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              About This Event
            </h2>
            <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {event.description}
            </div>
          </div>

          {/* Organizer Information */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              <span>Organizer Information</span>
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                  {event.organizerName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    {event.organizerName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Verified Host on EventHub
                  </p>
                </div>
              </div>

              <a
                href={`mailto:${event.organizerEmail}`}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors w-fit"
              >
                <Mail className="w-4 h-4 text-indigo-500" />
                <span>{event.organizerEmail}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Registration & Countdown Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-lg space-y-6">
            {/* Live Countdown Timer */}
            <div className="pb-6 border-b border-slate-100 dark:border-slate-800">
              <CountdownTimer targetDate={event.date} targetTime={event.startTime} />
            </div>

            {/* Seat Capacity Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600 dark:text-slate-400">Capacity & Seats</span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  {event.availableSeats} of {event.totalSeats} remaining
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    occupancyPercent > 90 ? 'bg-rose-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${occupancyPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {occupancyPercent}% seats filled
              </p>
            </div>

            {/* Registration Deadline Alert */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
              <p className="font-bold text-slate-800 dark:text-slate-200">
                Registration Deadline
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                Closes on {formattedDeadline}
              </p>
            </div>

            {/* Action Button & Status Message */}
            <div className="space-y-3 pt-2">
              {isRegistered ? (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm font-semibold flex items-center space-x-2.5">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>You are registered for this event!</span>
                </div>
              ) : isCancelled ? (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-sm font-semibold flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                  <span>This event has been cancelled by the host.</span>
                </div>
              ) : isCompleted ? (
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-semibold text-center">
                  This event has already concluded.
                </div>
              ) : isPastDeadline ? (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-sm font-semibold flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
                  <span>Registration deadline has passed.</span>
                </div>
              ) : isSoldOut ? (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-sm font-semibold flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
                  <span>Sold Out: Maximum capacity reached.</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleRegisterClick}
                  className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-black text-base shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Register Now (Free)</span>
                </button>
              )}

              {isRegistered && (
                <Link
                  to="/my-registrations"
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold text-center block transition-colors"
                >
                  Manage in My Registrations
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Registration Modal Dialog */}
      <RegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={event}
        onRegisteredSuccess={handleRegistrationSuccess}
      />
    </div>
  );
};

export default EventDetails;
