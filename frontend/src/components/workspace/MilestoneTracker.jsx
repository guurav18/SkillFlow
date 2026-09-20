import React from 'react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { formatDate } from '../../utils/formatters';
import {
  Flag,
  PlusCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  TrendingUp,
} from 'lucide-react';

export const MilestoneTracker = ({
  milestones,
  metrics,
  onUpdateProgress,
  onEditMilestone,
  onDeleteMilestone,
  onOpenCreateModal,
  isClient,
  onPayMilestone,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Flag className="w-5 h-5 text-purple-400" />
            <span>Project Milestones & Deliverables</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Track key development phases and target release schedules.
          </p>
        </div>

        {isClient && (
          <Button variant="primary" size="sm" onClick={onOpenCreateModal} className="glow-indigo">
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Add Milestone
          </Button>
        )}
      </div>

      {/* Overview Metric Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center font-bold text-purple-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100">
              Milestone Completion: {metrics?.completed || 0} of {metrics?.total || 0} Done
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Cumulative progress across all stages: <strong className="text-purple-400">{metrics?.overallProgress || 0}%</strong>
            </p>
          </div>
        </div>

        <div className="w-full sm:w-48 bg-slate-950 rounded-full h-2.5 p-0.5 border border-slate-800 overflow-hidden">
          <div
            className="bg-purple-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(5, metrics?.overallProgress || 0)}%` }}
          />
        </div>
      </div>

      {/* Milestone Cards */}
      {milestones.length === 0 ? (
        <EmptyState
          icon={Flag}
          title="No milestones set yet"
          description={
            isClient
              ? 'Break your project into tangible milestones to track progress with your freelancer.'
              : 'The client has not published any milestones for this project yet.'
          }
          actionLabel={isClient ? 'Create Milestone' : null}
          onAction={isClient ? onOpenCreateModal : null}
        />
      ) : (
        <div className="space-y-4">
          {milestones.map((m) => {
            const isCompleted = m.status === 'completed' || m.progress === 100;

            return (
              <div
                key={m._id}
                className={`p-6 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-purple-950/20 border-purple-500/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      {isCompleted ? (
                        <Badge variant="success" size="sm">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </Badge>
                      ) : m.status === 'in_progress' ? (
                        <Badge variant="purple" size="sm">
                          <Clock className="w-3 h-3" /> In Progress
                        </Badge>
                      ) : (
                        <Badge variant="default" size="sm">Pending</Badge>
                      )}

                      {m.dueDate && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          Target: {formatDate(m.dueDate)}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-slate-100">
                      {m.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-base font-extrabold text-purple-400">
                      {m.progress || 0}%
                    </span>

                    {isClient && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => onEditMilestone(m)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition"
                          title="Edit Milestone"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteMilestone(m._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                          title="Delete Milestone"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {m.description && (
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                    {m.description}
                  </p>
                )}

                {/* Progress Bar & Quick Slider / Status Button */}
                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(3, m.progress || 0)}%` }}
                    />
                  </div>

                  {/* Freelancer & Client Quick Progress Update */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Update Stage:</span>
                      {[25, 50, 75, 100].map((pct) => (
                        <button
                          key={pct}
                          onClick={() => onUpdateProgress(m._id, pct)}
                          className={`px-2 py-1 rounded-md text-[11px] font-semibold transition ${
                            m.progress === pct
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>

                    {!isCompleted && (
                      <button
                        onClick={() => onUpdateProgress(m._id, 100)}
                        className="px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 font-medium transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Ready / Complete
                      </button>
                    )}
                    {isClient && m.amount > 0 && (
                      <button
                        onClick={() => onPayMilestone(m)}
                        className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-medium transition"
                      >
                        Pay INR {m.amount}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
