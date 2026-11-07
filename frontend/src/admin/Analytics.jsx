import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  Percent,
  CheckCircle,
  CalendarDays,
  Sparkles
} from 'lucide-react';
import api from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f97316', '#10b981', '#06b6d4', '#eab308', '#3b82f6'];

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/analytics');
        if (res.data.success) {
          setAnalytics(res.data.analytics);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Crunching MongoDB aggregation metrics..." />
      </div>
    );
  }

  const {
    monthlyTrends = [],
    categoryPerformance = [],
    eventOccupancy = [],
    statusBreakdown = []
  } = analytics || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Platform Analytics & Aggregations
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Deep database insights generated using Mongoose pipeline aggregation queries.
        </p>
      </div>

      {/* Grid 1: Monthly Trends & Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Monthly Trends */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Monthly Registration Volume (Last 6 Months)</span>
              </h2>
              <p className="text-xs text-slate-400">
                Tracking confirmed vs. cancelled passes per month.
              </p>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            {monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="confirmed" fill="#10b981" name="Confirmed Passes" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="cancelled" fill="#f43f5e" name="Cancelled Passes" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No monthly data logged yet.
              </div>
            )}
          </div>
        </div>

        {/* Category Performance */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white">
              Category Popularity
            </h2>
            <p className="text-xs text-slate-400">
              Registrations by event category.
            </p>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {categoryPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPerformance}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="registrations"
                    nameKey="category"
                  >
                    {categoryPerformance.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500">No category registrations yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Grid 2: Event Occupancy Rates & Event Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Occupancy Rate Table */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Percent className="w-4 h-4 text-indigo-400" />
              <span>Event Seat Occupancy Rates</span>
            </h2>
            <p className="text-xs text-slate-400">
              Percentage of capacity filled per top active event.
            </p>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Event Title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Booked / Total</th>
                  <th className="py-2.5 px-3">Fill Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {eventOccupancy.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-bold text-white max-w-[220px] truncate">
                      {item.title}
                    </td>
                    <td className="py-2.5 px-3 text-indigo-400">{item.category}</td>
                    <td className="py-2.5 px-3 font-mono">
                      {item.bookedSeats} / {item.totalSeats}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${item.occupancyRate}%` }}
                          />
                        </div>
                        <span className="font-bold text-white text-[11px]">
                          {item.occupancyRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Event Status Distribution */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white">
              Lifecycle Breakdown
            </h2>
            <p className="text-xs text-slate-400">
              Distribution of event statuses across MongoDB.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {statusBreakdown.map((item) => (
              <div
                key={item.status}
                className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      item.status === 'upcoming'
                        ? 'bg-emerald-400'
                        : item.status === 'completed'
                        ? 'bg-slate-400'
                        : item.status === 'ongoing'
                        ? 'bg-blue-400'
                        : 'bg-rose-400'
                    }`}
                  />
                  <span className="text-xs font-bold capitalize text-white">
                    {item.status} Events
                  </span>
                </div>
                <span className="text-sm font-black text-white font-mono">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
