import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Calendar, Flag, AlertCircle } from 'lucide-react';

export const MilestoneModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialMilestone = null,
  loading,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [dueDate, setDueDate] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialMilestone) {
      setTitle(initialMilestone.title || '');
      setDescription(initialMilestone.description || '');
      setAmount(initialMilestone.amount || 0);
      setDueDate(
        initialMilestone.dueDate
          ? new Date(initialMilestone.dueDate).toISOString().split('T')[0]
          : ''
      );
      setProgress(initialMilestone.progress || 0);
      setStatus(initialMilestone.status || 'pending');
    } else {
      setTitle('');
      setDescription('');
      setAmount(0);
      setDueDate('');
      setProgress(0);
      setStatus('pending');
    }
    setError('');
  }, [initialMilestone, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a milestone title.');
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        amount: Number(amount),
        dueDate: dueDate || null,
        progress: Number(progress),
        status,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save milestone.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialMilestone ? 'Edit Milestone' : 'Create New Milestone'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Milestone Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Phase 1 Frontend Component Library & Responsive Flow"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Due Date & Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Due Date (Target)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Payment Amount (INR)</label>
          <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition" />
        </div>

        {/* Progress Slider */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Deliverable Progress ({progress}%)
            </label>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={progress}
            onChange={(e) => setProgress(e.target.value)}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Milestone Scope & Deliverables
          </label>
          <textarea
            rows="4"
            placeholder="Define the specific success criteria required to close this milestone..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed transition"
          ></textarea>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading} className="glow-indigo">
            {initialMilestone ? 'Save Changes' : 'Create Milestone'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
