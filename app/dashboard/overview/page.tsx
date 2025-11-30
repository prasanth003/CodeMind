"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Folder, FileCode, FileJson, FileType, ChevronRight, ChevronDown, File } from "lucide-react"
import { useProject } from "@/contexts/ProjectContext"
import { FileNode } from "@/lib/file-processor"
import { useState } from "react"

function FileTreeItem({ node, depth = 0 }: { node: FileNode; depth?: number }) {
    const [isOpen, setIsOpen] = useState(depth < 2); // Open first 2 levels by default
    const { setSelectedFile } = useProject();
    const hasChildren = node.children && node.children.length > 0;

    const getIcon = () => {
        if (node.type === 'directory') return <Folder className="h-4 w-4 text-blue-500" />;
        if (node.name.endsWith('.ts') || node.name.endsWith('.tsx')) return <FileCode className="h-4 w-4 text-blue-400" />;
        if (node.name.endsWith('.js') || node.name.endsWith('.jsx')) return <FileCode className="h-4 w-4 text-yellow-400" />;
        if (node.name.endsWith('.css') || node.name.endsWith('.scss')) return <FileType className="h-4 w-4 text-pink-400" />;
        if (node.name.endsWith('.json')) return <FileJson className="h-4 w-4 text-green-400" />;
        return <File className="h-4 w-4 text-gray-400" />;
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasChildren) {
            setIsOpen(!isOpen);
        } else {
            setSelectedFile(node);
        }
    };

    return (
        <div>
            <div
                className="flex items-center gap-1 py-1 hover:bg-muted/50 rounded px-2 cursor-pointer select-none"
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
                onClick={handleClick}
            >
                {hasChildren ? (
                    isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                ) : <span className="w-4" />}

                {getIcon()}
                <span className="truncate">{node.name}</span>
                {node.size && <span className="ml-auto text-xs text-muted-foreground">{(node.size / 1024).toFixed(1)}KB</span>}
            </div>
            {isOpen && hasChildren && (
                <div>
                    {node.children!.sort((a, b) => {
                        // Directories first, then files
                        if (a.type === b.type) return a.name.localeCompare(b.name);
                        return a.type === 'directory' ? -1 : 1;
                    }).map((child) => (
                        <FileTreeItem key={child.path} node={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function OverviewPage() {
    const { projectData, analysisData } = useProject();

    if (!projectData) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <h2 className="text-xl font-semibold">No Project Loaded</h2>
                <p className="text-muted-foreground">Please upload a project from the home page.</p>
            </div>
        );
    }

    const tsFiles = Object.keys(projectData.files).filter(f => f.endsWith('.ts') || f.endsWith('.tsx')).length;
    const styleFiles = Object.keys(projectData.files).filter(f => f.endsWith('.css') || f.endsWith('.scss') || f.endsWith('.less')).length;
    const jsonFiles = Object.keys(projectData.files).filter(f => f.endsWith('.json')).length;

    // Count directories recursively
    const countDirs = (node: FileNode): number => {
        let count = node.type === 'directory' ? 1 : 0;
        if (node.children) {
            count += node.children.reduce((acc, child) => acc + countDirs(child), 0);
        }
        return count;
    };
    const totalDirs = countDirs(projectData.tree) - 1; // Subtract root

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Project Overview</h1>
                <p className="text-muted-foreground">
                    Analysis for {projectData.tree.children?.length} root items.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">TypeScript/JS Files</CardTitle>
                        <FileCode className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tsFiles}</div>
                        <p className="text-xs text-muted-foreground">
                            {analysisData?.components?.length || 0} Components detected
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Styles</CardTitle>
                        <FileType className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{styleFiles}</div>
                        <p className="text-xs text-muted-foreground">CSS, SCSS, Modules</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Config Files</CardTitle>
                        <FileJson className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{jsonFiles}</div>
                        <p className="text-xs text-muted-foreground">JSON, YAML, etc.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Directories</CardTitle>
                        <Folder className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalDirs}</div>
                        <p className="text-xs text-muted-foreground">Total folders</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>File Structure</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border p-4 font-mono text-sm max-h-[500px] overflow-auto">
                        <FileTreeItem node={projectData.tree} />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
