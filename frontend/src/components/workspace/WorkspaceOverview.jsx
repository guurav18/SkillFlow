import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  Flag,
  MessageSquare,
  Kanban,
  User,
  Building2,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const WorkspaceOverview = ({
  project,
  taskMetrics,
  milestoneMetrics,
  onTabChange,
  isClient,
  isFreelancer,
}) => {
  const overallProgress =
    taskMetrics?.total > 0
      ? Math.round((taskMetrics.done / taskMetrics.total) * 100)
      : milestoneMetrics?.overallProgress || 0;

  // Calculate days remaining until project deadline
  const now = new Date();
  const deadlineDate = new Date(project.deadline);
  const diffTime = deadlineDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isOverdue = diffDays < 0;

  return (
    <div className="space-y-6">
      {/* Top Banner: Progress Bar & Key Statistics */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="brand">Workspace Active</Badge>
              <Badge variant="purple">{project.category}</Badge>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
              Overall Project Health & Progress
            </h2>
          </div>

          <div className="flex items-center gap-3 text-right">
            <div>
              <span className="text-3xl font-extrabold text-indigo-400">
                {overallProgress}%
              </span>
              <span className="text-xs text-slate-400 block font-medium">Completed</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-3.5 p-0.5 border border-slate-800 mb-6 overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm shadow-indigo-500/50"
            style={{ width: `${Math.max(5, overallProgress)}%` }}
          />
        </div>

        {/* 4 Overview Mini Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Layers className="w-3.5 h-3.5 text-indigo-400" /> Total Tasks
            </span>
            <div className="text-xl font-bold text-slate-100">{taskMetrics?.total || 0}</div>
            <span className="text-[11px] text-emerald-400 font-medium">
              {taskMetrics?.done || 0} Done • {taskMetrics?.inProgress || 0} Working
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Flag className="w-3.5 h-3.5 text-purple-400" /> Milestones
            </span>
            <div className="text-xl font-bold text-slate-100">
              {milestoneMetrics?.completed || 0} / {milestoneMetrics?.total || 0}
            </div>
            <span className="text-[11px] text-purple-400 font-medium">
              {milestoneMetrics?.overallProgress || 0}% Tracked
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" /> Timeline
            </span>
            <div
              className={`text-xl font-bold ${
                isOverdue ? 'text-rose-400' : 'text-slate-100'
              }`}
            >
              {isOverdue ? 'Overdue' : `${diffDays} days`}
            </div>
            <span className="text-[11px] text-slate-400">
              Due {formatDate(project.deadline)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Contract Budget
            </span>
            <div className="text-xl font-bold text-emerald-400">
              {formatCurrency(project.budget)}
            </div>
            <span className="text-[11px] text-slate-400">Fixed milestone scope</span>
          </div>
        </div>
      </div>

      {/* Workspace Participants Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client Box */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 text-lg flex-shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block mb-0.5">
              Project Client
            </span>
            <h4 className="text-base font-bold text-slate-100">{project.client?.name}</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {project.client?.company ? project.client.company : 'Verified Client'}
            </p>
            <p className="text-xs text-slate-500 mt-1">{project.client?.email}</p>
          </div>
        </div>

        {/* Hired Freelancer Box */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center font-bold text-purple-400 text-lg flex-shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block mb-0.5">
              Contracted Freelancer
            </span>
            <h4 className="text-base font-bold text-slate-100">
              {project.hiredFreelancer?.name || 'Hired Developer'}
            </h4>
            <p className="text-xs text-indigo-300 mt-0.5">
              {project.hiredFreelancer?.title || 'Senior Software Engineer'}
            </p>
            <p className="text-xs text-slate-500 mt-1">{project.hiredFreelancer?.email}</p>
          </div>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onTabChange('kanban')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900 cursor-pointer transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-105 transition-transform">
            <Kanban className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-200 group-hover:text-indigo-300 transition">
            Kanban Board →
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Visual column sprint workflow for tasks.
          </p>
        </div>

        <div
          onClick={() => onTabChange('milestones')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 hover:bg-slate-900 cursor-pointer transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-105 transition-transform">
            <Flag className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-200 group-hover:text-purple-300 transition">
            Milestones Tracker →
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Manage stage deliverables & percentages.
          </p>
        </div>

        <div
          onClick={() => onTabChange('chat')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900 cursor-pointer transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-200 group-hover:text-emerald-300 transition">
            Real-Time Chat →
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Instant Socket.IO messaging between parties.
          </p>
        </div>
      </div>
    </div>
  );
};
