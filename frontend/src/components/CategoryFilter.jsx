import React from 'react';
import {
  Sparkles,
  Cpu,
  Terminal,
  Hammer,
  Palette,
  Briefcase,
  Trophy,
  Music2,
  GraduationCap
} from 'lucide-react';

export const categories = [
  { name: 'All', icon: Sparkles },
  { name: 'Technology', icon: Cpu },
  { name: 'Hackathons', icon: Terminal },
  { name: 'Workshops', icon: Hammer },
  { name: 'Cultural Events', icon: Palette },
  { name: 'Business', icon: Briefcase },
  { name: 'Sports', icon: Trophy },
  { name: 'Music', icon: Music2 },
  { name: 'Education', icon: GraduationCap }
];

const CategoryFilter = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar py-1">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selectedCategory === cat.name;

        return (
          <button
            key={cat.name}
            onClick={() => onSelectCategory(cat.name)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 cursor-pointer ${
              isSelected
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-105'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-indigo-500'}`} />
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
