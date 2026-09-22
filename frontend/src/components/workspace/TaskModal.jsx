import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Calendar, Tag, AlertCircle, Users, UserCheck, Sparkles } from 'lucide-react';
import { aiService } from '../../services/aiService';

const EMPTY_FREELANCERS = [];

export const TaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialTask = null,
  loading,
  projectFreelancers = EMPTY_FREELANCERS,  // Array of { _id, name, email } hired for this project
  isClient = false,
  projectId = null,
  defaultStatus = 'todo',
}) => {
  const [title, setTitle] = useState(() => initialTask?.title || '');
  const [description, setDescription] = useState(() => initialTask?.description || '');
  const [priority, setPriority] = useState(() => initialTask?.priority || 'medium');
  const [status, setStatus] = useState(() => initialTask?.status || defaultStatus || 'todo');
  const [dueDate, setDueDate] = useState(() =>
    initialTask?.dueDate ? new Date(initialTask.dueDate).toISOString().split('T')[0] : ''
  );
  const [assignedTo, setAssignedTo] = useState(() =>
    initialTask?.assignedTo?._id ||
    initialTask?.assignedTo ||
    (projectFreelancers.length === 1 ? projectFreelancers[0]._id : '')
  );
  const [error, setError] = useState('');
  const [estimate, setEstimate] = useState(null);
  const [estimateLoading, setEstimateLoading] = useState(false);

  const estimateEffort = async () => {
    if (!projectId || !title.trim()) {
      setError('Add a task title before requesting an estimate.');
      return;
    }
    setEstimateLoading(true);
    setError('');
    try {
      const response = await aiService.estimateTask(projectId, { title, description, priority, dueDate });
      setEstimate(response.estimate);
    } catch (err) {
      setError(err.message || 'AI service is temporarily unavailable.');
    } finally {
      setEstimateLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a task title.');
      return;
    }

    // Client must assign the task to a freelancer
    if (isClient && !assignedTo) {
      if (projectFreelancers.length === 0) {
        setError('No hired freelancers are available. Please hire a freelancer for this project first.');
      } else {
        setError('Please select a freelancer to assign this task to.');
      }
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        dueDate: dueDate || null,
        ...(isClient && assignedTo ? { assignedTo } : {}),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save task.');
    }
  };

  const noFreelancers = isClient && projectFreelancers.length === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTask ? 'Edit Task' : 'Create New Task'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* No-freelancer warning banner */}
        {noFreelancers && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
            <Users className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">No Hired Freelancers</p>
              <p className="text-amber-400/80">
                You need to hire at least one freelancer before creating tasks.
              </p>
            </div>
          </div>
        )}

        {/* Assigned To — only visible to Client */}
        {isClient && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              Assigned To *
            </label>
            {projectFreelancers.length === 0 ? (
              <div className="w-full px-3.5 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-sm text-slate-500 italic">
                No hired freelancers available for this project
              </div>
            ) : (
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer transition"
              >
                {projectFreelancers.length > 1 && (
                  <option value="">— Select Freelancer —</option>
                )}
                {projectFreelancers.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name}
                    {f.title ? ` — ${f.title}` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Task Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Task Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Implement user authentication endpoints"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Priority & Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Initial Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Under Review</option>
              <option value="done">Done / Completed</option>
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Due Date (Optional)
          </label>
          <div className="relative">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Task Description / Instructions
          </label>
          <textarea
            rows="4"
            placeholder="Add relevant technical criteria, API specifications, or checklists..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed transition"
          ></textarea>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20">
          <div><p className="text-xs font-semibold text-slate-200">AI effort estimate</p>{estimate ? <p className="text-xs text-indigo-300 mt-1">Estimated {estimate.estimatedHoursMin}-{estimate.estimatedHoursMax} hours · {estimate.complexity} complexity</p> : <p className="text-[11px] text-slate-500 mt-1">Advisory estimate, not a guaranteed deadline.</p>}</div>
          <Button type="button" variant="secondary" size="sm" onClick={estimateEffort} loading={estimateLoading}><Sparkles className="w-3.5 h-3.5" /> Estimate Effort</Button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={loading}
            disabled={loading || noFreelancers}
            className="glow-indigo"
          >
            {initialTask ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
