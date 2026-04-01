"use client";

import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <div className="max-w-3xl text-center space-y-8 p-6">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
          Beat the ATS Algorithm
        </h1>
        <p className="text-xl text-muted-foreground">
          Upload your resume and simulate how enterprise applicant tracking systems evaluate your application.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => router.push('/analyze')}
            className="px-8 py-4 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 transition cursor-pointer"
          >
            Upload Resume
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-8 py-4 rounded-full border text-foreground font-bold hover:bg-secondary transition cursor-pointer"
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
