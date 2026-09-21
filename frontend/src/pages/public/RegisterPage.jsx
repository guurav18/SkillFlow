import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import {
  Mail,
  Lock,
  User,
  Building2,
  Code2,
  DollarSign,
  AlertCircle,
  ArrowRight,
  Briefcase,
} from 'lucide-react';
import { SkillFlowMark } from '../../components/common/SkillFlowMark';

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'client' ? 'client' : 'freelancer';

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [skills, setSkills] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const r = searchParams.get('role');
    if (r === 'client' || r === 'freelancer') {
      setRole(r);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        company: company.trim(),
        title: title.trim(),
        skills: skills
          ? skills
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        hourlyRate: Number(hourlyRate) || 0,
        bio: bio.trim(),
      };

      const newUser = await register(payload);

      if (newUser.role === 'client') {
        navigate('/client/dashboard');
      } else {
        navigate('/freelancer/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-12 overflow-hidden auth-page-enter">
      {/* Subtle SaaS Ambient Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        <div className="absolute -top-[12%] left-[15%] w-[440px] h-[440px] rounded-full bg-gradient-to-tr from-indigo-500/10 via-purple-500/8 to-blue-500/10 blur-3xl auth-blob-1" />
        <div className="absolute -bottom-[14%] right-[14%] w-[480px] h-[480px] rounded-full bg-gradient-to-br from-blue-500/10 via-indigo-500/8 to-teal-500/10 blur-3xl auth-blob-2" />
        <div className="absolute inset-0 surface-grid opacity-35 dark:opacity-20" />
      </div>

      <div className="w-full max-w-xl relative z-10">
        {/* Header with animated SkillFlow Mark */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block group focus:outline-none mb-3.5" title="Back to SkillFlow Home">
            <div className="auth-logo-pulse inline-flex items-center justify-center">
              <SkillFlowMark className="!w-12 !h-12 !rounded-2xl shadow-lg shadow-indigo-600/25 group-hover:scale-105 transition-all duration-300" />
            </div>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Create your SkillFlow Account
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5">
            Choose your role to get started with custom-tailored workflows.
          </p>
        </div>

        {/* Register Card */}
        <div className="p-8 rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/5 dark:shadow-2xl backdrop-blur-xl auth-card-enter">
          {/* Role Switcher */}
          <div className="relative p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 mb-6">
            <div className="grid grid-cols-2 gap-2 relative z-10">
              <button
                type="button"
                onClick={() => setRole('freelancer')}
                className={`group flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 select-none ${
                  role === 'freelancer'
                    ? 'bg-[#3157d5] text-white shadow-md shadow-indigo-600/25 scale-[1.01]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/70 dark:hover:bg-slate-800/70'
                }`}
              >
                <Code2 className={`w-4 h-4 transition-transform duration-200 ${role === 'freelancer' ? 'scale-110' : 'group-hover:scale-105'}`} />
                <span>I'm a Freelancer</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('client')}
                className={`group flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-200 select-none ${
                  role === 'client'
                    ? 'bg-[#3157d5] text-white shadow-md shadow-indigo-600/25 scale-[1.01]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/70 dark:hover:bg-slate-800/70'
                }`}
              >
                <Briefcase className={`w-4 h-4 transition-transform duration-200 ${role === 'client' ? 'scale-110' : 'group-hover:scale-105'}`} />
                <span>I'm a Client</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-400 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="auth-field-stagger auth-stagger-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative group">
                <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 group-focus-within:text-[#3157d5]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#3157d5] focus:ring-2 focus:ring-[#3157d5]/20 focus:bg-white dark:focus:bg-slate-950 transition-all duration-200"
                />
              </div>
            </div>

            {/* Email */}
            <div className="auth-field-stagger auth-stagger-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 group-focus-within:text-[#3157d5]" />
                <input
                  type="email"
                  required
                  placeholder="name@work.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#3157d5] focus:ring-2 focus:ring-[#3157d5]/20 focus:bg-white dark:focus:bg-slate-950 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field-stagger auth-stagger-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password (min 6 chars)
              </label>
              <div className="relative group">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 group-focus-within:text-[#3157d5]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#3157d5] focus:ring-2 focus:ring-[#3157d5]/20 focus:bg-white dark:focus:bg-slate-950 transition-all duration-200"
                />
              </div>
            </div>

            {/* Client Specific Fields */}
            {role === 'client' && (
              <div className="auth-field-stagger auth-stagger-4">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Company / Organization Name
                </label>
                <div className="relative group">
                  <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 group-focus-within:text-[#3157d5]" />
                  <input
                    type="text"
                    placeholder="e.g. Apex Innovations Ltd"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#3157d5] focus:ring-2 focus:ring-[#3157d5]/20 focus:bg-white dark:focus:bg-slate-950 transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {/* Freelancer Specific Fields */}
            {role === 'freelancer' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 auth-field-stagger auth-stagger-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Professional Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Full-Stack Engineer"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#3157d5] focus:ring-2 focus:ring-[#3157d5]/20 focus:bg-white dark:focus:bg-slate-950 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Hourly Rate ($/hr)
                    </label>
                    <div className="relative group">
                      <DollarSign className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 group-focus-within:text-[#3157d5]" />
                      <input
                        type="number"
                        placeholder="65"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/70 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#3157d5] focus:ring-2 focus:ring-[#3157d5]/20 focus:bg-white dark:focus:bg-slate-950 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="auth-field-stagger auth-stagger-5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="React, Node.js, TypeScript, Tailwind, MongoDB"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-[#3157d5] focus:ring-2 focus:ring-[#3157d5]/20 focus:bg-white dark:focus:bg-slate-950 transition-all duration-200"
                  />
                </div>
              </>
            )}

            <div className="auth-field-stagger auth-stagger-6 pt-1">
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full font-semibold shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200"
              >
                <span>Create {role === 'client' ? 'Client' : 'Freelancer'} Account</span>
                <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-600 dark:text-slate-400 mt-6 auth-field-stagger auth-stagger-7">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#3157d5] hover:text-[#2648c3] dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

