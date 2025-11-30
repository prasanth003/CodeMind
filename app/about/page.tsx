import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export default function AboutPage() {
    const features = [
        "Instant Code Analysis: Upload zip or link GitHub repo.",
        "Component Tree Visualization: Understand your React/Angular component structure.",
        "Dependency Graph: Visualize file dependencies and modules.",
        "API Flow Analysis: Track API calls and endpoints.",
        "Refactoring Suggestions: Get AI-powered code improvements.",
        "Secure & Private: Analysis happens locally/temporarily.",
    ]

    return (
        <div className="container mx-auto py-12 px-4 max-w-4xl">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">About CodeMind AI</h1>
                <p className="text-xl text-muted-foreground">
                    Your intelligent coding companion for understanding and improving codebases.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {features.map((feature, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                            <CheckCircle2 className="h-6 w-6 text-primary" />
                            <CardTitle className="text-base">{feature}</CardTitle>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>
    )
}
