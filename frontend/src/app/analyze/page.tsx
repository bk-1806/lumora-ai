"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast"
import { DashboardContent } from '../dashboard/page';
import { SearchProvider } from "@/context/search-context";

const loadingMessages = [
    "Parsing resume...",
    "Extracting keywords...",
    "Calculating semantic similarity...",
    "Computing ATS score...",
    "Optimizing weak bullet points..."
];

export default function AnalyzePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [jd, setJd] = useState('');
    const [email, setEmail] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isUploading) {
            setLoadingStep(0);
            interval = setInterval(() => {
                setLoadingStep((prev) => {
                    if (prev < loadingMessages.length - 1) return prev + 1;
                    return prev;
                });
            }, 1500);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isUploading]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !jd.trim() || !email.trim()) {
            setError("Please provide a resume, job description, and your email address.");
            return;
        }

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("resume", file);
        formData.append("job_description", jd);
        if (email) {
            formData.append("email", email);
        }

        try {
            console.log("Sending Analysis Request:", { filename: file.name, email });
            const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${API_BASE}/api/analyze`, {
                method: "POST",
                body: formData,
            });

            console.log("Analysis Request completed with status:", res.status);
            const data = await res.json();
            console.log("Analysis Payload Response:", data);

            if (!res.ok) {
                console.error("Analysis Request Failed:", data);
                throw new Error(data.detail || "Analysis failed due to server error");
            }

            // Store results in localStorage for the results page to pick up (Guest/Transient mode)
            localStorage.setItem("analysis_result", JSON.stringify(data.data));
            localStorage.setItem("analysis_filename", file.name);
            localStorage.setItem("analysis_jd", jd);

            toast({
                title: "Resume analysis completed successfully",
                description: "Your ATS score and analysis metrics are ready.",
            });

            setAnalysisResult(data.data);
            window.scrollTo({ top: 0, behavior: "smooth" });

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsUploading(false);
        }
    };

    if (analysisResult) {
        return (
            <SearchProvider>
                <DashboardContent result={analysisResult} />
            </SearchProvider>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col pt-16">
            <main className="flex-grow flex items-center justify-center px-4 sm:px-6">
                <div className="w-full max-w-3xl bg-card p-8 rounded-3xl border border-border shadow-2xl backdrop-blur-xl">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-lumora-secondary">
                            Start ATS Simulation
                        </h1>
                        <p className="text-muted-foreground mt-2">Upload your resume and paste the target job description to get your score.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {error && (
                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-muted-foreground">Email Address (for scan limits)</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-mono"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-muted-foreground">Resume Upload (PDF or DOCX)</label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-border border-dashed rounded-xl cursor-pointer bg-secondary/50 hover:bg-secondary transition-colors group">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg className={`w-10 h-10 mb-3 ${file ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground/80'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                        <p className="mb-2 text-sm text-muted-foreground">
                                            {file ? <span className="font-semibold text-primary">{file.name}</span> : <span><span className="font-semibold text-foreground">Click to upload</span> or drag and drop</span>}
                                        </p>
                                        <p className="text-xs text-muted-foreground/80">Only PDF or DOCX allowed</p>
                                    </div>
                                    <input type="file" className="hidden" accept=".pdf,.docx" onChange={handleFileChange} />
                                </label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-muted-foreground">Job Description</label>
                            <textarea
                                required
                                value={jd}
                                onChange={(e) => setJd(e.target.value)}
                                rows={6}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-sans"
                                placeholder="Paste the target job description here..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isUploading}
                            className={`w-full py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all duration-300 ${isUploading ? 'bg-primary/50 text-primary-foreground/70 cursor-not-allowed' : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40'}`}
                        >
                            {isUploading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    <span className="animate-pulse">{loadingMessages[loadingStep]}</span>
                                </>
                            ) : 'Run ATS Simulation'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
