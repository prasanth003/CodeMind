import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, BookOpen, FileCode, Layers } from "lucide-react"

export default function DocumentationPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
                <p className="text-muted-foreground">
                    Generate and export project documentation.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <FileText className="h-8 w-8 mb-2 text-primary" />
                        <CardTitle>Project README</CardTitle>
                        <CardDescription>
                            Generate a comprehensive README.md with setup instructions, scripts, and tech stack details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full">
                            <Download className="mr-2 h-4 w-4" />
                            Generate README
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <Layers className="h-8 w-8 mb-2 text-primary" />
                        <CardTitle>Architecture Report</CardTitle>
                        <CardDescription>
                            Detailed breakdown of system architecture, data flow, and component hierarchy.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full">
                            <Download className="mr-2 h-4 w-4" />
                            Generate Report
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <BookOpen className="h-8 w-8 mb-2 text-primary" />
                        <CardTitle>Component Docs</CardTitle>
                        <CardDescription>
                            JSDoc/TSDoc style documentation for all exported components and hooks.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full">
                            <Download className="mr-2 h-4 w-4" />
                            Generate Docs
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <FileCode className="h-8 w-8 mb-2 text-primary" />
                        <CardTitle>Mermaid Diagrams</CardTitle>
                        <CardDescription>
                            Export flowcharts and sequence diagrams in Mermaid syntax.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full">
                            <Download className="mr-2 h-4 w-4" />
                            Export Diagrams
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
