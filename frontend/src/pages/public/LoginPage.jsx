import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Button } from '../../components/common/Button';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { SkillFlowMark } from '../../components/common/SkillFlowMark';

export const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialEmail ? '' : 'password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Unverified email handling
  const [isEmailUnverified, setIsEmailUnverified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsEmailUnverified(false);
    setResendMessage('');
    setResendError('');
    setLoading(true);

    try {
      const loggedUser = await login({ email: email.trim(), password });

      if (from) {
        navigate(from, { replace: true });
      } else if (loggedUser.role === 'client') {
        navigate('/client/dashboard', { replace: true });
      } else if (loggedUser.role === 'freelancer') {
        navigate('/freelancer/dashboard', { replace: true });
      } else if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      const isUnverified =
        err.emailUnverified ||
        err.response?.data?.emailUnverified ||
        err.message?.toLowerCase().includes('verify your email');

      if (isUnverified) {
        setIsEmailUnverified(true);
        setUnverifiedEmail(email.trim());
        setError(err.message || 'Please verify your email before logging in.');
      } else {
        setError(err.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const targetEmail = unverifiedEmail || email.trim();
    if (!targetEmail || resendCooldown > 0) return;

    setResendLoading(true);
    setResendError('');
    setResendMessage('');

    try {
      const res = await authService.resendVerification(targetEmail);
      setResendMessage(
        res.message || 'A fresh verification link has been sent to your email.'
      );
      setResendCooldown(60);
    } catch (err) {
      setResendError(err.message || 'Failed to resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleQuickFill = (fillEmail) => {
    setEmail(fillEmail);
    setPassword('password123');
    setIsEmailUnverified(false);
    setError('');
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-12 overflow-hidden auth-page-enter">
      {/* Subtle SaaS Ambient Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        <div className="absolute -top-[10%] left-[18%] w-96 h-96 rounded-full bg-gradient-to-tr from-indigo-500/10 via-purple-500/8 to-blue-500/10 blur-3xl auth-blob-1" />
        <div className="absolute -bottom-[12%] right-[16%] w-[420px] h-[420px] rounded-full bg-gradient-to-br from-blue-500/10 via-indigo-500/8 to-teal-500/10 blur-3xl auth-blob-2" />
        <div className="absolute inset-0 surface-grid opacity-35 dark:opacity-20" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header with animated SkillFlow Mark */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block group focus:outline-none mb-3.5" title="Back to SkillFlow Home">
            <div className="auth-logo-pulse inline-flex items-center justify-center">
              <SkillFlowMark className="!w-12 !h-12 !rounded-2xl shadow-lg shadow-indigo-600/25 group-hover:scale-105 transition-all duration-300" />
            </div>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Welcome Back</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5">
            Sign in to manage projects, proposals, and workflows.
          </p>
        </div>

        {/* Login Card */}
        <div className="p-8 rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/5 dark:shadow-2xl backdrop-blur-xl auth-card-enter">
          {/* Unverified Email Warning Banner with Action */}
          {isEmailUnverified ? (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 animate-fadeIn">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <p className="font-bold text-sm text-amber-900 dark:text-amber-200 mb-1">
                    Email Verification Required
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    Please verify your email before logging in. We sent a link to{' '}
                    <strong>{unverifiedEmail}</strong>.
                  </p>

                  {resendMessage && (
                    <div className="mb-3 p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{resendMessage}</span>
                    </div>
                  )}

                  {resendError && (
                    <div className="mb-3 p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-[11px]">
                      {resendError}
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    loading={resendLoading}
                    disabled={resendLoading || resendCooldown > 0}
                    onClick={handleResend}
                    className="w-full text-xs font-semibold"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : 'Resend Verification Email'}
                  </Button>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-400 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="auth-field-stagger auth-stagger-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 group-focus-within:text-[#3157d5]" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (isEmailUnverified) setIsEmailUnverified(false);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#3157d5] focus:ring-2 focus:ring-[#3157d5]/20 focus:bg-white dark:focus:bg-slate-950 transition-all duration-200"
                />
              </div>
            </div>

            <div className="auth-field-stagger auth-stagger-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
              </div>
              <div className="relative group">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 group-focus-within:text-[#3157d5]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50/70 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#3157d5] focus:ring-2 focus:ring-[#3157d5]/20 focus:bg-white dark:focus:bg-slate-950 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="auth-field-stagger auth-stagger-3 pt-1">
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full font-semibold shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 auth-field-stagger auth-stagger-4">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 text-center uppercase tracking-wider mb-3">
              1-Click Demo Logins
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('client@workflowai.com')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium text-center transition-all duration-200 hover:scale-[1.01] hover:border-[#3157d5]/40 hover:shadow-sm active:scale-[0.98] cursor-pointer"
              >
                Client Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('freelancer@workflowai.com')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium text-center transition-all duration-200 hover:scale-[1.01] hover:border-[#3157d5]/40 hover:shadow-sm active:scale-[0.98] cursor-pointer"
              >
                Freelancer Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@workflowai.com')}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium text-center transition-all duration-200 hover:scale-[1.01] hover:border-[#3157d5]/40 hover:shadow-sm active:scale-[0.98] cursor-pointer"
              >
                Admin Demo
              </button>
            </div>
          </div>
        </div>

        {/* Register CTA */}
        <p className="text-center text-xs text-slate-600 dark:text-slate-400 mt-6 auth-field-stagger auth-stagger-5">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-[#3157d5] hover:text-[#2648c3] dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};
