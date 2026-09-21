import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';
import { applicationService } from '../../services/applicationService';
import { taskService } from '../../services/taskService';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';
import {
  Search,
  FileCheck2,
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  GitPullRequestArrow,
  CheckCheck,
  Layers,
  ExternalLink,
} from 'lucide-react';

const isMeaningfulText = (val) => {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim().toLowerCase();
  const dummyWords = ['kuch nhi', 'kuch nahi', 'none', 'n/a', 'na', 'null', 'undefined', 'test', 'xyz', 'no', 'nothing'];
  return trimmed.length > 0 && !dummyWords.includes(trimmed);
};

export const FreelancerDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [hiredProjects, setHiredProjects] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [workflowTasks, setWorkflowTasks] = useState([]);
  const [pendingActionCount, setPendingActionCount] = useState(0);
  const [projectSearch, setProjectSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [appsData, myProjData, openProjData, workflowData] = await Promise.all([
          applicationService.getMyApplications(),
          projectService.getMyProjects(),
          projectService.getProjects({ limit: 4 }),
          taskService.getGlobalWorkflow().catch(() => ({ tasks: [], pendingActionCount: 0 })),
        ]);
        setApplications(appsData.applications || []);
        setHiredProjects(myProjData.projects || []);
        setAvailableProjects(openProjData.projects || []);
        setWorkflowTasks(workflowData?.tasks || []);
        setPendingActionCount(workflowData?.pendingActionCount || 0);
      } catch (err) {
        console.error('Failed to load freelancer dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const totalApplications = applications.length;
  const pendingApplications = applications.filter((a) => a.status === 'pending').length;
  const acceptedApplications = applications.filter((a) => a.status === 'accepted').length;
  const activeContractsCount = hiredProjects.length;

  const changesRequestedTasks = workflowTasks.filter(
    (t) => t.changesRequested && t.status === 'in_progress'
  );

  const filteredProjects = availableProjects.filter((project) => {
    const query = projectSearch.trim().toLowerCase();
    if (!query) return true;
    return `${project.title} ${project.description || ''} ${(project.skills || []).join(' ')}`.toLowerCase().includes(query);
  });

  if (loading) {
    return <LoadingSpinner text="Loading freelancer dashboard..." />;
  }

  const hasValidTitle = isMeaningfulText(user?.title);

  return (
    <div className="space-y-8">
      {/* Hero / Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--sf-border)] bg-[var(--sf-card)] p-6 sm:p-7 shadow-xs">
        {/* Subtle decorative background accent */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-gradient-to-br from-[#3157d5]/10 via-[#6366f1]/5 to-transparent blur-2xl" />
        <div className="pointer-events-none absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#3157d5] via-[#4f46e5] to-[#7c3aed]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#eef2ff] text-[#3157d5] dark:bg-indigo-500/15 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/25">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Freelancer Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--sf-ink)]">
              Welcome back, {user?.name || 'Freelancer'}
            </h1>
            <p className="text-sm text-[var(--sf-muted)] max-w-xl leading-relaxed">
              {hasValidTitle
                ? `${user.title} • Track contracts, respond to clients, and discover verified project scopes.`
                : 'Track your active contracts, submit proposals to top clients, and deliver high-impact work.'}
            </p>
          </div>

          <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:items-center">
            <label className="relative min-w-0 sm:w-64">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--sf-muted)]" />
              <input
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                placeholder="Search projects, skills..."
                className="w-full rounded-xl border border-[var(--sf-border)] bg-[var(--sf-surface)] py-2 pl-9 pr-3 text-xs text-[var(--sf-ink)] outline-none transition placeholder:text-[var(--sf-muted)] focus:border-[#3157d5] focus:ring-1 focus:ring-[#3157d5]/20"
              />
            </label>
            <Link to="/freelancer/browse" className="shrink-0">
              <Button variant="primary" size="md" className="font-semibold shadow-xs w-full sm:w-auto">
                <Search className="w-4 h-4" />
                <span>Explore Projects</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Contracts */}
        <div className="rounded-2xl border border-[var(--sf-border)] bg-[var(--sf-card)] p-5 shadow-xs transition-all duration-200 hover:border-emerald-500/30 hover:shadow-sm hover:-translate-y-0.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--sf-muted)]">Active Contracts</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center shrink-0">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--sf-ink)]">
              {activeContractsCount}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[var(--sf-border)] text-xs text-[var(--sf-muted)]">
            {activeContractsCount === 0 ? 'No active contracts' : `${activeContractsCount} assigned project${activeContractsCount === 1 ? '' : 's'}`}
          </div>
        </div>

        {/* Pending Proposals */}
        <div className="rounded-2xl border border-[var(--sf-border)] bg-[var(--sf-card)] p-5 shadow-xs transition-all duration-200 hover:border-amber-500/30 hover:shadow-sm hover:-translate-y-0.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--sf-muted)]">Pending Proposals</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--sf-ink)]">
              {pendingApplications}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[var(--sf-border)] text-xs text-[var(--sf-muted)]">
            {pendingApplications === 0 ? 'No pending bids' : 'Under client review'}
          </div>
        </div>

        {/* Accepted Bids */}
        <div className="rounded-2xl border border-[var(--sf-border)] bg-[var(--sf-card)] p-5 shadow-xs transition-all duration-200 hover:border-[#3157d5]/30 hover:shadow-sm hover:-translate-y-0.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--sf-muted)]">Accepted Bids</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/15 text-[#3157d5] dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--sf-ink)]">
              {acceptedApplications}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[var(--sf-border)] text-xs text-[var(--sf-muted)]">
            {acceptedApplications === 0 ? 'Awaiting project wins' : 'Won contracts'}
          </div>
        </div>

        {/* Total Proposals */}
        <div className="rounded-2xl border border-[var(--sf-border)] bg-[var(--sf-card)] p-5 shadow-xs transition-all duration-200 hover:border-purple-500/30 hover:shadow-sm hover:-translate-y-0.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--sf-muted)]">Total Proposals</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--sf-ink)]">
              {totalApplications}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[var(--sf-border)] text-xs text-[var(--sf-muted)]">
            {totalApplications === 0 ? 'No proposals sent yet' : 'Submitted across marketplace'}
          </div>
        </div>
      </div>

      {/* Onboarding Callout when Zero Contracts & Proposals */}
      {activeContractsCount === 0 && totalApplications === 0 && (
        <div className="rounded-2xl border border-dashed border-[#3157d5]/30 bg-[#eef2ff]/40 dark:bg-indigo-950/20 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#3157d5] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--sf-ink)]">Start winning projects on SkillFlow</h3>
              <p className="text-xs text-[var(--sf-muted)] mt-0.5 max-w-lg leading-relaxed">
                Discover verified client requirements, send competitive proposals with milestone estimates, and collaborate through real-time workspaces.
              </p>
            </div>
          </div>
          <Link to="/freelancer/browse" className="shrink-0">
            <Button variant="primary" size="sm" className="font-semibold shadow-xs">
              <Search className="w-3.5 h-3.5" />
              Browse Open Projects
            </Button>
          </Link>
        </div>
      )}

      {/* Workflow & Deliverables Pipeline Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--sf-ink)] flex items-center gap-2">
              <GitPullRequestArrow className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              <span>Workflow &amp; Deliverables</span>
            </h2>
            <p className="text-xs text-[var(--sf-muted)]">Track task stages: To Do → In Progress → Review → Client Approval</p>
          </div>
          <Link
            to="/workflow"
            className="text-xs font-semibold text-[#3157d5] hover:underline flex items-center gap-1.5 transition"
          >
            <span>View Full Workflow ({workflowTasks.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Changes Requested Alert Banner */}
        {changesRequestedTasks.length > 0 && (
          <div className="mb-4 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 p-4 flex items-center justify-between gap-3 text-xs text-rose-800 dark:text-rose-300">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-medium">
                Client requested changes on <strong>{changesRequestedTasks.length} task{changesRequestedTasks.length === 1 ? '' : 's'}</strong>. Review feedback in your workspace and resubmit.
              </span>
            </div>
            <Link to="/workflow">
              <span className="font-bold underline text-rose-700 dark:text-rose-200 shrink-0">
                Action Required &rarr;
              </span>
            </Link>
          </div>
        )}

        {workflowTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--sf-border)] bg-[var(--sf-surface)]/50 p-8 text-center flex flex-col items-center justify-center">
            <div className="w-11 h-11 rounded-2xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-3 shadow-xs">
              <GitPullRequestArrow className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[var(--sf-ink)]">No pending workflow tasks</p>
            <p className="text-[11px] text-[var(--sf-muted)] max-w-sm mt-1 leading-relaxed">
              When clients assign tasks to you in project workspaces, your active deliverables and review statuses will be tracked here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {workflowTasks.slice(0, 3).map((task) => (
              <div
                key={task._id}
                className="rounded-2xl border border-[var(--sf-border)] bg-[var(--sf-card)] p-4 shadow-xs transition-all duration-200 hover:border-[#3157d5]/30 hover:shadow-sm flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold text-[var(--sf-muted)] truncate max-w-[140px]">
                      {task.project?.title || 'Project'}
                    </span>
                    {task.changesRequested && task.status === 'in_progress' ? (
                      <Badge variant="danger" size="sm">Changes Requested</Badge>
                    ) : task.status === 'review' ? (
                      <Badge variant="warning" size="sm">Under Review</Badge>
                    ) : task.status === 'in_progress' ? (
                      <Badge variant="brand" size="sm">In Progress</Badge>
                    ) : task.status === 'done' ? (
                      <Badge variant="success" size="sm">Approved</Badge>
                    ) : (
                      <Badge variant="default" size="sm">To Do</Badge>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-[var(--sf-ink)] line-clamp-1">
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-[var(--sf-muted)] line-clamp-2 mt-1">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="pt-2.5 border-t border-[var(--sf-border)] flex items-center justify-between text-xs">
                  <span className="capitalize font-medium text-[var(--sf-muted)] text-[11px]">
                    Priority: <span className={task.priority === 'high' ? 'text-rose-600 font-bold' : 'text-[var(--sf-ink)] font-semibold'}>{task.priority || 'medium'}</span>
                  </span>
                  <Link
                    to={`/projects/${task.project?._id}/workspace`}
                    className="font-semibold text-[#3157d5] hover:underline flex items-center gap-1"
                  >
                    <span>Workspace</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Contracts Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--sf-ink)] flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Active Contracts</span>
            </h2>
            <p className="text-xs text-[var(--sf-muted)]">Projects you are actively executing</p>
          </div>
          {hiredProjects.length > 0 && (
            <Link
              to="/freelancer/projects"
              className="text-xs font-semibold text-[#3157d5] hover:underline flex items-center gap-1.5 transition"
            >
              <span>View All ({hiredProjects.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {hiredProjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--sf-border)] bg-[var(--sf-surface)]/50 p-8 sm:p-10 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3.5 shadow-xs">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[var(--sf-ink)]">No active contracts right now</h3>
            <p className="text-xs text-[var(--sf-muted)] max-w-sm mt-1 mb-5 leading-relaxed">
              When a client accepts your proposal and hires you, the project workspace, Kanban board, and milestones will appear here.
            </p>
            <Link to="/freelancer/browse">
              <Button variant="outline" size="sm" className="font-semibold">
                <Search className="w-3.5 h-3.5" />
                Find Projects to Apply
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hiredProjects.slice(0, 2).map((project) => (
              <ProjectCard key={project._id} project={project} role="freelancer" />
            ))}
          </div>
        )}
      </div>

      {/* Recent Applications Tracker Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--sf-ink)] flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-[#3157d5] dark:text-indigo-400" />
              <span>Recent Applications</span>
            </h2>
            <p className="text-xs text-[var(--sf-muted)]">Track submitted proposals and client responses</p>
          </div>
          {applications.length > 0 && (
            <Link
              to="/freelancer/applications"
              className="text-xs font-semibold text-[#3157d5] hover:underline flex items-center gap-1.5 transition"
            >
              <span>View All ({applications.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {applications.length === 0 ? (
          <EmptyState
            icon={FileCheck2}
            title="No applications submitted yet"
            description="Browse open scopes in your domain and submit your proposals with custom estimates."
            actionLabel="Browse Projects"
            onAction={() => (window.location.href = '/freelancer/browse')}
          />
        ) : (
          <div className="space-y-3">
            {applications.slice(0, 3).map((app) => (
              <div
                key={app._id}
                className="p-4 sm:p-5 rounded-2xl bg-[var(--sf-card)] border border-[var(--sf-border)] shadow-xs transition-all duration-200 hover:border-[#3157d5]/30 hover:shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      to={`/freelancer/projects/${app.project?._id}`}
                      className="font-bold text-sm text-[var(--sf-ink)] hover:text-[#3157d5] transition truncate"
                    >
                      {app.project?.title || 'Untitled Project'}
                    </Link>
                  </div>
                  <p className="text-xs text-[var(--sf-muted)]">
                    Client: <span className="font-medium text-[var(--sf-ink)]">{app.project?.client?.name || 'Client'}</span> • Submitted {formatRelativeTime(app.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs shrink-0">
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatCurrency(app.bidAmount)}
                    </span>
                    <span className="text-[var(--sf-muted)] block text-[11px]">
                      {app.estimatedDays} days
                    </span>
                  </div>

                  <div>
                    {app.status === 'accepted' && <Badge variant="success">Accepted</Badge>}
                    {app.status === 'rejected' && <Badge variant="danger">Rejected</Badge>}
                    {app.status === 'pending' && <Badge variant="brand">Pending</Badge>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suggested Open Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--sf-ink)]">Explore Open Projects</h2>
            <p className="text-xs text-[var(--sf-muted)]">Recent marketplace scopes open for proposals</p>
          </div>
          <Link
            to="/freelancer/browse"
            className="text-xs font-semibold text-[#3157d5] hover:underline flex items-center gap-1.5 transition"
          >
            <span>Browse All Marketplace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.slice(0, 4).map((project) => (
            <ProjectCard key={project._id} project={project} role="freelancer" />
          ))}
          {filteredProjects.length === 0 && (
            <div className="md:col-span-2 rounded-2xl border border-dashed border-[var(--sf-border)] bg-[var(--sf-surface)]/50 p-8 text-center text-xs text-[var(--sf-muted)]">
              No matching projects in current recommendations. Browse the marketplace to explore all opportunities.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

