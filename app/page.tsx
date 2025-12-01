"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Github, Code2, ArrowRight, FileArchive, CheckCircle2, Loader2 } from "lucide-react"
import { ModeToggle } from "@/components/ui/mode-toggle"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


import { LoginModal } from "@/components/auth/LoginModal"
import { useAuth } from "@/contexts/AuthContext"
import { useProject } from "@/contexts/ProjectContext"
import { processZipFile } from "@/lib/file-processor"
import { AnalysisEngine } from "@/lib/analysis/engine"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const { user, loading, logout, isSkipped, skipLogin } = useAuth()
  const { setIsAnalyzing, isAnalyzing, addProject } = useProject()
  const router = useRouter()
  const [githubUrl, setGithubUrl] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [retryAction, setRetryAction] = useState<(() => Promise<void>) | null>(null)

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

  const handleAnalyze = async (bypassAuth = false) => {
    if (!uploadedFile) return;

    // Check if user is logged in or skipped
    if (!user && !isSkipped && !bypassAuth) {
      setRetryAction(() => () => handleAnalyze(true))
      setShowLoginModal(true)
      return
    }

    try {
      setIsAnalyzing(true);

      // 1. Process Zip
      const projectData = await processZipFile(uploadedFile);

      // 2. Run Analysis
      const engine = new AnalysisEngine(projectData);
      const analysisResults = await engine.analyze();

      // 3. Add Project (Persist)
      await addProject(
        projectData,
        analysisResults,
        projectData.metadata || { name: 'Project', version: '0.0.0' }
      );

      // 4. Redirect
      router.push("/dashboard/overview");
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Failed to analyze project. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGithubAnalyze = async (bypassAuth = false) => {
    if (!githubUrl) return;

    // Check if user is logged in or skipped
    if (!user && !isSkipped && !bypassAuth) {
      setRetryAction(() => () => handleGithubAnalyze(true))
      setShowLoginModal(true)
      return
    }

    try {
      setIsAnalyzing(true);

      // 1. Fetch Zip from Proxy
      const response = await fetch(`/api/github/download?url=${encodeURIComponent(githubUrl)}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download repository');
      }
      const blob = await response.blob();
      const file = new File([blob], "repo.zip", { type: "application/zip" });

      // 2. Process Zip
      const projectData = await processZipFile(file);

      // 3. Run Analysis
      const engine = new AnalysisEngine(projectData);
      const analysisResults = await engine.analyze();

      // 4. Add Project (Persist)
      await addProject(
        projectData,
        analysisResults,
        projectData.metadata || { name: 'Repo', version: '0.0.0' }
      );

      // 5. Redirect
      router.push("/dashboard/overview");
    } catch (error) {
      console.error("GitHub analysis failed:", error);
      alert((error as Error).message || "Failed to analyze repository. Please check the URL and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSkip = () => {
    skipLogin(false) // Don't redirect
    setShowLoginModal(false)
    if (retryAction) {
      retryAction()
      setRetryAction(null)
    }
  }

  return (
    <>
      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} onSkip={handleSkip} />
      <div className="flex min-h-screen flex-col">
        <header className="flex h-14 items-center px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <img src="/icon.svg" alt="CodeMind Logo" className="h-6 w-6" />
            <span className="">CodeMind AI</span>
          </div>
          <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="https://prasanthsekar.info" target="_blank" rel="noopener noreferrer">
              About
            </Link>
            {loading ? (
              <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                      <AvatarFallback>{user.displayName?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/overview" className="w-full cursor-pointer">
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="w-full cursor-pointer">
                        Settings
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={async () => {
                    try {
                      await logout()
                    } catch (error) {
                      console.error("Failed to log out", error)
                    }
                  }}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : isSkipped ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem onClick={() => setShowLoginModal(true)}>
                    Log in
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setShowLoginModal(true)}>
                Log in
              </Button>
            )}
            <ModeToggle />
          </nav>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-20 bg-gradient-to-b from-background to-muted/20">
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
                  <div className="mt-6 flex flex-col gap-2">
                    <Button
                      disabled={!uploadedFile || isAnalyzing}
                      className="w-full"
                      onClick={() => handleAnalyze(false)}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          Analyze Project <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                    <p className="text-[10px] text-center text-muted-foreground">
                      We do not store your code permanently. All analysis happens in your browser or temporary secure storage.
                    </p>
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
                    <nav className="flex items-center gap-4">
                      {loading ? (
                        <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
                      ) : user ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "@user"} />
                                <AvatarFallback>{user?.displayName?.charAt(0) || "U"}</AvatarFallback>
                              </Avatar>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                              <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.displayName || "User"}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                  {user?.email || "user@example.com"}
                                </p>
                              </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                              <DropdownMenuItem asChild>
                                <Link href="/dashboard/overview" className="w-full cursor-pointer">
                                  Dashboard
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href="/dashboard/settings" className="w-full cursor-pointer">
                                  Settings
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={async () => {
                              try {
                                await logout()
                              } catch (error) {
                                console.error("Failed to log out", error)
                              }
                            }}>
                              Log out
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => setShowLoginModal(true)}>
                          Log in
                        </Button>
                      )}
                    </nav>
                    <div className="flex flex-col gap-2">
                      <Button
                        disabled={!githubUrl || isAnalyzing}
                        className="w-full"
                        onClick={() => handleGithubAnalyze(false)}
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            Analyze Repo <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                      <p className="text-[10px] text-center text-muted-foreground">
                        We do not store your code permanently. All analysis happens in your browser or temporary secure storage.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}
