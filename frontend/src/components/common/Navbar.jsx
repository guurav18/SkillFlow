import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  Layers,
  PlusCircle,
  Search,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  Sparkles,
  GitPullRequestArrow,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';
import { taskService } from '../../services/taskService';
import { NotificationBell } from './NotificationBell';
import { SkillFlowMark } from './SkillFlowMark';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isClient, isFreelancer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [workflowCount, setWorkflowCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Fetch pending workflow count for authenticated users (client or freelancer)
  useEffect(() => {
    if (!isAuthenticated || isAdmin) return;
    const fetchCount = async () => {
      try {
        const data = await taskService.getGlobalWorkflow();
        // data.tasks is the array of pending-action tasks for this user
        setWorkflowCount(data?.tasks?.length ?? 0);
      } catch {
        // silently fail
      }
    };
    fetchCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${scrolled ? 'border-b bg-white/90 shadow-sm backdrop-blur-xl dark-header' : 'border-b border-transparent bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-14' : 'h-[4.5rem]'}`}>
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <SkillFlowMark className="text-white shadow-lg shadow-blue-900/15 transition-transform group-hover:rotate-6" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight text-slate-900 dark-brand-text">
                    SkillFlow
                  </span>
                </div>
              </div>
            </Link>

            {!isAuthenticated && (
              <nav className="hidden items-center gap-1 text-sm font-medium lg:flex">
                <Link to="/freelancer/browse" className="rounded-lg px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">Find Talent</Link>
                <Link to="/freelancer/browse" className="rounded-lg px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">Find Work</Link>
                <a href="/#how-it-works" className="rounded-lg px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">How It Works</a>
                <a href="/#explore" className="rounded-lg px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">Explore</a>
              </nav>
            )}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
                {isClient && (
                  <>
                    <Link
                      to="/client/dashboard"
                      className={`px-3 py-1.5 rounded-lg transition ${
                        isActive('/client/dashboard')
                          ? 'text-white bg-slate-800/80 font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/client/projects"
                      className={`px-3 py-1.5 rounded-lg transition ${
                        isActive('/client/projects')
                          ? 'text-white bg-slate-800/80 font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      My Projects
                    </Link>
                    <Link
                      to="/client/create-project"
                      className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                        isActive('/client/create-project')
                          ? 'text-indigo-400 bg-indigo-500/10 font-semibold'
                          : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-900'
                      }`}
                    >
                      <PlusCircle className="w-4 h-4" />
                      Post Project
                    </Link>
                  </>
                )}

                {isFreelancer && (
                  <>
                    <Link
                      to="/freelancer/dashboard"
                      className={`px-3 py-1.5 rounded-lg transition ${
                        isActive('/freelancer/dashboard')
                          ? 'text-white bg-slate-800/80 font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/freelancer/browse"
                      className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                        isActive('/freelancer/browse')
                          ? 'text-white bg-slate-800/80 font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <Search className="w-4 h-4" />
                      Browse Projects
                    </Link>
                    <Link
                      to="/freelancer/applications"
                      className={`px-3 py-1.5 rounded-lg transition ${
                        isActive('/freelancer/applications')
                          ? 'text-white bg-slate-800/80 font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      My Applications
                    </Link>
                    <Link
                      to="/freelancer/projects"
                      className={`px-3 py-1.5 rounded-lg transition ${
                        isActive('/freelancer/projects')
                          ? 'text-white bg-slate-800/80 font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      Active Projects
                    </Link>
                  </>
                )}

                {/* Workflow link — visible to client & freelancer only */}
                {(isClient || isFreelancer) && (
                  <Link
                    to="/workflow"
                    className={`relative px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                      isActive('/workflow')
                        ? 'text-violet-300 bg-violet-500/10 font-semibold border border-violet-500/20'
                        : 'text-slate-400 hover:text-violet-300 hover:bg-slate-900'
                    }`}
                  >
                    <GitPullRequestArrow className="w-4 h-4" />
                    Workflow
                    {workflowCount > 0 && (
                      <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-violet-600 text-white text-[10px] font-bold shadow shadow-violet-500/40 animate-pulse">
                        {workflowCount > 99 ? '99+' : workflowCount}
                      </span>
                    )}
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                      isActive('/admin/dashboard')
                        ? 'text-white bg-slate-800/80 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    Admin Overview
                  </Link>
                )}
              </nav>
            )}
          </div>

          {/* Right actions */}
          <div className="hidden items-center gap-2 md:flex">
            <button type="button" onClick={toggleTheme} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" aria-label="Toggle theme" title="Toggle theme">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <NotificationBell />
                {/* User tag */}
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-200 leading-tight">
                      {user?.name}
                    </span>
                    <span className="text-[10px] text-indigo-400 font-medium capitalize">
                      {user?.role}
                    </span>
                  </div>
                </div>

                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-400 hover:text-rose-400">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <span className="px-3 py-2 text-sm font-semibold text-slate-700">Log in</span>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-1 md:hidden">
            <button type="button" onClick={toggleTheme} className="rounded-lg p-2 text-slate-500" aria-label="Toggle theme">{isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden space-y-3 border-b bg-white p-4 shadow-lg">
          {isAuthenticated ? (
            <>
              <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-white">{user?.name}</p>
                  <p className="text-xs text-indigo-400 capitalize">{user?.role}</p>
                </div>
                <Button variant="danger" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>

              <div className="space-y-1 text-sm font-medium">
                {isClient && (
                  <>
                    <Link
                      to="/client/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/client/projects"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
                    >
                      My Projects
                    </Link>
                    <Link
                      to="/client/create-project"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-indigo-400 hover:bg-slate-800"
                    >
                      Post Project
                    </Link>
                  </>
                )}

                {isFreelancer && (
                  <>
                    <Link
                      to="/freelancer/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/freelancer/browse"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
                    >
                      Browse Projects
                    </Link>
                    <Link
                      to="/freelancer/applications"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
                    >
                      My Applications
                    </Link>
                    <Link
                      to="/freelancer/projects"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
                    >
                      Active Projects
                    </Link>
                  </>
                )}

                {/* Mobile Workflow link */}
                {(isClient || isFreelancer) && (
                  <Link
                    to="/workflow"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-violet-300 hover:bg-slate-800"
                  >
                    <span className="flex items-center gap-2">
                      <GitPullRequestArrow className="w-4 h-4" />
                      Workflow
                    </span>
                    {workflowCount > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-violet-600 text-white text-[10px] font-bold">
                        {workflowCount > 99 ? '99+' : workflowCount}
                      </span>
                    )}
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-amber-400 hover:bg-slate-800"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/freelancer/browse" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-center">Find Work</Button>
              </Link>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" className="w-full justify-center">
                  Sign In
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full justify-center">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
