import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GitFork, Globe, Lock, Unlock } from "lucide-react"

export default function RoutingPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Routing Structure</h1>
                <p className="text-muted-foreground">
                    Application routes and navigation hierarchy.
                </p>
            </div>

            <div className="grid gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            Public Routes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/5">
                            <div className="flex items-center gap-3">
                                <Unlock className="h-4 w-4 text-green-500" />
                                <code className="text-sm font-mono">/</code>
                            </div>
                            <Badge variant="outline">Landing Page</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/5">
                            <div className="flex items-center gap-3">
                                <Unlock className="h-4 w-4 text-green-500" />
                                <code className="text-sm font-mono">/login</code>
                            </div>
                            <Badge variant="outline">Auth</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Protected Routes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/5">
                            <div className="flex items-center gap-3">
                                <GitFork className="h-4 w-4 text-blue-500" />
                                <code className="text-sm font-mono">/dashboard</code>
                            </div>
                            <div className="flex gap-2">
                                <Badge>Layout</Badge>
                                <Badge variant="secondary">Auth Guard</Badge>
                            </div>
                        </div>
                        <div className="pl-8 space-y-2">
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/5">
                                <div className="flex items-center gap-3">
                                    <GitFork className="h-4 w-4 text-muted-foreground" />
                                    <code className="text-sm font-mono">/dashboard/overview</code>
                                </div>
                                <Badge variant="outline">Page</Badge>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/5">
                                <div className="flex items-center gap-3">
                                    <GitFork className="h-4 w-4 text-muted-foreground" />
                                    <code className="text-sm font-mono">/dashboard/settings</code>
                                </div>
                                <Badge variant="outline">Page</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
