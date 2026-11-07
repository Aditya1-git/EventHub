import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Filter,
  RotateCcw
} from 'lucide-react';
import api from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);

  // Delete modal state
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (category !== 'All') params.append('category', category);
      if (status !== 'All') params.append('status', status);
      params.append('page', page);
      params.append('limit', 10);

      const res = await api.get(`/admin/events?${params.toString()}`);
      if (res.data.success) {
        setEvents(res.data.events);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching admin events:', err);
      toast.error('Failed to load events table');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [category, status, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  const handleOpenDelete = (event) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/events/${eventToDelete._id}`);
      if (res.data.success) {
        toast.success('Event and associated registrations deleted');
        setEvents((prev) => prev.filter((e) => e._id !== eventToDelete._id));
        setTotal((prev) => prev - 1);
        setIsDeleteModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Manage Events
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            View, edit, or add events on the platform.
          </p>
        </div>

        <Link
          to="/admin/events/new"
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-2 w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Event</span>
        </Link>
      </div>

      {/* Filter Row */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full md:max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, venue, organizer..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Categories</option>
            <option value="Technology">Technology</option>
            <option value="Hackathons">Hackathons</option>
            <option value="Workshops">Workshops</option>
            <option value="Cultural Events">Cultural Events</option>
            <option value="Business">Business</option>
            <option value="Sports">Sports</option>
            <option value="Music">Music</option>
            <option value="Education">Education</option>
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearch('');
              setCategory('All');
              setStatus('All');
              setPage(1);
            }}
            title="Reset Filters"
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Events Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="md" text="Loading events..." />
          </div>
        ) : events.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Event</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Venue</th>
                  <th className="py-3.5 px-4">Seats (Avail/Total)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {events.map((evt) => {
                  const eventDate = new Date(evt.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  return (
                    <tr
                      key={evt._id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Image & Title */}
                      <td className="py-3 px-4 flex items-center space-x-3">
                        <img
                          src={evt.image}
                          alt={evt.title}
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-slate-800"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';
                          }}
                        />
                        <div className="min-w-0 max-w-[200px]">
                          <p className="font-bold text-white truncate">{evt.title}</p>
                          <p className="text-[11px] text-slate-400 truncate">
                            By {evt.organizerName}
                          </p>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                          {evt.category}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-4">
                        <p className="text-white font-medium">{eventDate}</p>
                        <p className="text-[10px] text-slate-400">{evt.startTime}</p>
                      </td>

                      {/* Venue */}
                      <td className="py-3 px-4 text-slate-300 max-w-[180px] truncate">
                        {evt.venue}
                      </td>

                      {/* Seats */}
                      <td className="py-3 px-4 font-mono font-medium">
                        <span className={evt.availableSeats > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {evt.availableSeats}
                        </span>{' '}
                        / <span className="text-slate-400">{evt.totalSeats}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            evt.status === 'upcoming'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : evt.status === 'completed'
                              ? 'bg-slate-800 text-slate-400 border border-slate-700'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {evt.status}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Link
                            to={`/events/${evt._id}`}
                            target="_blank"
                            title="View Public Page"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            to={`/admin/events/edit/${evt._id}`}
                            title="Edit Event"
                            className="p-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 text-indigo-400 hover:text-white transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(evt)}
                            title="Delete Event"
                            className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <p>No events found matching your criteria.</p>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-800/40 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing Page {page} of {totalPages} ({total} events)
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-medium"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Event?"
        message={`Are you sure you want to permanently delete "${eventToDelete?.title}"? All associated registrations will also be cancelled.`}
        confirmText="Yes, Delete Event"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={deleting}
      />
    </div>
  );
};

export default ManageEvents;
