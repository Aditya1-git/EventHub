import React from 'react';
import { Server, ShieldCheck, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const handleClearCache = () => {
    localStorage.removeItem('eventhub_viewed');
    toast.success('Local cache cleared');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          System environment and quick maintenance options.
        </p>
      </div>

      <div className="space-y-4">
        {/* Environment Info */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Server className="w-4 h-4 text-indigo-400" />
            <span>Environment Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 space-y-1">
              <span className="text-slate-400">Environment</span>
              <p className="font-semibold text-emerald-400">development</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 space-y-1">
              <span className="text-slate-400">Database</span>
              <p className="font-semibold text-white">MongoDB (Mongoose ODM)</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 space-y-1">
              <span className="text-slate-400">Auth Method</span>
              <p className="font-semibold text-white">JWT + HTTP-Only Cookie</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 space-y-1">
              <span className="text-slate-400">File Storage</span>
              <p className="font-semibold text-white">Local Uploads & Public URLs</p>
            </div>
          </div>
        </div>

        {/* Maintenance */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Storage Maintenance</span>
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60">
            <div>
              <p className="text-xs font-semibold text-white">Clear Browser Storage</p>
              <p className="text-[11px] text-slate-400">Removes cached preferences and recent history.</p>
            </div>
            <button
              type="button"
              onClick={handleClearCache}
              className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs transition-colors flex items-center space-x-1.5 w-fit"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear Cache</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
