"use client";
import { useRouter } from "next/navigation";
export default function ResumeCopilotPage() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center p-12 max-w-md">
        <div className="text-5xl mb-6">✨</div>
        <h1 className="text-2xl font-bold text-foreground mb-3">Resume Copilot</h1>
        <p className="text-muted-foreground mb-8">AI-powered chat assistant that rewrites bullets, suggests skills, and optimizes your entire resume. Coming soon.</p>
        <button onClick={() => router.push("/dashboard")} className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition">← Back to Dashboard</button>
      </div>
    </div>
  );
}
