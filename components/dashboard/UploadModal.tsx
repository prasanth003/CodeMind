"use client"

import { useState, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Github, CheckCircle2, Loader2, ArrowRight } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { useProject } from "@/contexts/ProjectContext"
import { useAuth } from "@/contexts/AuthContext"
import { processZipFile } from "@/lib/file-processor"
import { AnalysisEngine } from "@/lib/analysis/engine"
import { useRouter } from "next/navigation"
import { LoginModal } from "@/components/auth/LoginModal"

interface UploadModalProps {
    children: React.ReactNode
}

export function UploadModal({ children }: UploadModalProps) {
    const [open, setOpen] = useState(false)
    const [showLoginModal, setShowLoginModal] = useState(false)
    const { user } = useAuth()
    const { setProjectData, setAnalysisData, setIsAnalyzing, isAnalyzing, setProjectMetadata } = useProject()
    const router = useRouter()
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

    const handleAnalyze = async () => {
        if (!uploadedFile) return;

        // Check if user is logged in
        if (!user) {
            setShowLoginModal(true)
            return
        }

        try {
            setIsAnalyzing(true);

            // 1. Process Zip
            const projectData = await processZipFile(uploadedFile);
            setProjectData(projectData);

            // 2. Run Analysis
            const engine = new AnalysisEngine(projectData);
            const analysisResults = await engine.analyze();
            setAnalysisData(analysisResults);

            // 3. Redirect and Close
            setOpen(false);
            router.push("/dashboard/overview");
        } catch (error) {
            console.error("Analysis failed:", error);
            alert("Failed to analyze project. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleGithubAnalyze = async () => {
        if (!githubUrl) return;

        // Check if user is logged in
        if (!user) {
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
            setProjectData(projectData);
            if (projectData.metadata) {
                setProjectMetadata(projectData.metadata);
            }

            // 3. Run Analysis
            const engine = new AnalysisEngine(projectData);
            const analysisResults = await engine.analyze();
            setAnalysisData(analysisResults);

            // 4. Redirect and Close
            setOpen(false);
            router.push("/dashboard/overview");
        } catch (error: any) {
            console.error("GitHub analysis failed:", error);
            alert(error.message || "Failed to analyze repository. Please check the URL and try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <>
            <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>New Analysis</DialogTitle>
                        <DialogDescription>
                            Upload a new project or provide a repository URL.
                        </DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="upload" className="w-full mt-4">
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
                                <Button
                                    disabled={!uploadedFile || isAnalyzing}
                                    className="w-full sm:w-auto"
                                    onClick={handleAnalyze}
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
                                    <Button
                                        disabled={!githubUrl || isAnalyzing}
                                        className="w-full sm:w-auto"
                                        onClick={handleGithubAnalyze}
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
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </>
    )
}
