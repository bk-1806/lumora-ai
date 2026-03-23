import { Metadata } from 'next';
import Link from 'next/link';
import LandingNav from '@/components/landing-nav';

export const metadata: Metadata = {
  title: 'Lumora AI - Intelligent ATS Simulation',
  description: 'Simulate how Applicant Tracking Systems evaluate resumes against job descriptions.',
};

export default function Home() {
  return (
    <div className="min-h-screen text-slate-900 font-sans selection:bg-purple-200 bg-gradient-to-br from-[#faf7ff] via-[#f3eeff] to-[#f8faff]">
      {/* Navigation - client component for auth state */}
      <LandingNav />

      {/* Hero Section */}
      <main className="relative overflow-hidden w-full">
        {/* Soft glowing orbs for ambient background */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-purple-300/20 rounded-full blur-[120px] -z-10 mix-blend-multiply" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-indigo-300/20 rounded-full blur-[120px] -z-10 mix-blend-multiply" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-36 pb-24 relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-purple-200 shadow-sm text-purple-700 text-sm font-semibold mb-8 hover:shadow-md hover:bg-white/80 transition-all cursor-default">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
            </span>
            Premium SaaS ATS Simulation Engine
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 text-center text-slate-900 leading-[1.1]">
            Beat the <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 bg-[length:200%_auto] animate-pulse">ATS Algorithm</span><br className="hidden md:block"/> before you apply.
          </h1>

          <p className="text-lg md:text-xl text-slate-600 mb-12 leading-relaxed max-w-3xl text-center">
            Lumora AI uses advanced NLP and semantic mapping to simulate how enterprise Applicant Tracking Systems score your resume against real job descriptions. <span className="text-slate-800 font-medium">Stop guessing, start optimizing.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto">
            <Link
              href="/upload"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-white font-bold transition-all duration-300 transform hover:-translate-y-1 shadow-[0_10px_40px_-10px_rgba(168,85,247,0.5)] flex items-center justify-center gap-2 group bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
            >
              Scan Your Resume
              <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/50 backdrop-blur-sm border border-slate-200 text-slate-700 font-semibold hover:bg-white/80 hover:shadow-sm transition-all duration-300 flex justify-center text-center"
            >
              How it works
            </a>
          </div>
        </div>

        {/* How It Works Section */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">Three Steps to Perfection</h2>
            <p className="mt-4 text-slate-500">A seamless process to significantly increase your interview callback rate.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard step="01" title="Upload Resume & JD" desc="Drop your current resume and the target job description into our secure evaluation engine." />
            <StepCard step="02" title="AI ATS Simulation" desc="Our NLP engine parses, tokenizes, and maps your experience exactly like enterprise ATS platforms." />
            <StepCard step="03" title="Optimize & Apply" desc="Review your score, fix skill gaps with AI-rewritten bullets, and apply with confidence." />
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 border-t border-purple-100/50">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Enterprise Intelligence for Candidates</h2>
            <p className="mt-4 text-slate-500">Everything you need to outsmart automated recruiting systems.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="Semantic Similarity"
              description="Instead of dumb keyword matching, we use sentence-transformers to understand the contextual relevance of your experience."
              icon={
                <svg className="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              }
            />
            <FeatureCard
              title="Predictive ATS Scoring"
              description="Get a 0-100 score based on keyword density, quantification metrics, and formatting compliance."
              icon={
                <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              }
            />
            <FeatureCard
              title="AI Bullet Re-Writing"
              description="Identify weak 'responsible for' bullets and let Gemini optimize them into impactful, STAR-method statements."
              icon={
                <svg className="w-7 h-7 text-fuchsia-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              }
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="p-8 rounded-3xl bg-white/60 backdrop-blur-xl border border-white hover:border-purple-200 hover:shadow-[0_8px_30px_rgb(168,85,247,0.12)] hover:-translate-y-1 transition-all duration-300 group">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-800">{title}</h3>
      <p className="text-slate-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function StepCard({ step, title, desc }: { step: string, title: string, desc: string }) {
  return (
    <div className="relative p-8 pt-12 rounded-3xl bg-white/40 backdrop-blur-lg border border-white hover:bg-white/60 transition-all duration-300 shadow-sm hover:shadow-md">
      <div className="absolute -top-6 left-8 text-5xl font-black text-transparent opacity-30 select-none" style={{ WebkitTextStroke: '2px #a855f7' }}>
        {step}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-800">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}
