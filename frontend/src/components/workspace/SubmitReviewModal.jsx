import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { FileAttachmentUploader } from './FileAttachmentUploader';
import {
  Send,
  Link as LinkIcon,
  Plus,
  Trash2,
  AlertCircle,
  FileCheck2,
  Github,
  Globe,
  Figma,
} from 'lucide-react';

export const SubmitReviewModal = ({
  isOpen,
  onClose,
  task,
  onSubmit,
  loading = false,
}) => {
  const [notes, setNotes] = useState(() => task?.deliverables?.notes || '');
  const [links, setLinks] = useState(() =>
    task?.deliverables?.links?.length
      ? task.deliverables.links
      : [{ label: 'Live Demo / PR', url: '' }]
  );
  const [attachments, setAttachments] = useState(
    () => task?.deliverables?.attachments || []
  );
  const [error, setError] = useState('');

  if (!task) return null;

  const handleAddLink = (defaultLabel = 'Link') => {
    if (links.length >= 5) {
      setError('Maximum 5 deliverable links allowed.');
      return;
    }
    setError('');
    setLinks([...links, { label: defaultLabel, url: '' }]);
  };

  const handleUpdateLink = (index, field, value) => {
    const updated = [...links];
    updated[index][field] = value;
    setLinks(updated);
  };

  const handleRemoveLink = (index) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Filter valid links
    const validLinks = links
      .filter((l) => l.url && l.url.trim().length > 0)
      .map((l) => ({
        label: (l.label || 'Deliverable Link').trim(),
        url: l.url.trim().startsWith('http') ? l.url.trim() : `https://${l.url.trim()}`,
      }));

    // Basic validation: either notes, a link, or a file must be provided
    if (!notes.trim() && validLinks.length === 0 && attachments.length === 0) {
      setError(
        'Please provide a brief summary of your work, a deliverable link, or an attached file.'
      );
      return;
    }

    try {
      await onSubmit(task._id, {
        notes: notes.trim(),
        links: validLinks,
        attachments,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit task for review.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Task Deliverables"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Task Summary Banner */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-0.5">
              <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Submitting work for review</span>
            </div>
            <h4 className="font-semibold text-sm text-slate-100 truncate">
              {task.title}
            </h4>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              task.priority === 'high'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : task.priority === 'medium'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}
          >
            {task.priority} Priority
          </span>
        </div>

        {/* Work Summary / Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Work Summary & Completion Notes *
          </label>
          <textarea
            rows="3"
            required
            placeholder="Summarize what was completed, key highlights, or testing instructions for the client..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed transition"
          />
        </div>

        {/* Deliverable Links */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
              Deliverable Links (GitHub, Demo, Figma, etc.)
            </label>
            <button
              type="button"
              onClick={() => handleAddLink('Link')}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition"
            >
              <Plus className="w-3 h-3" /> Add Link
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-500">Quick presets:</span>
            <button
              type="button"
              onClick={() => handleAddLink('GitHub PR')}
              className="px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-[10px] text-slate-300 flex items-center gap-1 border border-slate-700/60 transition"
            >
              <Github className="w-2.5 h-2.5" /> + GitHub PR
            </button>
            <button
              type="button"
              onClick={() => handleAddLink('Live Demo')}
              className="px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-[10px] text-slate-300 flex items-center gap-1 border border-slate-700/60 transition"
            >
              <Globe className="w-2.5 h-2.5" /> + Live Demo
            </button>
            <button
              type="button"
              onClick={() => handleAddLink('Figma Design')}
              className="px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-[10px] text-slate-300 flex items-center gap-1 border border-slate-700/60 transition"
            >
              <Figma className="w-2.5 h-2.5" /> + Figma
            </button>
          </div>

          <div className="space-y-2">
            {links.map((link, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Label (e.g. PR #12)"
                  value={link.label}
                  onChange={(e) => handleUpdateLink(idx, 'label', e.target.value)}
                  className="w-1/3 px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="https://..."
                  value={link.url}
                  onChange={(e) => handleUpdateLink(idx, 'url', e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
                {links.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(idx)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                    title="Remove link"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Deliverable File Attachments */}
        <FileAttachmentUploader
          files={attachments}
          onChange={setAttachments}
          disabled={loading}
          label="Deliverable Files & Artifacts"
          hint="Upload deliverables, build zips, test evidence, or screenshots"
          maxFiles={5}
        />

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={loading}
            disabled={loading}
            className="glow-indigo"
          >
            <Send className="w-3.5 h-3.5" />
            Submit for Client Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};
