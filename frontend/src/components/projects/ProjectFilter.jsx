import React from 'react';
import { Search } from 'lucide-react';

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
    <div className="bg-[var(--sf-card)] border border-[var(--sf-border)] rounded-2xl p-4 sm:p-5 mb-8 shadow-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (onSearchSubmit) onSearchSubmit();
        }}
        className="flex min-w-0 flex-col gap-3 items-stretch md:flex-row md:items-center"
      >
        {/* Search input */}
        <div className="relative min-w-0 flex-1">
          <Search className="w-4 h-4 text-[var(--sf-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects by title, skill (e.g. React, Node.js), or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--sf-surface)] border border-[var(--sf-border)] rounded-xl text-sm text-[var(--sf-ink)] placeholder-[var(--sf-muted)] focus:outline-none focus:border-[#3157d5] focus:ring-1 focus:ring-[#3157d5] transition"
          />
        </div>

        {/* Category selector */}
        <div className="flex min-w-0 w-full flex-col gap-2 sm:flex-row md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full min-w-0 flex-1 px-3.5 py-2.5 bg-[var(--sf-surface)] border border-[var(--sf-border)] rounded-xl text-sm text-[var(--sf-ink)] focus:outline-none focus:border-[#3157d5] transition cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-[var(--sf-card)] text-[var(--sf-ink)]">
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full min-w-0 flex-1 px-3.5 py-2.5 bg-[var(--sf-surface)] border border-[var(--sf-border)] rounded-xl text-sm text-[var(--sf-ink)] focus:outline-none focus:border-[#3157d5] transition cursor-pointer"
          >
            <option value="newest" className="bg-[var(--sf-card)] text-[var(--sf-ink)]">
              Newest First
            </option>
            <option value="budget-high" className="bg-[var(--sf-card)] text-[var(--sf-ink)]">
              Highest Budget
            </option>
            <option value="budget-low" className="bg-[var(--sf-card)] text-[var(--sf-ink)]">
              Lowest Budget
            </option>
            <option value="deadline" className="bg-[var(--sf-card)] text-[var(--sf-ink)]">
              Deadline Approaching
            </option>
          </select>
        </div>
      </form>
    </div>
  );
};
