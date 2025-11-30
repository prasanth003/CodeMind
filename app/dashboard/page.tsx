"use client";

import { StatsCard } from "@/components/dashboard/StatsCard"
import { Button } from "@/components/ui/button"
import {
    FileCode,
    Box,
    Network,
    Activity,
    ArrowRight,
    FileText,
    Layers,
    Loader2
} from "lucide-react"
import Link from "next/link"
import { useProject } from "@/contexts/ProjectContext"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ComponentTree } from "@/components/analysis/ComponentTree"
import { DependencyGraph } from "@/components/analysis/DependencyGraph"
import { ApiFlow } from "@/components/analysis/ApiFlow"
import { AnalysisEngine } from "@/lib/analysis/engine"
import { useState } from "react"

export default function DashboardPage() {
    const { analysisData, projectData, isAnalyzing, setIsAnalyzing, updateAnalysis, currentProjectId } = useProject();
    const [reanalyzing, setReanalyzing] = useState(false);

    const handleReanalyze = async () => {
        if (!projectData || !currentProjectId) return;

        try {
            setReanalyzing(true);
            setIsAnalyzing(true);

            // Run Analysis
            const engine = new AnalysisEngine(projectData);
            const analysisResults = await engine.analyze();

            // Update Context
            await updateAnalysis(currentProjectId, analysisResults);

        } catch (error) {
            console.error("Re-analysis failed:", error);
            // Optionally show toast
        } finally {
            setReanalyzing(false);
            setIsAnalyzing(false);
        }
    };

    if (!analysisData && !isAnalyzing) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <h2 className="text-2xl font-bold">No Analysis Data</h2>
                <p className="text-muted-foreground">Run an analysis to see project insights.</p>
                <Button onClick={handleReanalyze} disabled={reanalyzing}>
                    {reanalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Layers className="mr-2 h-4 w-4" />}
                    Start Analysis
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <div className="flex items-center gap-2">
                    <Button onClick={handleReanalyze} disabled={reanalyzing}>
                        {reanalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Layers className="mr-2 h-4 w-4" />}
                        Re-Analyze Project
                    </Button>
                    <Button variant="outline">
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Documentation
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Files"
                    value={projectData?.fileCount.toString() || "0"}
                    icon={FileCode}
                    description="Project Files"
                />
                <StatsCard
                    title="Components"
                    value={analysisData?.components.length.toString() || "0"}
                    icon={Box}
                    description="Detected Components"
                />
                <StatsCard
                    title="Dependencies"
                    value={analysisData?.dependencies.length.toString() || "0"}
                    icon={Network}
                    description="File Dependencies"
                />
                <StatsCard
                    title="API Calls"
                    value={analysisData?.apiFlow?.length.toString() || "0"}
                    icon={Activity}
                    description="Detected Endpoints"
                />
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="components">Component Tree</TabsTrigger>
                    <TabsTrigger value="dependencies">Dependency Graph</TabsTrigger>
                    <TabsTrigger value="api">API Flow</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow">
                            <div className="p-6 flex flex-col space-y-3">
                                <h3 className="font-semibold leading-none tracking-tight">Recent Activity</h3>
                                <p className="text-sm text-muted-foreground">
                                    Latest analysis results and changes.
                                </p>
                                <div className="pt-4 text-sm text-muted-foreground">
                                    Analysis completed. Found {analysisData?.components.length} components and {analysisData?.apiFlow?.length || 0} API calls.
                                </div>
                            </div>
                        </div>
                        <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow">
                            <div className="p-6 flex flex-col space-y-3">
                                <h3 className="font-semibold leading-none tracking-tight">Quick Actions</h3>
                                <div className="grid gap-2 pt-4">
                                    <Button variant="ghost" className="justify-start" asChild>
                                        <Link href="/dashboard/components">
                                            <Box className="mr-2 h-4 w-4" />
                                            View Component Tree
                                            <ArrowRight className="ml-auto h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" className="justify-start" asChild>
                                        <Link href="/dashboard/dependencies">
                                            <Network className="mr-2 h-4 w-4" />
                                            Analyze Dependencies
                                            <ArrowRight className="ml-auto h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="components" className="space-y-4">
                    <ComponentTree data={analysisData?.componentTree || []} />
                </TabsContent>

                <TabsContent value="dependencies" className="space-y-4">
                    <DependencyGraph data={analysisData?.dependencies || []} />
                </TabsContent>

                <TabsContent value="api" className="space-y-4">
                    <ApiFlow data={analysisData?.apiFlow || []} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
