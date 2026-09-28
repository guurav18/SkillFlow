import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { freelancerService } from '../../services/freelancerService';
import { projectService } from '../../services/projectService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { InviteModal } from '../../components/freelancer/InviteModal';
import {
  Search,
  Star,
  MapPin,
  Sparkles,
  SlidersHorizontal,
  ArrowRight,
  Send,
  Briefcase,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Filter,
  X,
} from 'lucide-react';

export const BrowseFreelancersPage = () => {
  const { user, isClient, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [skillsList, setSkillsList] = useState([]);

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedSkill, setSelectedSkill] = useState(searchParams.get('skill') || '');
  const [rateRange, setRateRange] = useState(searchParams.get('rate') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || 'rating');

  // Quick Invite modal state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [clientProjects, setClientProjects] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  // Fetch client projects for invite modal
  useEffect(() => {
    if (isAuthenticated && isClient) {
      projectService
        .getMyProjects()
        .then((data) => setClientProjects(data.projects || []))
        .catch(() => {});
    }
  }, [isAuthenticated, isClient]);

  // Fetch freelancers whenever filters change
  useEffect(() => {
    const fetchFreelancers = async () => {
      setLoading(true);
      try {
        let minRate, maxRate;
        if (rateRange === 'under30') {
          maxRate = 30;
        } else if (rateRange === '30to60') {
          minRate = 30;
          maxRate = 60;
        } else if (rateRange === 'over60') {
          minRate = 60;
        }

        const data = await freelancerService.getFreelancers({
          search: search.trim() || undefined,
          skill: selectedSkill || undefined,
          minRate,
          maxRate,
          sort,
          limit: 24,
        });

        setFreelancers(data.freelancers || []);
        setTotal(data.total || 0);
        if (data.skillsList && data.skillsList.length > 0) {
          setSkillsList(data.skillsList.slice(0, 15));
        }
      } catch (err) {
        console.error('Error fetching freelancers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancers();
  }, [search, selectedSkill, rateRange, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams((prev) => {
      if (search) prev.set('search', search);
      else prev.delete('search');
      return prev;
    });
  };

  const handleQuickInvite = (freelancer, e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isClient) {
      alert('Only clients can invite freelancers to projects. Please switch to or register a client account.');
      return;
    }
    setSelectedFreelancer(freelancer);
    setInviteModalOpen(true);
  };

  const handleInviteSent = async (inviteData) => {
    await freelancerService.inviteFreelancer(selectedFreelancer._id, inviteData);
    setToastMessage(`Invitation successfully dispatched to ${selectedFreelancer.name}!`);
    setTimeout(() => setToastMessage(''), 5000);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedSkill('');
    setRateRange('all');
    setSort('rating');
  };

  return (
    <div className="min-h-screen pb-20 page-enter">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <section className="relative overflow-hidden py-14 sm:py-20 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
          <div className="absolute -top-[20%] left-[25%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-500/15 via-blue-500/10 to-teal-500/10 blur-3xl auth-blob-1" />
          <div className="absolute -bottom-[20%] right-[20%] w-[550px] h-[550px] rounded-full bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-blue-500/15 blur-3xl auth-blob-2" />
          <div className="absolute inset-0 surface-grid opacity-35 dark:opacity-15" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-5 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span>Curated SkillFlow Talent Network</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            Discover & Hire <span className="bg-gradient-to-r from-indigo-600 via-blue-500 to-indigo-500 bg-clip-text text-transparent">Elite Freelancers</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Collaborate with vetted specialists across Full-Stack, AI, Mobile, and UI/UX. Protected by SkillFlow milestone escrows and AI workflows.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-8 max-w-2xl mx-auto relative group">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-[#3157d5] transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by role, developer name, or skill (e.g. React, Python, UI/UX)..."
              className="w-full pl-12 pr-28 py-3.5 bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-xl shadow-slate-900/5 focus:outline-none focus:border-[#3157d5] focus:ring-2 focus:ring-[#3157d5]/20 backdrop-blur-xl transition"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 font-semibold shadow-md shadow-indigo-600/20"
            >
              Search
            </Button>
          </form>

          {/* Popular Skill Pills */}
          {skillsList.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5 max-w-3xl mx-auto text-xs">
              <span className="text-slate-400 mr-1 text-[11px] font-medium uppercase tracking-wider">
                Popular:
              </span>
              {skillsList.map((skill) => {
                const isSelected = selectedSkill.toLowerCase() === skill.toLowerCase();
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => setSelectedSkill(isSelected ? '' : skill)}
                    className={`px-3 py-1 rounded-full transition-all duration-200 text-xs ${
                      isSelected
                        ? 'bg-[#3157d5] text-white shadow-md shadow-indigo-600/25 font-semibold scale-105'
                        : 'bg-white/80 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/70 text-slate-700 dark:text-slate-300 hover:border-[#3157d5] hover:text-[#3157d5]'
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Main Content & Results */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>All Available Freelancers</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                {total}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified independent contractors with guaranteed milestone workflows
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Rate Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 hidden md:inline">Rate:</span>
              <select
                value={rateRange}
                onChange={(e) => setRateRange(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#3157d5]"
              >
                <option value="all">Any Hourly Rate</option>
                <option value="under30">&lt; $30 / hr</option>
                <option value="30to60">$30 - $60 / hr</option>
                <option value="over60">&gt; $60 / hr</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 hidden md:inline">Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#3157d5]"
              >
                <option value="rating">Top Rated</option>
                <option value="rate_asc">Rate: Low to High</option>
                <option value="rate_desc">Rate: High to Low</option>
                <option value="newest">Newest Members</option>
              </select>
            </div>

            {(search || selectedSkill || rateRange !== 'all') && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 animate-pulse space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && freelancers.length === 0 && (
          <div className="py-20 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400 shadow-xl shadow-indigo-500/10">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              No Freelancers Found
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We couldn't find any freelancers matching your specific filter criteria. Try clearing some filters or searching for different keywords.
            </p>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Reset All Filters
            </Button>
          </div>
        )}

        {/* Freelancers Grid */}
        {!loading && freelancers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {freelancers.map((freelancer) => {
              const initials = freelancer.name
                ? freelancer.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : 'FL';

              return (
                <div
                  key={freelancer._id}
                  onClick={() => navigate(`/freelancers/${freelancer._id}`)}
                  className="group relative p-6 rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Top Row: Avatar + Status + Rate */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3.5">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-600/25 group-hover:scale-105 transition-transform">
                            {initials}
                          </div>
                          {freelancer.emailVerified && (
                            <div
                              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white"
                              title="Verified SkillFlow Member"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#3157d5] transition-colors leading-tight">
                            {freelancer.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {freelancer.title || 'Independent Professional'}
                          </p>
                          {freelancer.location && (
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              <span>{freelancer.location}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Hourly Rate Callout */}
                      <div className="text-right flex-shrink-0">
                        <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                          ${freelancer.hourlyRate || 25}
                        </span>
                        <span className="text-[11px] text-slate-400 block font-normal">/ hr</span>
                      </div>
                    </div>

                    {/* Rating & Reviews Bar */}
                    <div className="flex items-center gap-2 mb-3.5 text-xs">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{(freelancer.averageRating || 5.0).toFixed(1)}</span>
                      </div>
                      <span className="text-slate-400 text-[11px]">
                        ({freelancer.totalReviews || 0} reviews)
                      </span>
                      {freelancer.availableForWork !== false && (
                        <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Available
                        </span>
                      )}
                    </div>

                    {/* Bio Snippet */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {freelancer.bio ||
                        'Experienced specialist focused on high-quality deliverables, clean code, and reliable milestone execution.'}
                    </p>

                    {/* Skills Tags */}
                    {freelancer.skills && freelancer.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {freelancer.skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200/60 dark:border-slate-700/60"
                          >
                            {skill}
                          </span>
                        ))}
                        {freelancer.skills.length > 4 && (
                          <span className="px-1.5 py-0.5 text-[10px] text-slate-400 font-medium">
                            +{freelancer.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs font-semibold group-hover:border-[#3157d5] group-hover:text-[#3157d5] transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/freelancers/${freelancer._id}`);
                      }}
                    >
                      <span>View Profile</span>
                      <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-0.5" />
                    </Button>

                    {isClient && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="text-xs font-semibold shadow-sm"
                        onClick={(e) => handleQuickInvite(freelancer, e)}
                        title="Invite to your project"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        <span>Invite</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Quick Invite Modal */}
      {selectedFreelancer && (
        <InviteModal
          isOpen={inviteModalOpen}
          onClose={() => {
            setInviteModalOpen(false);
            setSelectedFreelancer(null);
          }}
          freelancer={selectedFreelancer}
          clientProjects={clientProjects}
          onInviteSent={handleInviteSent}
        />
      )}
    </div>
  );
};
