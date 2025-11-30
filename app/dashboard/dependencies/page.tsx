"use client";
import { Loader2 } from "lucide-react"
import { useProject } from "@/contexts/ProjectContext"
import { DependencyGraph } from "@/components/analysis/DependencyGraph"

export default function DependencyGraphPage() {
    const { analysisData, isAnalyzing } = useProject();

    return (
        <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dependency Graph</h1>
                    <p className="text-muted-foreground">
                        Visualize module dependencies and import relationships.
                    </p>
                </div>
            </div>

            <>
                {isAnalyzing ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin mb-4" />
                        <p>Analyzing dependencies...</p>
                    </div>
                ) : analysisData?.dependencies ? (
                    <div className="h-full overflow-hidden">
                        <DependencyGraph data={analysisData.dependencies} />
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        <p>No dependency data available. Run analysis to view graph.</p>
                    </div>
                )}
            </>
        </div>
    )
}
