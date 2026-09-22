import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import {
  FolderKanban,
  PlusCircle,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Activity,
  Layers,
} from 'lucide-react';

const isMeaningfulText = (val) => {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim().toLowerCase();
  const dummyWords = ['kuch nhi', 'kuch nahi', 'none', 'n/a', 'na', 'null', 'undefined', 'test', 'xyz', 'no', 'nothing'];
  return trimmed.length > 0 && !dummyWords.includes(trimmed);
};

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
  const projectPeople = activeProjects.flatMap((project) => {
    const list = [];
    if (project.hiredFreelancer) {
      list.push({
        ...project.hiredFreelancer,
        projectTitle: project.title,
      });
    }
    if (Array.isArray(project.assignedFreelancers)) {
      project.assignedFreelancers.forEach((f) => {
        if (f && f._id !== project.hiredFreelancer?._id) {
          list.push({
            ...f,
            projectTitle: project.title,
          });
        }
      });
    }
    return list;
  });

  if (loading) {
    return <LoadingSpinner text="Loading client dashboard..." />;
  }

  const hasValidCompany = isMeaningfulText(user?.company);

  return (
    <div className="space-y-8">
      {/* Hero / Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--sf-border)] bg-[var(--sf-card)] p-6 sm:p-7 shadow-xs">
        {/* Subtle decorative background accent */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-gradient-to-br from-[#3157d5]/10 via-[#3157d5]/5 to-transparent blur-2xl" />
        <div className="pointer-events-none absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#3157d5] via-[#4f46e5] to-[#0f766e]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#eef2ff] text-[#3157d5] dark:bg-indigo-500/15 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/25">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Client Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--sf-ink)]">
              Welcome back, {user?.name || 'Client'}
            </h1>
            <p className="text-sm text-[var(--sf-muted)] max-w-xl leading-relaxed">
              {hasValidCompany
                ? `Managing projects for ${user.company}. Monitor scopes, review incoming proposals, and coordinate delivery.`
                : 'Manage your active scopes, review incoming proposals, and collaborate with your team.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/client/create-project">
              <Button variant="primary" size="md" className="font-semibold shadow-xs">
                <PlusCircle className="w-4 h-4" />
                <span>Post New Project</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div className="rounded-2xl border border-[var(--sf-border)] bg-[var(--sf-card)] p-5 shadow-xs transition-all duration-200 hover:border-[#3157d5]/30 hover:shadow-sm hover:-translate-y-0.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--sf-muted)]">Total Projects</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-[#3157d5] dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center shrink-0">
                <FolderKanban className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--sf-ink)]">
              {totalProjects}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[var(--sf-border)] text-xs text-[var(--sf-muted)]">
            {totalProjects === 0 ? 'No projects posted yet' : `${totalProjects} total scope${totalProjects === 1 ? '' : 's'}`}
          </div>
        </div>

        {/* Active Open Scopes */}
        <div className="rounded-2xl border border-[var(--sf-border)] bg-[var(--sf-card)] p-5 shadow-xs transition-all duration-200 hover:border-amber-500/30 hover:shadow-sm hover:-translate-y-0.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--sf-muted)]">Active Open Scopes</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--sf-ink)]">
              {openProjects}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[var(--sf-border)] text-xs text-[var(--sf-muted)]">
            {openProjects === 0 ? 'No open scopes currently' : `${openProjects} receiving proposals`}
          </div>
        </div>

        {/* Assigned & Hired */}
        <div className="rounded-2xl border border-[var(--sf-border)] bg-[var(--sf-card)] p-5 shadow-xs transition-all duration-200 hover:border-emerald-500/30 hover:shadow-sm hover:-translate-y-0.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--sf-muted)]">Assigned &amp; Hired</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--sf-ink)]">
              {assignedProjects}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[var(--sf-border)] text-xs text-[var(--sf-muted)]">
            {assignedProjects === 0 ? 'No active contracts yet' : `${assignedProjects} in delivery`}
          </div>
        </div>

        {/* Applications Received */}
        <div className="rounded-2xl border border-[var(--sf-border)] bg-[var(--sf-card)] p-5 shadow-xs transition-all duration-200 hover:border-purple-500/30 hover:shadow-sm hover:-translate-y-0.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--sf-muted)]">Applications Received</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--sf-ink)]">
              {totalApplications}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[var(--sf-border)] text-xs text-[var(--sf-muted)]">
            {totalApplications === 0 ? 'Applications appear after posting' : 'Across all your projects'}
          </div>
        </div>
      </div>

      {/* Zero Projects Onboarding Callout */}
      {totalProjects === 0 && (
        <div className="rounded-2xl border border-dashed border-[#3157d5]/30 bg-[#eef2ff]/40 dark:bg-indigo-950/20 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#3157d5] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--sf-ink)]">You haven't posted any projects yet</h3>
              <p className="text-xs text-[var(--sf-muted)] mt-0.5 max-w-lg leading-relaxed">
                Create your first scope to find verified freelancers, generate AI task breakdowns, and receive competitive proposals.
              </p>
            </div>
          </div>
          <Link to="/client/create-project" className="shrink-0">
            <Button variant="primary" size="sm" className="font-semibold shadow-xs">
              <PlusCircle className="w-3.5 h-3.5" />
              Post Your First Project
            </Button>
          </Link>
        </div>
      )}

      {/* Progress & Network Grid */}
      <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        {/* Delivery Pulse: Active Project Progress */}
        <section className="rounded-2xl border border-[var(--sf-border)] bg-[var(--sf-card)] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow text-[11px] font-bold tracking-wider text-[#3157d5] uppercase">Delivery Pulse</p>
                <h2 className="mt-0.5 text-base sm:text-lg font-bold text-[var(--sf-ink)]">Active project progress</h2>
              </div>
              <div className="w-8 h-8 rounded-xl bg-[#eef2ff] dark:bg-indigo-500/15 text-[#3157d5] dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center shrink-0">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>

            {activeProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-[var(--sf-border)] bg-[var(--sf-surface)]/50 my-2">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[var(--sf-muted)] mb-3 border border-[var(--sf-border)]">
                  <Activity className="w-5 h-5 text-[#3157d5]" />
                </div>
                <p className="text-xs font-semibold text-[var(--sf-ink)]">No projects currently in progress</p>
                <p className="text-[11px] text-[var(--sf-muted)] max-w-xs mt-1 leading-relaxed">
                  Once you assign a freelancer to an open project, real-time milestone and task progress will be visualized here.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5 pt-1">
                {activeProjects.slice(0, 3).map((project) => {
                  const progress = Math.min(100, Math.max(0, Number(project.progress || project.completionPercentage || 0)));
                  return (
                    <div key={project._id} className="p-3.5 rounded-xl bg-[var(--sf-surface)]/60 border border-[var(--sf-border)] space-y-2">
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <Link
                          to={`/projects/${project._id}/workspace`}
                          className="truncate font-semibold text-[var(--sf-ink)] hover:text-[#3157d5] transition"
                        >
                          {project.title}
                        </Link>
                        <span className="font-bold text-[#3157d5] shrink-0">{progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700/80 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#3157d5] to-[#4f46e5] transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Your Network: People in your projects */}
        <section className="rounded-2xl border border-[var(--sf-border)] bg-[var(--sf-card)] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow text-[11px] font-bold tracking-wider text-[#3157d5] uppercase">Your Network</p>
                <h2 className="mt-0.5 text-base sm:text-lg font-bold text-[var(--sf-ink)]">People in your projects</h2>
              </div>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center shrink-0">
                <Users className="h-4 w-4" />
              </div>
            </div>

            {projectPeople.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-[var(--sf-border)] bg-[var(--sf-surface)]/50 my-2">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[var(--sf-muted)] mb-3 border border-[var(--sf-border)]">
                  <Users className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-xs font-semibold text-[var(--sf-ink)]">No talent hired yet</p>
                <p className="text-[11px] text-[var(--sf-muted)] max-w-xs mt-1 leading-relaxed">
                  Hired freelancers and collaborators will appear here for fast messaging and workspace access.
                </p>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                {projectPeople.slice(0, 3).map((person, idx) => (
                  <div
                    key={`${person._id || idx}-${person.projectTitle}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--sf-surface)]/60 border border-[var(--sf-border)]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#3157d5] to-[#2648c3] font-bold text-xs text-white shadow-xs ring-2 ring-[#3157d5]/15">
                        {person.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-[var(--sf-ink)]">{person.name}</p>
                        <p className="truncate text-[11px] text-[var(--sf-muted)]">{person.title || person.projectTitle}</p>
                      </div>
                    </div>
                    <Badge variant="success" size="sm" className="shrink-0">Active</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Recent Projects List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--sf-ink)]">Your Projects</h2>
            <p className="text-xs text-[var(--sf-muted)]">Recent project scopes and proposal activity</p>
          </div>
          {projects.length > 0 && (
            <Link
              to="/client/projects"
              className="text-xs font-semibold text-[#3157d5] hover:underline flex items-center gap-1.5 transition"
            >
              <span>View All ({projects.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects posted yet"
            description="Create your first project scope to start receiving competitive proposals from top-rated freelancers."
            actionLabel="Post a Project"
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

