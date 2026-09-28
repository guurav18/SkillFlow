import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { freelancerService } from '../../services/freelancerService';
import { projectService } from '../../services/projectService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ReviewModal } from '../../components/freelancer/ReviewModal';
import { InviteModal } from '../../components/freelancer/InviteModal';
import {
  Star,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  Send,
  MessageSquare,
  Globe,
  Github,
  Linkedin,
  Sparkles,
  ArrowLeft,
  Share2,
  Award,
  Clock,
  ThumbsUp,
  AlertCircle,
} from 'lucide-react';

export const FreelancerProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isClient, isAuthenticated } = useAuth();

  const [freelancer, setFreelancer] = useState(null);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [clientProjects, setClientProjects] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch client projects for invite and review modals
  useEffect(() => {
    if (isAuthenticated && isClient) {
      projectService
        .getMyProjects()
        .then((data) => setClientProjects(data.projects || []))
        .catch(() => {});
    }
  }, [isAuthenticated, isClient]);

  // Fetch freelancer profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await freelancerService.getFreelancerById(id);
        setFreelancer(data.freelancer);
        setCompletedProjects(data.completedProjects || []);
        setReviews(data.reviews || []);
        setStats(data.stats || {});
      } catch (err) {
        setError(err.message || 'Unable to load freelancer profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleReviewSubmitted = async (reviewData) => {
    const res = await freelancerService.submitReview(id, reviewData);
    setReviews((prev) => [res.review, ...prev]);
    setStats((prev) => ({
      ...prev,
      averageRating: res.averageRating,
      totalReviews: res.totalReviews,
    }));
    setToastMessage('Thank you! Your verified review has been published.');
    setTimeout(() => setToastMessage(''), 5000);
  };

  const handleInviteSent = async (inviteData) => {
    await freelancerService.inviteFreelancer(id, inviteData);
    setToastMessage(`Project invitation successfully sent to ${freelancer.name}!`);
    setTimeout(() => setToastMessage(''), 5000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-[#3157d5] animate-spin">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-xs font-semibold text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !freelancer) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center max-w-md shadow-xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Freelancer Profile Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 mb-5">{error || 'This profile does not exist or has been removed.'}</p>
          <Button variant="primary" size="sm" onClick={() => navigate('/freelancers')}>
            Back to Freelancers Directory
          </Button>
        </div>
      </div>
    );
  }

  const initials = freelancer.name
    ? freelancer.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'FL';

  const memberSince = freelancer.createdAt
    ? new Date(freelancer.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Recent';

  const isSelf = user?._id?.toString() === freelancer._id?.toString();

  return (
    <div className="min-h-screen pb-24 page-enter">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs">
          <Link
            to="/freelancers"
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Freelancers</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-[#3157d5] hover:border-[#3157d5] transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Link Copied!' : 'Share Profile'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Profile Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/5 p-6 sm:p-10 mb-8">
          {/* Ambient Background Gradient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 via-blue-500/8 to-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Left: Avatar + Identity */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-500 p-1 shadow-xl shadow-indigo-600/25">
                  <div className="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center text-white font-extrabold text-3xl">
                    {initials}
                  </div>
                </div>
                {freelancer.emailVerified && (
                  <div
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 flex items-center justify-center text-white shadow"
                    title="Verified Identity & Email"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {freelancer.name}
                  </h1>
                  {freelancer.availableForWork !== false && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Available for Work
                    </span>
                  )}
                </div>

                <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300">
                  {freelancer.title || 'Senior Software Engineer & Specialist'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-3">
                  {freelancer.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{freelancer.location}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Member since {memberSince}</span>
                  </span>
                  <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verified SkillFlow Contractor</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Rate & Action Buttons */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
              <div className="px-5 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-center sm:text-right">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  ${freelancer.hourlyRate || 25}
                </span>
                <span className="text-xs text-slate-400 block font-normal">USD / hour</span>
              </div>

              {isClient && !isSelf && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="md"
                    className="flex-1 sm:flex-none font-semibold shadow-lg shadow-indigo-600/25"
                    onClick={() => setInviteModalOpen(true)}
                  >
                    <Send className="w-4 h-4 mr-1.5" />
                    <span>Invite to Project</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="md"
                    className="font-semibold"
                    onClick={() => setReviewModalOpen(true)}
                    title="Write a client review"
                  >
                    <Star className="w-4 h-4 mr-1.5 text-amber-500 fill-amber-500" />
                    <span>Review</span>
                  </Button>
                </div>
              )}

              {!isAuthenticated && (
                <Button
                  variant="primary"
                  size="md"
                  className="font-semibold shadow-lg shadow-indigo-600/25"
                  onClick={() => navigate(`/login?redirect=/freelancers/${freelancer._id}`)}
                >
                  <span>Sign In to Hire</span>
                </Button>
              )}

              {isSelf && (
                <div className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  ✦ This is your public profile preview
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-200/70 dark:border-slate-800/80">
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-500 text-lg font-bold">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>{(stats?.averageRating || freelancer.averageRating || 5.0).toFixed(1)}</span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 mt-0.5 block">
                {stats?.totalReviews || reviews.length || 0} Client Reviews
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 text-center">
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                {completedProjects.length}
              </div>
              <span className="text-[11px] font-medium text-slate-500 mt-0.5 block">
                Completed Projects
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 text-center">
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                100%
              </div>
              <span className="text-[11px] font-medium text-slate-500 mt-0.5 block">
                On-Time Delivery
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 text-center">
              <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                &lt; 2 hrs
              </div>
              <span className="text-[11px] font-medium text-slate-500 mt-0.5 block">
                Average Response Time
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns: Bio, Skills, Portfolio, Reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* About / Bio Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-500" />
                <span>About & Background</span>
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {freelancer.bio ||
                  `${freelancer.name} is a verified professional on SkillFlow specializing in high-performance deliverables, clean architecture, and modern technical execution. Experienced in taking products from concept to production-ready milestones.`}
              </p>
            </div>

            {/* Skills & Technologies */}
            {freelancer.skills && freelancer.skills.length > 0 && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>Skills & Core Expertise</span>
                </h2>
                <div className="flex flex-wrap gap-2">
                  {freelancer.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/25 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:scale-105 transition-transform"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Projects Portfolio */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-500" />
                <span>Verified Work History ({completedProjects.length})</span>
              </h2>

              {completedProjects.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">
                  No completed projects recorded yet. This freelancer is ready for their next milestone!
                </p>
              ) : (
                <div className="space-y-4">
                  {completedProjects.map((project) => (
                    <div
                      key={project._id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {project.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {project.category} • Client: {project.client?.name || 'Verified Client'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                          ${project.budget}
                        </span>
                        <span className="text-[11px] text-slate-400">Completed</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Client Reviews Section */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-indigo-500" />
                    <span>Client Reviews & Ratings ({reviews.length})</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Authentic feedback from verified SkillFlow clients
                  </p>
                </div>

                {isClient && !isSelf && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-xs font-semibold shadow-md shadow-indigo-600/20"
                    onClick={() => setReviewModalOpen(true)}
                  >
                    <Star className="w-3.5 h-3.5 mr-1 fill-white" />
                    <span>Leave a Review</span>
                  </Button>
                )}
              </div>

              {/* Sub-Ratings Summary Card */}
              {reviews.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Quality
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                        {stats?.qualityRating || 5.0}
                      </span>
                      <span className="text-xs text-slate-400">/ 5.0</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Communication
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                        {stats?.communicationRating || 5.0}
                      </span>
                      <span className="text-xs text-slate-400">/ 5.0</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Deadlines
                    </span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                        {stats?.deadlineRating || 5.0}
                      </span>
                      <span className="text-xs text-slate-400">/ 5.0</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews Feed */}
              {reviews.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <Star className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="text-xs text-slate-500">
                    No reviews published yet. Be the first client to review {freelancer.name}!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => {
                    const clientInitial = rev.client?.name ? rev.client.name[0] : 'C';
                    const revDate = rev.createdAt
                      ? new Date(rev.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Recently';

                    return (
                      <div
                        key={rev._id}
                        className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
                              {clientInitial}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                {rev.client?.name || 'Verified Client'}
                              </h4>
                              {rev.client?.company && (
                                <p className="text-[10px] text-slate-400">
                                  {rev.client.company}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= rev.rating
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-slate-300 dark:text-slate-700'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[11px] text-slate-400 ml-1.5">{revDate}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                          "{rev.comment}"
                        </p>

                        {rev.project && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Briefcase className="w-3 h-3 text-indigo-500" />
                            <span>Project: {rev.project.title}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Sidebar & Trust Cards */}
          <div className="space-y-6">
            {/* Quick Hire CTA Box */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-indigo-950 text-white border border-indigo-900/50 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold tracking-tight">Collaborate with {freelancer.name.split(' ')[0]}</h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Invite this freelancer to your open project or discuss milestone deliverables with full escrow payment protection.
              </p>

              {isClient && !isSelf && (
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full font-semibold shadow-lg shadow-indigo-600/30"
                  onClick={() => setInviteModalOpen(true)}
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  <span>Invite to Open Project</span>
                </Button>
              )}

              {!isAuthenticated && (
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full font-semibold"
                  onClick={() => navigate('/login')}
                >
                  <span>Sign In to Invite</span>
                </Button>
              )}
            </div>

            {/* Escrow & Trust Protection Card */}
            <div className="p-6 rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>SkillFlow Trust Guarantee</span>
              </h3>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900 dark:text-slate-200">Escrow Milestone Protection:</strong> Client funds are deposited securely before work begins.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900 dark:text-slate-200">AI Quality Check:</strong> Built-in task effort tracking and automated milestone pacing.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900 dark:text-slate-200">Secure Payments:</strong> Instant payouts released only upon client milestone approval.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        freelancer={freelancer}
        clientProjects={clientProjects}
        onReviewSubmitted={handleReviewSubmitted}
      />

      {/* Invite Modal */}
      <InviteModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        freelancer={freelancer}
        clientProjects={clientProjects}
        onInviteSent={handleInviteSent}
      />
    </div>
  );
};
