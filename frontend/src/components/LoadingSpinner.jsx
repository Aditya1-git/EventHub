import React from 'react';

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-3">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} border-indigo-600 border-t-transparent rounded-full animate-spin`}
      />
      {text && <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{text}</p>}
    </div>
  );
};

export const EventCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 animate-pulse shadow-sm">
      <div className="h-48 bg-slate-200 dark:bg-slate-800 w-full" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-24" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" />
        </div>
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
        </div>
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" />
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-28" />
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
