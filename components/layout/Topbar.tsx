"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import {
    RefreshCw,
    Plus,
    ChevronDown
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
import { LoginModal } from "@/components/auth/LoginModal"
import { useState } from "react"
import { Home } from "lucide-react"

export function Topbar() {
    const { user, logout, isSkipped } = useAuth()
    const { projectMetadata, projects, currentProjectId, switchProject, projectData, updateAnalysis, isAnalyzing, setIsAnalyzing } = useProject()
    const router = useRouter()
    const [showLoginModal, setShowLoginModal] = useState(false)

    const handleLogout = async () => {
        try {
            await logout()
            router.push("/")
        } catch (error) {
            console.error("Failed to log out", error)
        }
    }

    const handleReanalyze = async () => {
        if (!projectData || !currentProjectId) return;

        try {
            setIsAnalyzing(true);
            // Dynamic import to avoid server-side issues if any, though Topbar is client component
            const { AnalysisEngine } = await import("@/lib/analysis/engine");

            const engine = new AnalysisEngine(projectData);
            const analysisResults = await engine.analyze();

            await updateAnalysis(currentProjectId, analysisResults);
        } catch (error) {
            console.error("Re-analysis failed:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <>
            <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
                <div className="flex items-center gap-2 font-semibold">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-auto p-1 px-2 font-semibold text-base hover:bg-muted">
                                {projectMetadata?.name || "Select Project"}
                                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[200px]">
                            <DropdownMenuLabel>Projects</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {projects.map((project) => (
                                <DropdownMenuItem
                                    key={project.id}
                                    onClick={() => switchProject(project.id)}
                                    className="flex items-center justify-between"
                                >
                                    <span className={project.id === currentProjectId ? "font-bold" : ""}>
                                        {project.metadata.name}
                                    </span>
                                    {project.id === currentProjectId && (
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                    )}
                                </DropdownMenuItem>
                            ))}
                            {projects.length === 0 && (
                                <div className="p-2 text-sm text-muted-foreground text-center">
                                    No projects found
                                </div>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Badge variant="outline" className="font-normal">v{projectMetadata?.version || "0.0.0"}</Badge>
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
                            <div className={`h-2 w-2 rounded-full ${isAnalyzing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                            {isAnalyzing ? 'Analyzing...' : 'Analysis Complete'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/">
                            <Button variant="ghost" size="icon" title="Home">
                                <Home className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleReanalyze}
                            disabled={isAnalyzing}
                            title="Re-analyze Project"
                        >
                            <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                    <UploadModal>
                        <Button variant="default" size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            New Analysis
                        </Button>
                    </UploadModal>
                    <div className="flex items-center gap-2 pl-4 border-l">
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.photoURL || ""} alt={user.displayName || "User"} />
                                            <AvatarFallback>{user.displayName?.charAt(0) || "U"}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user.email}
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
                        ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuItem onClick={() => setShowLoginModal(true)}>
                                        Log in
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </header>
            <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
        </>
    )
}
