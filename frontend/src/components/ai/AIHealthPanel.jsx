import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { aiService } from '../../services/aiService';
import { Activity, RefreshCw } from 'lucide-react';

export const AIHealthPanel = ({ projectId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const load = async () => { setLoading(true); setError(''); try { setData(await aiService.getHealth(projectId)); } catch (err) { setError(err.message || 'AI service is temporarily unavailable.'); } finally { setLoading(false); } };
  return <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800"><div className="flex items-center justify-between gap-3"><div><h2 className="text-base font-bold text-slate-100 flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400" /> AI Project Health</h2><p className="text-xs text-slate-500 mt-1">Generated on request from current tasks and milestones.</p></div><Button variant="secondary" size="sm" onClick={load} loading={loading}><RefreshCw className="w-3.5 h-3.5" /> {data ? 'Refresh' : 'Analyze'}</Button></div>{loading && <LoadingSpinner text="Analyzing project data..." />}{error && <p className="text-xs text-amber-300 mt-4">{error}</p>}{data?.health && <div className="mt-5 space-y-4"><div className="flex items-center justify-between"><Badge variant={data.health.status === 'Healthy' ? 'success' : data.health.status === 'At Risk' ? 'warning' : 'danger'}>{data.health.status}</Badge><span className="text-xs text-slate-400">{data.metrics.completedTasks}/{data.metrics.totalTasks} tasks complete</span></div><p className="text-sm text-slate-300">{data.health.summary}</p><div className="grid sm:grid-cols-2 gap-4"><div><p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Key issues</p>{data.health.keyIssues?.length ? <ul className="space-y-1 text-xs text-amber-200">{data.health.keyIssues.map((issue) => <li key={issue}>• {issue}</li>)}</ul> : <p className="text-xs text-slate-500">No issues reported.</p>}</div><div><p className="text-[11px] uppercase tracking-wider text-slate-500 mb-2">Suggested actions</p><ul className="space-y-1 text-xs text-slate-300">{data.health.suggestedActions?.map((action) => <li key={action}>• {action}</li>)}</ul></div></div></div>}</div>;
};