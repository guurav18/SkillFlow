import React from 'react';
import { Search, Filter } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'AI & Machine Learning',
  'Data Science',
  'DevOps & Cloud',
  'Cybersecurity',
  'Content & Marketing',
];

export const ProjectFilter = ({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  onSearchSubmit,
}) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 mb-8 backdrop-blur-md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (onSearchSubmit) onSearchSubmit();
        }}
        className="flex min-w-0 flex-col gap-3 items-stretch md:flex-row md:items-center"
      >
        {/* Search input */}
        <div className="relative min-w-0 flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects by title, skill (e.g. React, Node.js), or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>

        {/* Category selector */}
        <div className="flex min-w-0 w-full flex-col gap-2 sm:flex-row md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full min-w-0 flex-1 px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-slate-900 text-slate-100">
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full min-w-0 flex-1 px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            <option value="newest" className="bg-slate-900 text-slate-100">
              Newest First
            </option>
            <option value="budget-high" className="bg-slate-900 text-slate-100">
              Highest Budget
            </option>
            <option value="budget-low" className="bg-slate-900 text-slate-100">
              Lowest Budget
            </option>
            <option value="deadline" className="bg-slate-900 text-slate-100">
              Deadline Approaching
            </option>
          </select>
        </div>
      </form>
    </div>
  );
};
