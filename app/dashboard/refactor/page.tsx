import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Lightbulb, ArrowRight, CheckCircle2 } from "lucide-react"

export default function RefactorPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Refactor Suggestions</h1>
                <p className="text-muted-foreground">
                    AI-powered code improvements and best practice recommendations.
                </p>
            </div>

            <div className="grid gap-4">
                <Card className="border-l-4 border-l-yellow-500">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                <CardTitle className="text-lg">Large Component Detected</CardTitle>
                            </div>
                            <Badge variant="outline" className="text-yellow-500 border-yellow-500">Warning</Badge>
                        </div>
                        <CardDescription>
                            src/components/Dashboard.tsx is over 400 lines long.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Consider splitting this component into smaller sub-components. It handles multiple responsibilities including data fetching, layout, and chart rendering.
                        </p>
                        <div className="mt-4 p-3 bg-muted rounded-md text-sm font-mono">
                            Suggested split: DashboardHeader, StatsGrid, ActivityFeed
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline">Explain Why</Button>
                        <Button>
                            Show Diff <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5 text-blue-500" />
                                <CardTitle className="text-lg">Memoization Opportunity</CardTitle>
                            </div>
                            <Badge variant="outline" className="text-blue-500 border-blue-500">Info</Badge>
                        </div>
                        <CardDescription>
                            Expensive calculation in src/utils/analytics.ts
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            The `calculateGrowth` function is re-running on every render. Wrap it in `useMemo` to improve performance.
                        </p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline">Explain Why</Button>
                        <Button>
                            Apply Fix <CheckCircle2 className="ml-2 h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
