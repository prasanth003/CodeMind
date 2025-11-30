import { Construction } from "lucide-react"

export default function DocumentationPage() {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 text-center">
            <div className="p-4 rounded-full bg-muted/50">
                <Construction className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Documentation Coming Soon</h2>
            <p className="text-muted-foreground max-w-md">
                We are working on comprehensive documentation for CodeMind AI.
                Stay tuned for updates!
            </p>
        </div>
    )
}
