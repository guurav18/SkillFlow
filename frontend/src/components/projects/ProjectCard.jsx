import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Calendar, Building2, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export const ProjectCard = ({ project, showActions = true, role = 'public' }) => {
  const isAssigned = project.status === 'assigned';
  const isCompleted = project.status === 'completed';

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <Badge variant="success" size="sm">
          <CheckCircle2 className="w-3 h-3" /> Completed
        </Badge>
      );
    }
    if (isAssigned) {
      return (
        <Badge variant="info" size="sm">
          <CheckCircle2 className="w-3 h-3" /> In Progress
        </Badge>
      );
    }
    return (
      <Badge variant="brand" size="sm">
        <Clock className="w-3 h-3" /> Open
      </Badge>
    );
  };

  const getDetailsLink = () => {
    if (role === 'client') return `/client/projects/${project._id}`;
    return `/freelancer/projects/${project._id}`;
  };

  const validSkills = (project.skills || [])
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .filter(Boolean);

  const categoryLabel = project.category?.trim() || 'General';

  return (
    <Card hover className="flex flex-col justify-between group">
      <div>
        {/* Top bar: Category + Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant="purple" size="sm">
            {categoryLabel}
          </Badge>
          {getStatusBadge()}
        </div>

        {/* Title */}
        <Link to={getDetailsLink()}>
          <h3 className="text-base sm:text-lg font-bold text-[var(--sf-ink)] group-hover:text-[#3157d5] dark:group-hover:text-cyan-300 transition-colors line-clamp-1 mb-2">
            {project.title}
          </h3>
        </Link>

        {/* Description snippet */}
        <p className="text-sm text-[var(--sf-muted)] line-clamp-2 mb-4 leading-relaxed">
          {project.description}
        </p>

        {/* Skills pills */}
        {validSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {validSkills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/60 font-medium"
              >
                {skill}
              </span>
            ))}
            {validSkills.length > 4 && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100/60 text-slate-500 border border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-800">
                +{validSkills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer info: budget, client, deadline, proposals */}
      <div className="pt-4 border-t border-[var(--sf-border)] space-y-3 text-xs text-[var(--sf-muted)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 font-semibold text-sm">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-base">
              {formatCurrency(project.budget)}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[var(--sf-muted)]">
            <Calendar className="w-3.5 h-3.5 opacity-70" />
            <span>Due {formatDate(project.deadline)}</span>
          </div>
          {typeof project.applicationCount === 'number' && (
            <span className="text-[var(--sf-muted)]">{project.applicationCount} proposals</span>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="flex min-w-0 items-center gap-1.5 truncate text-[var(--sf-muted)]">
            <Building2 className="h-3.5 w-3.5 text-[#3157d5] dark:text-cyan-300 shrink-0" />
            <span className="truncate font-medium">
              {project.client?.company || project.client?.name || 'Verified Client'}
            </span>
          </span>

          {showActions && (
            <Link
              to={getDetailsLink()}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#3157d5] dark:text-indigo-400 hover:text-blue-700 dark:hover:text-indigo-300 group-hover:translate-x-0.5 transition-all"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
};
