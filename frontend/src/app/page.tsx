import { Metadata } from 'next';
import Link from 'next/link';
import { LandingNav } from '@/components/ui/landing-nav';

export const metadata: Metadata = {
  title: 'Lumora AI - Intelligent ATS Simulation',
  description: 'Simulate how Applicant Tracking Systems evaluate resumes against job descriptions.',
};

export default function Home() {
  return (
    <div
      className="min-h-screen text-foreground font-sans selection:bg-[#7c8cff]/30"
      style={{ background: 'linear-gradient(135deg, #f8fbff 0%, #eef3ff 50%, #e9ecff 100%)' }}
    >
      {/* Navigation */}
      <LandingNav />

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Abstract background gradient */}
        <div
          className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[120px] opacity-60 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7c8cff 0%, transparent 70%)' }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              SaaS ATS Simulation Engine
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
              Beat the <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(to right, #7c8cff, #5fa9ff)' }}>ATS Algorithm</span> before you apply.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed">
              Lumora AI uses advanced NLP and semantic mapping to simulate how enterprise Applicant Tracking Systems score your resume against real job descriptions. Stop guessing and start optimizing.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/analyze"
                className="px-8 py-4 rounded-full text-white font-bold transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(124,140,255,0.3)] flex items-center gap-2 group bg-[#7c8cff] hover:bg-[#5fa9ff]"
              >
                Scan Your Resume
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
              <a
                href="#features"
                className="px-8 py-4 rounded-full bg-card border border-border text-muted-foreground font-medium hover:bg-secondary transition-all duration-300"
              >
                How it works
              </a>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 border-t border-border/50">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="Semantic Similarity"
              description="Instead of dumb keyword matching, we use sentence-transformers to understand the contextual relevance of your experience."
              icon="🧠"
            />
            <FeatureCard
              title="Predictive ATS Scoring"
              description="Get a 0-100 score based on keyword density, quantification metrics, and formatting compliance."
              icon="📊"
            />
            <FeatureCard
              title="AI Bullet Re-Writing"
              description="Identify weak 'responsible for' bullets and let Gemini optimize them into impactful, STAR-method statements."
              icon="✨"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: string }) {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors duration-300 group">
      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
