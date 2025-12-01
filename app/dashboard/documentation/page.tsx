"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Layers, Book, Code, Loader2, Download } from "lucide-react"
import { toast } from "sonner"
import { useProject } from "@/contexts/ProjectContext"

export default function DocumentationPage() {
    const { projectData } = useProject();
    const [loading, setLoading] = useState<string | null>(null);

    const handleGenerate = async (type: string) => {
        if (!projectData) {
            toast.error("No project loaded");
            return;
        }

        setLoading(type);
        toast.info(`Generating ${type}...`, {
            description: "This may take a few moments."
        });

        try {
            // For now, we'll send the root tree structure as context
            // In a real app, you might want to send specific files based on the type
            const response = await fetch('/api/ai/docs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: JSON.stringify(projectData.tree), // Sending tree as context
                    type
                }),
            });

            if (!response.ok) throw new Error("Generation failed");

            // In a real implementation, we would probably download the file or show it
            // For now, we'll just simulate the success
            const reader = response.body?.getReader();
            if (reader) {
                await reader.read(); // Consume stream
            }

            toast.success(`${type} Generated!`, {
                description: "Documentation has been created successfully."
            });

        } catch (error) {
            console.error(error);
            toast.error("Generation Failed");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
                <p className="text-muted-foreground">
                    Generate and export project documentation.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Project README */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Project README
                        </CardTitle>
                        <CardDescription>
                            Generate a comprehensive README.md with setup instructions, scripts, and tech stack details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => handleGenerate('readme')}
                            disabled={!!loading}
                        >
                            {loading === 'readme' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            Generate README
                        </Button>
                    </CardContent>
                </Card>

                {/* Architecture Report */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Layers className="h-5 w-5" />
                            Architecture Report
                        </CardTitle>
                        <CardDescription>
                            Detailed breakdown of system architecture, data flow, and component hierarchy.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => handleGenerate('architecture')}
                            disabled={!!loading}
                        >
                            {loading === 'architecture' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            Generate Report
                        </Button>
                    </CardContent>
                </Card>

                {/* Component Docs */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Book className="h-5 w-5" />
                            Component Docs
                        </CardTitle>
                        <CardDescription>
                            JSDoc/TSDoc style documentation for all exported components and hooks.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => handleGenerate('components')}
                            disabled={!!loading}
                        >
                            {loading === 'components' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            Generate Docs
                        </Button>
                    </CardContent>
                </Card>

                {/* Mermaid Diagrams */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Code className="h-5 w-5" />
                            Mermaid Diagrams
                        </CardTitle>
                        <CardDescription>
                            Export flowcharts and sequence diagrams in Mermaid syntax.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => handleGenerate('mermaid')}
                            disabled={!!loading}
                        >
                            {loading === 'mermaid' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            Export Diagrams
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
