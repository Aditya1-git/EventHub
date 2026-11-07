import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Search,
  BellRing
} from 'lucide-react';
import api from '../services/api';
import EventCard from '../components/EventCard';
import CategoryFilter, { categories } from '../components/CategoryFilter';
import { LoadingSpinner, EventCardSkeleton } from '../components/LoadingSpinner';

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

  // Handle scroll anchor if passed via query
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const scrollTarget = params.get('scroll');
    if (scrollTarget) {
      const el = document.getElementById(`${scrollTarget}-section`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  // Fetch Featured Events
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoadingFeatured(true);
        const res = await api.get('/events/featured');
        if (res.data.success) {
          setFeaturedEvents(res.data.events);
        }
      } catch (err) {
        console.error('Error fetching featured events:', err);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  // Fetch Upcoming Events with filtering and sorting
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
        console.error('Error fetching upcoming events:', err);
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
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-20 lg:py-32 rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 shadow-2xl border border-slate-800">
        {/* Ambient background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.3),rgba(255,255,255,0))]" />
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs sm:text-sm font-semibold backdrop-blur-sm animate-in fade-in zoom-in-95 duration-500">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>The Premier Event Discovery & Registration Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
            Discover Events. <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-pink-400 bg-clip-text text-transparent">
              Create Memories.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Find exciting events, connect with people, and experience something extraordinary. From high-octane coding hackathons to classical symphonies.
          </p>

          {/* Quick Hero Search Bar */}
          <form
            onSubmit={handleHeroSearch}
            className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center p-2 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-xl backdrop-blur-md gap-2"
          >
            <div className="flex-1 flex items-center px-4 w-full text-slate-400">
              <Search className="w-5 h-5 mr-3 text-indigo-400 flex-shrink-0" />
              <input
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Search hackathons, workshops, conferences..."
                className="w-full bg-transparent text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 flex-shrink-0"
            >
              <span>Search</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/events"
              className="px-6 py-3.5 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-100 transition-all shadow-lg flex items-center space-x-2"
            >
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>Explore All Events</span>
            </Link>
            <a
              href="#categories-section"
              className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm transition-all"
            >
              Browse Categories
            </a>
          </div>
        </div>
      </section>

      {/* 2. FEATURED EVENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Handpicked Highlights</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Featured Events
            </h2>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center space-x-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            <span>View all featured</span>
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
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <p className="text-slate-500 dark:text-slate-400">No featured events currently available.</p>
          </div>
        )}
      </section>

      {/* 3. CATEGORIES SECTION */}
      <section id="categories-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Browse By Interest
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Event Categories
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Discover tailored experiences designed for your passion and profession.
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
                  className="group p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg transition-all duration-200 flex flex-col items-center text-center space-y-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Explore events
                    </p>
                  </div>
                </Link>
              );
            })}
        </div>
      </section>

      {/* 4. UPCOMING EVENTS WITH LIVE FILTERING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Live Database
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Upcoming Events
            </h2>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Sort by:
            </label>
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="upcoming">Earliest Date</option>
              <option value="date-desc">Latest Date</option>
              <option value="seats">Most Seats Available</option>
              <option value="newest">Recently Added</option>
            </select>
          </div>
        </div>

        {/* Category Pills Bar */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setCurrentPage(1);
          }}
        />

        {/* Event Cards Grid */}
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-3 pt-6">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-50 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-50 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
              No upcoming events found for "{selectedCategory}".
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Try choosing another category or clear the filter.
            </p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="px-4 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl hover:bg-indigo-100 transition-colors"
            >
              Show All Events
            </button>
          </div>
        )}
      </section>

      {/* 5. WHY CHOOSE EVENTHUB? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-3xl mx-auto text-center space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Engineered For Seamless Experiences
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Why Choose EventHub?
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              From discovering top conferences to effortless instant seat bookings.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Discover Amazing Events</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Filter by verified categories, dates, and venues with real-time seat availability counts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Easy Online Registration</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                One-click registration for logged-in attendees with instant confirmation and seat allocation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Manage Registrations</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dedicated attendee dashboard to view tickets, track statuses, or cancel anytime.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                <BellRing className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Stay Updated</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Live countdown timers and instant notifications ensure you never miss a registration window.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent)]" />
          <div className="relative max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Ready to Join Your Next Great Event?
            </h2>
            <p className="text-indigo-100 text-sm sm:text-base">
              Create your account in seconds, explore upcoming hackathons, tech workshops, and cultural festivals.
            </p>
          </div>
          <div className="relative flex flex-wrap justify-center gap-4">
            <Link
              to="/events"
              className="px-8 py-3.5 bg-white text-indigo-700 hover:bg-slate-100 font-bold text-sm rounded-xl shadow-lg transition-all"
            >
              Explore Events Now
            </Link>
            <Link
              to="/register"
              className="px-8 py-3.5 bg-indigo-900/60 hover:bg-indigo-900 border border-indigo-400/30 text-white font-bold text-sm rounded-xl transition-all"
            >
              Sign Up for Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
