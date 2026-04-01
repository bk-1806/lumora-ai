"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"
import { SaveAnalysisModal } from "@/components/dashboard/save-analysis-modal"
import { AnalysisResult } from "@/types"

const loadingMessages = [
    "Parsing resume...",
    "Extracting keywords...",
    "Calculating semantic similarity...",
    "Computing ATS score...",
    "Optimizing weak bullet points..."
];

export default function UploadPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [jd, setJd] = useState('');
    const [email, setEmail] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [showSaveModal, setShowSaveModal] = useState(false);

    // Auto-fill email from Supabase auth if logged in
    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
    }, [user]);

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
        formData.append("email", email);

        try {
            const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, "");
            const res = await fetch(`${API_BASE}/api/analyze`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const text = await res.text();
                console.error("Analysis error:", text);
                try {
                    const errObj = JSON.parse(text);
                    throw new Error(errObj.detail || "Analysis failed due to a server error.");
                } catch (parseErr) {
                    throw new Error(`Server Error: ${res.status} - Please check backend logs.`);
                }
            }

            const data = await res.json();

            // Store results in localStorage
            localStorage.setItem("analysis_result", JSON.stringify(data.data));

            // Save resume version to backend (non-blocking)
            (async () => {
                try {
                    const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, "");
                    await fetch(`${API_BASE}/api/resume-version`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: email,
                            resume_text: data.data.optimized_resume_text || "",
                            ats_score: data.data.final_ats_score || 0,
                            metrics: data.data
                        }),
                    });
                } catch (vErr) {
                    console.warn("Version save failed (non-critical):", vErr);
                }
            })();

            toast({
                title: "Resume analysis completed successfully",
                description: "Your ATS score and analysis metrics are ready.",
            });

            // Show save modal before redirecting
            setAnalysisResult(data.data);
            setShowSaveModal(true);

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
        } finally {
            setIsUploading(false);
        }
    };

    const handleModalClose = () => {
        setShowSaveModal(false);
        router.push("/dashboard");
    };

    const handleModalSaved = () => {
        setShowSaveModal(false);
        router.push("/dashboard");
    };

    return (
        <>
            {/* Save Analysis Modal */}
            {showSaveModal && analysisResult && (
                <SaveAnalysisModal
                    result={analysisResult}
                    onClose={handleModalClose}
                    onSaved={handleModalSaved}
                />
            )}

            <div className="min-h-screen bg-gradient-to-br from-[#faf7ff] via-[#f3eeff] to-[#f8faff] text-slate-900 flex flex-col pt-16">
                <main className="flex-grow flex items-center justify-center px-4 sm:px-6 py-12">
                    <div className="w-full max-w-3xl bg-white/60 backdrop-blur-xl p-8 sm:p-10 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(168,85,247,0.12)]">
                        <div className="text-center mb-10">
                            <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                                Start ATS Simulation
                            </h1>
                            <p className="text-slate-500 mt-3 text-lg">Upload your resume and paste the target job description to get your score.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {error && (
                                <div className="p-4 rounded-xl bg-red-50/80 border border-red-100 text-red-600 text-sm flex items-center gap-3">
                                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700">
                                    Email Address {user ? <span className="text-xs text-purple-500 font-normal ml-1">(auto-filled from account)</span> : <span className="text-xs text-slate-400 font-normal ml-1">(for scan limits)</span>}
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/80 border border-purple-100 rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 transition-all font-medium"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700">Resume Upload <span className="text-xs text-slate-400 font-normal ml-1">(PDF or DOCX)</span></label>
                                <div className="flex items-center justify-center w-full">
                                    <label className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 group ${file ? 'border-purple-400 bg-purple-50/50' : 'border-purple-200 bg-white/50 hover:bg-purple-50/30 hover:border-purple-300'}`}>
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                                            <svg className={`w-10 h-10 mb-3 transition-colors ${file ? 'text-purple-500' : 'text-purple-300 group-hover:text-purple-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                            <p className="mb-2 text-sm text-slate-600">
                                                {file ? <span className="font-bold text-purple-700">{file.name}</span> : <span><span className="font-bold text-purple-600">Click to upload</span> or drag and drop</span>}
                                            </p>
                                            <p className="text-xs text-slate-400 font-medium">Maximum file size 5MB</p>
                                        </div>
                                        <input type="file" className="hidden" accept=".pdf,.docx" onChange={handleFileChange} />
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700">Job Description</label>
                                <textarea
                                    required
                                    value={jd}
                                    onChange={(e) => setJd(e.target.value)}
                                    rows={6}
                                    className="w-full bg-white/80 border border-purple-100 rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-400 transition-all font-medium resize-y"
                                    placeholder="Paste the exact job description here for the most accurate simulation..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isUploading}
                                className={`w-full py-4 rounded-xl font-bold flex justify-center items-center gap-3 transition-all duration-300 ${isUploading ? 'bg-purple-100 text-purple-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-[0_8px_20px_rgb(168,85,247,0.3)] hover:shadow-[0_10px_25px_rgb(168,85,247,0.4)] hover:-translate-y-0.5'}`}
                            >
                                {isUploading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        <span className="animate-pulse text-purple-600">{loadingMessages[loadingStep]}</span>
                                    </>
                                ) : 'Run ATS Simulation'}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </>
    );
}
