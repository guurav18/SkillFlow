import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { formatCurrency, formatDate, formatRelativeTime } from '../../utils/formatters';
import { Calendar, Building2, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export const ProjectCard = ({ project, showActions = true, role = 'public' }) => {
  const isAssigned = project.status === 'assigned';
  const isCompleted = project.status === 'completed';

  const getStatusBadge = () => {
    if (isAssigned) {
      return (
        <Badge variant="info">
          <CheckCircle2 className="w-3 h-3" /> Assigned
        </Badge>
      );
    }
    if (isCompleted) {
      return (
        <Badge variant="success">
          <CheckCircle2 className="w-3 h-3" /> Completed
        </Badge>
      );
    }
    return (
      <Badge variant="brand">
        <Clock className="w-3 h-3" /> Open
      </Badge>
    );
  };

  const getDetailsLink = () => {
    if (role === 'client') return `/client/projects/${project._id}`;
    return `/freelancer/projects/${project._id}`;
  };

  return (
    <Card hover className="flex flex-col justify-between group">
      <div>
        {/* Top bar: Category + Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant="purple" size="sm">
            {project.category || 'General'}
          </Badge>
          {getStatusBadge()}
        </div>

        {/* Title */}
        <Link to={getDetailsLink()}>
          <h3 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1 mb-2">
            {project.title}
          </h3>
        </Link>

        {/* Description snippet */}
        <p className="text-sm text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {project.description}
        </p>

        {/* Skills pills */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.skills?.slice(0, 4).map((skill, index) => (
            <span
              key={index}
              className="text-xs px-2.5 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60"
            >
              {skill}
            </span>
          ))}
          {project.skills?.length > 4 && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800/40 text-slate-400 border border-slate-800">
              +{project.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

        {/* Footer info: budget, client, deadline, proposals */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3 text-xs text-slate-400">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 font-semibold text-slate-200 text-sm">
            <span className="text-emerald-400 font-bold">{formatCurrency(project.budget)}</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Due {formatDate(project.deadline)}</span>
          </div>
          {typeof project.applicationCount === 'number' && (
            <span className="text-slate-400">{project.applicationCount} proposals</span>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-1.5 truncate text-slate-400">
            <Building2 className="h-3.5 w-3.5 text-cyan-300" />
            <span className="truncate">{project.client?.company || project.client?.name || 'WorkFlow client'}</span>
          </span>

        {showActions && (
          <Link
            to={getDetailsLink()}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 group-hover:translate-x-0.5 transition-transform"
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
