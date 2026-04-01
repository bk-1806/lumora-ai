"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Mail, Copy, Check, AlertCircle, Download } from "lucide-react"
import { useState } from "react"
import { useAnalysis } from "@/hooks/use-analysis"

export function CoverLetter() {
  const [copied, setCopied] = useState(false)
  const { data, loaded } = useAnalysis()
  
  if (!loaded) return null

  const coverLetterText = data?.cover_letter || ""

  const handleCopy = () => {
    if (coverLetterText) {
      navigator.clipboard.writeText(coverLetterText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!coverLetterText) {
    return (
      <Card className="border-border bg-card" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Mail className="size-4 text-primary" />
            AI Cover Letter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-border p-8 text-sm text-muted-foreground">
            <AlertCircle className="size-4 shrink-0 text-amber-500" />
            Upload and analyze a resume to generate an AI cover letter automatically.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Mail className="size-4 text-primary" />
            AI-Tailored Cover Letter
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2 border-border shadow-none"
            >
              {copied ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const blob = new Blob([coverLetterText], { type: "text/plain" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = "cover-letter.txt"
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="gap-2 border-border shadow-none"
            >
              <Download className="size-3.5" />
              Download
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] rounded-xl border border-border bg-background p-6 shadow-inner">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
            {coverLetterText}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
