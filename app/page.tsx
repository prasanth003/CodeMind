"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Github, Code2, ArrowRight, FileArchive, CheckCircle2 } from "lucide-react"
import { ModeToggle } from "@/components/ui/mode-toggle"
import Link from "next/link"

import { LoginButtons } from "@/components/auth/LoginButtons"
import { useAuth } from "@/contexts/AuthContext"

export default function LandingPage() {
  const { user } = useAuth()
  const [githubUrl, setGithubUrl] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip'],
    },
    maxFiles: 1
  })

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 h-16 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Code2 className="h-6 w-6 text-primary" />
          <span>CodeMind AI</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/dashboard">
              <Button variant="default" size="sm">Go to Dashboard</Button>
            </Link>
          ) : (
            <LoginButtons />
          )}
          <ModeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-24 bg-gradient-to-b from-background to-muted/20">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight lg:text-7xl">
            Analyze your codebase <br />
            <span className="text-primary">in seconds</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
            Get instant insights, architecture diagrams, and refactoring suggestions powered by AI.
          </p>
        </div>

        {/* Input Card */}
        <Card className="w-full max-w-2xl shadow-lg border-muted">
          <CardHeader>
            <CardTitle>Start Analysis</CardTitle>
            <CardDescription>
              Upload your project or provide a repository URL.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="upload">Upload Zip</TabsTrigger>
                <TabsTrigger value="github">GitHub Repo</TabsTrigger>
              </TabsList>

              <TabsContent value="upload">
                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
                    ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
                  `}
                >
                  <input {...getInputProps()} />
                  {uploadedFile ? (
                    <div className="flex flex-col items-center gap-2 text-primary">
                      <CheckCircle2 className="h-10 w-10" />
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="h-10 w-10 mb-2" />
                      <p className="font-medium">Drag & drop your project zip here</p>
                      <p className="text-xs">or click to browse files</p>
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-end">
                  <Button disabled={!uploadedFile} className="w-full sm:w-auto">
                    Analyze Project <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="github">
                <div className="space-y-4 py-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="https://github.com/username/repo"
                        className="pl-9"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-md text-sm text-muted-foreground">
                    <p>Make sure the repository is public or you have provided an access token in settings.</p>
                  </div>
                  <div className="flex justify-end">
                    <Button disabled={!githubUrl} className="w-full sm:w-auto">
                      Analyze Repo <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
