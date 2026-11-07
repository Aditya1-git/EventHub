import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Filter,
  RotateCcw,
  Ticket,
  Calendar,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  User
} from 'lucide-react';
import api from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ManageRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [eventId, setEventId] = useState('All');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  // Load events list for filter dropdown
  useEffect(() => {
    const fetchEventsDropdown = async () => {
      try {
        const res = await api.get('/events?limit=100');
        if (res.data.success) {
          setEventsList(res.data.events);
        }
      } catch (err) {
        console.error('Error fetching events dropdown:', err);
      }
    };
    fetchEventsDropdown();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (eventId !== 'All') params.append('eventId', eventId);
      if (status !== 'All') params.append('status', status);
      params.append('page', page);
      params.append('limit', 10);

      const res = await api.get(`/admin/registrations?${params.toString()}`);
      if (res.data.success) {
        setRegistrations(res.data.registrations);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
      toast.error('Failed to load registrations table');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [eventId, status, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRegistrations();
  };

  // CSV Export
  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (eventId !== 'All') params.append('eventId', eventId);
      if (status !== 'All') params.append('status', status);
      params.append('export', 'csv');

      const response = await api.get(`/admin/registrations?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `eventhub_registrations_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Registration data exported as CSV!');
    } catch (err) {
      console.error('Error exporting CSV:', err);
      toast.error('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Manage Registrations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            View all attendee registrations and export as CSV.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={exporting}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all flex items-center space-x-2 w-fit cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{exporting ? 'Generating CSV...' : 'Export to CSV'}</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full md:max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by participant name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          {/* Event Filter */}
          <select
            value={eventId}
            onChange={(e) => {
              setEventId(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[200px]"
          >
            <option value="All">All Events</option>
            {eventsList.map((e) => (
              <option key={e._id} value={e._id}>
                {e.title}
              </option>
            ))}
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
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearch('');
              setEventId('All');
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

      {/* Registrations Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="md" text="Loading registrations..." />
          </div>
        ) : registrations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Participant</th>
                  <th className="py-3.5 px-4">Contact Details</th>
                  <th className="py-3.5 px-4">Event Title</th>
                  <th className="py-3.5 px-4">Event Date & Venue</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Registered On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {registrations.map((reg) => {
                  const isConfirmed = reg.registrationStatus === 'confirmed';
                  const regDate = new Date(reg.registeredAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  const evtDate = reg.event?.date
                    ? new Date(reg.event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : 'N/A';

                  return (
                    <tr
                      key={reg._id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Participant */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                            {reg.participantName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white">{reg.participantName}</p>
                            <p className="text-[10px] text-slate-400">ID: {reg._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4">
                        <p className="text-white flex items-center space-x-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{reg.email}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{reg.phone}</span>
                        </p>
                      </td>

                      {/* Event Title */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-white max-w-[200px] truncate">
                          {reg.event?.title || 'Unknown Event'}
                        </p>
                        <span className="text-[10px] text-indigo-400">
                          {reg.event?.category || 'General'}
                        </span>
                      </td>

                      {/* Event Date & Venue */}
                      <td className="py-3 px-4">
                        <p className="text-white font-medium">{evtDate}</p>
                        <p className="text-[10px] text-slate-400 max-w-[150px] truncate">
                          {reg.event?.venue || 'Online'}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {isConfirmed ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center space-x-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Confirmed</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800 flex items-center space-x-1 w-fit">
                            <XCircle className="w-3 h-3" />
                            <span>Cancelled</span>
                          </span>
                        )}
                      </td>

                      {/* Registered Date */}
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {regDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <p>No registrations found matching your query.</p>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-800/40 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing Page {page} of {totalPages} ({total} registrations)
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
    </div>
  );
};

export default ManageRegistrations;
