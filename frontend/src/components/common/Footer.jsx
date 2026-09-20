import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SkillFlowMark } from './SkillFlowMark';

export const Footer = () => {
  return (
    <footer className="mt-auto border-t bg-[var(--sf-surface)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div><div className="flex items-center gap-2 text-lg font-bold text-[var(--sf-ink)]"><SkillFlowMark compact /> SkillFlow</div><p className="mt-4 max-w-xs text-sm leading-6 text-[var(--sf-muted)]">Find talent, build anything, and keep every project moving in one intelligent workspace.</p></div>
          <div><h3 className="text-sm font-bold text-[var(--sf-ink)]">Product</h3><div className="mt-4 space-y-3 text-sm text-[var(--sf-muted)]"><a className="block hover:text-[#3157d5]" href="/#explore">Marketplace</a><a className="block hover:text-[#3157d5]" href="/#ai">AI Matching</a><a className="block hover:text-[#3157d5]" href="/#workspace">Project Workspace</a><a className="block hover:text-[#3157d5]" href="/#ai">AI Copilot</a></div></div>
          <div><h3 className="text-sm font-bold text-[var(--sf-ink)]">Resources</h3><div className="mt-4 space-y-3 text-sm text-[var(--sf-muted)]"><a className="block hover:text-[#3157d5]" href="/#how-it-works">How It Works</a><a className="block hover:text-[#3157d5]" href="/browse">Explore Work</a><a className="block hover:text-[#3157d5]" href="/register">Get Started</a></div></div>
          <div><h3 className="text-sm font-bold text-[var(--sf-ink)]">Legal</h3><div className="mt-4 space-y-3 text-sm text-[var(--sf-muted)]"><a className="block hover:text-[#3157d5]" href="/">Privacy</a><a className="block hover:text-[#3157d5]" href="/">Terms</a><a className="flex items-center gap-1 hover:text-[#3157d5]" href="/login">Sign in <ArrowUpRight className="h-3.5 w-3.5" /></a></div></div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t pt-5 text-xs text-[var(--sf-muted)] sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} SkillFlow</span><span>Built for people who build.</span></div>
      </div>
    </footer>
  );
};
