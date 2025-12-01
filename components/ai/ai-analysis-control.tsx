"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth/AuthGuard";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Sparkles, FileText, GitBranch, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface AIAnalysisControlProps {
    code: string;
    filePath?: string;
    context?: string;
}

export function AIAnalysisControl({ code, filePath, context }: AIAnalysisControlProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [analysisType, setAnalysisType] = useState<"flow" | "refactor" | "docs" | null>(null);

    const handleAnalyze = async (type: "flow" | "refactor" | "docs") => {
        setIsLoading(true);
        setResult(null);
        setAnalysisType(type);
        setIsOpen(true);

        // "TOON" Notification - Toast
        toast.info(`Starting ${type} analysis...`, {
            description: "Sending data to AI for processing.",
        });

        try {
            let endpoint = "";
            let body = {};

            switch (type) {
                case "flow":
                    endpoint = "/api/ai/flow";
                    body = { code, context };
                    break;
                case "refactor":
                    endpoint = "/api/ai/refactor";
                    body = { code, filePath };
                    break;
                case "docs":
                    endpoint = "/api/ai/docs";
                    body = { code, type: "markdown" };
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
            let accumulatedResult = "";

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value);
                    accumulatedResult += chunk;
                    setResult((prev) => (prev || "") + chunk);
                }
            }

            toast.success("Analysis complete!", {
                description: "AI has finished processing your request.",
            });
        } catch (error) {
            console.error(error);
            toast.error("Analysis failed", {
                description: "Something went wrong. Please try again.",
            });
            setResult("Error occurred during analysis.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        AI Analyze
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleAnalyze("flow")}>
                        <GitBranch className="mr-2 h-4 w-4" />
                        API Flow
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAnalyze("refactor")}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refactor Suggestions
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAnalyze("docs")}>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Docs
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <AuthGuard>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-500" />
                            AI Analysis Result
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                        </DialogTitle>
                        <DialogDescription>
                            {analysisType === "flow" && "Visualizing API Flow..."}
                            {analysisType === "refactor" && "Refactoring Suggestions..."}
                            {analysisType === "docs" && "Generating Documentation..."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 prose dark:prose-invert max-w-none">
                        {result ? (
                            <ReactMarkdown>{result}</ReactMarkdown>
                        ) : (
                            <div className="text-muted-foreground text-sm">
                                {isLoading ? "Analyzing..." : "Select an option to start analysis."}
                            </div>
                        )}
                    </div>
                </AuthGuard>
            </DialogContent>
        </Dialog>
    );
}
