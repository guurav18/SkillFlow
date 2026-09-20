import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate, formatRelativeTime } from '../../utils/formatters';
import {
  ShieldAlert,
  Users,
  Briefcase,
  Layers,
  FileCheck2,
  CheckCircle2,
  Clock,
  Sparkles,
  Building2,
  Code2,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await adminService.getStats();
        setData(res);
      } catch (err) {
        setError(err.message || 'Failed to load platform stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Aggregating platform intelligence..." />;
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-rose-400">
        <p>{error || 'Access denied or server error.'}</p>
      </div>
    );
  }

  const { stats, recentUsers, recentProjects } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-slate-900 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
          <ShieldAlert className="w-4 h-4" /> Platform Control & Analytics
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
          Admin Intelligence Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Real-time oversight of users, marketplace projects, proposals, and contractor activity.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Users</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{stats.totalUsers}</div>
          <span className="text-[11px] text-slate-500">Platform-wide</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Clients</span>
            <Building2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{stats.totalClients}</div>
          <span className="text-[11px] text-sky-400/80">Project creators</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Freelancers</span>
            <Code2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{stats.totalFreelancers}</div>
          <span className="text-[11px] text-purple-400/80">Engineers & designers</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Projects</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{stats.totalProjects}</div>
          <span className="text-[11px] text-emerald-400/80">
            {stats.openProjects} open • {stats.assignedProjects} assigned
          </span>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
        <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          <span>Recently Registered Users</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="pb-3 px-3">Name</th>
                <th className="pb-3 px-3">Email</th>
                <th className="pb-3 px-3">Role</th>
                <th className="pb-3 px-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentUsers?.map((u) => (
                <tr key={u._id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-3 font-semibold text-slate-200">{u.name}</td>
                  <td className="py-3 px-3 text-slate-400">{u.email}</td>
                  <td className="py-3 px-3">
                    {u.role === 'admin' && <Badge variant="warning" size="sm">Admin</Badge>}
                    {u.role === 'client' && <Badge variant="brand" size="sm">Client</Badge>}
                    {u.role === 'freelancer' && <Badge variant="purple" size="sm">Freelancer</Badge>}
                  </td>
                  <td className="py-3 px-3 text-slate-500">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Projects Table */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
        <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Recently Created Scopes</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="pb-3 px-3">Project Title</th>
                <th className="pb-3 px-3">Client</th>
                <th className="pb-3 px-3">Budget</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentProjects?.map((p) => (
                <tr key={p._id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-3 font-semibold text-slate-200">{p.title}</td>
                  <td className="py-3 px-3 text-slate-400">{p.client?.name || 'Client'}</td>
                  <td className="py-3 px-3 font-bold text-emerald-400">{formatCurrency(p.budget)}</td>
                  <td className="py-3 px-3">
                    {p.status === 'open' ? (
                      <Badge variant="brand" size="sm">Open</Badge>
                    ) : (
                      <Badge variant="info" size="sm">Assigned</Badge>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-500">{formatDate(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
