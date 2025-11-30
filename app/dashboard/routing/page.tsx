"use client"

import { useProject } from "@/contexts/ProjectContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Lock, Unlock, GitBranch, ChevronRight, ChevronDown, Globe } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface RouteNode {
    path: string;
    file: string;
    type: string;
    target?: string;
    guards?: string[];
    roles?: string[];
    children?: RouteNode[];
}

function RouteItem({ route, depth = 0 }: { route: RouteNode, depth?: number }) {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = route.children && route.children.length > 0;
    const isGuarded = (route.guards && route.guards.length > 0) || (route.roles && route.roles.length > 0);

    return (
        <div className="border-b last:border-0 border-border/50">
            <div
                className={cn(
                    "flex items-center justify-between p-3 hover:bg-muted/30 transition-colors",
                    depth > 0 && "bg-muted/10"
                )}
                style={{ paddingLeft: `${(depth + 1) * 12}px` }}
            >
                <div className="flex items-center gap-3">
                    {hasChildren ? (
                        <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground">
                            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                    ) : (
                        <GitBranch className="h-4 w-4 text-muted-foreground/50 rotate-90" />
                    )}

                    <div className="flex items-center gap-2">
                        {isGuarded ? (
                            <Lock className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                            <Unlock className="h-3.5 w-3.5 text-green-500" />
                        )}
                        <span className="font-mono text-sm">
                            {route.path === '' ? (depth === 0 ? '/' : '(index)') : route.path}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs font-normal">
                        {route.type === 'layout' ? 'Layout' : route.type === 'page' ? 'Page' : 'Auth'}
                    </Badge>
                    {route.guards?.map(g => (
                        <Badge key={g} variant="outline" className="text-xs font-normal bg-background">
                            {g}
                        </Badge>
                    ))}
                    {route.roles?.map(r => (
                        <Badge key={r} className="text-xs font-normal bg-blue-600 hover:bg-blue-700">
                            {r}
                        </Badge>
                    ))}
                </div>
            </div>

            {expanded && hasChildren && (
                <div>
                    {route.children?.map((child, i) => (
                        <RouteItem key={`${child.path}-${i}`} route={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function RoutingPage() {
    const { analysisData } = useProject()
    const routes = (analysisData?.routes || []) as RouteNode[]

    // Helper to check if a route or its children are guarded
    const isRouteGuarded = (r: RouteNode): boolean => {
        if ((r.guards && r.guards.length > 0) || (r.roles && r.roles.length > 0)) return true;
        // If parent is not guarded, check if ALL children are guarded? 
        // Or should we just split based on the top-level route?
        // Let's stick to top-level for the main grouping, but maybe check children for "Mixed" status?
        // For now, simple check on the node itself.
        return false;
    };

    // Helper to deduplicate routes
    const deduplicateRoutes = (nodes: RouteNode[]): RouteNode[] => {
        const seen = new Set<string>();
        return nodes.filter(node => {
            if (seen.has(node.path)) return false;
            seen.add(node.path);
            return true;
        }).map(node => ({
            ...node,
            children: node.children ? deduplicateRoutes(node.children) : undefined
        }));
    };

    const uniqueRoutes = deduplicateRoutes(routes);
    const publicRoutes = uniqueRoutes.filter(r => !isRouteGuarded(r));
    const protectedRoutes = uniqueRoutes.filter(r => isRouteGuarded(r));

    return (
        <div className="h-full flex flex-col space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight mb-1">Routing Structure</h1>
                <p className="text-muted-foreground text-sm">
                    Application routes and navigation hierarchy.
                </p>
            </div>

            <ScrollArea className="flex-1 -mx-4 px-4">
                <div className="space-y-6 pb-10">
                    {/* Protected Routes Section (First) */}
                    <Card className="bg-card/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                Protected Routes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/50">
                                {protectedRoutes.length > 0 ? (
                                    protectedRoutes.map((route, i) => (
                                        <RouteItem key={i} route={route} />
                                    ))
                                ) : (
                                    <div className="p-4 text-sm text-muted-foreground text-center">
                                        No protected routes detected.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Public Routes Section (Second) */}
                    <Card className="bg-card/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                Public Routes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border/50">
                                {publicRoutes.length > 0 ? (
                                    publicRoutes.map((route, i) => (
                                        <RouteItem key={i} route={route} />
                                    ))
                                ) : (
                                    <div className="p-4 text-sm text-muted-foreground text-center">
                                        No public routes detected.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </ScrollArea>
        </div>
    )
}
