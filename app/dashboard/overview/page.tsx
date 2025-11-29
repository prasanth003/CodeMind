import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Folder, FileCode, FileJson, FileType, ChevronRight, ChevronDown } from "lucide-react"

export default function OverviewPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Project Overview</h1>
                <p className="text-muted-foreground">
                    Detailed statistics and file structure analysis.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">TypeScript Files</CardTitle>
                        <FileCode className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">84</div>
                        <p className="text-xs text-muted-foreground">65% of codebase</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Styles (CSS/SCSS)</CardTitle>
                        <FileType className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">Global & Modules</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">JSON Configs</CardTitle>
                        <FileJson className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">8</div>
                        <p className="text-xs text-muted-foreground">Package & TSConfig</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Directories</CardTitle>
                        <Folder className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">24</div>
                        <p className="text-xs text-muted-foreground">Depth level: 4</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>File Structure</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border p-4 font-mono text-sm">
                        <div className="flex items-center gap-1 py-1">
                            <ChevronDown className="h-4 w-4" />
                            <Folder className="h-4 w-4 text-blue-500" />
                            <span>src</span>
                        </div>
                        <div className="pl-6 border-l ml-2">
                            <div className="flex items-center gap-1 py-1">
                                <ChevronDown className="h-4 w-4" />
                                <Folder className="h-4 w-4 text-blue-500" />
                                <span>components</span>
                            </div>
                            <div className="pl-6 border-l ml-2">
                                <div className="flex items-center gap-1 py-1">
                                    <FileCode className="h-4 w-4 text-yellow-500" />
                                    <span>Button.tsx</span>
                                </div>
                                <div className="flex items-center gap-1 py-1">
                                    <FileCode className="h-4 w-4 text-yellow-500" />
                                    <span>Header.tsx</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 py-1">
                                <ChevronRight className="h-4 w-4" />
                                <Folder className="h-4 w-4 text-blue-500" />
                                <span>utils</span>
                            </div>
                            <div className="flex items-center gap-1 py-1">
                                <FileCode className="h-4 w-4 text-yellow-500" />
                                <span>App.tsx</span>
                            </div>
                            <div className="flex items-center gap-1 py-1">
                                <FileCode className="h-4 w-4 text-yellow-500" />
                                <span>index.tsx</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 py-1">
                            <FileJson className="h-4 w-4 text-green-500" />
                            <span>package.json</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
