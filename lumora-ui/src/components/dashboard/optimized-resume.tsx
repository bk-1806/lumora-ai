"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Copy, Download, RefreshCw, Check } from "lucide-react"
import { useState } from "react"
import { AnalysisResult } from "@/types"

const optimizedResume = `JOHN DOE
Senior Software Engineer
john.doe@email.com | (555) 123-4567 | San Francisco, CA | linkedin.com/in/johndoe | github.com/johndoe

PROFESSIONAL SUMMARY
Results-driven Senior Software Engineer with 7+ years of experience designing and implementing scalable distributed systems, microservices architectures, and cloud-native applications. Proven track record of leading cross-functional teams to deliver high-impact projects on time, improving system performance by up to 60%. Passionate about leveraging machine learning and data-driven approaches to solve complex engineering challenges.

TECHNICAL SKILLS
Languages: TypeScript, Python, Go, Java, SQL
Frameworks: React, Next.js, Node.js, Express, FastAPI, Spring Boot
Cloud & DevOps: AWS (EC2, Lambda, S3, ECS), Docker, Kubernetes, Terraform, CI/CD (GitHub Actions, Jenkins)
Data: PostgreSQL, MongoDB, Redis, Kafka, Elasticsearch, Apache Spark
Practices: Agile/Scrum, TDD, Microservices, REST API Design, GraphQL, System Design

PROFESSIONAL EXPERIENCE

Senior Software Engineer | TechCorp Inc. | Jan 2021 - Present
- Led a team of 8 engineers to architect and deliver a microservices migration serving 2M+ daily active users, reducing API latency by 60% and improving system reliability to 99.99% uptime
- Designed and implemented a real-time data pipeline using Kafka and Apache Spark, processing 500K+ events per second for analytics and ML model training
- Established CI/CD best practices with Docker and Kubernetes, reducing deployment time from 2 hours to 15 minutes and enabling 50+ deployments per week
- Mentored 5 junior engineers through code reviews, pair programming, and technical talks, resulting in 40% faster onboarding

Software Engineer | InnovateTech | Jun 2018 - Dec 2020
- Built a cloud-native e-commerce platform on AWS, handling $10M+ in annual transactions with auto-scaling infrastructure
- Developed RESTful APIs and GraphQL endpoints serving 100K+ requests per minute with sub-100ms response times
- Implemented comprehensive unit testing and integration testing suites, achieving 95% code coverage and reducing production bugs by 70%

EDUCATION
Master of Science in Computer Science | Stanford University | 2018
Bachelor of Science in Computer Engineering | UC Berkeley | 2016

CERTIFICATIONS
- AWS Solutions Architect Professional
- Certified Kubernetes Administrator (CKA)
- Google Cloud Professional Data Engineer`

export function OptimizedResume({ result, searchQuery = "" }: { result: AnalysisResult; searchQuery?: string }) {
  const optimizedContent = result.optimized_resume_text || "";
  const coverLetterContent = result.cover_letter || "";

  const [copied, setCopied] = useState(false)
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyCoverLetter = () => {
    navigator.clipboard.writeText(coverLetterContent)
    setCopiedCoverLetter(true)
    setTimeout(() => setCopiedCoverLetter(false), 2000)
  }

  return (
    <div className="space-y-6">
      <Card
        className="border-white bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(168,85,247,0.06)] rounded-3xl"
      >
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <FileText className="size-4 text-purple-600" />
              Optimized Resume
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-2 border-white bg-white/60 shadow-sm hover:bg-white text-slate-700 font-semibold rounded-xl"
              >
                {copied ? (
                  <Check className="size-3.5 text-green-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-white bg-white/60 shadow-sm hover:bg-white text-slate-700 font-semibold rounded-xl"
              >
                <Download className="size-3.5" />
                PDF
              </Button>
              <Button
                size="sm"
                className="gap-2 text-white border-0 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-[0_4px_14px_rgba(168,85,247,0.3)] hover:shadow-[0_6px_20px_rgba(168,85,247,0.4)] transition-all font-semibold rounded-xl px-4"
              >
                <RefreshCw className="size-3.5" />
                Regenerate
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] rounded-2xl border border-white bg-white/50 p-6 shadow-inner">
            <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-slate-700">
              {optimizedContent || "No optimized resume content available."}
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>

      {(coverLetterContent || result.cover_letter === null) && (
        <Card
          className="border-white bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(168,85,247,0.06)] rounded-3xl"
        >
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <FileText className="size-4 text-purple-600" />
                Cover Letter
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCoverLetter}
                  className="gap-2 border-white bg-white/60 shadow-sm hover:bg-white text-slate-700 font-semibold rounded-xl"
                >
                  {copiedCoverLetter ? (
                    <Check className="size-3.5 text-green-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  {copiedCoverLetter ? "Copied" : "Copy"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-white bg-white/60 shadow-sm hover:bg-white text-slate-700 font-semibold rounded-xl"
                >
                  <Download className="size-3.5" />
                  PDF
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] rounded-2xl border border-white bg-white/50 p-6 shadow-inner">
              <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-slate-700">
                {coverLetterContent || "Generating cover letter... Please wait."}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
