import React, { useState } from 'react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { RequestChangesModal } from './RequestChangesModal';
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
                    <div className="font-semibold text-slate-100 text-sm">{task.title}</div>
                    {task.description && (
                      <div className="text-slate-400 text-xs line-clamp-1 mt-0.5">
                        {task.description}
                      </div>
                    )}
                    {task.changesRequested && task.reviewComment && (
                      <div className="text-amber-300 text-[11px] mt-1 flex items-center gap-1">
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
                        onClick={() => onSubmitForReview(task._id)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition flex items-center gap-1 shadow-sm"
                      >
                        <Send className="w-3 h-3" /> Submit Review
                      </button>
                    )}

                    {task.status === 'review' && isClient && (
                      <div className="flex items-center gap-1.5">
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
                      <span className="text-slate-400 text-[11px] italic">Awaiting client</span>
                    )}

                    {task.status === 'done' && (
                      <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Approved
                      </span>
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
    </div>
  );
};
