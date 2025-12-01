"use client"

import { Folder, FileCode, FileJson, FileType, ChevronRight, ChevronDown, File } from "lucide-react"
import { FileNode } from "@/lib/file-processor"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

interface FileTreeProps {
    node: FileNode;
    selectedPath?: string;
    onSelect?: (node: FileNode) => void;
    depth?: number;
    checkable?: boolean;
    checkedPaths?: string[];
    onCheck?: (node: FileNode, checked: boolean) => void;
}

export function FileTree({
    node,
    selectedPath,
    onSelect,
    depth = 0,
    checkable = false,
    checkedPaths = [],
    onCheck
}: FileTreeProps) {
    const [isOpen, setIsOpen] = useState(depth < 2);
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
            onSelect?.(node);
        }
    };

    const handleCheck = (checked: boolean) => {
        onCheck?.(node, checked);
    };

    return (
        <div>
            <div
                className={cn(
                    "flex items-center gap-2 py-1 hover:bg-muted/50 rounded px-2 cursor-pointer select-none transition-colors",
                    selectedPath === node.path && !checkable && "bg-muted text-primary font-medium"
                )}
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
                onClick={handleClick}
            >
                {hasChildren ? (
                    <div onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} className="p-0.5 hover:bg-muted rounded">
                        {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </div>
                ) : <span className="w-5" />}

                {checkable && node.type === 'file' && (
                    <Checkbox
                        checked={checkedPaths.includes(node.path)}
                        onCheckedChange={handleCheck}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4"
                    />
                )}

                {getIcon()}
                <span className="truncate">{node.name}</span>
                {node.size && <span className="ml-auto text-xs text-muted-foreground">{(node.size / 1024).toFixed(1)}KB</span>}
            </div>
            {isOpen && hasChildren && (
                <div>
                    {node.children!.sort((a, b) => {
                        if (a.type === b.type) return a.name.localeCompare(b.name);
                        return a.type === 'directory' ? -1 : 1;
                    }).map((child) => (
                        <FileTree
                            key={child.path}
                            node={child}
                            selectedPath={selectedPath}
                            onSelect={onSelect}
                            depth={depth + 1}
                            checkable={checkable}
                            checkedPaths={checkedPaths}
                            onCheck={onCheck}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
