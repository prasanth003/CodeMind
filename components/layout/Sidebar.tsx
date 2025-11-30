"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    Network,
    Activity,
    GitFork,
    Lightbulb,
    BookOpen,
    Settings,
    Box,
    ChevronLeft,
} from "lucide-react"
import { useProject } from "@/contexts/ProjectContext"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    collapsed: boolean
    setCollapsed: (collapsed: boolean) => void
}

export function Sidebar({ className, collapsed, setCollapsed }: SidebarProps) {
    const pathname = usePathname()
    const { currentProjectId } = useProject()

    const items = [
        {
            title: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
            alwaysVisible: true
        },
        {
            title: "Overview",
            href: "/dashboard/overview",
            icon: Activity, // Changed icon to distinguish
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
        <div className={cn("relative pb-12 border-r bg-background transition-all duration-300", collapsed ? "w-16" : "w-64", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="flex items-center justify-between mb-6 px-2">
                        {!collapsed && (
                            <div className="flex items-center gap-2">
                                <img src="/icon.svg" alt="CodeMind Logo" className="h-6 w-6" />
                                <h2 className="text-lg font-semibold tracking-tight">
                                    CodeMind
                                </h2>
                            </div>
                        )}
                        {collapsed && (
                            <div className="mx-auto">
                                <img src="/icon.svg" alt="CodeMind Logo" className="h-6 w-6" />
                            </div>
                        )}
                    </div>

                    {/* Floating Minimize Button */}
                    <Button
                        variant="default"
                        size="icon"
                        className={cn(
                            "absolute -right-3 top-6 h-6 w-6 rounded-full shadow-md z-50 transition-transform duration-300",
                            collapsed ? "rotate-180" : ""
                        )}
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        <ChevronLeft className="h-3 w-3" />
                    </Button>

                    <div className="space-y-1">
                        {items.map((item) => {
                            // Hide project specific items if no project selected, except Dashboard
                            if (!item.alwaysVisible && !currentProjectId) return null;

                            return (
                                <Button
                                    key={item.href}
                                    variant={pathname === item.href ? "default" : "ghost"}
                                    className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}
                                    asChild
                                    title={collapsed ? item.title : undefined}
                                >
                                    <Link href={item.href}>
                                        <item.icon className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
                                        {!collapsed && item.title}
                                    </Link>
                                </Button>
                            )
                        })}
                    </div>
                </div>
                <div className="px-3 py-2">
                    {!collapsed && (
                        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                            Tools
                        </h2>
                    )}
                    <div className="space-y-1">
                        <Button
                            key={'/dashboard/settings'}
                            variant={pathname === '/dashboard/settings' ? "default" : "ghost"}
                            className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}
                            asChild
                            title={collapsed ? "Settings" : undefined}
                        >
                            <Link href="/dashboard/settings">
                                <Settings className={cn("h-4 w-4", collapsed ? "mr-0" : "mr-2")} />
                                <span className={cn(collapsed ? "hidden" : "")}>Settings</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
