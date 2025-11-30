"use client";

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, Maximize2, Loader2 } from "lucide-react"
import { useProject } from "@/contexts/ProjectContext"
import { ComponentTree } from "@/components/analysis/ComponentTree"

export default function ComponentTreePage() {
    const { analysisData, isAnalyzing } = useProject();

    return (
        <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Component Tree</h1>
                    <p className="text-muted-foreground">
                        Visual hierarchy of your application components.
                    </p>
                </div>
            </div>

            <Card className="flex-1 overflow-hidden">
                <CardContent className="p-0 h-full bg-muted/5 relative">
                    {isAnalyzing ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin mb-4" />
                            <p>Analyzing component structure...</p>
                        </div>
                    ) : analysisData?.componentTree ? (
                        <div className="h-full overflow-auto p-4">
                            <ComponentTree data={analysisData.componentTree} />
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                            <p>No component data available. Run analysis to view tree.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
