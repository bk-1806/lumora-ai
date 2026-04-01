"use client";

import { useState, useEffect } from "react";

export interface AnalysisResult {
  final_ats_score: number;
  keyword_score: number;
  similarity_score: number;
  experience_score: number;
  skill_density: number;
  formatting_score: number;
  pass_probability: number;
  strengths: string[];
  weaknesses: string[];
  missing_keywords: string[];
  skill_gap: string[];
  optimized_bullets: string[];
  cover_letter?: string;
  resume_text?: string;
  job_description?: string;
  filename?: string;
  _resume_text?: string;
}

export function useAnalysis() {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("lumora_analysis_result");
      if (raw) setData(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  return { data, loaded };
}
