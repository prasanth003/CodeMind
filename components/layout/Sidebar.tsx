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
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
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
        <div className={cn("pb-12 w-64 border-r bg-background", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        CodeMind AI
                    </h2>
                    <div className="space-y-1">
                        {items.map((item) => (
                            <Button
                                key={item.href}
                                variant={pathname === item.href ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                asChild
                            >
                                <Link href={item.href}>
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Tools
                    </h2>
                    <div className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Chat Assistant
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
