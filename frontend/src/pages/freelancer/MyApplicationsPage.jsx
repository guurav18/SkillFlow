import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatDate, formatRelativeTime } from '../../utils/formatters';
import { FileCheck2, ArrowRight, Building2, Calendar, DollarSign, Search } from 'lucide-react';

export const MyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await applicationService.getMyApplications();
        setApplications(data.applications || []);
      } catch (err) {
        console.error('Failed to load applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const filteredApps = applications.filter((app) => {
    if (filterStatus === 'pending') return app.status === 'pending';
    if (filterStatus === 'accepted') return app.status === 'accepted';
    if (filterStatus === 'rejected') return app.status === 'rejected';
    return true;
  });

  if (loading) {
    return <LoadingSpinner text="Loading your applications..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-indigo-400" />
            My Submitted Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track and monitor the status of all your client proposals.
          </p>
        </div>

        <Link to="/freelancer/browse">
          <Button variant="primary" size="sm">
            <Search className="w-4 h-4" />
            Find More Projects
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {['all', 'pending', 'accepted', 'rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
              filterStatus === tab
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab === 'all'
              ? `All (${applications.length})`
              : `${tab} (${applications.filter((a) => a.status === tab).length})`}
          </button>
        ))}
      </div>

      {/* Application Cards List */}
      {filteredApps.length === 0 ? (
        <EmptyState
          title="No applications found"
          description={
            filterStatus === 'all'
              ? 'You have not submitted any project proposals yet.'
              : `No applications currently marked as ${filterStatus}.`
          }
          actionLabel="Browse Projects"
          onAction={() => (window.location.href = '/freelancer/browse')}
        />
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => (
            <div
              key={app._id}
              className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-purple-400">
                      {app.project?.category || 'Project'}
                    </span>
                    {app.status === 'accepted' && <Badge variant="success">Accepted & Hired</Badge>}
                    {app.status === 'rejected' && <Badge variant="danger">Rejected</Badge>}
                    {app.status === 'pending' && <Badge variant="brand">Pending Review</Badge>}
                  </div>

                  <Link
                    to={`/freelancer/projects/${app.project?._id}`}
                    className="font-bold text-base sm:text-lg text-slate-100 hover:text-indigo-400 transition"
                  >
                    {app.project?.title}
                  </Link>

                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Client: {app.project?.client?.name}</span>
                    <span>• Applied {formatRelativeTime(app.createdAt)}</span>
                  </p>
                </div>

                <div className="flex sm:flex-col items-end gap-1 text-right">
                  <span className="text-sm font-bold text-emerald-400">
                    Your Bid: {formatCurrency(app.bidAmount)}
                  </span>
                  <span className="text-xs text-slate-500">
                    Est. {app.estimatedDays} days
                  </span>
                </div>
              </div>

              {/* Proposal preview */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed line-clamp-3 mb-4">
                {app.proposal}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <span className="text-slate-500">
                  Target Project Budget: {formatCurrency(app.project?.budget)}
                </span>
                <Link
                  to={`/freelancer/projects/${app.project?._id}`}
                  className="font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                >
                  View Project <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
