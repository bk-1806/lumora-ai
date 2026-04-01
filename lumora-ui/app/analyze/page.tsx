"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AnalyzePage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [jd, setJd] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !jd.trim()) {
            setError("Please provide a resume and job description.");
            return;
        }

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("resume", file);
        formData.append("job_description", jd);
        // Add dummy email to align with backend validation format if needed
        formData.append("email", "guest@example.com");

        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://lumora-ai-production.up.railway.app"

        try {
            const res = await fetch(`${API_BASE}/api/analyze`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                throw new Error("Analysis failed - server error");
            }

            const data = await res.json();
            localStorage.setItem("analysis_result", JSON.stringify(data.data));
            
            // Redirect to dashboard where results will be loaded or mocked
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
            <div className="w-full max-w-2xl bg-card border rounded-2xl p-8 shadow-xl">
                <h1 className="text-3xl font-bold mb-6 text-center">Analyze Your Resume</h1>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-100 text-red-600 rounded-lg">{error}</div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium mb-2">Resume Upload (PDF/DOCX)</label>
                        <input 
                            type="file" 
                            accept=".pdf,.docx"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="w-full border p-4 rounded-xl"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Job Description</label>
                        <textarea
                            value={jd}
                            onChange={(e) => setJd(e.target.value)}
                            rows={6}
                            required
                            className="w-full border p-4 rounded-xl resize-none"
                            placeholder="Paste your target job description here..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isUploading}
                        className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl disabled:opacity-50"
                    >
                        {isUploading ? "Analyzing..." : "Submit Analysis Request"}
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => router.push("/")}
                        className="w-full py-4 bg-transparent border border-border text-foreground font-bold rounded-xl hover:bg-secondary mt-4"
                    >
                        Back to Home
                    </button>
                </form>
            </div>
        </div>
    );
}
