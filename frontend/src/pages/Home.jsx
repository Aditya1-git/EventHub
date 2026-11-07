import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Calendar,
  Search,
  BellRing
} from 'lucide-react';
import api from '../services/api';
import EventCard from '../components/EventCard';
import CategoryFilter, { categories } from '../components/CategoryFilter';
import { EventCardSkeleton } from '../components/LoadingSpinner';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);

  const [heroSearch, setHeroSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('upcoming');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const scrollTarget = params.get('scroll');
    if (scrollTarget) {
      const el = document.getElementById(`${scrollTarget}-section`);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoadingFeatured(true);
        const res = await api.get('/events/featured');
        if (res.data.success) {
          setFeaturedEvents(res.data.events);
        }
      } catch (err) {
        console.error('Failed to load featured events:', err);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        setLoadingUpcoming(true);
        let url = `/events?status=upcoming&sort=${sortOption}&page=${currentPage}&limit=6`;
        if (selectedCategory !== 'All') {
          url += `&category=${encodeURIComponent(selectedCategory)}`;
        }
        const res = await api.get(url);
        if (res.data.success) {
          setUpcomingEvents(res.data.events);
          setTotalPages(res.data.totalPages || 1);
        }
      } catch (err) {
        console.error('Failed to load upcoming events:', err);
      } finally {
        setLoadingUpcoming(false);
      }
    };
    fetchUpcoming();
  }, [selectedCategory, sortOption, currentPage]);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/events?search=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/events');
    }
  };

  return (
    <div className="space-y-16 lg:space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-16 lg:py-28 rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 shadow-xl border border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.25),transparent)]" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs sm:text-sm font-medium">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Discover campus events, hackathons & workshops</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Discover Events. <br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Create Memories.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
            Find technical hackathons, hands-on development workshops, cultural fests, and sports matches happening around you.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleHeroSearch}
            className="max-w-xl mx-auto flex flex-col sm:flex-row items-center p-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-lg gap-2"
          >
            <div className="flex-1 flex items-center px-3 w-full text-slate-400">
              <Search className="w-5 h-5 mr-2 text-indigo-400 flex-shrink-0" />
              <input
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Search events, topics, or venues..."
                className="w-full bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>Search</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/events"
              className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-colors shadow flex items-center space-x-2"
            >
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>Explore All Events</span>
            </Link>
            <a
              href="#categories-section"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 transition-colors"
            >
              Browse Categories
            </a>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Top Picks
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Featured Events
            </h2>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center space-x-1 text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>View all</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingFeatured ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <EventCardSkeleton />
            <EventCardSkeleton />
            <EventCardSkeleton />
          </div>
        ) : featuredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((evt) => (
              <EventCard key={evt._id} event={evt} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-sm text-slate-500">
            No featured events at the moment.
          </div>
        )}
      </section>

      {/* Categories */}
      <section id="categories-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Categories
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Explore by Category
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Find the right activities for your interests.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories
            .filter((c) => c.name !== 'All')
            .map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  to={`/events?category=${encodeURIComponent(cat.name)}`}
                  className="group p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all flex flex-col items-center text-center space-y-2"
                >
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">Browse events</p>
                  </div>
                </Link>
              );
            })}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Schedule
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Upcoming Events
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200"
            >
              <option value="upcoming">Soonest</option>
              <option value="date-desc">Latest</option>
              <option value="seats">Most Seats</option>
              <option value="newest">Recently Added</option>
            </select>
          </div>
        </div>

        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setCurrentPage(1);
          }}
        />

        {loadingUpcoming ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            <EventCardSkeleton />
            <EventCardSkeleton />
            <EventCardSkeleton />
          </div>
        ) : upcomingEvents.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {upcomingEvents.map((evt) => (
                <EventCard key={evt._id} event={evt} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 pt-6">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300"
                >
                  Prev
                </button>
                <span className="text-xs text-slate-500 px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-2">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              No events found for {selectedCategory}.
            </p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Reset filter
            </button>
          </div>
        )}
      </section>

      {/* Why EventHub Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800">
          <div className="max-w-2xl mx-auto text-center space-y-2 mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Platform Benefits
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold">
              Why use EventHub?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              A straightforward way for students to discover and register for campus activities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm">Discover Great Events</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Filter by category, date, or venue with real-time seat availability.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm">One-Click Sign Up</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Registered users can reserve seats instantly with pre-filled details.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm">Manage Your Passes</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                View your confirmed passes, track dates, or cancel anytime if plans change.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                <BellRing className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm">Live Timers</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Real-time countdown clocks keep you informed before seats run out.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-indigo-600 rounded-3xl p-8 sm:p-12 text-center text-white space-y-5">
          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold">
              Ready to attend your next event?
            </h2>
            <p className="text-indigo-100 text-xs sm:text-sm">
              Create an account in seconds and register for upcoming hackathons and workshops.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/events"
              className="px-6 py-2.5 bg-white text-indigo-700 hover:bg-slate-100 font-bold text-xs sm:text-sm rounded-xl transition-colors shadow"
            >
              Browse Events
            </Link>
            <Link
              to="/register"
              className="px-6 py-2.5 bg-indigo-800 hover:bg-indigo-900 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
