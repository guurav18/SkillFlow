import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { applicationService } from '../../services/applicationService';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatDate, formatRelativeTime } from '../../utils/formatters';
import { AIMatchPanel } from '../../components/ai/AIMatchPanel';
import {
  Calendar,
  DollarSign,
  Tag,
  User,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Briefcase,
  Mail,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const ProjectDetailsPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hiringApp, setHiringApp] = useState(null);
  const [hireLoading, setHireLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const projData = await projectService.getProjectById(id);
      setProject(projData.project);

      // Fetch applications for this project
      const appsData = await applicationService.getProjectApplications(id);
      setApplications(appsData.applications || []);
    } catch (err) {
      setError(err.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleHireConfirm = async () => {
    if (!hiringApp) return;
    setHireLoading(true);
    try {
      await projectService.hireFreelancer(id, {
        applicationId: hiringApp._id,
      });
      setSuccessMessage(`Successfully hired ${hiringApp.freelancer?.name}! Project status is now Assigned.`);
      setHiringApp(null);
      await loadData();
    } catch (err) {
      alert(err.message || 'Failed to hire freelancer.');
    } finally {
      setHireLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading project details & applicants..." />;
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <p className="text-rose-400 mb-4">{error || 'Project not found.'}</p>
        <Link to="/client/projects">
          <Button variant="secondary">Back to My Projects</Button>
        </Link>
      </div>
    );
  }

  const isAssigned = project.status === 'assigned';

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/client/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Projects
        </Link>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Project Overview Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="purple">{project.category}</Badge>
            {isAssigned ? (
              <Badge variant="info">
                <CheckCircle2 className="w-3 h-3" /> Assigned
              </Badge>
            ) : (
              <Badge variant="brand">
                <Clock className="w-3 h-3" /> Open for Proposals
              </Badge>
            )}
          </div>
          <span className="text-xs text-slate-500">Posted {formatRelativeTime(project.createdAt)}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-4">{project.title}</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6 text-xs">
          <div>
            <span className="text-slate-500 block mb-1">Budget</span>
            <span className="text-base font-bold text-emerald-400">{formatCurrency(project.budget)}</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">Deadline</span>
            <span className="text-base font-semibold text-slate-200">{formatDate(project.deadline)}</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">Total Applicants</span>
            <span className="text-base font-semibold text-indigo-400">{applications.length} Applicants</span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Scope & Description</h3>
          <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{project.description}</p>
        </div>

        {/* Required Skills */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {project.skills?.map((skill, index) => (
              <span
                key={index}
                className="text-xs px-3 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Hired Freelancer Card (if assigned) */}
      {isAssigned && project.hiredFreelancer && (
        <div className="p-6 rounded-3xl bg-indigo-950/30 border border-indigo-500/30 backdrop-blur-md">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Hired Freelancer
            </div>
            <Link to={`/projects/${project._id}/workspace`}>
              <Button variant="primary" size="sm" className="glow-indigo">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Open Project Workspace →
              </Button>
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-white text-lg shadow-md">
                {project.hiredFreelancer?.name?.[0]?.toUpperCase() || 'F'}
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-base">{project.hiredFreelancer.name}</h4>
                <p className="text-xs text-indigo-300">{project.hiredFreelancer.title || 'Freelance Specialist'}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" /> {project.hiredFreelancer.email}
                </p>
              </div>
            </div>
            <Badge variant="success" size="md">
              Currently Contracted
            </Badge>
          </div>
        </div>
      )}

      {/* Applications Section */}
      <AIMatchPanel projectId={id} />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>Received Applications</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">
              {applications.length}
            </span>
          </h2>
        </div>

        {applications.length === 0 ? (
          <EmptyState
            title="No proposals received yet"
            description="Your project is open in the marketplace. Freelancers will appear here as soon as they submit their proposals."
          />
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const isAccepted = app.status === 'accepted';
              const isRejected = app.status === 'rejected';

              return (
                <div
                  key={app._id}
                  className={`p-6 rounded-2xl border transition-all ${
                    isAccepted
                      ? 'bg-indigo-950/20 border-emerald-500/30'
                      : isRejected
                      ? 'bg-slate-900/40 border-slate-800 opacity-60'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    {/* Freelancer Header */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-indigo-400">
                        {app.freelancer?.name?.[0]?.toUpperCase() || 'F'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-100 text-sm sm:text-base">
                            {app.freelancer?.name}
                          </h4>
                          {isAccepted && <Badge variant="success" size="sm">Accepted & Hired</Badge>}
                          {isRejected && <Badge variant="danger" size="sm">Rejected</Badge>}
                          {app.status === 'pending' && <Badge variant="brand" size="sm">Pending Review</Badge>}
                        </div>
                        <p className="text-xs text-indigo-400 font-medium">
                          {app.freelancer?.title || 'Freelancer'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Applied {formatRelativeTime(app.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Bid & Delivery Info */}
                    <div className="flex sm:flex-col items-end gap-1 text-right">
                      <div className="text-sm font-bold text-emerald-400">
                        Bid: {formatCurrency(app.bidAmount)}
                      </div>
                      <span className="text-xs text-slate-400">
                        Est. Timeline: {app.estimatedDays || 7} days
                      </span>
                    </div>
                  </div>

                  {/* Proposal Text */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-4 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {app.proposal}
                  </div>

                  {/* Freelancer Skills */}
                  {app.freelancer?.skills?.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mb-4">
                      <span className="text-[11px] text-slate-500 mr-1">Skills:</span>
                      {app.freelancer.skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Bar */}
                  {!isAssigned && app.status === 'pending' && (
                    <div className="flex justify-end pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setHiringApp(app)}
                        className="glow-indigo"
                      >
                        <ShieldCheck className="w-4 h-4 mr-1" />
                        Hire {app.freelancer?.name}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hiring Confirmation Modal */}
      <Modal
        isOpen={!!hiringApp}
        onClose={() => setHiringApp(null)}
        title="Confirm Freelancer Hiring"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you want to hire <strong className="text-white">{hiringApp?.freelancer?.name}</strong> for this project?
          </p>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Agreed Bid:</span>
              <span className="font-bold text-emerald-400">{formatCurrency(hiringApp?.bidAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Estimated Timeline:</span>
              <span className="font-semibold text-slate-200">{hiringApp?.estimatedDays} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Project Status:</span>
              <span className="font-semibold text-indigo-400">Will change to 'Assigned'</span>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Note: All other pending applications for this project will automatically be marked as rejected.
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="ghost" size="sm" onClick={() => setHiringApp(null)} disabled={hireLoading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={hireLoading}
              onClick={handleHireConfirm}
              className="glow-indigo"
            >
              Confirm & Hire Now
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
