import React, { useEffect, useState } from 'react';
import { projectService } from '../../services/projectService';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Briefcase } from 'lucide-react';

export const FreelancerMyProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyProjects = async () => {
      try {
        const data = await projectService.getMyProjects();
        setProjects(data.projects || []);
      } catch (err) {
        console.error('Failed to load freelancer projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyProjects();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading your active contracts..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-emerald-400" />
          My Hired Contracts
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Projects where your proposal was accepted and you are currently contracted.
        </p>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="No active contracts yet"
          description="When a client accepts your project proposal, the project will appear in this workspace."
          actionLabel="Explore Open Projects"
          onAction={() => (window.location.href = '/freelancer/browse')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} role="freelancer" />
          ))}
        </div>
      )}
    </div>
  );
};
