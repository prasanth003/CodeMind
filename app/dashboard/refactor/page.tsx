"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Lightbulb, ArrowRight, CheckCircle2, Loader2, RefreshCw, FileCode, ShieldAlert, Info, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useProject } from "@/contexts/ProjectContext"
import { FileTree } from "@/components/dashboard/FileTree"
import { FileNode } from "@/lib/file-processor"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Suggestion {
    id: string;
    type: 'warning' | 'info';
    category: 'ai' | 'large-file' | 'risk';
    title: string;
    description: string;
    file: string;
    recommendation: string;
    lineNumber?: number;
}

export default function RefactorPage() {
    const { projectData } = useProject();
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [checkedPaths, setCheckedPaths] = useState<string[]>([]);
    const [showDisclaimer, setShowDisclaimer] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);

    // Static Analysis on Mount
    useEffect(() => {
        if (projectData?.tree) {
            runStaticAnalysis(projectData.tree);
        }
    }, [projectData]);

    const runStaticAnalysis = (root: FileNode) => {
        const staticSuggestions: Suggestion[] = [];

        const traverse = (node: FileNode) => {
            if (node.type === 'file') {
                // Check for large files (> 50KB approx 1000 lines)
                if (node.size && node.size > 50 * 1024) {
                    staticSuggestions.push({
                        id: `static-large-${node.path}`,
                        type: 'warning',
                        category: 'large-file',
                        title: 'Large File Detected',
                        description: `File size is ${(node.size / 1024).toFixed(1)}KB. Large files are harder to maintain and test.`,
                        file: node.path,
                        recommendation: 'Split this component/module into smaller, focused units.'
                    });
                }
                // Check for potential secrets
                if (node.name.match(/secret|key|token|env/i) && !node.name.endsWith('.example')) {
                    staticSuggestions.push({
                        id: `static-secret-${node.path}`,
                        type: 'warning',
                        category: 'risk',
                        title: 'Potential Security Risk',
                        description: 'Filename suggests sensitive information.',
                        file: node.path,
                        recommendation: 'Ensure this file is in .gitignore. Do not commit secrets.'
                    });
                }
            }
            if (node.children) {
                node.children.forEach(traverse);
            }
        };

        traverse(root);
        setSuggestions(prev => [...prev.filter(s => s.category === 'ai'), ...staticSuggestions]);
    };

    const handleCheck = (node: FileNode, checked: boolean) => {
        if (checked) {
            if (checkedPaths.length >= 5) {
                toast.warning("Limit Reached", { description: "Select up to 5 files for deep AI analysis." });
                return;
            }
            setCheckedPaths(prev => [...prev, node.path]);
        } else {
            setCheckedPaths(prev => prev.filter(p => p !== node.path));
        }
    };

    const confirmAnalysis = async () => {
        setShowDisclaimer(false);
        setLoading(true);

        try {
            const filesToAnalyze = [];
            for (const path of checkedPaths) {
                try {
                    const res = await fetch('/api/files/read', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ path }),
                    });
                    if (res.ok) {
                        const data = await res.json();
                        filesToAnalyze.push({ path, content: data.content });
                    }
                } catch (e) {
                    console.error(`Failed to read ${path}`, e);
                }
            }

            const response = await fetch('/api/ai/refactor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: JSON.stringify(filesToAnalyze),
                    filePath: "multiple"
                }),
            });

            if (!response.ok) throw new Error("Analysis failed");

            const data = await response.json();

            const aiSuggestions = (data.suggestions || []).map((s: any) => ({
                ...s,
                category: 'ai'
            }));

            setSuggestions(prev => [
                ...prev.filter(s => s.category !== 'ai'),
                ...aiSuggestions
            ]);

            toast.success("Analysis Complete", {
                description: `AI found ${aiSuggestions.length} suggestions.`
            });

        } catch (error) {
            console.error(error);
            toast.error("Analysis Failed");
        } finally {
            setLoading(false);
        }
    };

    const SuggestionCard = ({ suggestion }: { suggestion: Suggestion }) => (
        <Card className={`border-l-4 ${suggestion.type === 'warning' ? 'border-l-yellow-500' : 'border-l-blue-500'}`}>
            <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        {suggestion.type === 'warning' ? (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        ) : (
                            <Lightbulb className="h-5 w-5 text-blue-500" />
                        )}
                        <h3 className="font-semibold text-lg">{suggestion.title}</h3>
                    </div>
                </div>

                <p className="text-sm font-mono text-muted-foreground mb-2 bg-muted/30 px-2 py-1 rounded w-fit">
                    {suggestion.file}
                </p>
                <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                    {suggestion.description}
                </p>

                <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => setSelectedSuggestion(suggestion)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div className="shrink-0">
                <h1 className="text-3xl font-bold tracking-tight">Refactor Suggestions</h1>
                <p className="text-muted-foreground">
                    Optimize your codebase with static analysis and AI insights.
                </p>
            </div>

            <Tabs defaultValue="ai" className="flex-1 flex flex-col min-h-0">
                <TabsList>
                    <TabsTrigger value="ai">AI Suggestions</TabsTrigger>
                    <TabsTrigger value="large-file">Large Files</TabsTrigger>
                    <TabsTrigger value="risk">Potential Risks</TabsTrigger>
                </TabsList>

                <TabsContent value="ai" className="flex-1 flex gap-6 min-h-0 mt-4">
                    {/* File Selection */}
                    <Card className="w-1/3 flex flex-col min-h-0">
                        <CardHeader className="py-4 shrink-0">
                            <CardTitle className="text-sm flex justify-between items-center">
                                <span>Select Files ({checkedPaths.length}/5)</span>
                                {checkedPaths.length > 0 && (
                                    <Button size="sm" onClick={() => setShowDisclaimer(true)} disabled={loading}>
                                        {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                                        Analyze
                                    </Button>
                                )}
                            </CardTitle>
                            <CardDescription className="text-xs mt-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-blue-600 dark:text-blue-300">
                                <Info className="h-3 w-3 inline mr-1" />
                                Select specific files for deep AI analysis. This helps reduce costs and focuses on critical areas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto p-2">
                            {projectData ? (
                                <FileTree
                                    node={projectData.tree}
                                    checkable
                                    checkedPaths={checkedPaths}
                                    onCheck={handleCheck}
                                />
                            ) : (
                                <div className="text-center text-muted-foreground p-4">Load a project first</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* AI Suggestions List */}
                    <ScrollArea className="flex-1 h-full">
                        <div className="space-y-4 pr-4">
                            {suggestions.filter(s => s.category === 'ai').length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                                    <RefreshCw className="h-10 w-10 mb-4 opacity-20" />
                                    <p>Select files and click Analyze to get AI suggestions.</p>
                                </div>
                            ) : (
                                suggestions.filter(s => s.category === 'ai').map(s => (
                                    <SuggestionCard key={s.id} suggestion={s} />
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="large-file" className="flex-1 overflow-hidden mt-4">
                    <ScrollArea className="h-full">
                        <div className="space-y-4 pr-4">
                            {suggestions.filter(s => s.category === 'large-file').map(s => (
                                <SuggestionCard key={s.id} suggestion={s} />
                            ))}
                            {suggestions.filter(s => s.category === 'large-file').length === 0 && (
                                <div className="text-center text-muted-foreground py-10">No large files detected. Great job!</div>
                            )}
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="risk" className="flex-1 overflow-hidden mt-4">
                    <ScrollArea className="h-full">
                        <div className="space-y-4 pr-4">
                            {suggestions.filter(s => s.category === 'risk').map(s => (
                                <SuggestionCard key={s.id} suggestion={s} />
                            ))}
                            {suggestions.filter(s => s.category === 'risk').length === 0 && (
                                <div className="text-center text-muted-foreground py-10">No potential risks detected.</div>
                            )}
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>

            {/* Disclaimer Dialog */}
            <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-yellow-500">
                            <ShieldAlert className="h-5 w-5" />
                            Data Privacy Warning
                        </DialogTitle>
                        <DialogDescription>
                            You are about to send code to OpenAI.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 text-sm text-muted-foreground">
                        <p>Please ensure no sensitive data (API keys, secrets) is included in the selected files.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDisclaimer(false)}>Cancel</Button>
                        <Button onClick={confirmAnalysis}>Proceed</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Detail View Dialog */}
            <Dialog open={!!selectedSuggestion} onOpenChange={(open) => !open && setSelectedSuggestion(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedSuggestion?.type === 'warning' ? <AlertTriangle className="text-yellow-500" /> : <Lightbulb className="text-blue-500" />}
                            {selectedSuggestion?.title}
                        </DialogTitle>
                        <DialogDescription className="font-mono text-xs mt-1">
                            {selectedSuggestion?.file}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 my-4">
                        <div>
                            <h4 className="font-semibold mb-1">Issue</h4>
                            <p className="text-sm text-muted-foreground">{selectedSuggestion?.description}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-1">Recommendation</h4>
                            <div className="bg-muted p-4 rounded-md overflow-x-auto">
                                <pre className="text-sm font-mono">{selectedSuggestion?.recommendation}</pre>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setSelectedSuggestion(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
