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
        className="border-border bg-card"
        style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileText className="size-4 text-primary" />
              Optimized Resume
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-2 border-border shadow-none"
              >
                {copied ? (
                  <Check className="size-3.5 text-lumora-success" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-border shadow-none"
              >
                <Download className="size-3.5" />
                PDF
              </Button>
              <Button
                size="sm"
                className="gap-2 text-primary-foreground"
                style={{
                  background: "linear-gradient(135deg, #9B8CF5, #A7C7FF)",
                  boxShadow: "0 2px 8px rgba(155,140,245,0.2)",
                }}
              >
                <RefreshCw className="size-3.5" />
                Regenerate
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] rounded-xl border border-border bg-background p-6">
            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground">
              {optimizedContent || "No optimized resume content available."}
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>

      {(coverLetterContent || result.cover_letter === null) && (
        <Card
          className="border-border bg-card"
          style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileText className="size-4 text-primary" />
                Cover Letter
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCoverLetter}
                  className="gap-2 border-border shadow-none"
                >
                  {copiedCoverLetter ? (
                    <Check className="size-3.5 text-lumora-success" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  {copiedCoverLetter ? "Copied" : "Copy"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-border shadow-none"
                >
                  <Download className="size-3.5" />
                  PDF
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] rounded-xl border border-border bg-background p-6">
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground">
                {coverLetterContent || "Generating cover letter... Please wait."}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
