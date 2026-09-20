import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { PlusCircle, FolderKanban } from 'lucide-react';

export const MyProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectService.getMyProjects();
        setProjects(data.projects || []);
      } catch (err) {
        console.error('Failed to load my projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((p) => {
    if (filterStatus === 'open') return p.status === 'open';
    if (filterStatus === 'assigned') return p.status === 'assigned';
    return true;
  });

  if (loading) {
    return <LoadingSpinner text="Loading your projects..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-indigo-400" />
            My Posted Projects
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track applications, review submissions, and manage hired developers.
          </p>
        </div>

        <Link to="/client/create-project">
          <Button variant="primary" size="sm">
            <PlusCircle className="w-4 h-4" />
            Post New Project
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {['all', 'open', 'assigned'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
              filterStatus === tab
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab === 'all' ? `All (${projects.length})` : `${tab} (${projects.filter((p) => p.status === tab).length})`}
          </button>
        ))}
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description={
            filterStatus === 'all'
              ? 'You have not created any projects yet.'
              : `No projects currently marked as ${filterStatus}.`
          }
          actionLabel="Post New Project"
          onAction={() => (window.location.href = '/client/create-project')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project._id} project={project} role="client" />
          ))}
        </div>
      )}
    </div>
  );
};
