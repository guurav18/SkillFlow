import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';
import { applicationService } from '../../services/applicationService';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatDate, formatRelativeTime } from '../../utils/formatters';
import {
  Search,
  FileCheck2,
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export const FreelancerDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [hiredProjects, setHiredProjects] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [projectSearch, setProjectSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [appsData, myProjData, openProjData] = await Promise.all([
          applicationService.getMyApplications(),
          projectService.getMyProjects(),
          projectService.getProjects({ limit: 4 }),
        ]);
        setApplications(appsData.applications || []);
        setHiredProjects(myProjData.projects || []);
        setAvailableProjects(openProjData.projects || []);
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
  const filteredProjects = availableProjects.filter((project) => {
    const query = projectSearch.trim().toLowerCase();
    if (!query) return true;
    return `${project.title} ${project.description || ''} ${(project.skills || []).join(' ')}`.toLowerCase().includes(query);
  });

  if (loading) {
    return <LoadingSpinner text="Loading freelancer dashboard..." />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-slate-900 border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Freelancer Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {user?.title || 'Discover open projects and track your active bids.'}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <label className="relative min-w-0 sm:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={projectSearch} onChange={(event) => setProjectSearch(event.target.value)} placeholder="Search projects, skills, or technologies..." className="w-full rounded-xl border border-[#385962] bg-[#0f1b20] py-2.5 pl-9 pr-3 text-xs text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60" /></label>
          <Link to="/freelancer/browse"><Button variant="primary" size="md" className="glow-indigo"><Search className="w-4 h-4" /> Explore Projects</Button></Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Contracts</span>
            <Briefcase className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{hiredProjects.length}</div>
          <span className="text-[11px] text-emerald-400/80">Assigned projects</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Pending Proposals</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{pendingApplications}</div>
          <span className="text-[11px] text-amber-400/80">Under client review</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Accepted Bids</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{acceptedApplications}</div>
          <span className="text-[11px] text-slate-500">Won contracts</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Proposals</span>
            <FileCheck2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{totalApplications}</div>
          <span className="text-[11px] text-slate-500">Submitted bids</span>
        </div>
      </div>

      {/* Hired Projects Section (if any) */}
      {hiredProjects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              <span>My Active Contracts</span>
            </h2>
            <Link to="/freelancer/projects" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hiredProjects.slice(0, 2).map((project) => (
              <ProjectCard key={project._id} project={project} role="freelancer" />
            ))}
          </div>
        </div>
      )}

      {/* Recent Applications Tracker Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-indigo-400" />
            <span>Recent Applications</span>
          </h2>
          <Link to="/freelancer/applications" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            View All ({applications.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {applications.length === 0 ? (
          <EmptyState
            title="No applications submitted yet"
            description="Browse open projects in your domain and submit your proposals."
            actionLabel="Browse Projects"
            onAction={() => (window.location.href = '/freelancer/browse')}
          />
        ) : (
          <div className="space-y-3">
            {applications.slice(0, 3).map((app) => (
              <div
                key={app._id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      to={`/freelancer/projects/${app.project?._id}`}
                      className="font-bold text-sm text-slate-100 hover:text-indigo-400 transition"
                    >
                      {app.project?.title || 'Untitled Project'}
                    </Link>
                  </div>
                  <p className="text-xs text-slate-400">
                    Client: {app.project?.client?.name || 'Client'} • Submitted {formatRelativeTime(app.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <span className="font-bold text-emerald-400">{formatCurrency(app.bidAmount)}</span>
                    <span className="text-slate-500 block text-[11px]">{app.estimatedDays} days</span>
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
          <h2 className="text-lg font-bold text-slate-100">Explore Open Projects</h2>
          <Link to="/freelancer/browse" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            Browse All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.slice(0, 4).map((project) => (
            <ProjectCard key={project._id} project={project} role="freelancer" />
          ))}
          {filteredProjects.length === 0 && <div className="md:col-span-2 rounded-2xl border border-dashed border-[#385962] p-8 text-center text-sm text-slate-400">No matching projects in the current recommendations. Browse the marketplace for more opportunities.</div>}
        </div>
      </div>
    </div>
  );
};
