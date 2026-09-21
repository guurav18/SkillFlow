import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { projectService } from '../../services/projectService';
import { Button } from '../../components/common/Button';
import {
  ArrowDownRight,
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Code2,
  Database,
  Gauge,
  Layers3,
  Megaphone,
  MessageSquareText,
  Network,
  PenTool,
  Search,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Target,
  Users,
  Workflow,
} from 'lucide-react';

const HERO_VIDEO = import.meta.env.VITE_HERO_VIDEO_URL || '/7983979-hd_1920_1080_25fps.mp4';
const categories = [
  ['AI & Machine Learning', 'Build intelligent products and automations.', BrainCircuit],
  ['Web Development', 'Ship robust digital experiences.', Code2],
  ['Mobile Development', 'Create apps people return to.', Smartphone],
  ['UI/UX Design', 'Make complex products feel simple.', PenTool],
  ['Data Science', 'Find signal in every dataset.', Database],
  ['Marketing', 'Turn good work into momentum.', Megaphone],
  ['Content', 'Give your ideas a sharper voice.', MessageSquareText],
  ['Software Development', 'Build the systems behind the idea.', Layers3],
];
const storySteps = [
  ['01', 'Tell us what you need', 'Shape a rough idea into a clear brief.', Target],
  ['02', 'Find the right talent', 'Compare people by skills and project context.', Users],
  ['03', 'Build together', 'Keep tasks, milestones, and feedback connected.', Workflow],
  ['04', 'Deliver with confidence', 'See project health before risks become delays.', ShieldCheck],
];

const useReveal = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.14 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, visible ? 'reveal is-visible' : 'reveal'];
};

const SectionLabel = ({ children }) => <p className="eyebrow">{children}</p>;

