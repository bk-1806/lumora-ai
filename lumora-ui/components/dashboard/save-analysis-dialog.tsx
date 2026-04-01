"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { useAnalysis } from "@/hooks/use-analysis"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Save, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function SaveAnalysisDialog() {
  const router = useRouter()
  const { user } = useAuth()
  const { data, loaded } = useAnalysis()
  
  const [open, setOpen] = useState(false)
  const [resumeName, setResumeName] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Only show the save button if logged in, data exists, and it hasn't been saved yet
  // Once saved, we'd traditionally clear locals or track ID, but here we just leave the button 
  // until they clear it or upload a new one.

  if (!user || !loaded || !data) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resumeName.trim()) {
      toast.error("Please enter a name for this resume.")
      return
    }

    setIsSaving(true)
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://lumora-ai-production.up.railway.app"

    try {
      const payload = {
        user_id: user.id, // from Supabase auth session
        filename: data.filename || "Uploaded Resume",
        label: resumeName.trim(), // e.g. "Software Engineer Resume"
        resume_text: data.resume_text || data._resume_text || "",
        job_description: data.job_description || "",
        analysis_data: data 
      }

      const res = await fetch(`${API_BASE}/api/auth/save-analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add auth header if the backend checks JWT, else we trust user_id for now as requested
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error("Failed to save analysis")
      }

      toast.success("Resume Analysis Saved Successfully!")
      setOpen(false)
      // Note: we're not clearing localStorage so the user can keep viewing the overview page
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Failed to save analysis")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
        >
          <Save className="size-3.5" />
          <span className="hidden xl:inline">Save Analysis</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Resume Analysis</DialogTitle>
          <DialogDescription>
            Give this resume analysis a role-specific name so you can easily find it later in your history.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Resume Name
            </label>
            <Input
              id="name"
              placeholder="e.g. AI Engineer Resume"
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              disabled={isSaving}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save to History
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
