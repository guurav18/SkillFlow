import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { taskService } from '../../services/taskService';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { RequestChangesModal } from '../../components/workspace/RequestChangesModal';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import {
  GitMerge,
  Search,
  CheckCircle2,
  Clock,
  Send,
  CheckCheck,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
  User,
  Building2,
} from 'lucide-react';

export const WorkflowPage = () => {
  const { user, isClient, isFreelancer } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [pendingActionCount, setPendingActionCount] = useState(0);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTaskForChanges, setSelectedTaskForChanges] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadWorkflowData = async () => {
    try {
      setLoading(true);
      const data = await taskService.getGlobalWorkflow();
      setTasks(data.tasks || []);
      setPendingActionCount(data.pendingActionCount || 0);
    } catch (err) {
      console.error('Failed to load global workflow:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflowData();
  }, []);

  const handleApprove = async (taskId) => {
    setActionLoading(true);
    try {
      await taskService.approveTask(taskId);
      setSuccessMessage('Task approved and marked as completed!');
      setTimeout(() => setSuccessMessage(''), 4000);
      await loadWorkflowData();
    } catch (err) {
      alert(err.message || 'Failed to approve task.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitReview = async (taskId) => {
    setActionLoading(true);
    try {
      await taskService.submitForReview(taskId);
      setSuccessMessage('Task submitted for client review!');
      setTimeout(() => setSuccessMessage(''), 4000);
      await loadWorkflowData();
    } catch (err) {
      alert(err.message || 'Failed to submit task for review.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmChanges = async (taskId, comment) => {
    setActionLoading(true);
    try {
      await taskService.requestChanges(taskId, comment);
      setSelectedTaskForChanges(null);
      setSuccessMessage('Changes requested! Task returned to In Progress.');
      setTimeout(() => setSuccessMessage(''), 4000);
      await loadWorkflowData();
    } catch (err) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // Filter Logic
  const filteredTasks = tasks.filter((task) => {
    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchProject = task.project?.title?.toLowerCase().includes(q);
      const matchDesc = task.description && task.description.toLowerCase().includes(q);
      if (!matchTitle && !matchProject && !matchDesc) return false;
    }

    if (filter === 'pending') {
      if (isClient) return task.status === 'review';
      if (isFreelancer) return task.changesRequested || task.status === 'in_progress';
      return task.status === 'review';
    }
    if (filter === 'review') return task.status === 'review';
    if (filter === 'in_progress') return task.status === 'in_progress';
    if (filter === 'changes_requested') return task.changesRequested;
    if (filter === 'done') return task.status === 'done';
    return true; // 'all'
  });

  const getPriorityBadge = (priority) => {
    if (priority === 'high') return <Badge variant="danger" size="sm">High</Badge>;
    if (priority === 'low') return <Badge variant="info" size="sm">Low</Badge>;
    return <Badge variant="warning" size="sm">Medium</Badge>;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-900 border border-slate-800 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
              <GitMerge className="w-4 h-4" /> Global Task & Approval Workflow
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
              {isClient ? 'Needs Your Review' : 'Changes Requested'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {isClient ? 'Review submitted work, approve deliverables, or send clear feedback.' : 'Keep momentum across every handoff and respond to client feedback.'}
            </p>
          </div>

          {/* Pending Action Callout Pill */}
          {pendingActionCount > 0 ? (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></div>
              <span>
                {isClient
                  ? `${pendingActionCount} Task${pendingActionCount === 1 ? '' : 's'} Awaiting Your Approval`
                  : `${pendingActionCount} Task${pendingActionCount === 1 ? '' : 's'} Requiring Action`}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>All workflows up to date</span>
            </div>
          )}
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto text-xs font-semibold">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              filter === 'pending'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>Pending Action</span>
            {pendingActionCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
                {pendingActionCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filter === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            All Tasks ({tasks.length})
          </button>

          <button
            onClick={() => setFilter('review')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filter === 'review'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Awaiting Review ({tasks.filter((t) => t.status === 'review').length})
          </button>

          <button
            onClick={() => setFilter('changes_requested')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filter === 'changes_requested'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Changes Requested ({tasks.filter((t) => t.changesRequested).length})
          </button>

          <button
            onClick={() => setFilter('done')}
            className={`px-3 py-1.5 rounded-xl transition ${
              filter === 'done'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Approved ({tasks.filter((t) => t.status === 'done').length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks or projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Task List Feed */}
      {loading ? (
        <LoadingSpinner text="Aggregating cross-project workflows..." />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          title="No workflow tasks found"
          description={
            filter === 'pending'
              ? 'No tasks currently require immediate action or approval.'
              : 'No tasks matching the selected filter criteria.'
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const isReview = task.status === 'review';
            const isDone = task.status === 'done';
            const isChangesRequested = task.changesRequested;
            const projectId = task.project?._id;

            return (
              <div
                key={task._id}
                className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                  isReview
                    ? 'bg-indigo-950/20 border-indigo-500/30 shadow-md shadow-indigo-500/5'
                    : isChangesRequested
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : isDone
                    ? 'bg-slate-900/60 border-slate-800 opacity-80'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                  <div>
                    {/* Project Breadcrumb / Context */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <Link
                        to={`/projects/${projectId}/workspace`}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
                      >
                        <span>{task.project?.title || 'Project'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <span className="text-slate-600">•</span>
                      {getPriorityBadge(task.priority)}
                    </div>

                    {/* Task Title */}
                    <h3 className="font-bold text-base sm:text-lg text-slate-100">
                      {task.title}
                    </h3>
                  </div>

                  {/* Status Badge */}
                  <div className="self-start sm:self-auto">
                    {isDone && (
                      <Badge variant="success">
                        <CheckCircle2 className="w-3 h-3" /> Approved & Done
                      </Badge>
                    )}
                    {isReview && (
                      <Badge variant="purple">
                        <Clock className="w-3 h-3" />
                        {isClient ? 'Awaiting Your Approval' : 'Awaiting Client Review'}
                      </Badge>
                    )}
                    {isChangesRequested && (
                      <Badge variant="warning">
                        <AlertTriangle className="w-3 h-3" /> Changes Requested
                      </Badge>
                    )}
                    {task.status === 'in_progress' && !isChangesRequested && (
                      <Badge variant="brand">In Progress</Badge>
                    )}
                    {task.status === 'todo' && <Badge variant="default">To Do</Badge>}
                  </div>
                </div>

                {/* Description snippet */}
                {task.description && (
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
                    {task.description}
                  </p>
                )}

                {/* Changes Requested Comment Box */}
                {isChangesRequested && task.reviewComment && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 mb-3 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-300">
                      <RotateCcw className="w-3.5 h-3.5" /> Client Feedback & Revisions:
                    </div>
                    <p className="italic leading-relaxed">"{task.reviewComment}"</p>
                  </div>
                )}

                {/* Footer Meta info & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                  <div className="flex flex-wrap items-center gap-4">
                    {task.assignedTo && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        Assignee: <strong>{task.assignedTo.name}</strong>
                      </span>
                    )}

                    {task.dueDate && (
                      <span>Due {formatDate(task.dueDate)}</span>
                    )}

                    {task.submittedForReviewAt && (
                      <span className="text-indigo-300">
                        Submitted {formatRelativeTime(task.submittedForReviewAt)}
                      </span>
                    )}

                    {task.approvedAt && (
                      <span className="text-emerald-400">
                        Approved {formatRelativeTime(task.approvedAt)}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* Client Approval / Changes Actions */}
                    {isReview && isClient && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={actionLoading}
                          onClick={() => setSelectedTaskForChanges(task)}
                          className="bg-amber-600/20 hover:bg-amber-600/30 border-amber-500/30 text-amber-300"
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-1" />
                          Request Changes
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={actionLoading}
                          onClick={() => handleApprove(task._id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                          <CheckCheck className="w-3.5 h-3.5 mr-1" />
                          Approve Task
                        </Button>
                      </>
                    )}

                    {/* Freelancer Resubmit Action */}
                    {task.status === 'in_progress' && isFreelancer && (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={actionLoading}
                        onClick={() => handleSubmitReview(task._id)}
                        className="glow-indigo"
                      >
                        <Send className="w-3.5 h-3.5 mr-1" />
                        Submit for Review
                      </Button>
                    )}

                    {/* Direct Workspace Link */}
                    <Link to={`/projects/${projectId}/workspace?tab=kanban`}>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                        <span>Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Changes Modal */}
      {selectedTaskForChanges && (
        <RequestChangesModal
          isOpen={!!selectedTaskForChanges}
          onClose={() => setSelectedTaskForChanges(null)}
          task={selectedTaskForChanges}
          onSubmit={handleConfirmChanges}
          loading={actionLoading}
        />
      )}
    </div>
  );
};
