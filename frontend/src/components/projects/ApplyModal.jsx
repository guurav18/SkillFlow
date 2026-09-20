import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { formatCurrency } from '../../utils/formatters';
import { Send, DollarSign, Calendar } from 'lucide-react';

export const ApplyModal = ({ isOpen, onClose, project, onSubmit, loading }) => {
  const [proposal, setProposal] = useState('');
  const [bidAmount, setBidAmount] = useState(project?.budget || '');
  const [estimatedDays, setEstimatedDays] = useState(7);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!proposal || proposal.trim().length < 20) {
      setError('Please provide a meaningful proposal of at least 20 characters.');
      return;
    }

    if (!bidAmount || Number(bidAmount) <= 0) {
      setError('Please enter a valid positive bid amount.');
      return;
    }

    try {
      await onSubmit({
        proposal: proposal.trim(),
        bidAmount: Number(bidAmount),
        estimatedDays: Number(estimatedDays) || 7,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit application.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Apply to: ${project?.title}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Project budget reference */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Client's Target Budget:</span>
          <span className="font-semibold text-emerald-400 text-sm">
            {formatCurrency(project?.budget)}
          </span>
        </div>

        {/* Bid Amount & Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Your Bid Amount ($ USD)
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="1"
                required
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="e.g. 1500"
                className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Estimated Delivery (Days)
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="1"
                max="365"
                required
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(e.target.value)}
                placeholder="e.g. 14"
                className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Proposal / Cover letter */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Proposal / Cover Letter
          </label>
          <textarea
            rows="5"
            required
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
            placeholder="Introduce your expertise, relevant previous projects, and how you will solve this project's requirements..."
            className="w-full p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
          ></textarea>
          <p className="text-[11px] text-slate-500 mt-1">
            Tip: Highlight relevant tech stack and timeline commitments.
          </p>
        </div>

        {/* Modal actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading}>
            <Send className="w-4 h-4" />
            Submit Application
          </Button>
        </div>
      </form>
    </Modal>
  );
};
