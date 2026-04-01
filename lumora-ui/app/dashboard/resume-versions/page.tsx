"use client";
import { useRouter } from "next/navigation";
export default function ResumeVersionsPage() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center p-12 max-w-md">
        <div className="text-5xl mb-6">📚</div>
        <h1 className="text-2xl font-bold text-foreground mb-3">Resume Versions</h1>
        <p className="text-muted-foreground mb-8">Track, compare, and manage multiple resume versions tailored to different roles. Coming soon.</p>
        <button onClick={() => router.push("/dashboard")} className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition">← Back to Dashboard</button>
      </div>
    </div>
  );
}
