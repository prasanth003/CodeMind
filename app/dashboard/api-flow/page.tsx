"use client"

import { Construction } from "lucide-react"

export default function ApiFlowPage() {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 text-center">
            <div className="p-4 rounded-full bg-muted/50">
                <Construction className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold">API Flow Analysis</h2>
            <p className="text-muted-foreground max-w-md">
                Visualizing API data flow... (Coming Soon)
            </p>
        </div>
    )
}
