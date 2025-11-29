import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Network, ZoomIn, ZoomOut, Maximize2, Filter, Share2 } from "lucide-react"

export default function DependencyGraphPage() {
    return (
        <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dependency Graph</h1>
                    <p className="text-muted-foreground">
                        Visualize module dependencies and import relationships.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                    </Button>
                    <Button variant="outline" size="icon">
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                        <Maximize2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Card className="flex-1 overflow-hidden">
                <CardContent className="p-0 h-full bg-muted/5 relative">
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        <div className="text-center space-y-6">
                            <div className="w-[600px] h-[400px] border-2 border-dashed rounded-lg flex items-center justify-center bg-background/50 relative overflow-hidden">
                                {/* Mock Nodes */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-primary text-primary-foreground rounded-full shadow-lg z-10">
                                    <Share2 className="h-6 w-6" />
                                </div>

                                <div className="absolute top-1/4 left-1/4 p-3 bg-background border rounded-full shadow-sm">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                                </div>
                                <div className="absolute top-1/4 right-1/4 p-3 bg-background border rounded-full shadow-sm">
                                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                                </div>
                                <div className="absolute bottom-1/4 left-1/3 p-3 bg-background border rounded-full shadow-sm">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                                </div>
                                <div className="absolute bottom-1/4 right-1/3 p-3 bg-background border rounded-full shadow-sm">
                                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                                </div>

                                {/* Mock Edges (SVG Lines) */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                                    <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="currentColor" strokeWidth="2" />
                                    <line x1="50%" y1="50%" x2="75%" y2="25%" stroke="currentColor" strokeWidth="2" />
                                    <line x1="50%" y1="50%" x2="33%" y2="75%" stroke="currentColor" strokeWidth="2" />
                                    <line x1="50%" y1="50%" x2="66%" y2="75%" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-medium text-foreground">Interactive Force-Directed Graph</h3>
                                <p className="text-sm">
                                    Nodes represent files/modules. Edges represent imports.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
