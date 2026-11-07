import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Users,
  Ticket,
  CalendarCheck,
  CheckCircle,
  XCircle,
  PlusCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import api from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f97316', '#eab308', '#10b981', '#06b6d4', '#3b82f6'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const stats = data?.stats || {
    totalEvents: 0,
    totalUsers: 0,
    totalRegistrations: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    cancelledRegistrations: 0
  };

  const charts = data?.charts || {
    registrationsOverTime: [],
    categoryDistribution: [],
    popularEvents: []
  };

  const statCards = [
    { title: 'Total Events', value: stats.totalEvents, icon: CalendarDays, textColor: 'text-blue-400' },
    { title: 'Total Users', value: stats.totalUsers, icon: Users, textColor: 'text-purple-400' },
    { title: 'Registrations', value: stats.totalRegistrations, icon: Ticket, textColor: 'text-emerald-400' },
    { title: 'Upcoming Events', value: stats.upcomingEvents, icon: CalendarCheck, textColor: 'text-amber-400' },
    { title: 'Completed Events', value: stats.completedEvents, icon: CheckCircle, textColor: 'text-cyan-400' },
    { title: 'Cancelled Passes', value: stats.cancelledRegistrations, icon: XCircle, textColor: 'text-rose-400' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Overview of events, bookings, and platform users.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/events/new"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Event</span>
          </Link>
          <Link
            to="/admin/registrations"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
          >
            View Bookings
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase text-slate-400">
                  {card.title}
                </span>
                <div className={`p-1.5 rounded-lg bg-slate-800 ${card.textColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-white">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">
                Registrations (Last 30 Days)
              </h2>
              <p className="text-xs text-slate-400">
                Daily bookings trend
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            {charts.registrationsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.registrationsOverTime}>
                  <defs>
                    <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="registrations"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#regGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No recent bookings recorded.
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div>
            <h2 className="text-sm font-bold text-white">
              Events by Category
            </h2>
            <p className="text-xs text-slate-400">
              Distribution across categories
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {charts.categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {charts.categoryDistribution.map((entry, index) => (
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
              <p className="text-xs text-slate-500">No events found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Top 5 Events */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white">
            Most Popular Events
          </h2>
          <p className="text-xs text-slate-400">
            Events with the highest confirmed registrations
          </p>
        </div>

        {charts.popularEvents.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.popularEvents} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    width={130}
                    tickFormatter={(val) => (val.length > 16 ? `${val.substring(0, 16)}...` : val)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="registrations" fill="#6366f1" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="lg:col-span-5 space-y-2.5">
              {charts.popularEvents.map((item) => (
                <div
                  key={item.eventId}
                  className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-white truncate">{item.name}</p>
                    <span className="text-[11px] text-indigo-400">{item.category}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-white">{item.registrations} passes</p>
                    <span className="text-[10px] text-slate-400">
                      {item.availableSeats} left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-500">
            No bookings recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
