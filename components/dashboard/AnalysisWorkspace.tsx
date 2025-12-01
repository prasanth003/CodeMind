"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileTree } from "@/components/dashboard/FileTree"
import { useProject } from "@/contexts/ProjectContext"
import { FileNode } from "@/lib/file-processor"
import { Loader2, Play, FileCode, GitBranch, RefreshCw, FileText } from "lucide-react"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"

interface AnalysisWorkspaceProps {
    mode: "flow" | "refactor" | "docs";
    title: string;
    description: string;
}

export function AnalysisWorkspace({ mode, title, description }: AnalysisWorkspaceProps) {
    const { projectData } = useProject();
    const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [isLoadingFile, setIsLoadingFile] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);

    // Fetch file content
    useEffect(() => {
        const fetchFileContent = async () => {
            if (!selectedFile || selectedFile.type === 'directory') {
                setFileContent(null);
                setAnalysisResult(null); // Reset result on file change
                return;
            }

            setIsLoadingFile(true);
            try {
                const response = await fetch('/api/files/read', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: selectedFile.path }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setFileContent(data.content);
                } else {
                    setFileContent("Failed to load file content.");
                }
            } catch (error) {
                console.error("Error fetching file:", error);
                setFileContent("Error loading file.");
            } finally {
                setIsLoadingFile(false);
            }
        };

        fetchFileContent();
    }, [selectedFile]);

    const handleAnalyze = async () => {
        if (!fileContent || !selectedFile) return;

        setIsAnalyzing(true);
        setAnalysisResult(null);

        toast.info(`Starting ${mode} analysis...`, {
            description: "Sending data to AI for processing.",
        });

        try {
            let endpoint = "";
            let body = {};

            switch (mode) {
                case "flow":
                    endpoint = "/api/ai/flow";
                    body = { code: fileContent, context: `Project: ${projectData?.tree.name}` };
                    break;
                case "refactor":
                    endpoint = "/api/ai/refactor";
                    body = { code: fileContent, filePath: selectedFile.path };
                    break;
                case "docs":
                    endpoint = "/api/ai/docs";
                    body = { code: fileContent, type: "markdown" };
                    break;
            }

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error("Analysis failed");

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value);
                    setAnalysisResult((prev) => (prev || "") + chunk);
                }
            }

            toast.success("Analysis complete!");
        } catch (error) {
            console.error(error);
            toast.error("Analysis failed");
            setAnalysisResult("Error occurred during analysis.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (!projectData) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <h2 className="text-xl font-semibold">No Project Loaded</h2>
                <p className="text-muted-foreground">Please upload a project from the home page.</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col space-y-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
            </div>

            <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
                {/* File Tree */}
                <Card className="col-span-3 flex flex-col min-h-0">
                    <CardHeader className="shrink-0 py-4">
                        <CardTitle className="text-sm">Files</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto min-h-0 p-2">
                        <div className="font-mono text-sm">
                            <FileTree
                                node={projectData.tree}
                                selectedPath={selectedFile?.path}
                                onSelect={setSelectedFile}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content */}
                <div className="col-span-9 flex flex-col gap-4 min-h-0">
                    {/* Code View */}
                    <Card className="flex-1 flex flex-col min-h-0">
                        <CardHeader className="shrink-0 py-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <FileCode className="h-4 w-4" />
                                {selectedFile ? selectedFile.name : "Select a file"}
                            </CardTitle>
                            {selectedFile && fileContent && (
                                <Button size="sm" onClick={handleAnalyze} disabled={isAnalyzing}>
                                    {isAnalyzing ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Play className="h-4 w-4 mr-2" />
                                    )}
                                    {isAnalyzing ? "Analyzing..." : "Run Analysis"}
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto min-h-0 p-0 bg-muted/30 relative">
                            {selectedFile ? (
                                isLoadingFile ? (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        Loading content...
                                    </div>
                                ) : fileContent ? (
                                    <div className="absolute inset-0 overflow-auto p-4">
                                        <pre className="text-sm font-mono whitespace-pre-wrap">
                                            {fileContent}
                                        </pre>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        Unable to read file content
                                    </div>
                                )
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    Select a file to start
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Analysis Result */}
                    {analysisResult && (
                        <Card className="flex-1 flex flex-col min-h-0 border-purple-500/50">
                            <CardHeader className="shrink-0 py-4 bg-purple-500/5">
                                <CardTitle className="text-sm flex items-center gap-2 text-purple-600 dark:text-purple-400">
                                    {mode === 'flow' && <GitBranch className="h-4 w-4" />}
                                    {mode === 'refactor' && <RefreshCw className="h-4 w-4" />}
                                    {mode === 'docs' && <FileText className="h-4 w-4" />}
                                    Analysis Result
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-auto min-h-0 p-4 prose dark:prose-invert max-w-none">
                                <ReactMarkdown>{analysisResult}</ReactMarkdown>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
