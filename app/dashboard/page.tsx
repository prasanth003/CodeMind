"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FolderOpen, Clock, ArrowRight, Trash2 } from "lucide-react"
import { useProject } from "@/contexts/ProjectContext"
import { useRouter } from "next/navigation"
import { UploadModal } from "@/components/dashboard/UploadModal"

export default function DashboardLandingPage() {
    const { projects, switchProject, removeProject } = useProject()
    const router = useRouter()

    const handleProjectClick = (projectId: string) => {
        switchProject(projectId)
        router.push("/dashboard/overview")
    }

    const handleDelete = async (e: React.MouseEvent, projectId: string) => {
        e.stopPropagation()
        if (confirm("Are you sure you want to delete this project?")) {
            await removeProject(projectId)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
                    <p className="text-muted-foreground">
                        Select a project to analyze or start a new one.
                    </p>
                </div>
                <UploadModal>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        New Project
                    </Button>
                </UploadModal>
            </div>

            {projects.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="rounded-full bg-primary/10 p-4 mb-4">
                            <FolderOpen className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No projects found</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm">
                            Get started by uploading your first project zip file or importing from GitHub.
                        </p>
                        <UploadModal>
                            <Button>Create Project</Button>
                        </UploadModal>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <Card
                            key={project.id}
                            className="cursor-pointer hover:border-primary/50 transition-colors group relative"
                            onClick={() => handleProjectClick(project.id)}
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center justify-between">
                                    <span className="truncate">{project.metadata.name}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={(e) => handleDelete(e, project.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </CardTitle>
                                <CardDescription>
                                    v{project.metadata.version} • {project.metadata.framework || "Unknown Framework"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {project.lastAccessed ? new Date(project.lastAccessed).toLocaleDateString() : "Just now"}
                                    </div>
                                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
