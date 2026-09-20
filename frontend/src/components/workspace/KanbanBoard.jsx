import React, { useState } from 'react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { RequestChangesModal } from './RequestChangesModal';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import {
  PlusCircle,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Edit2,
  Trash2,
  Send,
  CheckCheck,
  RotateCcw,
  AlertTriangle,
  MessageSquareQuote,
} from 'lucide-react';

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'border-slate-700/80 bg-slate-900/40' },
  { id: 'in_progress', title: 'In Progress', color: 'border-indigo-500/30 bg-indigo-950/10' },
  { id: 'review', title: 'Review & Approval', color: 'border-amber-500/30 bg-amber-950/10' },
  { id: 'done', title: 'Done / Approved', color: 'border-emerald-500/30 bg-emerald-950/10' },
];

export const KanbanBoard = ({
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
  const [selectedTaskForChanges, setSelectedTaskForChanges] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const getTasksByStatus = (status) => tasks.filter((t) => t.status === status);

  const getPriorityBadge = (priority) => {
    if (priority === 'high') return <Badge variant="danger" size="sm">High</Badge>;
    if (priority === 'low') return <Badge variant="info" size="sm">Low</Badge>;
    return <Badge variant="warning" size="sm">Medium</Badge>;
  };

  const handleApprove = async (taskId) => {
    setActionLoading(true);
    try {
      await onApproveTask(taskId);
    } catch (err) {
      alert(err.message || 'Failed to approve task.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitReview = async (taskId) => {
    setActionLoading(true);
    try {
      await onSubmitForReview(taskId);
    } catch (err) {
      alert(err.message || 'Failed to submit task for review.');
    } finally {
      setActionLoading(false);
    }
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
      {/* Kanban Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>Project Sprint Kanban</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-semibold">
              {tasks.length} Total
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Structured workflow: To Do → In Progress → Review & Approval → Approved & Done.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => onOpenCreateModal('todo')} className="glow-indigo">
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Add Task
        </Button>
      </div>

      {/* 4 Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const colTasks = getTasksByStatus(col.id);

          return (
            <div
              key={col.id}
              className={`rounded-2xl border p-4 flex flex-col min-h-[520px] backdrop-blur-sm ${col.color}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-200">{col.title}</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {colTasks.length}
                  </span>
                </div>

                <button
                  onClick={() => onOpenCreateModal(col.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs flex items-center"
                  title={`Add task to ${col.title}`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Task Cards in Column */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                {colTasks.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800 rounded-xl">
                    <p className="text-xs text-slate-500 font-medium">No tasks in {col.title}</p>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task._id}
                      className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-sm transition-all group"
                    >
                      {/* Priority & Top actions */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {getPriorityBadge(task.priority)}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditTask(task)}
                            className="p-1 text-slate-400 hover:text-indigo-400 rounded transition"
                            title="Edit Task"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          {isClient && (
                            <button
                              onClick={() => onDeleteTask(task._id)}
                              className="p-1 text-slate-400 hover:text-rose-400 rounded transition"
                              title="Delete Task"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="font-bold text-xs sm:text-sm text-slate-100 mb-1.5 leading-snug">
                        {task.title}
                      </h4>

                      {/* Description if any */}
                      {task.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Changes Requested Banner (if in_progress with feedback) */}
                      {col.id === 'in_progress' && task.changesRequested && (
                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 mb-3 space-y-1">
                          <div className="flex items-center gap-1 font-bold text-[11px] text-amber-400">
                            <AlertTriangle className="w-3.5 h-3.5" /> Changes Requested
                          </div>
                          {task.reviewComment && (
                            <p className="text-[11px] text-slate-300 italic line-clamp-2">
                              "{task.reviewComment}"
                            </p>
                          )}
                        </div>
                      )}

                      {/* Review State Banner */}
                      {col.id === 'review' && (
                        <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 mb-3 flex items-center justify-between">
                          <span className="flex items-center gap-1 font-semibold text-[11px]">
                            <Clock className="w-3 h-3 text-indigo-400" />
                            {isClient ? 'Review Required' : 'Awaiting Client Review'}
                          </span>
                        </div>
                      )}

                      {/* Done State Banner */}
                      {col.id === 'done' && (
                        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 mb-3 flex items-center justify-between">
                          <span className="flex items-center gap-1 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Approved & Done
                          </span>
                        </div>
                      )}

                      {/* Footer: Due Date & Assignee */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1 text-slate-400">
                          {task.dueDate && (
                            <>
                              <Calendar className="w-3 h-3 text-slate-500" />
                              <span>{formatDate(task.dueDate)}</span>
                            </>
                          )}
                        </div>

                        {task.assignedTo && (
                          <div className="flex items-center gap-1 text-indigo-400 font-medium truncate max-w-[100px]">
                            <User className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{task.assignedTo.name}</span>
                          </div>
                        )}
                      </div>

                      {/* Workflow Actions Based on Column & Role */}
                      <div className="pt-3 mt-3 border-t border-slate-800/60 flex flex-col gap-1.5">
                        {/* 1. To Do column action: Move to In Progress */}
                        {col.id === 'todo' && (
                          <button
                            onClick={() => onUpdateStatus(task._id, 'in_progress')}
                            className="w-full py-1.5 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition flex items-center justify-center gap-1"
                          >
                            Start Working <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {/* 2. In Progress column action: Submit for Review */}
                        {col.id === 'in_progress' && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => onUpdateStatus(task._id, 'todo')}
                              className="py-1 px-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 text-xs transition"
                              title="Move back to Todo"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleSubmitReview(task._id)}
                              disabled={actionLoading}
                              className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5"
                            >
                              <Send className="w-3 h-3" />
                              Submit for Review
                            </button>
                          </div>
                        )}

                        {/* 3. Review Column: Client Approve / Request Changes, or Freelancer Status */}
                        {col.id === 'review' && (
                          isClient ? (
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                onClick={() => setSelectedTaskForChanges(task)}
                                disabled={actionLoading}
                                className="py-1.5 px-2 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-300 text-[11px] font-semibold transition flex items-center justify-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Changes
                              </button>
                              <button
                                onClick={() => handleApprove(task._id)}
                                disabled={actionLoading}
                                className="py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-sm transition flex items-center justify-center gap-1"
                              >
                                <CheckCheck className="w-3.5 h-3.5" />
                                Approve
                              </button>
                            </div>
                          ) : (
                            <div className="text-center py-1 text-[11px] text-slate-400 italic">
                              Pending client approval
                            </div>
                          )
                        )}

                        {/* 4. Done Column */}
                        {col.id === 'done' && (
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                            <span>Completed</span>
                            {task.approvedAt && <span>{formatRelativeTime(task.approvedAt)}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Request Changes Feedback Modal */}
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
