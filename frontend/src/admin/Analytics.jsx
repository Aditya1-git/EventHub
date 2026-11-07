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
  Legend
} from 'recharts';
import { TrendingUp, Percent } from 'lucide-react';
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
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading analytics..." />
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
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Booking trends and attendance statistics.
        </p>
      </div>

      {/* Grid 1: Monthly Trends & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Monthly Bookings (Last 6 Months)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Confirmed vs cancelled passes per month
            </p>
          </div>

          <div className="h-64 w-full pt-2">
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
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="confirmed" fill="#10b981" name="Confirmed" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cancelled" fill="#f43f5e" name="Cancelled" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No monthly data recorded yet.
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div>
            <h2 className="text-sm font-bold text-white">
              Category Share
            </h2>
            <p className="text-xs text-slate-400">
              Total passes by category
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {categoryPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPerformance}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="registrations"
                    nameKey="category"
                  >
                    {categoryPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500">No category data yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Grid 2: Occupancy Table & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Percent className="w-4 h-4 text-indigo-400" />
              <span>Seat Occupancy Rates</span>
            </h2>
            <p className="text-xs text-slate-400">
              Capacity filled per event
            </p>
          </div>

          <div className="overflow-x-auto pt-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">Event</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Booked / Total</th>
                  <th className="py-2 px-3">Fill Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {eventOccupancy.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-semibold text-white max-w-[200px] truncate">
                      {item.title}
                    </td>
                    <td className="py-2.5 px-3 text-indigo-400">{item.category}</td>
                    <td className="py-2.5 px-3 font-mono">
                      {item.bookedSeats} / {item.totalSeats}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${item.occupancyRate}%` }}
                          />
                        </div>
                        <span className="font-semibold text-white text-[11px]">
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

        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div>
            <h2 className="text-sm font-bold text-white">
              Status Breakdown
            </h2>
            <p className="text-xs text-slate-400">
              Events by current state
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            {statusBreakdown.map((item) => (
              <div
                key={item.status}
                className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      item.status === 'upcoming'
                        ? 'bg-emerald-400'
                        : item.status === 'completed'
                        ? 'bg-slate-400'
                        : item.status === 'ongoing'
                        ? 'bg-blue-400'
                        : 'bg-rose-400'
                    }`}
                  />
                  <span className="font-semibold capitalize text-white">
                    {item.status}
                  </span>
                </div>
                <span className="font-bold text-white font-mono">
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
