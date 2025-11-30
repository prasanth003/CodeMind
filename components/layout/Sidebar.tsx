"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    LayoutDashboard,
    FileCode,
    Network,
    Activity,
    GitFork,
    Lightbulb,
    BookOpen,
    Settings,
    MessageSquare,
    Box,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    collapsed: boolean
    setCollapsed: (collapsed: boolean) => void
}

export function Sidebar({ className, collapsed, setCollapsed }: SidebarProps) {
    const pathname = usePathname()

    const items = [
        {
            title: "Overview",
            href: "/dashboard/overview",
            icon: LayoutDashboard,
        },
        {
            title: "Component Tree",
            href: "/dashboard/components",
            icon: Box,
        },
        {
            title: "Dependency Graph",
            href: "/dashboard/dependencies",
            icon: Network,
        },
        {
            title: "API Flow",
            href: "/dashboard/api-flow",
            icon: Activity,
        },
        {
            title: "Routing",
            href: "/dashboard/routing",
            icon: GitFork,
        },
        {
            title: "Refactor Suggestions",
            href: "/dashboard/refactor",
            icon: Lightbulb,
        },
        {
            title: "Documentation",
            href: "/dashboard/documentation",
            icon: BookOpen,
        },
    ]

    return (
        <div className={cn("pb-12 border-r bg-background transition-all duration-300", collapsed ? "w-16" : "w-64", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="flex items-center justify-between mb-2 px-2">
                        {!collapsed && (
                            <h2 className="text-lg font-semibold tracking-tight">
                                CodeMind
                            </h2>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-6 w-6", collapsed ? "mx-auto" : "")}
                            onClick={() => setCollapsed(!collapsed)}
                        >
                            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        </Button>
                    </div>
                    <div className="space-y-1">
                        {items.map((item) => (
                            <Button
                                key={item.href}
                                variant={pathname === item.href ? "secondary" : "ghost"}
                                className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}
                                asChild
                                title={collapsed ? item.title : undefined}
                            >
                                <Link href={item.href}>
                                    <item.icon className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
                                    {!collapsed && item.title}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="px-3 py-2">
                    {!collapsed && (
                        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                            Tools
                        </h2>
                    )}
                    <div className="space-y-1">
                        <Button variant="ghost" className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")} asChild title={collapsed ? "Settings" : undefined}>
                            <Link href="/dashboard/settings">
                                <Settings className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
                                {!collapsed && "Settings"}
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