export const LandingPage = () => {
  const { isAuthenticated, isClient, isFreelancer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [query, setQuery] = useState('');
  const [storyStep, setStoryStep] = useState(0);
  const storyRefs = useRef([]);
  const [heroRef, heroClass] = useReveal();
  const [workflowRef, workflowClass] = useReveal();
  const [aiRef, aiClass] = useReveal();

  useEffect(() => {
    projectService.getProjects({ limit: 4 })
      .then((data) => setProjects(data.projects?.slice(0, 4) || []))
      .catch(() => setProjects([]))
      .finally(() => setLoadingProjects(false));
  }, []);

  useEffect(() => {
    const observers = storyRefs.current.map((node, index) => {
      if (!node) return null;
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) setStoryStep(index);
      }, { threshold: 0.55 });
      observer.observe(node);
      return observer;
    });
    return () => observers.forEach((observer) => observer?.disconnect());
  }, []);

  const dashboardLink = isClient ? '/client/dashboard' : isFreelancer ? '/freelancer/dashboard' : isAdmin ? '/admin/dashboard' : '/register';
  const talentSignals = useMemo(() => projects.filter((project) => project.hiredFreelancer), [projects]);
  const searchMarketplace = (event) => {
    event.preventDefault();
    navigate(`/freelancer/browse${query.trim() ? `?search=${encodeURIComponent(query.trim())}` : ''}`);
  };

  return (
    <div className="skillflow-landing page-enter overflow-hidden bg-[var(--sf-bg)] text-[var(--sf-ink)]">
      <section ref={heroRef} className="relative border-b bg-white py-4 sm:py-8">
        <div className="video-hero-frame relative mx-auto min-h-[650px] max-w-[1320px] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-950 shadow-[0_30px_90px_rgba(15,23,42,.18)] sm:min-h-[700px]">
          <video className="absolute inset-0 h-full w-full object-cover" src={HERO_VIDEO} autoPlay muted loop playsInline poster="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=2200&q=85" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,10,15,.72)_0%,rgba(5,10,15,.42)_44%,rgba(5,10,15,.08)_100%)]" />
          <div className="relative z-10 flex min-h-[650px] items-center px-6 py-16 sm:min-h-[700px] sm:px-12 lg:px-16">
            <div className={`${heroClass} video-hero-copy max-w-2xl text-white`}>
              <div className="hero-reveal hero-delay-1 mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm"><Sparkles className="h-3.5 w-3.5 text-lime-300" /> AI-powered freelance workspace</div>
              <h1 className="hero-reveal hero-delay-2 max-w-2xl text-5xl font-bold leading-[.98] tracking-[-.05em] sm:text-6xl lg:text-8xl">Find talent.<br /><span className="text-blue-200">Build anything.</span></h1>
              <p className="hero-reveal hero-delay-3 mt-7 max-w-xl text-base leading-7 text-white/80 sm:text-lg">Connect with skilled freelancers, manage projects effortlessly, and let AI help you move from idea to delivery.</p>
              <div className="hero-reveal hero-delay-4 mt-8 flex flex-wrap gap-3"><Link to={isAuthenticated ? dashboardLink : '/freelancer/browse'}><Button size="lg">Find Talent <ArrowRight className="h-4 w-4" /></Button></Link><Link to={isAuthenticated ? dashboardLink : '/register'}><Button className="border border-white/35 bg-white/10 text-white hover:bg-white/20" size="lg">Find Work</Button></Link></div>
              <p className="hero-reveal hero-delay-5 mt-8 text-xs font-semibold uppercase tracking-[.18em] text-white/70">The right people, the right workflow, one intelligent workspace.</p>
            </div>
          </div>
          <div className="absolute bottom-6 left-6 z-10 flex max-w-[calc(100%-3rem)] flex-wrap gap-2 sm:left-12 lg:left-16"><span className="rounded-full border border-white/35 bg-black/20 px-3 py-1.5 text-xs text-white/90 backdrop-blur-sm">Web development <ArrowRight className="ml-1 inline h-3 w-3" /></span><span className="rounded-full border border-white/35 bg-black/20 px-3 py-1.5 text-xs text-white/90 backdrop-blur-sm">AI development <ArrowRight className="ml-1 inline h-3 w-3" /></span><span className="rounded-full border border-white/35 bg-black/20 px-3 py-1.5 text-xs text-white/90 backdrop-blur-sm">UI/UX design <ArrowRight className="ml-1 inline h-3 w-3" /></span></div>
          <div className="hero-float-card hero-float-card-one"><Sparkles className="h-4 w-4 text-[#3157d5]" /><span>AI Match</span><strong>94%</strong></div>
          <div className="hero-float-card hero-float-card-two"><Gauge className="h-4 w-4 text-emerald-600" /><span>Project Progress</span><strong>72%</strong></div>
          <div className="hero-float-card hero-float-card-three"><ShieldCheck className="h-4 w-4 text-emerald-600" /><span>Project Health</span><strong>On track</strong></div>
        </div>
      </section>

      <section ref={workflowRef} className={`workflow-intro border-b bg-white py-20 ${workflowClass}`}><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="max-w-2xl"><SectionLabel>One intelligent workspace</SectionLabel><h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-5xl">Everything you need to move work forward.</h2><p className="mt-4 text-base leading-7 text-slate-500">From finding the right talent to delivering the final milestone.</p></div><div className="mt-12 grid gap-4 lg:grid-cols-3"><Link to="/freelancer/browse" className="workflow-card workflow-card-find group rounded-[1.75rem] border bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-[var(--sf-shadow)]"><div className="flex items-start justify-between"><span className="text-6xl font-bold tracking-[-.08em] text-slate-100">01</span><Users className="h-6 w-6 text-[#3157d5]" /></div><h3 className="mt-10 text-2xl font-bold text-slate-950">Find the right talent</h3><p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">Discover specialists whose skills and experience fit the work you want to ship.</p><ArrowRight className="mt-8 h-5 w-5 text-[#3157d5] transition group-hover:translate-x-2" /></Link><Link to="/register" className="workflow-card workflow-card-build group rounded-[1.75rem] border bg-[#f7f8fa] p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-[var(--sf-shadow)]"><div className="flex items-start justify-between"><span className="text-6xl font-bold tracking-[-.08em] text-slate-200">02</span><Workflow className="h-6 w-6 text-[#3157d5]" /></div><h3 className="mt-10 text-2xl font-bold text-slate-950">Manage your project</h3><p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">Keep tasks, milestones, feedback, and conversations moving in one place.</p><ArrowRight className="mt-8 h-5 w-5 text-[#3157d5] transition group-hover:translate-x-2" /></Link><Link to="/register" className="workflow-card workflow-card-deliver group rounded-[1.75rem] border bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-[var(--sf-shadow)]"><div className="flex items-start justify-between"><span className="text-6xl font-bold tracking-[-.08em] text-slate-100">03</span><ShieldCheck className="h-6 w-6 text-emerald-600" /></div><h3 className="mt-10 text-2xl font-bold text-slate-950">Track and deliver</h3><p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">See progress early, approve confidently, and finish every milestone with clarity.</p><ArrowRight className="mt-8 h-5 w-5 text-[#3157d5] transition group-hover:translate-x-2" /></Link></div></div></section>

      <section ref={aiRef} className={`ai-flow-section border-b bg-[#f7f8fa] py-20 ${aiClass}`}><div className="mx-auto max-w-5xl px-4 text-center sm:px-6"><SectionLabel>Intelligence behind every project</SectionLabel><h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-5xl">The intelligent layer stays close.</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-500">AI helps turn a brief into useful momentum, without taking human judgment out of the work.</p><div className="ai-flow-line mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-2 sm:flex-nowrap"><span>Requirements</span><ArrowRight className="h-4 w-4 text-[#3157d5]" /><span>AI Breakdown</span><ArrowRight className="h-4 w-4 text-[#3157d5]" /><span>Talent Match</span><ArrowRight className="h-4 w-4 text-[#3157d5]" /><span>Effort Estimate</span><ArrowRight className="h-4 w-4 text-[#3157d5]" /><span>Project Health</span><ArrowRight className="h-4 w-4 text-[#3157d5]" /><span className="bg-[#3157d5] text-white">Copilot</span></div></div></section>

      <section id="explore" className="border-b bg-white py-14"><div className="mx-auto max-w-4xl px-4 text-center sm:px-6"><SectionLabel>Marketplace search</SectionLabel><h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-5xl">What are you looking to build?</h2><form onSubmit={searchMarketplace} className="mx-auto mt-8 flex max-w-2xl items-center rounded-2xl border bg-white p-2 shadow-[0_16px_45px_rgba(49,87,213,.12)]"><Search className="ml-3 h-5 w-5 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" placeholder="Search skills, projects, or services..." /><Button type="submit">Search</Button></form><div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-slate-500">{['AI Developer', 'React Developer', 'UI/UX Designer', 'Data Scientist', 'Mobile App Developer'].map((suggestion) => <button type="button" key={suggestion} onClick={() => setQuery(suggestion)} className="rounded-full border bg-slate-50 px-3 py-1.5 transition hover:border-blue-200 hover:text-[#3157d5]">{suggestion}</button>)}</div></div></section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"><div className="flex items-end justify-between gap-5"><div><SectionLabel>Explore top skills</SectionLabel><h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-5xl">A better starting point<br />for good work.</h2></div><Link to="/freelancer/browse" className="hidden items-center gap-2 text-sm font-bold text-[#3157d5] sm:flex">Explore all <ArrowRight className="h-4 w-4" /></Link></div><div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{categories.map(([title, description, Icon], index) => <Link to="/freelancer/browse" key={title} className="group rounded-2xl border bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[var(--sf-shadow)]" style={{ transitionDelay: `${index * 35}ms` }}><div className="flex items-start justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef2ff] text-[#3157d5] transition group-hover:scale-110"><Icon className="h-5 w-5" /></div><ArrowDownRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:translate-y-1 group-hover:text-[#3157d5]" /></div><h3 className="mt-9 text-sm font-bold text-slate-900">{title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{description}</p></Link>)}</div></section>

      <section className="border-y bg-[#f7f8fa] py-20"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="max-w-2xl"><SectionLabel>Live marketplace</SectionLabel><h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-5xl">Projects worth building.</h2><p className="mt-3 text-sm text-slate-500">Real briefs from the current marketplace, ready for the right people.</p></div>{loadingProjects ? <div className="mt-10 grid gap-5 md:grid-cols-3"><div className="h-64 animate-pulse rounded-2xl bg-slate-100" /><div className="h-64 animate-pulse rounded-2xl bg-slate-100" /><div className="h-64 animate-pulse rounded-2xl bg-slate-100" /></div> : projects.length ? <div className="mt-10 grid gap-5 md:grid-cols-3">{projects.map((project, index) => <Link key={project._id} to={`/freelancer/projects/${project._id}`} className={`group rounded-2xl border bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[var(--sf-shadow)] ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}><div className="flex items-center justify-between"><span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[10px] font-bold text-[#3157d5]">{project.category || 'Open project'}</span><ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#3157d5]" /></div><h3 className={`${index === 0 ? 'mt-16 text-2xl sm:text-3xl' : 'mt-10 text-lg'} font-bold text-slate-950`}>{project.title}</h3><p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">{project.description}</p><div className="mt-6 flex flex-wrap gap-1.5">{project.skills?.slice(0, 4).map((skill) => <span key={skill} className="rounded-md bg-slate-100 px-2 py-1 text-[10px] text-slate-600">{skill}</span>)}</div><div className="mt-8 flex items-center justify-between border-t pt-4 text-xs"><span className="font-bold text-slate-900">{project.budget ? `$${Number(project.budget).toLocaleString()}` : 'Budget open'}</span><span className="truncate text-slate-500">{project.client?.company || project.client?.name || 'Verified client'}</span></div></Link>)}</div> : <div className="mt-10 rounded-2xl border border-dashed p-10 text-center text-sm text-slate-500">New projects will appear here as clients publish them.</div>}</div></section>

      <section id="workspace" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"><div className="overflow-hidden rounded-[2rem] border bg-slate-950 p-5 text-white shadow-[0_30px_80px_rgba(15,23,42,.18)] sm:p-8"><div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-center"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-blue-300">Product preview</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">A workspace that makes progress visible.</h2></div><div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-bold text-emerald-200">Project is on track</div></div><div className="mt-7 grid gap-5 lg:grid-cols-[1.4fr_.6fr]"><div className="rounded-2xl border border-white/10 bg-white/[.06] p-4"><div className="flex items-center justify-between"><p className="text-sm font-bold">AI E-Commerce Platform</p><span className="text-xs text-blue-200">72%</span></div><div className="mt-3 h-1.5 rounded-full bg-white/10"><div className="h-full w-[72%] rounded-full bg-blue-300" /></div><div className="mt-6 grid gap-3 sm:grid-cols-4">{['To Do', 'In Progress', 'Review', 'Done'].map((title) => <div key={title} className="rounded-xl bg-white/[.06] p-3"><p className="text-[10px] font-bold uppercase text-slate-400">{title}</p><div className="mt-4 rounded-lg border border-white/10 bg-white/[.06] p-3 text-xs font-semibold">{title === 'Done' ? 'Brief approved' : title === 'Review' ? 'Checkout tests' : title === 'In Progress' ? 'Build storefront' : 'Research flows'}</div></div>)}</div></div><div className="space-y-4"><div className="rounded-2xl border border-white/10 bg-white/[.06] p-5"><p className="text-xs text-slate-400">Milestones</p><p className="mt-2 text-2xl font-bold">3 <span className="text-sm font-normal text-slate-400">of 4 complete</span></p><div className="mt-4 space-y-2 text-xs text-slate-300"><p className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-300" /> Scope approved</p><p className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-300" /> Prototype review</p></div></div><div className="rounded-2xl border border-blue-300/20 bg-blue-300/10 p-5"><p className="flex items-center gap-2 text-xs font-bold text-blue-200"><Sparkles className="h-3.5 w-3.5" /> AI Copilot</p><p className="mt-3 text-sm font-semibold">What should I work on next?</p><p className="mt-2 text-xs leading-5 text-slate-300">Finish checkout tests before the next client review.</p></div></div></div></div></section>

      <section className="border-y bg-[#f7f8fa] py-20"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="max-w-2xl"><SectionLabel>Talent discovery</SectionLabel><h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-5xl">Meet the talent behind great work.</h2><p className="mt-3 text-sm leading-6 text-slate-500">Real hired talent appears here from the marketplace data. No invented profiles.</p></div>{talentSignals.length ? <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{talentSignals.map((project) => <div key={project._id} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-800">{project.hiredFreelancer.name?.[0]?.toUpperCase() || 'U'}</div><div><h3 className="font-bold text-slate-900">{project.hiredFreelancer.name}</h3><p className="text-xs text-slate-500">{project.hiredFreelancer.title || 'Freelance specialist'}</p></div><BadgeCheck className="ml-auto h-4 w-4 text-emerald-600" /></div><p className="mt-5 text-xs text-slate-500">Working on <span className="font-semibold text-slate-800">{project.title}</span></p></div>)}</div> : <div className="mt-10 rounded-2xl border border-dashed bg-white p-10 text-center"><Users className="mx-auto h-8 w-8 text-[#3157d5]" /><h3 className="mt-4 font-bold text-slate-900">Talent discovery starts with a project</h3><p className="mt-2 text-sm text-slate-500">Post a brief or browse open projects to unlock context-aware matching.</p></div>}</div></section>

      <section className="relative overflow-hidden bg-[#3157d5] px-4 py-20 text-center text-white"><div className="pointer-events-none absolute -left-20 top-[-8rem] h-80 w-80 rounded-full border border-white/10" /><div className="pointer-events-none absolute -right-16 bottom-[-9rem] h-96 w-96 rounded-full border border-white/10" /><div className="relative mx-auto max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-100">Ready when you are</p><h2 className="mt-4 text-4xl font-bold sm:text-6xl">Ready to build something great?</h2><p className="mx-auto mt-5 max-w-xl text-base leading-7 text-blue-100">Find the right talent and turn your next idea into reality.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link to="/register"><Button className="bg-white text-[#3157d5] hover:bg-blue-50">Get Started <ArrowRight className="h-4 w-4" /></Button></Link><Link to="/freelancer/browse"><Button variant="outline" className="border-white/50 text-white hover:bg-white/10">Explore Talent</Button></Link></div></div></section>
    </div>
  );
};