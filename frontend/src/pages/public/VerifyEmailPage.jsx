import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Button } from '../../components/common/Button';
import { SkillFlowMark } from '../../components/common/SkillFlowMark';
import {
  CheckCircle2,
  AlertCircle,
  Mail,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  // States: 'verifying' | 'success' | 'error'
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');

  // Resend form states
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Prevent duplicate execution from React 18 StrictMode double-mounting
  const verificationRan = useRef(false);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (verificationRan.current) return;
    verificationRan.current = true;

    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token was provided in the link.');
        return;
      }

      try {
        const response = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(response.message || 'Your email has been verified successfully!');
        if (response.email) {
          setVerifiedEmail(response.email);
        }
      } catch (err) {
        setStatus('error');
        setMessage(
          err.message ||
            'This verification link is invalid, has already been used, or has expired after 24 hours.'
        );
      }
    };

    verifyToken();
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    setResendError('');
    setResendMessage('');

    if (!resendEmail.trim()) {
      setResendError('Please enter your account email address.');
      return;
    }

    setResendLoading(true);
    try {
      const response = await authService.resendVerification(resendEmail.trim());
      setResendMessage(
        response.message || 'A new verification link has been sent to your email.'
      );
      setResendCooldown(60);
    } catch (err) {
      setResendError(err.message || 'Failed to resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-12 overflow-hidden auth-page-enter">
      {/* Ambient background blur */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        <div className="absolute -top-[10%] left-[20%] w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-indigo-500/10 via-purple-500/8 to-blue-500/10 blur-3xl auth-blob-1" />
        <div className="absolute -bottom-[12%] right-[18%] w-[440px] h-[440px] rounded-full bg-gradient-to-br from-blue-500/10 via-indigo-500/8 to-teal-500/10 blur-3xl auth-blob-2" />
        <div className="absolute inset-0 surface-grid opacity-35 dark:opacity-20" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* SkillFlow Mark Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block group focus:outline-none mb-3" title="Back to SkillFlow Home">
            <div className="auth-logo-pulse inline-flex items-center justify-center">
              <SkillFlowMark className="!w-12 !h-12 !rounded-2xl shadow-lg shadow-indigo-600/25 group-hover:scale-105 transition-all duration-300" />
            </div>
          </Link>
        </div>

        {/* State 1: Verifying... */}
        {status === 'verifying' && (
          <div className="p-8 rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/5 dark:shadow-2xl backdrop-blur-xl text-center auth-card-enter">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center mx-auto mb-5 text-indigo-600 dark:text-indigo-400">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Verifying your email...
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Please wait a moment while we validate your secure token and activate your SkillFlow account.
            </p>
          </div>
        )}

        {/* State 2: Verified Successfully */}
        {status === 'success' && (
          <div className="p-8 rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/5 dark:shadow-2xl backdrop-blur-xl text-center auth-card-enter">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center mx-auto mb-5 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Email Verified Successfully!
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              {message || 'Your email address has been confirmed. Your account is now fully active.'}
            </p>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <Button
                variant="primary"
                onClick={() => navigate(`/login${verifiedEmail ? `?email=${encodeURIComponent(verifiedEmail)}` : ''}`)}
                className="w-full font-semibold shadow-md shadow-indigo-600/20"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <p className="text-xs text-slate-500">
                You can now log in and access your projects, proposals, and AI workflows.
              </p>
            </div>
          </div>
        )}

        {/* States 3 & 4: Invalid/Expired Token + Resend Option */}
        {status === 'error' && (
          <div className="p-8 rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/5 dark:shadow-2xl backdrop-blur-xl auth-card-enter">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-600 dark:text-rose-400 shadow-lg shadow-rose-500/10">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Verification Link Expired or Invalid
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                {message}
              </p>
            </div>

            {/* Resend Verification Form */}
            <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-500" />
                <span>Request a New Verification Link</span>
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Enter your registered email address and we will dispatch a fresh 24-hour verification link.
              </p>

              {resendError && (
                <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400">
                  {resendError}
                </div>
              )}

              {resendMessage && (
                <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400">
                  {resendMessage}
                </div>
              )}

              <form onSubmit={handleResend} className="space-y-3">
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#3157d5] transition"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={resendLoading}
                  disabled={resendLoading || resendCooldown > 0}
                  className="w-full text-xs font-semibold"
                >
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : 'Send New Verification Link'}
                </Button>
              </form>
            </div>

            <div className="pt-2 text-center flex items-center justify-between text-xs">
              <Link
                to="/login"
                className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition font-medium"
              >
                Back to Sign In
              </Link>
              <Link
                to="/register"
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                Create New Account
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
