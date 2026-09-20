import React from 'react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

export const AIProjectBreakdown = ({ breakdown, onAccept, onRegenerate, loading }) => {
  if (!breakdown) return null;
  return (
    <div className="mt-6 p-5 rounded-2xl bg-indigo-950/25 border border-indigo-500/30 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><div className="flex items-center gap-2 text-xs font-semibold text-indigo-300"><Sparkles className="w-4 h-4" /> AI Project Breakdown</div><p className="text-sm text-slate-200 mt-2">{breakdown.summary}</p></div>
        <Badge variant="purple">Estimate: {breakdown.estimatedHours || 0}h</Badge>
      </div>
      <div><p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Suggested skills</p><div className="flex flex-wrap gap-2">{breakdown.skills?.map((skill) => <span key={skill} className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-700">{skill}</span>)}</div></div>
      <div className="space-y-3">{breakdown.milestones?.map((milestone) => <div key={milestone.title} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800"><div className="flex items-center justify-between gap-2"><h3 className="text-sm font-bold text-slate-100">{milestone.title}</h3><span className="text-xs text-indigo-300">{milestone.tasks?.length || 0} tasks</span></div><p className="text-xs text-slate-400 mt-1">{milestone.description}</p><div className="mt-3 space-y-2">{milestone.tasks?.map((task) => <div key={task.title} className="flex items-start justify-between gap-3 text-xs"><div><p className="text-slate-200">{task.title}</p><p className="text-slate-500">{task.description}</p></div><span className="shrink-0 text-slate-500">{task.estimatedHours || 0}h</span></div>)}</div></div>)}</div>
      <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-indigo-500/20"><Button variant="secondary" size="sm" onClick={onRegenerate} loading={loading}><RefreshCw className="w-3.5 h-3.5" /> Regenerate</Button><Button variant="success" size="sm" onClick={onAccept}><CheckCircle2 className="w-3.5 h-3.5" /> Use Suggestions</Button></div>
    </div>
  );
};