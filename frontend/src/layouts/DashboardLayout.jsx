import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { taskService } from '../services/taskService';
import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  Search,
  FileCheck2,
  Briefcase,
  ShieldAlert,
  User,
  ExternalLink,
  GitPullRequestArrow,
  BarChart3,
  ReceiptText,
  Bell,
  Building2,
  CheckCircle,
} from 'lucide-react';

const isMeaningfulText = (val) => {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim().toLowerCase();
  const dummyWords = ['kuch nhi', 'kuch nahi', 'none', 'n/a', 'na', 'null', 'undefined', 'test', 'xyz', 'no', 'nothing'];
  return trimmed.length > 0 && !dummyWords.includes(trimmed);
};

export const DashboardLayout = () => {
  const { user, isClient, isFreelancer, isAdmin } = useAuth();
  const location = useLocation();
  const [workflowCount, setWorkflowCount] = useState(0);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  useEffect(() => {
    if (isAdmin) return;
    const fetchCount = async () => {
      try {
        const data = await taskService.getGlobalWorkflow();
        setWorkflowCount(data?.tasks?.length ?? 0);
      } catch {
        // silently fail
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const hasCompany = isMeaningfulText(user?.company);
  const hasTitle = isMeaningfulText(user?.title);

  return (
    <div className="page-enter flex flex-col min-h-screen bg-slate-950 text-slate-100 antialiased">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Dashboard Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            {/* User Profile Card */}
            <div className="p-5 rounded-2xl bg-[var(--sf-card)] border border-[var(--sf-border)] shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3157d5] to-[#2648c3] flex items-center justify-center font-bold text-lg text-white shadow-xs shrink-0 ring-2 ring-[#3157d5]/15">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-[var(--sf-ink)] truncate leading-tight">{user?.name || 'User'}</h4>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#eef2ff] text-[#3157d5] dark:bg-indigo-500/15 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20">
                      {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : (isFreelancer ? 'Freelancer' : 'Client')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Details or Clean Neutral State */}
              <div className="mt-4 pt-3.5 border-t border-[var(--sf-border)] text-xs text-[var(--sf-muted)] space-y-2">
                {hasCompany ? (
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="w-3.5 h-3.5 text-[#3157d5] shrink-0" />
                    <span className="truncate font-medium text-[var(--sf-ink)]">{user.company}</span>
                  </div>
                ) : hasTitle ? (
                  <div className="flex items-center gap-2 truncate">
                    <Briefcase className="w-3.5 h-3.5 text-[#3157d5] shrink-0" />
                    <span className="truncate font-medium text-[var(--sf-ink)]">{user.title}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[var(--sf-muted)]">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">
                      {isFreelancer ? 'Verified Freelancer Profile' : 'Verified Client Account'}
                    </span>
                  </div>
                )}

                {isFreelancer && user?.hourlyRate > 0 && (
                  <div className="flex items-center justify-between text-xs text-[var(--sf-muted)] pt-0.5">
                    <span>Hourly Rate:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">${user.hourlyRate}/hr</span>
                  </div>
                )}

                {isFreelancer && Array.isArray(user?.skills) && user.skills.filter(isMeaningfulText).length > 0 && (
                  <div className="pt-1.5 border-t border-[var(--sf-border)]/60">
                    <p className="text-[10px] font-semibold text-[var(--sf-muted)] uppercase tracking-wider mb-1.5">Top Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {user.skills.filter(isMeaningfulText).slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--sf-surface)] text-[var(--sf-ink)] border border-[var(--sf-border)] truncate max-w-[120px]"
                        >
                          {skill}
                        </span>
                      ))}
                      {user.skills.filter(isMeaningfulText).length > 4 && (
                        <span className="text-[10px] text-[var(--sf-muted)] self-center font-medium pl-0.5">
                          +{user.skills.filter(isMeaningfulText).length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Navigation */}
            <nav className="p-3 rounded-2xl bg-[var(--sf-card)] border border-[var(--sf-border)] shadow-xs space-y-1 text-sm font-medium">
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--sf-muted)]">Navigation</p>
              {isClient && (
                <>
                  <Link
                    to="/client/dashboard"
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                      isActive('/client/dashboard')
                        ? 'bg-[#eef2ff] text-[#3157d5] dark:bg-indigo-500/15 dark:text-indigo-300 font-semibold border border-indigo-100 dark:border-indigo-500/20 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 shrink-0" />
                    <span>Dashboard Overview</span>
                  </Link>

                  <Link
                    to="/client/projects"
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                      isActive('/client/projects')
                        ? 'bg-[#eef2ff] text-[#3157d5] dark:bg-indigo-500/15 dark:text-indigo-300 font-semibold border border-indigo-100 dark:border-indigo-500/20 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <FolderKanban className="w-4 h-4 shrink-0" />
                    <span>My Created Projects</span>
                  </Link>

                  <Link
                    to="/client/create-project"
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                      isActive('/client/create-project')
                        ? 'bg-[#eef2ff] text-[#3157d5] dark:bg-indigo-500/15 dark:text-indigo-300 font-semibold border border-indigo-100 dark:border-indigo-500/20 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-[#3157d5] hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4 shrink-0" />
                    <span>Post New Project</span>
                  </Link>
                </>
              )}

              {isFreelancer && (
                <>
                  <Link
                    to="/freelancer/dashboard"
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                      isActive('/freelancer/dashboard')
                        ? 'bg-[#eef2ff] text-[#3157d5] dark:bg-indigo-500/15 dark:text-indigo-300 font-semibold border border-indigo-100 dark:border-indigo-500/20 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 shrink-0" />
                    <span>Dashboard Overview</span>
                  </Link>

                  <Link
                    to="/freelancer/browse"
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                      isActive('/freelancer/browse')
                        ? 'bg-[#eef2ff] text-[#3157d5] dark:bg-indigo-500/15 dark:text-indigo-300 font-semibold border border-indigo-100 dark:border-indigo-500/20 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Search className="w-4 h-4 shrink-0" />
                    <span>Explore Projects</span>
                  </Link>

                  <Link
                    to="/freelancer/applications"
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                      isActive('/freelancer/applications')
                        ? 'bg-[#eef2ff] text-[#3157d5] dark:bg-indigo-500/15 dark:text-indigo-300 font-semibold border border-indigo-100 dark:border-indigo-500/20 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <FileCheck2 className="w-4 h-4 shrink-0" />
                    <span>My Applications</span>
                  </Link>

                  <Link
                    to="/freelancer/projects"
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                      isActive('/freelancer/projects')
                        ? 'bg-[#eef2ff] text-[#3157d5] dark:bg-indigo-500/15 dark:text-indigo-300 font-semibold border border-indigo-100 dark:border-indigo-500/20 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 shrink-0" />
                    <span>My Hired Projects</span>
                  </Link>
                </>
              )}

              {/* Workflow Sidebar Link — client & freelancer */}
              {(isClient || isFreelancer) && (
                <Link
                  to="/workflow"
                  className={`flex items-center justify-between px-3 py-2 rounded-xl transition ${
                    isActive('/workflow')
                      ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 font-semibold border border-violet-200 dark:border-violet-500/20 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <GitPullRequestArrow className="w-4 h-4 shrink-0" />
                    <span>Workflow</span>
                  </span>
                  {workflowCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-violet-600 text-white text-[10px] font-bold shadow-xs">
                      {workflowCount > 99 ? '99+' : workflowCount}
                    </span>
                  )}
                </Link>
              )}

              <Link
                to={`/${user?.role}/analytics`}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                  isActive(`/${user?.role}/analytics`)
                    ? 'bg-[#eef2ff] text-[#3157d5] dark:bg-indigo-500/15 dark:text-indigo-300 font-semibold border border-indigo-100 dark:border-indigo-500/20 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                }`}
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span>Analytics</span>
              </Link>
              <Link
                to={`/${user?.role}/invoices`}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                  isActive(`/${user?.role}/invoices`)
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-500/20 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                }`}
              >
                <ReceiptText className="w-4 h-4 shrink-0" />
                <span>Invoices</span>
              </Link>
              <Link
                to={`/${user?.role}/notifications`}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                  isActive(`/${user?.role}/notifications`)
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-500/20 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                }`}
              >
                <Bell className="w-4 h-4 shrink-0" />
                <span>Notifications</span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                    isActive('/admin/dashboard')
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-500/20 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Admin Intelligence</span>
                </Link>
              )}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9">
            <Outlet />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};
