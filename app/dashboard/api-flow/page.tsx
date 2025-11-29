import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, ArrowRight, Server, Database, Monitor } from "lucide-react"

export default function ApiFlowPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">API Flow Analysis</h1>
                <p className="text-muted-foreground">
                    Trace data flow from UI components to backend services.
                </p>
            </div>

            <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge variant={i === 1 ? "default" : "secondary"}>GET</Badge>
                                    <code className="text-sm font-mono bg-muted px-1 py-0.5 rounded">
                                        /api/users{i === 1 ? "" : `/${i}`}
                                    </code>
                                </div>
                                <Button variant="ghost" size="sm">
                                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                                <div className="flex items-center gap-2">
                                    <Monitor className="h-4 w-4" />
                                    <span>UserList.tsx</span>
                                </div>
                                <ArrowRight className="h-3 w-3" />
                                <div className="flex items-center gap-2">
                                    <Server className="h-4 w-4" />
                                    <span>UserService.ts</span>
                                </div>
                                <ArrowRight className="h-3 w-3" />
                                <div className="flex items-center gap-2">
                                    <Database className="h-4 w-4" />
                                    <span>PostgreSQL</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
