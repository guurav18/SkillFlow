import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AlertCircle, RotateCcw } from 'lucide-react';

export const RequestChangesModal = ({
  isOpen,
  onClose,
  task,
  onSubmit,
  loading,
}) => {
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide feedback or specific change requests for the freelancer.');
      return;
    }
    setError('');
    try {
      await onSubmit(task._id, comment.trim());
      setComment('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to request changes.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Request Changes: ${task?.title}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <p className="text-xs text-slate-300">
          Moving this task back to <strong>In Progress</strong>. Please describe what needs to be improved or fixed before approval.
        </p>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Review Comments & Instructions *
          </label>
          <textarea
            rows="4"
            required
            placeholder="e.g. Please optimize responsive layout on mobile screens and add error handling for API timeouts..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
          ></textarea>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            loading={loading}
            className="bg-amber-600/20 hover:bg-amber-600/30 border-amber-500/40 text-amber-300 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Send Change Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};
