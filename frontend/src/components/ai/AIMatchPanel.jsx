import React, { useState } from 'react';
import { Button } from '../common/Button';
import { aiService } from '../../services/aiService';
import { Badge } from '../common/Badge';
import { Sparkles } from 'lucide-react';

export const AIMatchPanel = ({ projectId }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const load = async () => { setLoading(true); setError(''); try { setMatches((await aiService.getMatches(projectId)).matches || []); } catch (err) { setError(err.message || 'AI service is temporarily unavailable.'); } finally { setLoading(false); } };
  return <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800"><div className="flex items-center justify-between gap-3 mb-4"><div><h2 className="text-lg font-bold text-slate-100 flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-400" /> Recommended Freelancers</h2><p className="text-xs text-slate-500 mt-1">Advisory matches based on profile skills and this project’s requirements.</p></div><Button variant="secondary" size="sm" onClick={load} loading={loading}>Find Best Freelancers</Button></div>{error && <p className="text-xs text-amber-300">{error}</p>}<div className="space-y-3">{matches.map(({ freelancer, match }) => <div key={freelancer.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-100">{freelancer.name}</p><p className="text-xs text-indigo-300">{freelancer.title || 'Freelancer'}</p></div><Badge variant="purple">AI Match: {match.matchScore}%</Badge></div><p className="text-xs text-slate-400 mt-3">{match.experience}</p><div className="flex flex-wrap gap-1.5 mt-3">{match.reasons?.map((reason) => <span key={reason} className="text-[11px] px-2 py-1 rounded bg-emerald-500/10 text-emerald-300">✓ {reason}</span>)}{match.weakSkills?.map((skill) => <span key={skill} className="text-[11px] px-2 py-1 rounded bg-amber-500/10 text-amber-300">Needs: {skill}</span>)}</div></div>)}</div>{!matches.length && !error && <p className="text-xs text-slate-500">Run matching when you are ready to compare current applicants.</p>}</div>;
};