import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  FolderKanban,
  PlusCircle,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export const ClientDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await projectService.getMyProjects();
        setProjects(data.projects || []);
      } catch (err) {
        console.error('Failed to fetch client projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const totalProjects = projects.length;
  const openProjects = projects.filter((p) => p.status === 'open').length;
  const assignedProjects = projects.filter((p) => p.status === 'assigned').length;
  const totalApplications = projects.reduce((acc, curr) => acc + (curr.applicationCount || 0), 0);
  const activeProjects = projects.filter((project) => project.status === 'assigned');
  const projectPeople = activeProjects.filter((project) => project.hiredFreelancer).map((project) => ({
    ...project.hiredFreelancer,
    projectTitle: project.title,
  }));

  if (loading) {
    return <LoadingSpinner text="Loading client dashboard..." />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-900 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Client Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {user?.company ? `Managing projects for ${user.company}` : 'Manage your posted projects and hired talent.'}
          </p>
        </div>

        <Link to="/client/create-project">
          <Button variant="primary" size="md" className="glow-indigo">
            <PlusCircle className="w-4 h-4" />
            Post New Project
          </Button>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Projects</span>
            <FolderKanban className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{totalProjects}</div>
          <span className="text-[11px] text-slate-500">All posted scopes</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Open Scopes</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{openProjects}</div>
          <span className="text-[11px] text-amber-400/80">Receiving applications</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Assigned & Hired</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{assignedProjects}</div>
          <span className="text-[11px] text-emerald-400/80">Freelancers working</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Applications Received</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{totalApplications}</div>
          <span className="text-[11px] text-slate-500">Across all projects</span>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <section className="rounded-2xl border border-[#294048] bg-[#122027] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div><p className="eyebrow">Delivery pulse</p><h2 className="mt-1 text-lg font-bold text-white">Active project progress</h2></div>
            <TrendingUp className="h-5 w-5 text-cyan-300" />
          </div>
          {activeProjects.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#385962] p-5 text-sm text-slate-400">Assign a freelancer to start tracking delivery progress here.</p>
          ) : (
            <div className="space-y-4">{activeProjects.slice(0, 3).map((project) => { const progress = Math.min(100, Math.max(0, Number(project.progress || project.completionPercentage || 0))); return <div key={project._id}><div className="mb-2 flex items-center justify-between gap-3 text-xs"><span className="truncate font-semibold text-slate-200">{project.title}</span><span className="text-cyan-200">{progress}%</span></div><div className="h-2 rounded-full bg-slate-800"><div className="h-2 rounded-full bg-cyan-300 transition-all duration-500" style={{ width: `${progress}%` }} /></div></div>; })}</div>
          )}
        </section>
        <section className="rounded-2xl border border-[#294048] bg-[#122027] p-5">
          <div className="mb-5 flex items-center justify-between"><div><p className="eyebrow">Your network</p><h2 className="mt-1 text-lg font-bold text-white">People in your projects</h2></div><Users className="h-5 w-5 text-amber-200" /></div>
          {projectPeople.length === 0 ? <p className="rounded-xl border border-dashed border-[#385962] p-5 text-sm text-slate-400">Your hired talent will appear here once a project is assigned.</p> : <div className="space-y-3">{projectPeople.slice(0, 3).map((person) => <div key={`${person._id}-${person.projectTitle}`} className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-300 font-bold text-slate-950">{person.name?.[0]?.toUpperCase() || 'U'}</div><div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{person.name}</p><p className="truncate text-xs text-slate-400">{person.title || person.projectTitle}</p></div><Badge variant="success" size="sm">Active</Badge></div>)}</div>}
        </section>
      </div>

      {/* Recent Projects List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-100">Your Projects</h2>
          <Link to="/client/projects" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            View All ({projects.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            title="No projects posted yet"
            description="Create your first project to start receiving proposals from top-rated freelancers."
            actionLabel="Create Project"
            onAction={() => (window.location.href = '/client/create-project')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.slice(0, 4).map((project) => (
              <ProjectCard key={project._id} project={project} role="client" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
