import React, { useState } from 'react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { RequestChangesModal } from './RequestChangesModal';
import { SubmitReviewModal } from './SubmitReviewModal';
import { TaskDetailsModal } from './TaskDetailsModal';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import {
  Search,
  PlusCircle,
  Calendar,
  User,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Send,
  CheckCheck,
  RotateCcw,
  AlertTriangle,
  Paperclip,
  FileCheck2,
  Eye,
} from 'lucide-react';

export const TaskList = ({
  tasks,
  onUpdateStatus,
  onSubmitForReview,
  onApproveTask,
  onRequestChanges,
  onEditTask,
  onDeleteTask,
  onOpenCreateModal,
  isClient,
  isFreelancer,
}) => {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedTaskForChanges, setSelectedTaskForChanges] = useState(null);
  const [selectedTaskForReview, setSelectedTaskForReview] = useState(null);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const filteredTasks = tasks.filter((task) => {
    if (selectedStatus === 'changes_requested') return task.changesRequested;
    if (selectedStatus !== 'all' && task.status !== selectedStatus) return false;
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        (task.description && task.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getStatusBadge = (task) => {
    if (task.status === 'done') return <Badge variant="success" size="sm">Done</Badge>;
    if (task.status === 'review') return <Badge variant="purple" size="sm">Awaiting Review</Badge>;
    if (task.changesRequested) return <Badge variant="warning" size="sm">Changes Requested</Badge>;
    if (task.status === 'in_progress') return <Badge variant="brand" size="sm">In Progress</Badge>;
    return <Badge variant="default" size="sm">To Do</Badge>;
  };

  const getPriorityBadge = (priority) => {
    if (priority === 'high') return <Badge variant="danger" size="sm">High</Badge>;
    if (priority === 'low') return <Badge variant="info" size="sm">Low</Badge>;
    return <Badge variant="warning" size="sm">Medium</Badge>;
  };

  const handleConfirmChanges = async (taskId, comment) => {
    setActionLoading(true);
    try {
      await onRequestChanges(taskId, comment);
      setSelectedTaskForChanges(null);
    } catch (err) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Tasks List</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Detailed view of all project action items, review submissions, and approvals.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => onOpenCreateModal('todo')} className="glow-indigo">
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Add Task
        </Button>
      </div>

      {/* Filter Row */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer flex-1 sm:flex-initial"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="changes_requested">Changes Requested</option>
            <option value="review">Awaiting Review</option>
            <option value="done">Done</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer flex-1 sm:flex-initial"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          title="No tasks found"
          description="No tasks match the active filters or search term."
          actionLabel="Create Task"
          onAction={() => onOpenCreateModal('todo')}
        />
      ) : (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="pb-3 px-3">Title & Details</th>
                <th className="pb-3 px-3">Priority</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Workflow Action</th>
                <th className="pb-3 px-3">Due Date</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTasks.map((task) => (
                <tr key={task._id} className="hover:bg-slate-800/30 transition">
                  {/* Title & Desc */}
                  <td className="py-3.5 px-3 max-w-xs sm:max-w-md">
                    <div
                      onClick={() => setSelectedTaskForDetails(task)}
                      className="cursor-pointer group/title"
                    >
                      <div className="font-semibold text-slate-100 text-sm group-hover/title:text-indigo-400 transition">
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-slate-400 text-xs line-clamp-1 mt-0.5">
                          {task.description}
                        </div>
                      )}
                    </div>

                    {/* Attachments / Deliverables Chips */}
                    {((task.attachments && task.attachments.length > 0) ||
                      (task.deliverables &&
                        (task.deliverables.notes ||
                          task.deliverables.links?.length > 0 ||
                          task.deliverables.attachments?.length > 0))) && (
                      <div
                        onClick={() => setSelectedTaskForDetails(task)}
                        className="flex items-center gap-1.5 mt-1.5 flex-wrap cursor-pointer"
                      >
                        {task.attachments && task.attachments.length > 0 && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60 hover:border-slate-600 transition"
                            title={`${task.attachments.length} specification file(s)`}
                          >
                            <Paperclip className="w-2.5 h-2.5 text-indigo-400" />
                            <span>{task.attachments.length} files</span>
                          </span>
                        )}
                        {task.deliverables &&
                          (task.deliverables.notes ||
                            task.deliverables.links?.length > 0 ||
                            task.deliverables.attachments?.length > 0) && (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/30 hover:bg-indigo-500/20 transition"
                              title="Click to view deliverables"
                            >
                              <FileCheck2 className="w-2.5 h-2.5 text-indigo-400" />
                              <span>Deliverables submitted</span>
                            </span>
                          )}
                      </div>
                    )}

                    {task.changesRequested && task.reviewComment && (
                      <div
                        onClick={() => setSelectedTaskForDetails(task)}
                        className="text-amber-300 text-[11px] mt-1 flex items-center gap-1 cursor-pointer"
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        <span className="italic truncate">"{task.reviewComment}"</span>
                      </div>
                    )}
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-3">{getPriorityBadge(task.priority)}</td>

                  {/* Status badge */}
                  <td className="py-3.5 px-3">{getStatusBadge(task)}</td>

                  {/* Workflow Action Button */}
                  <td className="py-3.5 px-3">
                    {task.status === 'in_progress' && (
                      <button
                        onClick={() => setSelectedTaskForReview(task)}
                        disabled={actionLoading}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition flex items-center gap-1 shadow-sm"
                      >
                        <Send className="w-3 h-3" /> Submit Deliverables
                      </button>
                    )}

                    {task.status === 'review' && isClient && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedTaskForDetails(task)}
                          className="px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold transition flex items-center gap-1"
                          title="View Deliverables"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setSelectedTaskForChanges(task)}
                          className="px-2 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-300 text-[11px] font-semibold transition flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Changes
                        </button>
                        <button
                          onClick={() => onApproveTask(task._id)}
                          className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition flex items-center gap-1 shadow-sm"
                        >
                          <CheckCheck className="w-3 h-3" /> Approve
                        </button>
                      </div>
                    )}

                    {task.status === 'review' && !isClient && (
                      <button
                        onClick={() => setSelectedTaskForDetails(task)}
                        className="text-indigo-400 hover:text-indigo-300 text-[11px] font-medium flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> Awaiting Review
                      </button>
                    )}

                    {task.status === 'done' && (
                      <button
                        onClick={() => setSelectedTaskForDetails(task)}
                        className="text-emerald-400 hover:text-emerald-300 text-[11px] font-medium flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Approved
                      </button>
                    )}

                    {task.status === 'todo' && (
                      <button
                        onClick={() => onUpdateStatus(task._id, 'in_progress')}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition"
                      >
                        Start
                      </button>
                    )}
                  </td>

                  {/* Due Date */}
                  <td className="py-3.5 px-3 text-slate-400">
                    {task.dueDate ? formatDate(task.dueDate) : '—'}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedTaskForDetails(task)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEditTask(task)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition"
                        title="Edit Task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {isClient && (
                        <button
                          onClick={() => onDeleteTask(task._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Request Changes Modal */}
      {selectedTaskForChanges && (
        <RequestChangesModal
          isOpen={!!selectedTaskForChanges}
          onClose={() => setSelectedTaskForChanges(null)}
          task={selectedTaskForChanges}
          onSubmit={handleConfirmChanges}
          loading={actionLoading}
        />
      )}

      {/* Submit Deliverables Modal */}
      {selectedTaskForReview && (
        <SubmitReviewModal
          isOpen={!!selectedTaskForReview}
          onClose={() => setSelectedTaskForReview(null)}
          task={selectedTaskForReview}
          onSubmit={async (taskId, submissionData) => {
            setActionLoading(true);
            try {
              await onSubmitForReview(taskId, submissionData);
              setSelectedTaskForReview(null);
            } finally {
              setActionLoading(false);
            }
          }}
          loading={actionLoading}
        />
      )}

      {/* Task Details Modal */}
      {selectedTaskForDetails && (
        <TaskDetailsModal
          isOpen={!!selectedTaskForDetails}
          onClose={() => setSelectedTaskForDetails(null)}
          task={selectedTaskForDetails}
          isClient={isClient}
          isFreelancer={isFreelancer}
          onApprove={onApproveTask}
          onRequestChanges={(task) => {
            setSelectedTaskForDetails(null);
            setSelectedTaskForChanges(task);
          }}
          onOpenSubmitReview={(task) => {
            setSelectedTaskForDetails(null);
            setSelectedTaskForReview(task);
          }}
          onEditTask={(task) => {
            setSelectedTaskForDetails(null);
            onEditTask(task);
          }}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
};
