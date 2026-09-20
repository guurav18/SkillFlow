import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { Button } from '../../components/common/Button';
import { AIProjectBreakdown } from '../../components/ai/AIProjectBreakdown';
import { aiService } from '../../services/aiService';
import {
  FolderPlus,
  DollarSign,
  Calendar,
  Layers,
  AlertCircle,
  Tag,
  AlignLeft,
  Sparkles,
} from 'lucide-react';

const CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'AI & Machine Learning',
  'Data Science',
  'DevOps & Cloud',
  'Cybersecurity',
  'Content & Marketing',
  'Other',
];

export const CreateProjectPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [skills, setSkills] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [breakdown, setBreakdown] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const generateBreakdown = async () => {
    if (!description.trim()) {
      setError('Add a project description before generating an AI breakdown.');
      return;
    }
    setAiLoading(true);
    setError('');
    try {
      const response = await aiService.generateBreakdown({ title, description, category, skills: skills.split(',').map((skill) => skill.trim()).filter(Boolean), budget, deadline });
      setBreakdown(response.breakdown);
    } catch (err) {
      setError(err.message || 'AI service is temporarily unavailable.');
    } finally {
      setAiLoading(false);
    }
  };

  const acceptBreakdown = () => {
    if (!breakdown) return;
    setCategory(breakdown.category || category);
    setSkills((breakdown.skills || []).join(', '));
    setDescription((current) => current || breakdown.summary);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim() || !budget || !deadline) {
      setError('Please fill in all required fields.');
      return;
    }

    const parsedSkills = skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (parsedSkills.length === 0) {
      setError('Please specify at least one required skill (e.g. React, Node.js).');
      return;
    }

    setLoading(true);

    try {
      const response = await projectService.createProject({
        title: title.trim(),
        description: description.trim(),
        category,
        skills: parsedSkills,
        budget: Number(budget),
        deadline,
      });

      navigate(`/client/projects/${response.project._id}`);
    } catch (err) {
      setError(err.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 flex items-center gap-2.5">
          <FolderPlus className="w-7 h-7 text-indigo-400" />
          Create a New Project
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Specify your project goals, required technologies, budget, and target timeline.
        </p>
      </div>

      {/* Form Card */}
      <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Project Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Project Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Build Real-Time SaaS Analytics Dashboard"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20">
            <div><p className="text-sm font-semibold text-slate-100">Plan this project with AI</p><p className="text-xs text-slate-400 mt-1">Generate milestones and tasks for review before publishing.</p></div>
            <Button type="button" variant="secondary" size="sm" onClick={generateBreakdown} loading={aiLoading}><Sparkles className="w-4 h-4" /> Generate Breakdown</Button>
          </div>
          <AIProjectBreakdown breakdown={breakdown} onAccept={acceptBreakdown} onRegenerate={generateBreakdown} loading={aiLoading} />

          {/* Category & Budget Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-slate-100">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Budget (USD $) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="5"
                  required
                  placeholder="e.g. 2500"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Deadline & Skills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Deadline *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Required Skills (Comma separated) *
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="React, Node.js, MongoDB, Tailwind"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Project Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Project Description & Requirements *
            </label>
            <textarea
              rows="6"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the scope of work, technical architecture expectations, key deliverables, and qualification criteria..."
              className="w-full p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed transition"
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/client/dashboard')}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading} className="glow-indigo">
              Publish Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
