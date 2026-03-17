"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ExternalLink, Calendar, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface ResumeHistoryItem {
  id: string;
  user_id: string;
  resume_id: string;
  job_description: string;
  ats_score: number;
  keyword_score: number;
  similarity_score: number;
  experience_score: number;
  skill_density: number;
  pass_probability: number;
  created_at: string;
  raw_response: any;
  // Joined from resumes table
  resumes?: {
    filename: string;
    label: string;
  };
}

export function ResumeHistory() {
  const { user } = useAuth()
  const router = useRouter()
  const [history, setHistory] = useState<ResumeHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchHistory()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchHistory = async () => {
    if (!user?.id) return;
    try {
      setLoading(true)
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://lumora-ai-production.up.railway.app"
      const res = await fetch(`${API_BASE}/api/auth/resume-history?user_id=${user.id}`)
      if (!res.ok) {
        console.error("Failed to fetch history");
        setHistory([]);
        return;
      }
      const data = await res.json()
      setHistory(data.data || [])
    } catch (err: any) {
      console.error(err)
      setHistory([])
      toast.error("Could not load resume history.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (analysisId: string) => {
    try {
      if (!user?.id) return;
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://lumora-ai-production.up.railway.app"
      const res = await fetch(`${API_BASE}/api/auth/resume-analysis/${analysisId}?user_id=${user.id}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error("Failed to delete")
      
      toast.success("Analysis deleted.");
      setHistory(history.filter(h => h.id !== analysisId))
    } catch (err) {
      toast.error("Failed to delete analysis.")
    }
  }

  const handleOpenAnalysis = (item: ResumeHistoryItem) => {
    // Reconstruct the analysis result shape the frontend expects
    const reconstructedData = {
      ...item.raw_response,
      resume_text: item.raw_response.resume_text,
      job_description: item.job_description,
      filename: item.resumes?.filename,
    }
    
    // Save to local storage to mimic a fresh upload
    localStorage.setItem("lumora_analysis_result", JSON.stringify(reconstructedData))
    
    // Redirect to overview
    router.push("/dashboard?tab=overview")
    toast.success("Restored analysis from history!")
    
    // Note: since the layout doesn't automatically re-mount the context if we just change the query param
    // we may need to trigger a hard refresh or rely on a global state. But window.location.href forces it reliably:
    window.location.href = "/dashboard?tab=overview"
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="size-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your resume history...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-5xl mb-6">🔒</div>
        <h2 className="text-2xl font-bold text-foreground mb-3">Please Log In</h2>
        <p className="text-muted-foreground max-w-md">You need to log in to view and manage your saved resume analyses.</p>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-5xl mb-6">📄</div>
        <h2 className="text-2xl font-bold text-foreground mb-3">No Resumes Yet</h2>
        <p className="text-muted-foreground max-w-md mb-6">You haven't saved any resume analyses yet. Upload a resume to get started!</p>
        <Button onClick={() => router.push("/analyze")}>Analyze a Resume</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Resumes</h2>
        <p className="text-muted-foreground">View and manage your previously saved ATS analyses.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {history.map((item) => (
          <Card key={item.id} className="flex flex-col hover:border-primary/30 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{item.resumes?.label || "Untitled Resume"}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Calendar className="size-3" />
                    {formatDate(item.created_at)}
                  </CardDescription>
                </div>
                <Badge variant={item.ats_score >= 75 ? "default" : item.ats_score >= 60 ? "secondary" : "destructive"}>
                  {item.ats_score}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
               <p className="text-xs text-muted-foreground line-clamp-2">
                 <strong>Target Role:</strong> {item.job_description || "Not provided"}
               </p>
               <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                 <strong>Original File:</strong> {item.resumes?.filename}
               </p>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-border pt-4">
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(item.id)}>
                <Trash2 className="size-4" />
              </Button>
              <Button size="sm" className="gap-2" onClick={() => handleOpenAnalysis(item)}>
                Open Analysis
                <ExternalLink className="size-3.5" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
