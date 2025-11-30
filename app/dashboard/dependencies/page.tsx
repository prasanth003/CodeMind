"use client";

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, Maximize2, Filter, Loader2 } from "lucide-react"
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

            <Card className="flex-1 overflow-hidden">
                <CardContent className="p-0 h-full bg-muted/5 relative">
                    {isAnalyzing ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin mb-4" />
                            <p>Analyzing dependencies...</p>
                        </div>
                    ) : analysisData?.dependencies ? (
                        <div className="h-full overflow-auto p-4">
                            <DependencyGraph data={analysisData.dependencies} />
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                            <p>No dependency data available. Run analysis to view graph.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
