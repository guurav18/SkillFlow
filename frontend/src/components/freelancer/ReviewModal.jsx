import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Star, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export const ReviewModal = ({ isOpen, onClose, freelancer, clientProjects = [], onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [deadlineRating, setDeadlineRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please write a brief feedback comment for the freelancer.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onReviewSubmitted({
        rating,
        qualityRating,
        communicationRating,
        deadlineRating,
        comment: comment.trim(),
        projectId: selectedProject || undefined,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Review & Rate ${freelancer?.name || 'Freelancer'}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Overall Star Rating */}
        <div className="text-center py-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Overall Rating
          </label>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating || rating) >= star;
              return (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1.5 focus:outline-none transition-transform hover:scale-125 duration-150"
                  title={`${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`w-8 h-8 transition-colors duration-150 ${
                      active
                        ? 'text-amber-400 fill-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.35)]'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1.5">
            {rating === 5 && 'Outstanding work — Exceeded expectations!'}
            {rating === 4 && 'Very Good — Delivered quality results.'}
            {rating === 3 && 'Average — Met baseline requirements.'}
            {rating === 2 && 'Below Average — Significant improvements needed.'}
            {rating === 1 && 'Poor — Disappointing experience.'}
          </p>
        </div>

        {/* Sub Ratings */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-700 dark:text-slate-300">Quality of Deliverables</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setQualityRating(s)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-4 h-4 ${
                      qualityRating >= s
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-700 dark:text-slate-300">Communication & Speed</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setCommunicationRating(s)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-4 h-4 ${
                      communicationRating >= s
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-700 dark:text-slate-300">Adherence to Deadlines</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setDeadlineRating(s)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-4 h-4 ${
                      deadlineRating >= s
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Associated Project (Optional) */}
        {clientProjects.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Associated Project (Optional)
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#3157d5]"
            >
              <option value="">General Profile Feedback</option>
              {clientProjects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title} (${p.budget})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Comment */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Your Testimonial / Feedback *
          </label>
          <textarea
            required
            rows={4}
            maxLength={1000}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={`Share what it was like working with ${freelancer?.name || 'this freelancer'}... What stood out about their work?`}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#3157d5] focus:ring-2 focus:ring-[#3157d5]/20 resize-none transition"
          />
          <div className="flex justify-end mt-1">
            <span className="text-[10px] text-slate-400">
              {comment.length}/1000 characters
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading} className="font-semibold shadow-md shadow-indigo-600/20">
            <span>Publish Review</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
