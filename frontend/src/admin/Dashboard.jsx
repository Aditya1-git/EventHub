import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Users,
  Ticket,
  CalendarCheck,
  CheckCircle,
  XCircle,
  TrendingUp,
  PlusCircle,
  ExternalLink
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
  Bar,
  Legend
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
        console.error('Error fetching admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Aggregating database statistics..." />
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
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: CalendarDays,
      color: 'from-blue-600 to-indigo-600',
      textColor: 'text-blue-400'
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-purple-600 to-violet-600',
      textColor: 'text-purple-400'
    },
    {
      title: 'Total Registrations',
      value: stats.totalRegistrations,
      icon: Ticket,
      color: 'from-emerald-600 to-teal-600',
      textColor: 'text-emerald-400'
    },
    {
      title: 'Upcoming Events',
      value: stats.upcomingEvents,
      icon: CalendarCheck,
      color: 'from-amber-600 to-orange-600',
      textColor: 'text-amber-400'
    },
    {
      title: 'Completed Events',
      value: stats.completedEvents,
      icon: CheckCircle,
      color: 'from-cyan-600 to-blue-600',
      textColor: 'text-cyan-400'
    },
    {
      title: 'Cancelled Registrations',
      value: stats.cancelledRegistrations,
      icon: XCircle,
      color: 'from-rose-600 to-red-600',
      textColor: 'text-rose-400'
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time analytics and platform metrics connected to MongoDB.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/events/new"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Event</span>
          </Link>
          <Link
            to="/admin/registrations"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            View Registrations
          </Link>
        </div>
      </div>

      {/* 1. Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl bg-slate-800 ${card.textColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-white tracking-tight">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Registrations Over Time Area Chart */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">
                Registration Trends (Last 30 Days)
              </h2>
              <p className="text-xs text-slate-400">
                Number of confirmed user event bookings over time.
              </p>
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800">
              Live Aggregate
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            {charts.registrationsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.registrationsOverTime}>
                  <defs>
                    <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="registrations"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#regGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No registrations logged within the last 30 days.
              </div>
            )}
          </div>
        </div>

        {/* Category Distribution Pie Chart */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white">
              Category Distribution
            </h2>
            <p className="text-xs text-slate-400">
              Proportion of events by domain.
            </p>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            {charts.categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {charts.categoryDistribution.map((entry, index) => (
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
              <p className="text-xs text-slate-500">No events found.</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Popular Events Bar Chart & Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div>
          <h2 className="text-base font-bold text-white">
            Top 5 Most Popular Events
          </h2>
          <p className="text-xs text-slate-400">
            Ranked by confirmed attendee registration volume.
          </p>
        </div>

        {charts.popularEvents.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.popularEvents} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    width={140}
                    tickFormatter={(val) => (val.length > 18 ? `${val.substring(0, 18)}...` : val)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="registrations" fill="#818cf8" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="lg:col-span-5 space-y-3">
              {charts.popularEvents.map((item, idx) => (
                <div
                  key={item.eventId}
                  className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-white truncate">{item.name}</p>
                    <span className="text-indigo-400 font-semibold">{item.category}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-white text-sm">
                      {item.registrations} regs
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {item.availableSeats} seats left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            No registrations currently logged for events.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
