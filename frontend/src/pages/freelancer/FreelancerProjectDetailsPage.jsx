import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';
import { applicationService } from '../../services/applicationService';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ApplyModal } from '../../components/projects/ApplyModal';
import { AIMatchPanel } from '../../components/ai/AIMatchPanel';
import { formatCurrency, formatDate, formatRelativeTime } from '../../utils/formatters';
import {
  Calendar,
  DollarSign,
  Building2,
  User,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react';

export const FreelancerProjectDetailsPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated, isFreelancer } = useAuth();
  const [project, setProject] = useState(null);
  const [myApplication, setMyApplication] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadProjectAndApp = async () => {
    try {
      setLoading(true);
      const projData = await projectService.getProjectById(id);
      setProject(projData.project);

      if (isAuthenticated && isFreelancer) {
        const appsData = await applicationService.getMyApplications();
        const found = appsData.applications?.find(
          (a) => a.project?._id === id || a.project === id
        );
        setMyApplication(found || null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load project.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectAndApp();
  }, [id, isAuthenticated, isFreelancer]);

  const handleApplySubmit = async (formData) => {
    setApplyLoading(true);
    try {
      const res = await applicationService.applyToProject(id, formData);
      setMyApplication(res.application);
      setSuccessMessage('Your proposal was submitted successfully to the client!');
    } catch (err) {
      throw err;
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading project details..." />;
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <p className="text-rose-400 mb-4">{error || 'Project not found.'}</p>
        <Link to="/freelancer/browse">
          <Button variant="secondary">Back to Browse</Button>
        </Link>
      </div>
    );
  }

  const isAssignedToMe =
    project.status === 'assigned' &&
    (project.hiredFreelancer?._id === user?._id || project.hiredFreelancer === user?._id);

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/freelancer/browse"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Browse
        </Link>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Hired Banner if Assigned to Current Freelancer */}
      {isAssignedToMe && (
        <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-sm">You have been hired for this project!</h4>
              <p className="text-xs text-indigo-300">Contract is officially assigned and active.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/projects/${project._id}/workspace`}>
              <Button variant="primary" size="sm" className="glow-indigo">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Open Project Workspace →
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Project Overview Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="purple">{project.category}</Badge>
            {project.status === 'open' ? (
              <Badge variant="brand">
                <Clock className="w-3 h-3" /> Open
              </Badge>
            ) : (
              <Badge variant="info">
                <CheckCircle2 className="w-3 h-3" /> Assigned
              </Badge>
            )}
          </div>
          <span className="text-xs text-slate-500">Posted {formatRelativeTime(project.createdAt)}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-4">{project.title}</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6 text-xs">
          <div>
            <span className="text-slate-500 block mb-1">Target Budget</span>
            <span className="text-base font-bold text-emerald-400">{formatCurrency(project.budget)}</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">Target Deadline</span>
            <span className="text-base font-semibold text-slate-200">{formatDate(project.deadline)}</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">Applications Received</span>
            <span className="text-base font-semibold text-indigo-400">
              {project.applicationCount || 0} Proposals
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Scope & Details</h3>
          <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{project.description}</p>
        </div>

        {/* Required Skills */}
        <div className="mb-8">
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

        {/* Client Profile Box */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">
              <Building2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h4 className="font-bold text-slate-200 text-sm">{project.client?.name}</h4>
              <p className="text-xs text-slate-400">
                {project.client?.company ? project.client.company : 'Verified Client'}
                {project.client?.location && ` • ${project.client.location}`}
              </p>
            </div>
          </div>

          {/* Action to Apply or View Application */}
          <div>
            {!isAuthenticated ? (
              <Link to="/login">
                <Button variant="primary" size="sm">
                  Sign In to Apply
                </Button>
              </Link>
            ) : isFreelancer ? (
              myApplication ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Application Status:</span>
                  {myApplication.status === 'accepted' && <Badge variant="success">Accepted</Badge>}
                  {myApplication.status === 'rejected' && <Badge variant="danger">Rejected</Badge>}
                  {myApplication.status === 'pending' && <Badge variant="brand">Pending Review</Badge>}
                </div>
              ) : project.status === 'open' ? (
                <Button
                  variant="primary"
                  size="md"
                  className="glow-indigo"
                  onClick={() => setIsApplyModalOpen(true)}
                >
                  <Send className="w-4 h-4 mr-1.5" />
                  Apply to Project
                </Button>
              ) : (
                <Badge variant="default">Project Closed</Badge>
              )
            ) : null}
          </div>
        </div>
      </div>

      <AIMatchPanel projectId={id} />

      {/* If current freelancer already applied: Show their proposal submission details */}
      {myApplication && (
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-indigo-400" />
              <span>Your Submitted Proposal</span>
            </h3>
            <span className="text-xs text-slate-500">
              Submitted {formatRelativeTime(myApplication.createdAt)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800 mb-4 text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">Your Bid</span>
              <span className="text-sm font-bold text-emerald-400">{formatCurrency(myApplication.bidAmount)}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Estimated Delivery</span>
              <span className="text-sm font-semibold text-slate-200">{myApplication.estimatedDays} days</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {myApplication.proposal}
          </div>
        </div>
      )}

      {/* Apply Modal */}
      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        project={project}
        onSubmit={handleApplySubmit}
        loading={applyLoading}
      />
    </div>
  );
};
