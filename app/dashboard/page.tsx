import { StatsCard } from "@/components/dashboard/StatsCard"
import { Button } from "@/components/ui/button"
import {
    FileCode,
    Box,
    Network,
    Activity,
    ArrowRight,
    FileText,
    Layers
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <div className="flex items-center gap-2">
                    <Button>
                        <Layers className="mr-2 h-4 w-4" />
                        Generate Architecture Report
                    </Button>
                    <Button variant="outline">
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Documentation
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Files"
                    value="142"
                    icon={FileCode}
                    description="+12 from last analysis"
                />
                <StatsCard
                    title="Components"
                    value="48"
                    icon={Box}
                    description="24 stateless, 24 stateful"
                />
                <StatsCard
                    title="Services"
                    value="12"
                    icon={Network}
                    description="8 API services"
                />
                <StatsCard
                    title="API Calls"
                    value="36"
                    icon={Activity}
                    description="Detected endpoints"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6 flex flex-col space-y-3">
                        <h3 className="font-semibold leading-none tracking-tight">Recent Activity</h3>
                        <p className="text-sm text-muted-foreground">
                            Latest analysis results and changes.
                        </p>
                        <div className="pt-4 text-sm text-muted-foreground">
                            No recent activity to display.
                        </div>
                    </div>
                </div>
                <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6 flex flex-col space-y-3">
                        <h3 className="font-semibold leading-none tracking-tight">Quick Actions</h3>
                        <div className="grid gap-2 pt-4">
                            <Button variant="ghost" className="justify-start" asChild>
                                <Link href="/dashboard/components">
                                    <Box className="mr-2 h-4 w-4" />
                                    View Component Tree
                                    <ArrowRight className="ml-auto h-4 w-4" />
                                </Link>
                            </Button>
                            <Button variant="ghost" className="justify-start" asChild>
                                <Link href="/dashboard/dependencies">
                                    <Network className="mr-2 h-4 w-4" />
                                    Analyze Dependencies
                                    <ArrowRight className="ml-auto h-4 w-4" />
                                </Link>
                            </Button>
                            <Button variant="ghost" className="justify-start" asChild>
                                <Link href="/dashboard/refactor">
                                    <Activity className="mr-2 h-4 w-4" />
                                    Check Refactor Suggestions
                                    <ArrowRight className="ml-auto h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
