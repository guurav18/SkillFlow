import React, { useState } from 'react';
import { Button } from '../common/Button';
import { aiService } from '../../services/aiService';
import { Bot, Send, Sparkles } from 'lucide-react';

const SUGGESTIONS = ['What should I work on next?', 'What is blocking the project?', 'Summarize project progress', 'What needs client review?', 'Which tasks are overdue?'];

export const AICopilotPanel = ({ projectId }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const ask = async (value = question) => { if (!value.trim()) return; setLoading(true); setError(''); setQuestion(value); try { setAnswer((await aiService.askCopilot(projectId, value)).copilot); } catch (err) { setError(err.message || 'AI service is temporarily unavailable.'); } finally { setLoading(false); } };
  return <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4"><div className="flex items-center gap-2"><Bot className="w-5 h-5 text-indigo-400" /><div><h2 className="font-bold text-slate-100">Project Copilot</h2><p className="text-xs text-slate-500">Answers are grounded in this project’s tasks, milestones, members, and deadlines.</p></div></div><div className="flex flex-wrap gap-2">{SUGGESTIONS.map((suggestion) => <button key={suggestion} onClick={() => ask(suggestion)} className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:border-indigo-500/50 hover:text-indigo-300 transition"><Sparkles className="w-3 h-3 inline mr-1" />{suggestion}</button>)}</div><div className="flex gap-2"><input value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && ask()} placeholder="Ask about this project..." className="flex-1 px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500" /><Button onClick={() => ask()} loading={loading} aria-label="Ask copilot"><Send className="w-4 h-4" /></Button></div>{error && <p className="text-xs text-amber-300">{error}</p>}{answer && <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20"><p className="text-sm text-slate-200 whitespace-pre-line">{answer.answer}</p>{answer.references?.length > 0 && <p className="text-[11px] text-slate-500 mt-3">References: {answer.references.join(' · ')}</p>}</div>}</div>;
};