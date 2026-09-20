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
} from 'lucide-react';

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

  return (
    <div className="page-enter flex flex-col min-h-screen bg-slate-950 text-slate-100 antialiased">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Dashboard Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            {/* User Profile Card */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-lg text-white shadow-md shadow-indigo-600/30">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-sm text-slate-100 truncate">{user?.name}</h4>
                  <p className="text-xs text-indigo-400 capitalize font-medium">{user?.role}</p>
                </div>
              </div>

              {user?.company && (
                <div className="text-xs text-slate-400 mb-2 truncate">
                  🏢 <span className="text-slate-300 font-medium">{user.company}</span>
                </div>
              )}

              {user?.title && (
                <p className="text-xs text-slate-400 line-clamp-1 mb-3">
                  {user.title}
                </p>
              )}

              {user?.role === 'freelancer' && user?.hourlyRate > 0 && (
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Hourly Rate:</span>
                  <span className="font-semibold text-emerald-400">${user.hourlyRate}/hr</span>
                </div>
              )}
            </div>

            {/* Quick Navigation */}
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1 text-sm font-medium">
              {isClient && (
                <>
                  <Link
                    to="/client/dashboard"
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                      isActive('/client/dashboard')
                        ? 'bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard Overview
                  </Link>

                  <Link
                    to="/client/projects"
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                      isActive('/client/projects')
                        ? 'bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <FolderKanban className="w-4 h-4" />
                    My Created Projects
                  </Link>

                  <Link
                    to="/client/create-project"
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                      isActive('/client/create-project')
                        ? 'bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/20'
                        : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800/50'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    Post New Project
                  </Link>
                </>
              )}

              {isFreelancer && (
                <>
                  <Link
                    to="/freelancer/dashboard"
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                      isActive('/freelancer/dashboard')
                        ? 'bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard Overview
                  </Link>

                  <Link
                    to="/freelancer/browse"
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                      isActive('/freelancer/browse')
                        ? 'bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    Explore Projects
                  </Link>

                  <Link
                    to="/freelancer/applications"
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                      isActive('/freelancer/applications')
                        ? 'bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <FileCheck2 className="w-4 h-4" />
                    My Applications
                  </Link>

                  <Link
                    to="/freelancer/projects"
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                      isActive('/freelancer/projects')
                        ? 'bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    My Hired Projects
                  </Link>
                </>
              )}

              {/* Workflow Sidebar Link — client & freelancer */}
              {(isClient || isFreelancer) && (
                <Link
                  to="/workflow"
                  className={`flex items-center justify-between px-3 py-2 rounded-xl transition ${
                    isActive('/workflow')
                      ? 'bg-violet-600/15 text-violet-300 font-semibold border border-violet-500/20'
                      : 'text-slate-400 hover:text-violet-300 hover:bg-slate-800/50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <GitPullRequestArrow className="w-4 h-4" />
                    Workflow
                  </span>
                  {workflowCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-violet-600 text-white text-[10px] font-bold shadow shadow-violet-500/40 animate-pulse">
                      {workflowCount > 99 ? '99+' : workflowCount}
                    </span>
                  )}
                </Link>
              )}

              <Link to={`/${user?.role}/analytics`} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${isActive(`/${user?.role}/analytics`) ? 'bg-indigo-600/15 text-indigo-400 font-semibold border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                <BarChart3 className="w-4 h-4" /> Analytics
              </Link>
              <Link to={`/${user?.role}/invoices`} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${isActive(`/${user?.role}/invoices`) ? 'bg-emerald-600/15 text-emerald-400 font-semibold border border-emerald-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                <ReceiptText className="w-4 h-4" /> Invoices
              </Link>
              <Link to={`/${user?.role}/notifications`} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${isActive(`/${user?.role}/notifications`) ? 'bg-amber-600/15 text-amber-400 font-semibold border border-amber-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}>
                <Bell className="w-4 h-4" /> Notifications
              </Link>

              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition ${
                    isActive('/admin/dashboard')
                      ? 'bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  Admin Intelligence
                </Link>
              )}
            </div>

            {/* Platform Phase Roadmap Badge */}
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-900/40 text-xs text-slate-400">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Phase 2 Active
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Project Workspace, Kanban, Milestones, Real-time Chat &amp; Task Approval Workflow operational.
              </p>
            </div>
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
