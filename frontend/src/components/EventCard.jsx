import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';

const categoryColors = {
  Technology: 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  Hackathons: 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  Workshops: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  'Cultural Events': 'bg-pink-100 text-pink-800 dark:bg-pink-950/70 dark:text-pink-300 border-pink-200 dark:border-pink-800',
  Business: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  Sports: 'bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  Music: 'bg-violet-100 text-violet-800 dark:bg-violet-950/70 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  Education: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
};

const EventCard = ({ event }) => {
  if (!event) return null;

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const categoryStyle = categoryColors[event.category] || 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300';
  const isSoldOut = event.availableSeats <= 0;
  const isCancelled = event.status === 'cancelled';
  const isCompleted = event.status === 'completed';

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
      {/* Event Image Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

        {/* Category & Featured Badge */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border backdrop-blur-md ${categoryStyle}`}>
            {event.category}
          </span>
          {event.isFeatured && (
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500 text-white shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* Status indicator on top right */}
        <div className="absolute top-3 right-3 z-10">
          {isCancelled ? (
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-600 text-white">
              Cancelled
            </span>
          ) : isCompleted ? (
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-600 text-white">
              Completed
            </span>
          ) : isSoldOut ? (
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-600 text-white">
              Sold Out
            </span>
          ) : (
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/90 text-white backdrop-blur-sm">
              {event.availableSeats} seats left
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Date & Time info */}
          <div className="flex items-center text-xs text-indigo-600 dark:text-indigo-400 font-semibold space-x-3">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{event.startTime}</span>
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {event.title}
          </h3>

          {/* Short Description */}
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {event.shortDescription}
          </p>
        </div>

        {/* Venue & Capacity Footer */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 truncate">
            <MapPin className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 text-slate-400" />
            <span className="truncate">{event.venue}</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
              <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <span>
                {event.totalSeats - event.availableSeats} / {event.totalSeats} registered
              </span>
            </div>

            <Link
              to={`/events/${event._id}`}
              className="inline-flex items-center space-x-1 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white dark:bg-indigo-950/60 dark:hover:bg-indigo-600 dark:text-indigo-300 dark:hover:text-white rounded-xl text-xs font-semibold transition-all duration-200"
            >
              <span>View Details</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
