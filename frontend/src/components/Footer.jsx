import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Mail, Phone, MapPin, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="about-section" className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
                <CalendarDays className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Event<span className="text-indigo-600 dark:text-indigo-400">Hub</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm">
              EventHub is a modern, full-stack event discovery and registration platform. Explore cutting-edge tech hackathons, workshops, cultural summits, and academic conferences all in one place.
            </p>
            <div className="flex space-x-3 pt-2"> 
              {/* GitHub */}
              <a href="https://github.com/Aditya1-git" target="_blank" rel="noreferrer" aria-label="GitHub" className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
              </a>
              {/* LinkedIn */}
              <a href="https://www.linkedin.com/in/2005-aditya/" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a> 
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Explore Events
                </Link>
              </li>
              <li>
                <Link to="/my-registrations" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  My Registrations
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  User Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Event Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Categories
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/events?category=Technology" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Technology & AI
                </Link>
              </li>
              <li>
                <Link to="/events?category=Hackathons" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Coding Hackathons
                </Link>
              </li>
              <li>
                <Link to="/events?category=Workshops" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Hands-on Workshops
                </Link>
              </li>
              <li>
                <Link to="/events?category=Cultural%20Events" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Cultural Fests
                </Link>
              </li>
            </ul>
          </div>

          {/* Event Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Categories
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/events?category=Technology" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Technology & AI
                </Link>
              </li>
              <li>
                <Link to="/events?category=Hackathons" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Coding Hackathons
                </Link>
              </li>
              <li>
                <Link to="/events?category=Workshops" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Hands-on Workshops
                </Link>
              </li>
              <li>
                <Link to="/events?category=Cultural%20Events" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Cultural Fests
                </Link>
              </li>
            </ul>
          </div>
 
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} EventHub Inc. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">
            Made with love by Aditya raj ❤️
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
