import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { ProjectFilter } from '../../components/projects/ProjectFilter';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Search, Sparkles } from 'lucide-react';

export const BrowseProjectsPage = () => {
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = {
        search: search.trim() || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        sort: sortBy,
      };
      const data = await projectService.getProjects(params);
      setProjects(data.projects || []);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [selectedCategory, sortBy]);

  const handleSearchSubmit = () => {
    fetchProjects();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-2.5">
          <Search className="w-7 h-7 text-indigo-400" />
          Explore Open Projects
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Discover verified opportunities, filter by specialization, and submit competitive proposals.
        </p>
      </div>

      {/* Filter Component */}
      <ProjectFilter
        search={search}
        setSearch={setSearch}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Results */}
      {loading ? (
        <LoadingSpinner text="Searching available projects..." />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No open projects found"
          description="Try broadening your search keywords or switching category filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setSelectedCategory('All');
            setSortBy('newest');
          }}
        />
      ) : (
        <div>
          <div className="text-xs text-slate-400 font-medium mb-4">
            Showing <strong className="text-slate-200">{projects.length}</strong> available project{projects.length === 1 ? '' : 's'}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} role="freelancer" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
