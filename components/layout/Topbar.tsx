"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    RefreshCw,
    Download,
    User,
    Bell,
    Plus
} from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { useProject } from "@/contexts/ProjectContext"
import { useRouter } from "next/navigation"
import { UploadModal } from "@/components/dashboard/UploadModal"
import Link from "next/link"

export function Topbar() {
    const { user, logout } = useAuth()
    const { projectMetadata } = useProject()
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await logout()
            router.push("/")
        } catch (error) {
            console.error("Failed to log out", error)
        }
    }

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
            <div className="flex items-center gap-2 font-semibold">
                <span className="">{projectMetadata?.name || "Project Name"}</span>
                <Badge variant="outline" className="font-normal">v{projectMetadata?.version || "1.0.0"}</Badge>
                {projectMetadata?.framework && (
                    <Badge variant="secondary" className="font-normal">
                        {projectMetadata.framework}
                        {projectMetadata.frameworkVersion && ` ${projectMetadata.frameworkVersion}`}
                    </Badge>
                )}
            </div>
            <div className="ml-auto flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        Analysis Complete
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
                <UploadModal>
                    <Button variant="default" size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Analysis
                    </Button>
                </UploadModal>
                <div className="flex items-center gap-2 pl-4 border-l">
                    <Button variant="ghost" size="icon">
                        <Bell className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "@user"} />
                                    <AvatarFallback>{user?.displayName?.charAt(0) || "U"}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user?.displayName || "User"}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user?.email || "user@example.com"}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/settings" className="w-full cursor-pointer">
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/settings" className="w-full cursor-pointer">
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
