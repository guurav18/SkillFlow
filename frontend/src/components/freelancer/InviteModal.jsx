import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Send, Briefcase, PlusCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

export const InviteModal = ({ isOpen, onClose, freelancer, clientProjects = [], onInviteSent }) => {
  const [selectedProjectId, setSelectedProjectId] = useState(
    clientProjects.length > 0 ? clientProjects[0]._id : ''
  );
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const openProjects = clientProjects.filter((p) => p.status === 'open');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) {
      setError('Please select an active project to invite this freelancer to.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onInviteSent({
        projectId: selectedProjectId,
        message: message.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to send project invitation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invite ${freelancer?.name || 'Freelancer'} to Collaborate`}
      size="md"
    >
      {openProjects.length === 0 ? (
        <div className="py-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              No Open Projects Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              You don't have any open projects right now. Post a project first so you can invite {freelancer?.name || 'this freelancer'} directly!
            </p>
          </div>
          <Link
            to="/client/create-project"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3157d5] hover:bg-[#2546b8] text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post a New Project</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Your Project *
            </label>
            <select
              required
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#3157d5]"
            >
              {openProjects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title} • Budget: ${p.budget} • {p.category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Personalized Invitation Message (Optional)
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hi ${freelancer?.name ? freelancer.name.split(' ')[0] : 'there'}, I noticed your profile and think your skills would be a great fit for my project...`}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#3157d5] focus:ring-2 focus:ring-[#3157d5]/20 resize-none transition"
            />
          </div>

          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>The freelancer will receive an instant in-app notification with your project details.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={loading}
              className="font-semibold shadow-md shadow-indigo-600/20"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              <span>Send Invitation</span>
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
